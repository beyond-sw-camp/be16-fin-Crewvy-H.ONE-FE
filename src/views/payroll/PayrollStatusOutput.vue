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
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  @change="fetchPayrollStatus"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="부서">
                <el-select v-model="selectedDepartment" placeholder="부서 선택">
                  <el-option label="전체" value="" />
                  <el-option 
                    v-for="dept in departmentList" 
                    :key="dept" 
                    :label="dept" 
                    :value="dept" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="급여 상태">
                <el-select v-model="selectedStatus" placeholder="상태 선택">
                  <el-option label="전체" value="" />
                  <el-option label="지급완료" value="PAID" />
                  <el-option label="지급대기" value="PENDING" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <el-table :data="filteredStatusData" style="width: 100%" class="status-table" v-loading="loading">
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
import apiClient from '@/api/http'
import { getUserHeaders } from '@/utils/authUtils'

export default {
  name: 'PayrollStatusOutput',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 초기 데이터 로드
    this.fetchPayrollStatus()
  },
  data() {
    // 초기값: 당월 설정
    const now = new Date()
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    return {
      statusPeriod: currentYearMonth,
      selectedDepartment: '',
      selectedStatus: '',
      statusData: [],
      allStatusData: [], // 원본 데이터 (필터링 전)
      loading: false
    }
  },
  computed: {
    // 필터링된 데이터
    filteredStatusData() {
      let filtered = [...this.allStatusData]
      
      // 부서 필터링
      if (this.selectedDepartment && this.selectedDepartment !== '') {
        filtered = filtered.filter(item => item.department === this.selectedDepartment)
      }
      
      // 급여 상태 필터링
      if (this.selectedStatus && this.selectedStatus !== '') {
        const statusMap = {
          'PAID': '지급완료',
          'PENDING': '지급대기'
        }
        const statusText = statusMap[this.selectedStatus] || this.selectedStatus
        filtered = filtered.filter(item => item.status === statusText)
      }
      
      return filtered
    },
    // 부서 목록 (동적으로 생성)
    departmentList() {
      const departments = [...new Set(this.allStatusData.map(item => item.department).filter(Boolean))]
      return departments.sort()
    }
  },
  methods: {
    // 급여 현황 데이터 조회
    async fetchPayrollStatus() {
      try {
        this.loading = true
        
        let yearMonth = ''
        
        // statusPeriod를 yyyy-MM 형식으로 변환
        // 조회기간이 선택되지 않았거나 null인 경우 당월로 설정
        if (this.statusPeriod && this.statusPeriod !== null && this.statusPeriod !== '') {
          if (typeof this.statusPeriod === 'string') {
            yearMonth = this.statusPeriod
          } else {
            const date = new Date(this.statusPeriod)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            yearMonth = `${year}-${month}`
          }
        } else {
          // 기본값: 현재 년월 (당월)
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, '0')
          yearMonth = `${year}-${month}`
          // statusPeriod도 당월로 업데이트
          this.statusPeriod = yearMonth
        }
        
        const userHeaders = getUserHeaders()
        const response = await apiClient.get('/workforce-service/salary/list', {
          params: {
            yearMonth: yearMonth
          },
          headers: userHeaders
        })
        
        // API 응답 데이터를 컴포넌트 형식으로 변환
        const apiData = response.data?.data || response.data || []
        this.allStatusData = apiData.map(item => ({
          employeeName: item.memberName || '',
          department: item.department || '',
          position: item.role || '',
          basicSalary: item.baseSalary || 0,
          totalIncome: item.totalAllowance || 0,
          totalDeduction: item.totalDeduction || 0,
          netPay: item.netPay || 0,
          payDate: item.paymentDate || '',
          status: this.convertStatus(item.status || '')
        }))
        
        // statusData는 computed의 filteredStatusData를 사용하므로 업데이트 불필요
        this.success('급여 현황을 조회했습니다.')
      } catch (err) {
        console.error('급여 현황 조회 실패:', err)
        this.error('급여 현황을 불러오는데 실패했습니다.')
        this.allStatusData = []
      } finally {
        this.loading = false
      }
    },
    
    // API status를 한글 상태로 변환
    convertStatus(status) {
      const statusMap = {
        'PENDING': '지급대기',
        'PAID': '지급완료'
      }
      return statusMap[status] || status
    },
    
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
    // 인쇄 기능
    printReport() {
      try {
        const htmlContent = this.generatePrintHTMLFixed()
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        
        // CSS 추가
        const style = printWindow.document.createElement('style')
        style.textContent = `
          @media print {
            body { margin: 0; }
            @page { margin: 0.5in; }
          }
          @media screen {
            body { margin: 20px; }
            .print-instructions {
              background: #f0f8ff;
              border: 1px solid #0066cc;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 20px;
              font-family: 'Malgun Gothic', sans-serif;
            }
            .print-instructions h3 {
              margin: 0 0 10px 0;
              color: #0066cc;
            }
            .print-instructions ol {
              margin: 0;
              padding-left: 20px;
            }
            .print-instructions li {
              margin-bottom: 5px;
            }
            .print-button {
              background: #0066cc;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              margin-right: 10px;
            }
            .print-button:hover {
              background: #0052a3;
            }
          }
        `
        printWindow.document.head.appendChild(style)
        
        // 인쇄 안내 메시지 추가
        const instructionsDiv = printWindow.document.createElement('div')
        instructionsDiv.className = 'print-instructions'
        instructionsDiv.innerHTML = `
          <h3>🖨️ 급여 현황 보고서 인쇄 안내</h3>
          <ol>
            <li><strong>인쇄 버튼</strong>을 클릭하거나 <strong>Ctrl+P</strong>를 눌러주세요</li>
            <li>인쇄 설정을 확인하고 <strong>"인쇄"</strong>를 클릭하세요</li>
            <li>또는 <strong>"PDF로 저장"</strong>을 선택하여 파일로 저장할 수 있습니다</li>
          </ol>
          <button class="print-button" onclick="window.print()">🖨️ 인쇄하기</button>
          <button class="print-button" onclick="window.close()">❌ 창 닫기</button>
        `
        printWindow.document.body.insertBefore(instructionsDiv, printWindow.document.body.firstChild)
        
        this.success('인쇄 창이 열렸습니다. 인쇄 버튼을 클릭하여 인쇄하세요.')
      } catch (error) {
        this.error('인쇄 중 오류가 발생했습니다.')
        console.error('인쇄 오류:', error)
      }
    },
    
    // PDF/인쇄용 HTML 생성
    generatePrintHTMLFixed() {
      const groupedData = this.groupDataByDepartment()
      const currentDate = new Date().toLocaleDateString()
      const displayData = this.filteredStatusData // 필터링된 데이터 사용
      const totalEmployees = displayData.length
      const totalIncome = displayData.reduce((sum, item) => sum + item.totalIncome, 0)
      const totalDeduction = displayData.reduce((sum, item) => sum + item.totalDeduction, 0)
      const totalNetPay = displayData.reduce((sum, item) => sum + item.netPay, 0)
      
      const monthStr = this.statusPeriod ? 
        (typeof this.statusPeriod === 'string' ? this.statusPeriod.replace('-', '년 ').replace('-', '월') : 
         new Date(this.statusPeriod).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }) + '분') :
        new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }) + '분'
      
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>급여 현황 보고서</title>
          <style>
            body { 
              font-family: 'Malgun Gothic', sans-serif; 
              margin: 20px; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .date { 
              font-size: 12px; 
              color: #666; 
            }
            .info-section {
              margin-bottom: 20px;
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
              color: #2c3e50;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              table-layout: fixed;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px 6px; 
              text-align: center; 
              vertical-align: middle;
              font-size: 11px;
            }
            th { 
              background-color: #E6E6FA; 
              font-weight: bold; 
            }
            .amount { 
              text-align: right; 
            }
            .summary { 
              background-color: #E6F7E6; 
              font-weight: bold; 
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
            }
            .dept-summary { 
              background-color: #F0F8FF; 
              font-weight: bold; 
            }
            .col-name { width: 12%; }
            .col-dept { width: 12%; }
            .col-position { width: 10%; }
            .col-basic { width: 12%; }
            .col-income { width: 12%; }
            .col-deduction { width: 12%; }
            .col-net { width: 12%; }
            .col-date { width: 10%; }
            .col-status { width: 10%; }
            @media screen {
              * { 
                -webkit-print-color-adjust: exact !important; 
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            @media print {
              body { margin: 0; }
              @page { margin: 0.5in; }
              .no-print { display: none; }
              * { 
                -webkit-print-color-adjust: exact !important; 
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              th { 
                background-color: #E6E6FA !important;
                color: #000 !important;
              }
              .summary { 
                background-color: #E6F7E6 !important;
                color: #000 !important;
              }
              .dept-summary { 
                background-color: #F0F8FF !important;
                color: #000 !important;
              }
              td, th {
                border: 1px solid #000 !important;
                vertical-align: middle !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${monthStr} 급여 현황 보고서</div>
            <div class="date">생성일: ${currentDate} ${new Date().toLocaleTimeString()}</div>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">조회 기간:</span>
              <span>${this.statusPeriod ? (typeof this.statusPeriod === 'string' ? this.statusPeriod : new Date(this.statusPeriod).toLocaleDateString()) : '전체'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">부서:</span>
              <span>${this.selectedDepartment || '전체'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">급여 상태:</span>
              <span>${this.selectedStatus ? (this.selectedStatus === 'PAID' ? '지급완료' : '지급대기') : '전체'}</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th class="col-name">직원명</th>
                <th class="col-dept">부서</th>
                <th class="col-position">직급</th>
                <th class="col-basic">기본급</th>
                <th class="col-income">총 지급액</th>
                <th class="col-deduction">총 공제액</th>
                <th class="col-net">실수령액</th>
                <th class="col-date">지급일</th>
                <th class="col-status">상태</th>
              </tr>
            </thead>
            <tbody>
      `
      
      // 각 부서별로 처리
      Object.keys(groupedData).forEach(department => {
        const deptData = groupedData[department]
        let deptTotalIncome = 0
        let deptTotalDeduction = 0
        let deptTotalNetPay = 0
        let deptCount = 0
        
        // 개별 직원 데이터 추가
        deptData.forEach(employee => {
          html += `
            <tr>
              <td class="col-name">${employee.employeeName}</td>
              <td class="col-dept">${employee.department}</td>
              <td class="col-position">${employee.position}</td>
              <td class="col-basic amount">${employee.basicSalary.toLocaleString()}</td>
              <td class="col-income amount">${employee.totalIncome.toLocaleString()}</td>
              <td class="col-deduction amount">${employee.totalDeduction.toLocaleString()}</td>
              <td class="col-net amount">${employee.netPay.toLocaleString()}</td>
              <td class="col-date">${employee.payDate}</td>
              <td class="col-status">${employee.status}</td>
            </tr>
          `
          deptTotalIncome += employee.totalIncome
          deptTotalDeduction += employee.totalDeduction
          deptTotalNetPay += employee.netPay
          deptCount++
        })
        
        // 부서계 추가
        html += `
          <tr class="dept-summary" style="background-color: #F0F8FF;">
            <td class="col-name" colspan="3" style="background-color: #F0F8FF; font-weight: bold;">${department}계</td>
            <td class="col-basic" style="background-color: #F0F8FF;"></td>
            <td class="col-income amount" style="background-color: #F0F8FF; font-weight: bold;">${deptTotalIncome.toLocaleString()}</td>
            <td class="col-deduction amount" style="background-color: #F0F8FF; font-weight: bold;">${deptTotalDeduction.toLocaleString()}</td>
            <td class="col-net amount" style="background-color: #F0F8FF; font-weight: bold;">${deptTotalNetPay.toLocaleString()}</td>
            <td class="col-date" style="background-color: #F0F8FF;"></td>
            <td class="col-status" style="background-color: #F0F8FF; font-weight: bold;">${deptCount}건</td>
          </tr>
        `
      })
      
      // 전체 합계 추가
      html += `
            <tr class="summary" style="background-color: #E6F7E6;">
              <td class="col-name" colspan="4" style="background-color: #E6F7E6; font-weight: bold;">총계</td>
              <td class="col-income amount" style="background-color: #E6F7E6; font-weight: bold;">${totalIncome.toLocaleString()}</td>
              <td class="col-deduction amount" style="background-color: #E6F7E6; font-weight: bold;">${totalDeduction.toLocaleString()}</td>
              <td class="col-net amount" style="background-color: #E6F7E6; font-weight: bold;">${totalNetPay.toLocaleString()}</td>
              <td class="col-date" style="background-color: #E6F7E6;"></td>
              <td class="col-status" style="background-color: #E6F7E6; font-weight: bold;">${totalEmployees}명</td>
            </tr>
          </tbody>
        </table>
        </body>
        </html>
      `
      
      return html
    },
    // PDF 보고서 생성
    async generatePDF() {
      try {
        // PDF 생성을 위한 HTML 생성
        const htmlContent = this.generatePrintHTMLFixed()
        
        // 새 창에서 HTML 표시
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        
        // CSS 추가 (인쇄용 스타일)
        const style = printWindow.document.createElement('style')
        style.textContent = `
          @media print {
            body { margin: 0; }
            @page { margin: 0.5in; }
          }
          @media screen {
            body { margin: 20px; }
            .print-instructions {
              background: #f0f8ff;
              border: 1px solid #0066cc;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 20px;
              font-family: 'Malgun Gothic', sans-serif;
            }
            .print-instructions h3 {
              margin: 0 0 10px 0;
              color: #0066cc;
            }
            .print-instructions ol {
              margin: 0;
              padding-left: 20px;
            }
            .print-instructions li {
              margin-bottom: 5px;
            }
            .print-button {
              background: #0066cc;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              margin-right: 10px;
            }
            .print-button:hover {
              background: #0052a3;
            }
          }
        `
        printWindow.document.head.appendChild(style)
        
        // 인쇄 안내 메시지 추가
        const instructionsDiv = printWindow.document.createElement('div')
        instructionsDiv.className = 'print-instructions'
        instructionsDiv.innerHTML = `
          <h3>📄 급여 현황 보고서 PDF 출력 안내</h3>
          <ol>
            <li><strong>인쇄 버튼</strong>을 클릭하거나 <strong>Ctrl+P</strong>를 눌러주세요</li>
            <li>인쇄 대화상자에서 <strong>"대상"</strong>을 <strong>"PDF로 저장"</strong> 또는 <strong>"Microsoft Print to PDF"</strong>로 선택하세요</li>
            <li><strong>"다른 이름으로 저장"</strong> 또는 <strong>"저장"</strong>을 클릭하세요</li>
            <li>원하는 파일명을 입력하고 <strong>"저장"</strong>을 클릭하세요</li>
          </ol>
          <button class="print-button" onclick="window.print()">🖨️ 인쇄/PDF 저장</button>
          <button class="print-button" onclick="window.close()">❌ 창 닫기</button>
        `
        printWindow.document.body.insertBefore(instructionsDiv, printWindow.document.body.firstChild)
        
        this.success('PDF 생성 창이 열렸습니다. 인쇄 버튼을 클릭하여 PDF로 저장하세요.')
      } catch (error) {
        this.error('PDF 파일 생성 중 오류가 발생했습니다.')
        console.error('PDF 생성 오류:', error)
      }
    },
    // Excel 보고서 생성 (ExcelJS 사용)
    async generateExcel() {
      try {
        const ExcelJS = await import('exceljs')
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('급여현황')
        
        // 데이터를 부서별로 그룹화
        const groupedData = this.groupDataByDepartment()
        
        // 제목 추가
        const monthStr = this.statusPeriod ? 
          (typeof this.statusPeriod === 'string' ? this.statusPeriod.replace('-', '년 ').replace('-', '월') : 
           new Date(this.statusPeriod).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }) + '분') :
          new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }) + '분'
        const titleRow = worksheet.addRow([`${monthStr} 급여현황`])
        titleRow.getCell(1).font = { size: 16, bold: true }
        titleRow.getCell(1).alignment = { horizontal: 'center' }
        worksheet.mergeCells('A1:I1')
        
        // 빈 행 추가
        worksheet.addRow([])
        
        // 헤더 추가
        const headerRow = worksheet.addRow(['직원명', '부서', '직급', '기본급', '총 지급액', '총 공제액', '실수령액', '지급일', '상태'])
        headerRow.eachCell((cell) => {
          cell.font = { bold: true }
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6FA' }
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
        })
        
        let totalIncome = 0
        let totalDeduction = 0
        let totalNetPay = 0
        let totalCount = 0
        let currentRow = 4 // 제목(1) + 빈행(1) + 헤더(1) + 다음행(1) = 4
        
        // 각 부서별로 처리
        Object.keys(groupedData).forEach(department => {
          const deptData = groupedData[department]
          let deptTotalIncome = 0
          let deptTotalDeduction = 0
          let deptTotalNetPay = 0
          let deptCount = 0
          
          // 개별 직원 데이터 추가
          deptData.forEach(employee => {
            const row = worksheet.addRow([
              employee.employeeName,
              employee.department,
              employee.position,
              employee.basicSalary,
              employee.totalIncome,
              employee.totalDeduction,
              employee.netPay,
              employee.payDate,
              employee.status
            ])
            
            // 테두리 추가
            row.eachCell((cell, colNumber) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              }
              // 숫자 열은 오른쪽 정렬
              if ([4, 5, 6, 7].includes(colNumber)) {
                cell.alignment = { horizontal: 'right', vertical: 'middle' }
                if (colNumber > 3) {
                  cell.numFmt = '#,##0'
                }
              } else {
                cell.alignment = { horizontal: 'center', vertical: 'middle' }
              }
            })
            
            deptTotalIncome += employee.totalIncome
            deptTotalDeduction += employee.totalDeduction
            deptTotalNetPay += employee.netPay
            deptCount++
            currentRow++
          })
          
          // 부서계 추가
          const deptSummaryRow = worksheet.addRow([
            '',
            department,
            '',
            '',
            deptTotalIncome,
            deptTotalDeduction,
            deptTotalNetPay,
            '',
            `${deptCount}건`
          ])
          
          // 부서계 스타일링
          deptSummaryRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true }
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF0F8FF' }
            }
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
            if ([5, 6, 7].includes(colNumber)) {
              cell.alignment = { horizontal: 'right', vertical: 'middle' }
              cell.numFmt = '#,##0'
            } else {
              cell.alignment = { horizontal: 'center', vertical: 'middle' }
            }
          })
          
          // 부서계에서 직원명, 직급, 기본급, 지급일 셀 병합
          worksheet.mergeCells(`A${currentRow}:A${currentRow}`)
          worksheet.mergeCells(`C${currentRow}:C${currentRow}`)
          worksheet.mergeCells(`D${currentRow}:D${currentRow}`)
          worksheet.mergeCells(`H${currentRow}:H${currentRow}`)
          
          totalIncome += deptTotalIncome
          totalDeduction += deptTotalDeduction
          totalNetPay += deptTotalNetPay
          totalCount += deptCount
          currentRow++
        })
        
        // 전체 합계 추가
        const totalSummaryRow = worksheet.addRow([
          '',
          '',
          '',
          '',
          totalIncome,
          totalDeduction,
          totalNetPay,
          '',
          `${totalCount}건`
        ])
        
        // 전체합계 스타일링
        totalSummaryRow.eachCell((cell, colNumber) => {
          cell.font = { bold: true, size: 12 }
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6F7E6' }
          }
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'thin' },
            bottom: { style: 'medium' },
            right: { style: 'thin' }
          }
          if ([5, 6, 7].includes(colNumber)) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' }
            cell.numFmt = '#,##0'
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
          }
        })
        
        // 전체합계에서 직원명, 부서, 직급, 기본급, 지급일 셀 병합
        worksheet.mergeCells(`A${currentRow}:D${currentRow}`)
        worksheet.mergeCells(`H${currentRow}:H${currentRow}`)
        
        // 열 너비 설정
        worksheet.columns = [
          { width: 12 }, // 직원명
          { width: 12 }, // 부서
          { width: 10 }, // 직급
          { width: 15 }, // 기본급
          { width: 15 }, // 총 지급액
          { width: 15 }, // 총 공제액
          { width: 15 }, // 실수령액
          { width: 12 }, // 지급일
          { width: 12 }  // 상태
        ]
        
        // 파일 다운로드
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        const fileName = this.statusPeriod ? 
          `급여현황보고서_${typeof this.statusPeriod === 'string' ? this.statusPeriod : new Date(this.statusPeriod).toISOString().slice(0, 7)}_${new Date().toISOString().slice(0, 10)}.xlsx` :
          `급여현황보고서_${new Date().toISOString().slice(0, 10)}.xlsx`
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        this.success('Excel 파일이 다운로드되었습니다.')
        
      } catch (error) {
        console.error('Excel 생성 오류:', error)
        this.error('Excel 생성 중 오류가 발생했습니다.')
      }
    },
    
    // 데이터를 부서별로 그룹화하는 메서드
    groupDataByDepartment() {
      const grouped = {}
      const displayData = this.filteredStatusData // 필터링된 데이터 사용
      
      displayData.forEach(employee => {
        const dept = employee.department || '미지정'
        if (!grouped[dept]) {
          grouped[dept] = []
        }
        grouped[dept].push(employee)
      })
      
      return grouped
    },
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

.status-filters :deep(.el-form-item) {
  margin-bottom: 0;
}

.status-filters :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

.status-filters :deep(.el-form-item__label) {
  width: auto !important;
  padding-right: 8px;
}

.status-filters :deep(.el-date-editor) {
  width: 100%;
}

.status-table {
  margin-top: 20px;
}
</style>
