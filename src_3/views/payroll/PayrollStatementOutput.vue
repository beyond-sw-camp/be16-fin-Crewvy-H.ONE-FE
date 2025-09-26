<template>
  <div class="payroll-statement-output">
    <div class="page-header">
      <h1>명세서 출력</h1>
      <p>직원별 급여 명세서를 생성하고 출력합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 명세서 생성</span>
            <div class="header-actions">
              <el-button @click="generatePDFStatement">PDF 명세서</el-button>
              <el-button @click="generateExcelStatement">Excel 명세서</el-button>
              <el-button type="primary" @click="printStatement">인쇄</el-button>
            </div>
          </div>
        </template>
        
        <div class="statement-filters">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="명세서 기간">
                <el-date-picker
                  v-model="statementPeriod"
                  type="month"
                  placeholder="명세서 기간 선택"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="직원 선택">
                <el-select v-model="selectedEmployee" placeholder="직원 선택">
                  <el-option label="전체" value="" />
                  <el-option label="김철수" value="kim" />
                  <el-option label="이영희" value="lee" />
                  <el-option label="박민수" value="park" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="출력 형식">
                <el-select v-model="outputFormat" placeholder="출력 형식 선택">
                  <el-option label="PDF" value="pdf" />
                  <el-option label="Excel" value="excel" />
                  <el-option label="인쇄" value="print" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <el-table :data="statementData" style="width: 100%" class="statement-table">
          <el-table-column prop="employeeName" label="직원명" min-width="120" align="center" />
          <el-table-column prop="period" label="급여 기간" min-width="120" align="center" />
          <el-table-column prop="basicSalary" label="기본급" min-width="100" align="center">
            <template #default="scope">
              {{ scope.row.basicSalary.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="allowance" label="수당" min-width="100" align="center">
            <template #default="scope">
              {{ scope.row.allowance.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="totalIncome" label="총 지급액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.totalIncome.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="tax" label="소득세" min-width="100" align="center">
            <template #default="scope">
              {{ scope.row.tax.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="insurance" label="4대보험" min-width="100" align="center">
            <template #default="scope">
              {{ scope.row.insurance.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="netPay" label="실수령액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.netPay.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column label="상태" min-width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '완료' ? 'success' : 'warning'">
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
  name: 'PayrollStatementOutput',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 목업 데이터 늘리기 (총 60행)
    const base = [...this.statementData]
    const targetCount = 60
    const mockNames = ['김민준','이서연','박도윤','최지우','정하준','한유진','조준서','윤예린','장수아','임시우','오태윤','서연우','신아윤','권승현','황재민','문서윤','홍지안','강유나','배민서','류하린']
    let i = 0
    while (this.statementData.length < targetCount) {
      const src = base[i % base.length]
      const idx = this.statementData.length + 1
      const varied = {
        employeeName: mockNames[idx % mockNames.length],
        period: src.period,
        basicSalary: src.basicSalary + (idx % 10) * 10000,
        allowance: src.allowance + (idx % 6) * 5000,
        totalIncome: src.totalIncome + (idx % 8) * 12000,
        tax: src.tax + (idx % 7) * 3000,
        insurance: src.insurance + (idx % 5) * 2000,
        netPay: src.netPay + (idx % 9) * 8000,
        status: src.status
      }
      this.statementData.push(varied)
      i++
    }
  },
  data() {
    return {
      statementPeriod: new Date(),
      selectedEmployee: '',
      outputFormat: 'pdf',
      statementData: [
        {
          employeeName: '김철수',
          period: '2024-09',
          basicSalary: 3000000,
          allowance: 200000,
          totalIncome: 3350000,
          tax: 335000,
          insurance: 268000,
          netPay: 2747000,
          status: '완료'
        },
        {
          employeeName: '이영희',
          period: '2024-09',
          basicSalary: 2800000,
          allowance: 300000,
          totalIncome: 3200000,
          tax: 320000,
          insurance: 256000,
          netPay: 2624000,
          status: '완료'
        },
        {
          employeeName: '박민수',
          period: '2024-09',
          basicSalary: 2500000,
          allowance: 150000,
          totalIncome: 2700000,
          tax: 270000,
          insurance: 216000,
          netPay: 2214000,
          status: '완료'
        }
      ]
    }
  },
  methods: {
    generateStatement() {
      this.success('급여 명세서가 생성되었습니다.')
    },
    printStatement() {
      this.success('명세서 인쇄가 시작되었습니다.')
    },
    // PDF 명세서 생성
    async generatePDFStatement() {
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
            <h1 style="font-size: 24px; margin: 0; color: #2c3e50;">급여 명세서</h1>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">생성일: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 5px 0; font-size: 14px;">명세서 생성일: ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0; font-size: 14px;">총 직원 수: ${this.statementData.length}명</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
            <thead>
              <tr style="background-color: #2980b9; color: white;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">직원명</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">급여기간</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">기본급</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">수당</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">총지급액</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">소득세</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">4대보험</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">실수령액</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">상태</th>
              </tr>
            </thead>
            <tbody>
              ${this.statementData.map((item, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.employeeName}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.period}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.basicSalary.toLocaleString()}원</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.allowance.toLocaleString()}원</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.totalIncome.toLocaleString()}원</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.tax.toLocaleString()}원</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.insurance.toLocaleString()}원</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.netPay.toLocaleString()}원</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.status}</td>
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
        pdf.save(`급여명세서_${new Date().toISOString().slice(0, 10)}.pdf`)
        
        this.success('PDF 명세서가 다운로드되었습니다.')
        
      } catch (error) {
        console.error('PDF 생성 오류:', error)
        this.error('PDF 생성 중 오류가 발생했습니다.')
      }
    },
    // Excel 명세서 생성
    async generateExcelStatement() {
      try {
        // XLSX 라이브러리 동적 로드
        const XLSX = await import('xlsx')
        
        // 데이터 준비
        const worksheetData = [
          ['급여 명세서'],
          [`생성일: ${new Date().toLocaleDateString()}`],
          [''],
          ['직원명', '급여 기간', '기본급', '수당', '총 지급액', '소득세', '4대보험', '실수령액', '상태']
        ]
        
        // 데이터 행 추가
        this.statementData.forEach(item => {
          worksheetData.push([
            item.employeeName,
            item.period,
            item.basicSalary,
            item.allowance,
            item.totalIncome,
            item.tax,
            item.insurance,
            item.netPay,
            item.status
          ])
        })
        
        // 워크시트 생성
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
        
        // 워크북 생성
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, '급여명세서')
        
        // Excel 파일 생성 및 다운로드
        XLSX.writeFile(workbook, `급여명세서_${new Date().toISOString().slice(0, 10)}.xlsx`)
        
        this.success('Excel 명세서가 생성되었습니다.')
        
      } catch (error) {
        console.error('Excel 생성 오류:', error)
        this.error('Excel 생성 중 오류가 발생했습니다.')
      }
    }
  }
}
</script>

<style scoped>
.payroll-statement-output {
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

.statement-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.statement-table {
  margin-top: 20px;
}
</style>
