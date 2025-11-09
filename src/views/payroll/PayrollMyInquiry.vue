<template>
  <div class="payroll-my-inquiry">
    <div class="page-header">
      <h1>내 급여 조회</h1>
      <p>내 급여 내역을 조회합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>내 급여 조회</span>
            <div class="header-actions">
              <el-button @click="generatePDF">PDF 다운로드</el-button>
              <el-button @click="generateExcel">Excel 다운로드</el-button>
              <el-button type="primary" @click="printReport">인쇄</el-button>
            </div>
          </div>
        </template>
        
        <div class="inquiry-filters">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="조회 기간">
                <el-date-picker
                  v-model="inquiryPeriod"
                  type="month"
                  placeholder="전체 조회"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <el-table :data="payrollData" style="width: 100%" class="payroll-table" v-loading="loading">
          <el-table-column prop="period" label="급여 기간" min-width="120" align="center" />
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
              <span style="font-weight: 600; color: #409eff;">
                {{ scope.row.netPay.toLocaleString() }}원
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="payDate" label="지급일" min-width="120" align="center" />
          <el-table-column prop="status" label="상태" min-width="100" align="center">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ convertStatus(scope.row.status) }}
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
import apiClient from '@/api/http'
import { getUserHeaders } from '@/utils/authUtils'

