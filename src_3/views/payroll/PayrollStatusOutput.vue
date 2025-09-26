<template>
  <div class="payroll-status-output">
    <div class="page-header">
      <h1>급여 현황 출력</h1>
      <p>급여 지급 현황을 조회하고 출력합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 현황 조회</span>
            <div class="header-actions">
              <el-button @click="generatePDF">PDF 보고서</el-button>
              <el-button @click="generateExcel">Excel 보고서</el-button>
              <el-button type="primary" @click="printReport">인쇄</el-button>
            </div>
          </div>
        </template>
        
        <div class="status-filters">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="조회 기간">
                <el-date-picker
                  v-model="statusPeriod"
                  type="month"
                  placeholder="조회 기간 선택"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="부서">
                <el-select v-model="selectedDepartment" placeholder="부서 선택">
                  <el-option label="전체" value="" />
                  <el-option label="개발팀" value="dev" />
                  <el-option label="영업팀" value="sales" />
                  <el-option label="인사팀" value="hr" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="급여 상태">
                <el-select v-model="selectedStatus" placeholder="상태 선택">
                  <el-option label="전체" value="" />
                  <el-option label="지급완료" value="completed" />
                  <el-option label="지급대기" value="pending" />
                  <el-option label="지급보류" value="hold" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <el-table :data="statusData" style="width: 100%" class="status-table">
          <el-table-column prop="employeeName" label="직원명" min-width="120" align="center" />
          <el-table-column prop="department" label="부서" min-width="100" align="center" />
          <el-table-column prop="position" label="직급" min-width="100" align="center" />
          <el-table-column prop="basicSalary" label="기본급" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.basicSalary.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="totalIncome" label="총 지급액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.totalIncome.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="totalDeduction" label="총 공제액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.totalDeduction.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="netPay" label="실수령액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.netPay.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="payDate" label="지급일" min-width="120" align="center" />
          <el-table-column prop="status" label="상태" min-width="100" align="center">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'PayrollStatusOutput',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 목업 데이터 늘리기 (총 70행)
    const base = [...this.statusData]
    const targetCount = 70
    const mockNames = ['김민준','이서연','박도윤','최지우','정하준','한유진','조준서','윤예린','장수아','임시우','오태윤','서연우','신아윤','권승현','황재민','문서윤','홍지안','강유나','배민서','류하린']
    let i = 0
    while (this.statusData.length < targetCount) {
      const src = base[i % base.length]
      const idx = this.statusData.length + 1
      const varied = {
        employeeName: mockNames[idx % mockNames.length],
        department: src.department,
        position: src.position,
        basicSalary: src.basicSalary + (idx % 12) * 10000,
        totalIncome: src.totalIncome + (idx % 9) * 12000,
        totalDeduction: src.totalDeduction + (idx % 6) * 5000,
        netPay: src.netPay + (idx % 10) * 8000,
        payDate: src.payDate,
        status: src.status
      }
      this.statusData.push(varied)
      i++
    }
  },
  data() {
    return {
      statusPeriod: new Date(),
      selectedDepartment: '',
      selectedStatus: '',
      statusData: [
        {
          employeeName: '김철수',
          department: '개발팀',
          position: '대리',
          basicSalary: 3000000,
          totalIncome: 3350000,
          totalDeduction: 603000,
          netPay: 2747000,
          payDate: '2024-09-25',
          status: '지급완료'
        },
        {
          employeeName: '이영희',
          department: '영업팀',
          position: '과장',
          basicSalary: 2800000,
          totalIncome: 3200000,
          totalDeduction: 576000,
          netPay: 2624000,
          payDate: '2024-09-25',
          status: '지급완료'
        },
        {
          employeeName: '박민수',
          department: '인사팀',
          position: '사원',
          basicSalary: 2500000,
          totalIncome: 2700000,
          totalDeduction: 486000,
          netPay: 2214000,
          payDate: '2024-09-25',
          status: '지급완료'
        }
      ]
    }
  },
  methods: {
    getStatusType(status) {
      switch (status) {
        case '지급완료':
          return 'success'
        case '지급대기':
          return 'warning'
        case '지급보류':
          return 'danger'
        default:
          return 'info'
      }
    },
    generateReport() {
      this.success('급여 현황 보고서가 생성되었습니다.')
    },
    printReport() {
      // 인쇄용 스타일과 함께 새 창 열기
      const printWindow = window.open('', '_blank')
      
      // 인쇄용 HTML 생성
      const printContent = this.generatePrintContent()
      
      printWindow.document.write(printContent)
      printWindow.document.close()
      
      // 인쇄 대화상자 열기
      printWindow.focus()
      printWindow.print()
      
      // 인쇄 후 창 닫기
      printWindow.onafterprint = () => {
        printWindow.close()
      }
      
      this.success('인쇄 대화상자가 열렸습니다.')
    },
    
    generatePrintContent() {
      const currentDate = new Date().toLocaleDateString()
      const totalEmployees = this.statusData.length
      const totalIncome = this.statusData.reduce((sum, item) => sum + item.totalIncome, 0)
      const totalDeduction = this.statusData.reduce((sum, item) => sum + item.totalDeduction, 0)
      const totalNetPay = this.statusData.reduce((sum, item) => sum + item.netPay, 0)
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>급여 현황 보고서</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              font-family: 'Malgun Gothic', Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              margin: 0;
              padding: 0;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            
            .print-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #2c3e50;
            }
            
            .print-subtitle {
              font-size: 14px;
              color: #666;
            }
            
            .print-info {
              margin-bottom: 20px;
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
            }
            
            .print-info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            
            .print-info-label {
              font-weight: bold;
              color: #2c3e50;
            }
            
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 11px;
            }
            
            .print-table th,
            .print-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
            }
            
            .print-table th {
              background-color: #f5f5f5;
              font-weight: bold;
              color: #2c3e50;
            }
            
            .print-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            .print-total {
              margin-top: 20px;
              padding: 15px;
              background-color: #f0f8ff;
              border: 2px solid #4a90e2;
              border-radius: 5px;
            }
            
            .print-total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-weight: bold;
            }
            
            .print-total-label {
              color: #2c3e50;
            }
            
            .print-total-value {
              color: #e74c3c;
              font-size: 14px;
            }
            
            .print-footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            
            @media print {
              body { margin: 0; }
              .print-header { page-break-after: avoid; }
              .print-table { page-break-inside: avoid; }
              .print-total { page-break-before: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="print-title">급여 현황 보고서</div>
            <div class="print-subtitle">Payroll Status Report</div>
          </div>
          
          <div class="print-info">
            <div class="print-info-row">
              <span class="print-info-label">보고서 생성일:</span>
              <span>${currentDate}</span>
            </div>
            <div class="print-info-row">
              <span class="print-info-label">조회 기간:</span>
              <span>${this.statusPeriod ? new Date(this.statusPeriod).toLocaleDateString() : '전체'}</span>
            </div>
            <div class="print-info-row">
              <span class="print-info-label">부서:</span>
              <span>${this.selectedDepartment || '전체'}</span>
            </div>
            <div class="print-info-row">
              <span class="print-info-label">급여 상태:</span>
              <span>${this.selectedStatus || '전체'}</span>
            </div>
          </div>
          
          <table class="print-table">
            <thead>
              <tr>
                <th>직원명</th>
                <th>부서</th>
                <th>직급</th>
                <th>기본급</th>
                <th>총 지급액</th>
                <th>총 공제액</th>
                <th>실수령액</th>
                <th>지급일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              ${this.statusData.map(item => `
                <tr>
                  <td>${item.employeeName}</td>
                  <td>${item.department}</td>
                  <td>${item.position}</td>
                  <td>${item.basicSalary.toLocaleString()}원</td>
                  <td>${item.totalIncome.toLocaleString()}원</td>
                  <td>${item.totalDeduction.toLocaleString()}원</td>
                  <td>${item.netPay.toLocaleString()}원</td>
                  <td>${item.payDate}</td>
                  <td>${item.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="print-total">
            <div class="print-total-row">
              <span class="print-total-label">총 직원 수:</span>
              <span class="print-total-value">${totalEmployees}명</span>
            </div>
            <div class="print-total-row">
              <span class="print-total-label">총 지급액:</span>
              <span class="print-total-value">${totalIncome.toLocaleString()}원</span>
            </div>
            <div class="print-total-row">
              <span class="print-total-label">총 공제액:</span>
              <span class="print-total-value">${totalDeduction.toLocaleString()}원</span>
            </div>
            <div class="print-total-row">
              <span class="print-total-label">총 실수령액:</span>
              <span class="print-total-value">${totalNetPay.toLocaleString()}원</span>
            </div>
          </div>
          
          <div class="print-footer">
            <p>본 보고서는 시스템에서 자동 생성되었습니다.</p>
            <p>생성일시: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `
    },
    // PDF 보고서 생성
    async generatePDF() {
      try {
        // jsPDF 동적 로드
        const { jsPDF } = await import('jspdf')
        
        const doc = new jsPDF()
        
        // 한글 폰트 설정 (기본 폰트 사용)
        doc.setFont('helvetica')
        
        // 제목
        doc.setFontSize(20)
        doc.text('급여 현황 보고서', 105, 20, { align: 'center' })
        
        // 생성일
        doc.setFontSize(10)
        doc.text(`생성일: ${new Date().toLocaleDateString()}`, 180, 15)
        
        // 요약 정보
        doc.setFontSize(12)
        doc.text(`보고서 생성일: ${new Date().toLocaleDateString()}`, 20, 40)
        doc.text(`총 직원 수: ${this.statusData.length}명`, 20, 50)
        doc.text(`총 지급액: ${this.statusData.reduce((sum, item) => sum + item.totalIncome, 0).toLocaleString()}원`, 20, 60)
        
        // 테이블 헤더
        doc.setFontSize(10)
        doc.setDrawColor(0, 0, 0)
        
        const tableHeaders = ['직원명', '부서', '직급', '기본급', '총지급액', '총공제액', '실수령액', '지급일', '상태']
        const columnWidths = [20, 15, 15, 20, 20, 20, 20, 20, 15]
        const startX = 20
        let currentX = startX
        
        // 헤더 그리기
        tableHeaders.forEach((header, index) => {
          doc.rect(currentX, 80, columnWidths[index], 8)
          doc.text(header, currentX + 2, 85)
          currentX += columnWidths[index]
        })
        
        // 데이터 행들
        let yPosition = 88
        this.statusData.forEach((item) => {
          // 페이지 넘김 체크
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
          
          currentX = startX
          const rowData = [
            item.employeeName,
            item.department,
            item.position,
            item.basicSalary.toLocaleString(),
            item.totalIncome.toLocaleString(),
            item.totalDeduction.toLocaleString(),
            item.netPay.toLocaleString(),
            item.payDate,
            item.status
          ]
          
          rowData.forEach((data, dataIndex) => {
            doc.rect(currentX, yPosition, columnWidths[dataIndex], 8)
            doc.text(data, currentX + 2, yPosition + 5)
            currentX += columnWidths[dataIndex]
          })
          
          yPosition += 8
        })
        
        // 합계 행
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        
        currentX = startX
        const totalData = [
          '합계',
          '',
          '',
          '',
          this.statusData.reduce((sum, item) => sum + item.totalIncome, 0).toLocaleString(),
          this.statusData.reduce((sum, item) => sum + item.totalDeduction, 0).toLocaleString(),
          this.statusData.reduce((sum, item) => sum + item.netPay, 0).toLocaleString(),
          '',
          ''
        ]
        
        totalData.forEach((data, dataIndex) => {
          doc.rect(currentX, yPosition, columnWidths[dataIndex], 8)
          doc.text(data, currentX + 2, yPosition + 5)
          currentX += columnWidths[dataIndex]
        })
        
        // PDF 다운로드
        doc.save(`급여현황보고서_${new Date().toISOString().slice(0, 10)}.pdf`)
        
        this.success('PDF 보고서가 다운로드되었습니다.')
        
      } catch (error) {
        console.error('PDF 생성 오류:', error)
        this.error('PDF 생성 중 오류가 발생했습니다.')
      }
    },
    // Excel 보고서 생성
    async generateExcel() {
      try {
        // XLSX 라이브러리 동적 로드
        const XLSX = await import('xlsx')
        
        // 데이터 준비
        const worksheetData = [
          ['급여 현황 보고서'],
          [`생성일: ${new Date().toLocaleDateString()}`],
          [`총 직원 수: ${this.statusData.length}명`],
          [`총 지급액: ${this.statusData.reduce((sum, item) => sum + item.totalIncome, 0).toLocaleString()}원`],
          [''],
          ['직원명', '부서', '직급', '기본급', '총 지급액', '총 공제액', '실수령액', '지급일', '상태']
        ]
        
        // 데이터 행 추가
        this.statusData.forEach(item => {
          worksheetData.push([
            item.employeeName,
            item.department,
            item.position,
            item.basicSalary,
            item.totalIncome,
            item.totalDeduction,
            item.netPay,
            item.payDate,
            item.status
          ])
        })
        
        // 합계 행 추가
        worksheetData.push([''])
        worksheetData.push([
          '합계',
          '',
          '',
          '',
          this.statusData.reduce((sum, item) => sum + item.totalIncome, 0),
          this.statusData.reduce((sum, item) => sum + item.totalDeduction, 0),
          this.statusData.reduce((sum, item) => sum + item.netPay, 0),
          '',
          ''
        ])
        
        // 워크시트 생성
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
        
        // 워크북 생성
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, '급여현황')
        
        // Excel 파일 생성 및 다운로드
        XLSX.writeFile(workbook, `급여현황보고서_${new Date().toISOString().slice(0, 10)}.xlsx`)
        
        this.success('Excel 보고서가 생성되었습니다.')
        
      } catch (error) {
        console.error('Excel 생성 오류:', error)
        this.error('Excel 생성 중 오류가 발생했습니다.')
      }
    }
  }
}
</script>

<style scoped>
.payroll-status-output {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.page-header p {
  color: #606266;
  font-size: 14px;
}

.content-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.status-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.status-table {
  margin-top: 20px;
}
</style>