export default {
  name: 'PayrollMyInquiry',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 초기 데이터 로드
    this.fetchMyPayroll()
  },
  data() {
    return {
      inquiryPeriod: '', // 처음에는 전체 조회
      allPayrollData: [], // 전체 데이터
      loading: false
    }
  },
  computed: {
    // 필터링된 데이터
    payrollData() {
      if (!this.inquiryPeriod || this.inquiryPeriod === '') {
        return this.allPayrollData
      }
      
      // 조회 기간 필터링
      return this.allPayrollData.filter(item => {
        if (!item.period) return false
        
        // period가 yearMonth 형식이거나 포함하고 있는지 확인
        const itemPeriod = typeof item.period === 'string' 
          ? item.period 
          : `${item.period.year}-${String(item.period.month).padStart(2, '0')}`
        
        return itemPeriod === this.inquiryPeriod || itemPeriod.startsWith(this.inquiryPeriod)
      })
    }
  },
  methods: {
    // 내 급여 조회
    async fetchMyPayroll() {
      try {
        this.loading = true
        
        const userHeaders = getUserHeaders()
        const response = await apiClient.get('/workforce-service/salary/member', {
          headers: userHeaders
        })
        
        const apiData = response.data?.data || response.data || []
        
        // API 응답을 컴포넌트 형식으로 변환
        this.allPayrollData = Array.isArray(apiData) ? apiData.map(item => {
          // periodStartDate에서 연월 추출
          let period = ''
          if (item.periodStartDate) {
            const date = new Date(item.periodStartDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            period = `${year}-${month}`
          }
          
          // allowanceList에서 기본급 찾기
          let basicSalary = 0
          if (item.allowanceList && Array.isArray(item.allowanceList)) {
            const baseSalaryItem = item.allowanceList.find(allowance => 
              allowance.salaryName === '기본급'
            )
            if (baseSalaryItem) {
              basicSalary = baseSalaryItem.amount || baseSalaryItem.value || 0
            }
          }
          
          return {
            period: period,
            basicSalary: basicSalary,
            totalIncome: item.totalPayment || item.totalAllowance || 0,
            totalDeduction: item.totalDeduction || 0,
            netPay: item.netPay || 0,
            payDate: item.paymentDate || item.payDate || '',
            status: item.status
          }
        }) : []
        
        if (this.allPayrollData.length > 0) {
          this.success('급여 내역을 조회했습니다.')
        } else {
          this.warning('조회된 급여 내역이 없습니다.')
        }
      } catch (err) {
        console.error('내 급여 조회 실패:', err)
        this.error('급여 내역을 불러오는데 실패했습니다.')
        this.allPayrollData = []
      } finally {
        this.loading = false
      }
    },
    
    // 상태 변환
    convertStatus(status) {
      if (status === 'PENDING' || status === '지급대기') {
        return '지급대기'
      } else if (status === 'PAID' || status === '지급완료') {
        return '지급완료'
      }
      return status
    },
    
    // 상태 타입 반환
    getStatusType(status) {
      if (status === 'PAID') {
        return 'success'
      } else if (status === 'PENDING') {
        return 'warning'
      }
      return ''
    },
    
    // PDF 생성
    async generatePDF() {
      try {
        // html2canvas와 jsPDF 동적 로드
        const html2canvas = await import('html2canvas')
        const { jsPDF } = await import('jspdf')
        
        // PDF용 HTML 요소 생성
        const pdfElement = document.createElement('div')
        pdfElement.style.cssText = `
          width: 800px;
          padding: 20px;
          font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
          background: white;
          color: black;
        `
        
        pdfElement.innerHTML = `
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin: 0; color: #2c3e50;">내 급여 조회</h1>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">생성일: ${new Date().toLocaleDateString()}</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">조회 기간: ${this.inquiryPeriod}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
            <thead>
              <tr style="background-color: #2980b9; color: white;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">급여 기간</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">기본급</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">총 지급액</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">총 공제액</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">실수령액</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">지급일</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">상태</th>
              </tr>
            </thead>
            <tbody>
              ${this.payrollData.map((item, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.period}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.basicSalary.toLocaleString()}원</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.totalIncome.toLocaleString()}원</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.totalDeduction.toLocaleString()}원</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">${item.netPay.toLocaleString()}원</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.payDate}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${this.convertStatus(item.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        
        // DOM에 임시로 추가
        document.body.appendChild(pdfElement)
        
        // HTML을 캔버스로 변환
        const canvas = await html2canvas.default(pdfElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true
        })
        
        // 캔버스를 PDF로 변환
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const imgWidth = 210
        const pageHeight = 295
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        
        let position = 0
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }
        
        // 임시 요소 제거
        document.body.removeChild(pdfElement)
        
        // PDF 다운로드
        pdf.save(`내급여조회_${this.inquiryPeriod}_${new Date().toISOString().slice(0, 10)}.pdf`)
        
        this.success('PDF 파일이 다운로드되었습니다.')
        
      } catch (error) {
        console.error('PDF 생성 오류:', error)
        this.error('PDF 생성 중 오류가 발생했습니다.')
      }
    },
    
    // Excel 생성
    async generateExcel() {
      try {
        // XLSX 라이브러리 동적 로드
        const XLSX = await import('xlsx')
        
        // 데이터 준비
        const worksheetData = [
          ['내 급여 조회'],
          [`조회 기간: ${this.inquiryPeriod}`],
          [`생성일: ${new Date().toLocaleDateString()}`],
          [''],
          ['급여 기간', '기본급', '총 지급액', '총 공제액', '실수령액', '지급일', '상태']
        ]
        
        // 데이터 행 추가
        this.payrollData.forEach(item => {
          worksheetData.push([
            item.period,
            item.basicSalary,
            item.totalIncome,
            item.totalDeduction,
            item.netPay,
            item.payDate,
            this.convertStatus(item.status)
          ])
        })
        
        // 워크시트 생성
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
        
        // 워크북 생성
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, '내급여조회')
        
        // Excel 파일 생성 및 다운로드
        XLSX.writeFile(workbook, `내급여조회_${this.inquiryPeriod}_${new Date().toISOString().slice(0, 10)}.xlsx`)
        
        this.success('Excel 파일이 다운로드되었습니다.')
        
      } catch (error) {
        console.error('Excel 생성 오류:', error)
        this.error('Excel 생성 중 오류가 발생했습니다.')
      }
    },
    
    // 인쇄
    printReport() {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>내 급여 조회</title>
          <style>
            body { 
              font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; 
              margin: 20px; 
            }
            h1 { 
              text-align: center; 
              color: #2c3e50; 
              margin-bottom: 10px;
            }
            .header-info {
              text-align: center;
              color: #666;
              margin-bottom: 20px;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
            }
            th {
              background-color: #2980b9;
              color: white;
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
            }
            td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .net-pay {
              font-weight: bold;
              color: #409eff;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>내 급여 조회</h1>
          <div class="header-info">
            <p>조회 기간: ${this.inquiryPeriod}</p>
            <p>생성일: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>급여 기간</th>
                <th>기본급</th>
                <th>총 지급액</th>
                <th>총 공제액</th>
                <th>실수령액</th>
                <th>지급일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              ${this.payrollData.map(item => `
                <tr>
                  <td>${item.period}</td>
                  <td>${item.basicSalary.toLocaleString()}원</td>
                  <td>${item.totalIncome.toLocaleString()}원</td>
                  <td>${item.totalDeduction.toLocaleString()}원</td>
                  <td class="net-pay">${item.netPay.toLocaleString()}원</td>
                  <td>${item.payDate}</td>
                  <td>${this.convertStatus(item.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `
      
      const printWindow = window.open('', '_blank')
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
      
      this.success('인쇄가 시작되었습니다.')
    }
  }
}
</script>

<style scoped>
.payroll-my-inquiry {
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

.content-section :deep(.el-card) {
  border-radius: var(--surface-radius);
  box-shadow: var(--surface-shadow);
  border: none;
}

.content-section :deep(.el-card__body) {
  border-radius: var(--surface-radius);
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

.inquiry-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: var(--surface-radius);
}

.inquiry-filters :deep(.el-form-item) {
  margin-bottom: 0;
}

.inquiry-filters :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

.inquiry-filters :deep(.el-form-item__label) {
  width: auto !important;
  padding-right: 8px;
}

.inquiry-filters :deep(.el-date-editor) {
  width: 100%;
}

.payroll-table {
  margin-top: 20px;
}
</style>

