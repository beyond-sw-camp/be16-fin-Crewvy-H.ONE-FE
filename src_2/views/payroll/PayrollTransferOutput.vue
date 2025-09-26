<template>
  <div class="payroll-transfer-output">
    <div class="page-header">
      <h1>급여 이체 출력</h1>
      <p>급여 이체를 위한 파일을 생성하고 출력합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 이체 파일 생성</span>
            <div class="header-actions">
              <el-button @click="generateExcelFile">Excel 파일</el-button>
              <el-button @click="generatePDFFile">PDF 파일</el-button>
              <el-button @click="printDocument">인쇄</el-button>
              <el-button type="primary" @click="downloadFile">다운로드</el-button>
            </div>
          </div>
        </template>
        
        <div class="transfer-filters">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="이체 기간">
                <el-date-picker
                  v-model="transferPeriod"
                  type="month"
                  placeholder="이체 기간 선택"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="은행">
                <el-select v-model="selectedBank" placeholder="은행 선택">
                  <el-option label="전체" value="" />
                  <el-option label="국민은행" value="kb" />
                  <el-option label="신한은행" value="shinhan" />
                  <el-option label="우리은행" value="woori" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="파일 형식">
                <el-select v-model="fileFormat" placeholder="파일 형식 선택">
                  <el-option label="Excel" value="excel" />
                  <el-option label="PDF" value="pdf" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <el-table :data="transferData" style="width: 100%" class="transfer-table">
          <el-table-column prop="bankName" label="은행" min-width="100" align="center" />
          <el-table-column prop="department" label="부서" min-width="100" align="center" />
          <el-table-column prop="employeeId" label="사번" min-width="100" align="center" />
          <el-table-column prop="employeeName" label="예금주" min-width="120" align="center" />
          <el-table-column prop="accountNumber" label="계좌번호" min-width="150" align="center" />
          <el-table-column prop="amount" label="입금액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.amount.toLocaleString() }}원
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import ExcelJS from 'exceljs'

export default {
  name: 'PayrollTransferOutput',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 목업 데이터 늘리기 (총 80행)
    const base = [...this.transferData]
    const targetCount = 80
    const mockNames = ['김민준','이서연','박도윤','최지우','정하준','한유진','조준서','윤예린','장수아','임시우','오태윤','서연우','신아윤','권승현','황재민','문서윤','홍지안','강유나','배민서','류하린']
    const departments = ['관리팀', '영업팀', '개발팀', '마케팅팀', '인사팀', '재무팀', '디자인팀', 'QA팀']
    let i = 0
    while (this.transferData.length < targetCount) {
      const src = base[i % base.length]
      const idx = this.transferData.length + 1
      const varied = {
        employeeId: String(220500 + idx).padStart(6, '0'),
        employeeName: mockNames[idx % mockNames.length],
        department: departments[idx % departments.length],
        accountNumber: src.accountNumber.replace(/\d/g, (d) => ((+d + idx) % 10)),
        bankName: src.bankName,
        amount: src.amount + (idx % 7) * 5000,
        transferDate: src.transferDate,
        status: src.status
      }
      this.transferData.push(varied)
      i++
    }
  },
  data() {
    return {
      transferPeriod: new Date(),
      selectedBank: '',
      fileFormat: 'excel',
      transferData: [
        {
          employeeName: '김철수',
          employeeId: '220503',
          department: '관리팀',
          accountNumber: '285102-04-269765',
          bankName: '국민은행',
          amount: 3008550,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '이영희',
          employeeId: '220504',
          department: '관리팀',
          accountNumber: '285102-04-269766',
          bankName: '국민은행',
          amount: 2559910,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '박민수',
          employeeId: '220505',
          department: '영업팀',
          accountNumber: '285102-04-269767',
          bankName: '국민은행',
          amount: 3200000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '최지영',
          employeeId: '220506',
          department: '영업팀',
          accountNumber: '285102-04-269768',
          bankName: '국민은행',
          amount: 2800000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '정하준',
          employeeId: '220507',
          department: '개발팀',
          accountNumber: '285102-04-269769',
          bankName: '국민은행',
          amount: 3500000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '한유진',
          employeeId: '220508',
          department: '마케팅팀',
          accountNumber: '110-123-456789',
          bankName: '신한은행',
          amount: 2800000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '조준서',
          employeeId: '220509',
          department: '마케팅팀',
          accountNumber: '110-123-456790',
          bankName: '신한은행',
          amount: 3200000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '윤예린',
          employeeId: '220510',
          department: '마케팅팀',
          accountNumber: '110-123-456791',
          bankName: '신한은행',
          amount: 2900000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '장수아',
          employeeId: '220511',
          department: '인사팀',
          accountNumber: '1002-123-456789',
          bankName: '우리은행',
          amount: 3100000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '임시우',
          employeeId: '220512',
          department: '인사팀',
          accountNumber: '1002-123-456790',
          bankName: '우리은행',
          amount: 2700000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '오태윤',
          employeeId: '220513',
          department: '인사팀',
          accountNumber: '1002-123-456791',
          bankName: '우리은행',
          amount: 3300000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '서연우',
          employeeId: '220514',
          department: '인사팀',
          accountNumber: '1002-123-456792',
          bankName: '우리은행',
          amount: 2850000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '신아윤',
          employeeId: '220515',
          department: '인사팀',
          accountNumber: '1002-123-456793',
          bankName: '우리은행',
          amount: 2950000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '권승현',
          employeeId: '220516',
          department: '인사팀',
          accountNumber: '1002-123-456794',
          bankName: '우리은행',
          amount: 3200000,
          transferDate: '2024-09-25',
          status: '완료'
        }
      ]
    }
  },
  methods: {
    generateFile() {
      this.success('급여 이체 파일이 생성되었습니다.')
    },
    downloadFile() {
      if (this.fileFormat === 'excel') {
        this.generateExcelFile()
      } else if (this.fileFormat === 'pdf') {
        this.generatePDFFile()
      }
    },
    
    // Excel 파일 생성 (셀 병합 및 스타일링 포함)
    async generateExcelFile() {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('급여이체명세서')
      
      // 데이터를 은행별, 부서별로 그룹화
      const groupedData = this.groupDataByBankAndDepartment()
      
      // 제목 추가
      const titleRow = worksheet.addRow(['09월분 급여이체'])
      titleRow.getCell(1).font = { size: 16, bold: true }
      titleRow.getCell(1).alignment = { horizontal: 'center' }
      worksheet.mergeCells('A1:F1')
      
      // 빈 행 추가
      worksheet.addRow([])
      
      // 헤더 추가
      const headerRow = worksheet.addRow(['은행', '부서', '사번', '예금주', '계좌번호', '입금액'])
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
        cell.alignment = { horizontal: 'center' }
      })
      
      let totalAmount = 0
      let totalCount = 0
      let currentRow = 4 // 제목(1) + 빈행(1) + 헤더(1) + 다음행(1) = 4
      
      // 각 은행별로 처리
      Object.keys(groupedData).forEach(bankName => {
        const bankData = groupedData[bankName]
        let bankTotalAmount = 0
        let bankTotalCount = 0
        
        // 각 부서별로 처리
        Object.keys(bankData).forEach(department => {
          const deptData = bankData[department]
          let deptTotalAmount = 0
          let deptCount = 0
          
          // 개별 직원 데이터 추가
          deptData.forEach(employee => {
            const row = worksheet.addRow([
              employee.bankName,
              employee.department,
              employee.employeeId,
              employee.employeeName,
              employee.accountNumber,
              employee.amount.toLocaleString()
            ])
            
            // 테두리 추가
            row.eachCell((cell, colNumber) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              }
              // 입금액 열(F열)은 오른쪽 정렬, 나머지는 가운데 정렬
              if (colNumber === 6) {
                cell.alignment = { horizontal: 'right', vertical: 'middle' }
              } else {
                cell.alignment = { horizontal: 'center', vertical: 'middle' }
              }
            })
            
            deptTotalAmount += employee.amount
            deptCount++
            currentRow++
          })
          
          // 부서계 추가
          const deptSummaryRow = worksheet.addRow([
            bankName,
            department,
            '',
            '',
            `${deptCount}건`,
            deptTotalAmount.toLocaleString()
          ])
          
          // 부서계 스타일링 및 가로 셀 병합
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
            // 입금액 열(F열)은 오른쪽 정렬, 나머지는 가운데 정렬
            if (colNumber === 6) {
              cell.alignment = { horizontal: 'right', vertical: 'middle' }
            } else {
              cell.alignment = { horizontal: 'center', vertical: 'middle' }
            }
          })
          
          // 부서계에서 사번, 예금주, 계좌번호 셀 병합 (C:E)
          worksheet.mergeCells(`C${currentRow}:E${currentRow}`)
          
          bankTotalAmount += deptTotalAmount
          bankTotalCount += deptCount
          currentRow++
        })
        
        // 은행계 추가
        const bankSummaryRow = worksheet.addRow([
          bankName,
          '',
          '',
          '',
          `${bankTotalCount}건`,
          bankTotalAmount.toLocaleString()
        ])
        
        // 은행계 스타일링 및 가로 셀 병합
        bankSummaryRow.eachCell((cell, colNumber) => {
          cell.font = { bold: true }
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          // 입금액 열(F열)은 오른쪽 정렬, 나머지는 가운데 정렬
          if (colNumber === 6) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' }
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
          }
        })
        
        // 은행계에서 부서, 사번, 예금주, 계좌번호 셀 병합 (B:E)
        worksheet.mergeCells(`B${currentRow}:E${currentRow}`)
        
        totalAmount += bankTotalAmount
        totalCount += bankTotalCount
        currentRow++
      })
      
      // 전체 합계 추가
      const totalSummaryRow = worksheet.addRow([
        '',
        '',
        '',
        '',
        `${totalCount}건`,
        totalAmount.toLocaleString()
      ])
      
      // 전체합계 스타일링 및 가로 셀 병합
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
        // 입금액 열(F열)은 오른쪽 정렬, 나머지는 가운데 정렬
        if (colNumber === 6) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' }
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
        }
      })
      
      // 전체합계에서 은행, 부서, 사번, 예금주, 계좌번호 셀 병합 (A:E)
      worksheet.mergeCells(`A${currentRow}:E${currentRow}`)
      
      // 세로 셀 병합 처리
      this.mergeVerticalCells(worksheet, groupedData)
      
      // 열 너비 설정
      worksheet.columns = [
        { width: 15 }, // 은행
        { width: 15 }, // 부서
        { width: 10 }, // 사번
        { width: 12 }, // 예금주
        { width: 20 }, // 계좌번호
        { width: 15 }  // 입금액
      ]
      
      // 파일 다운로드
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `09월분 급여이체_${new Date().toISOString().slice(0, 10)}.xlsx`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.success('Excel 파일이 다운로드되었습니다.')
    },
    
    // 데이터를 은행별, 부서별로 그룹화하는 메서드
    groupDataByBankAndDepartment() {
      const grouped = {}
      
      this.transferData.forEach(employee => {
        if (!grouped[employee.bankName]) {
          grouped[employee.bankName] = {}
        }
        if (!grouped[employee.bankName][employee.department]) {
          grouped[employee.bankName][employee.department] = []
        }
        grouped[employee.bankName][employee.department].push(employee)
      })
      
      return grouped
    },
    
    // 세로 셀 병합 처리 메서드
    mergeVerticalCells(worksheet, groupedData) {
      let currentRow = 4 // 헤더 다음 행부터 시작
      
      Object.keys(groupedData).forEach(bankName => {
        const bankData = groupedData[bankName]
        const bankStartRow = currentRow
        let bankRowCount = 0
        
        Object.keys(bankData).forEach(department => {
          const deptData = bankData[department]
          const deptStartRow = currentRow
          let deptRowCount = 0
          
          // 개별 직원 데이터 행 수 계산
          deptData.forEach(() => {
            deptRowCount++
            currentRow++
          })
          
          // 부서계 행 추가
          deptRowCount++
          currentRow++
          
          // 부서별 세로 셀 병합 (부서명)
          if (deptRowCount > 1) {
            worksheet.mergeCells(`B${deptStartRow}:B${deptStartRow + deptRowCount - 1}`)
          }
          
          bankRowCount += deptRowCount
        })
        
        // 은행계 행 추가
        bankRowCount++
        currentRow++
        
        // 은행별 세로 셀 병합 (은행명)
        if (bankRowCount > 1) {
          worksheet.mergeCells(`A${bankStartRow}:A${bankStartRow + bankRowCount - 1}`)
        }
      })
    },
    
    // PDF 파일 생성 (개선된 방식 - 사용자가 직접 저장)
    async generatePDFFile() {
      try {
        // PDF 생성을 위한 HTML 생성
        const htmlContent = this.generatePDFHTMLFixed()
        
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
          <h3>📄 급여이체명세서 출력 안내</h3>
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
    
    // 인쇄 기능 (개선된 방식)
    printDocument() {
      try {
        const htmlContent = this.generatePDFHTMLFixed()
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
          <h3>🖨️ 급여이체명세서 인쇄 안내</h3>
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
    
    // PDF용 HTML 생성 (Excel과 동일한 스타일링 및 실제 셀 병합)
    generatePDFHTML() {
      const groupedData = this.groupDataByBankAndDepartment()
      let totalAmount = 0
      let totalCount = 0
      
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>급여이체명세서</title>
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
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              table-layout: fixed;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 6px; 
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
            .bank-summary { 
              background-color: #E0E0E0; 
              font-weight: bold; 
            }
            .dept-summary { 
              background-color: #F0F8FF; 
              font-weight: bold; 
            }
            .bank-cell {
              background-color: #E0E0E0;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
            }
            .dept-cell {
              background-color: #F0F8FF;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
            }
            .col-bank { width: 15%; }
            .col-dept { width: 15%; }
            .col-id { width: 10%; }
            .col-name { width: 12%; }
            .col-account { width: 20%; }
            .col-amount { width: 15%; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
              th { background-color: #E6E6FA !important; }
              .summary { background-color: #E6F7E6 !important; }
              .bank-summary { background-color: #E0E0E0 !important; }
              .dept-summary { background-color: #F0F8FF !important; }
              .bank-cell { background-color: #E0E0E0 !important; }
              .dept-cell { background-color: #F0F8FF !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">09월분 급여이체명세서</div>
            <div class="date">생성일: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div class="filename-suggestion" style="font-size: 11px; color: #666; margin-top: 5px;">
              권장 파일명: 급여이체명세서_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${new Date().toTimeString().slice(0, 8).replace(/:/g, '')}.pdf
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th class="col-bank">은행</th>
                <th class="col-dept">부서</th>
                <th class="col-id">사번</th>
                <th class="col-name">예금주</th>
                <th class="col-account">계좌번호</th>
                <th class="col-amount">입금액</th>
              </tr>
            </thead>
            <tbody>
      `
      
      // 각 은행별로 처리
      Object.keys(groupedData).forEach(bankName => {
        const bankData = groupedData[bankName]
        let bankTotalAmount = 0
        let bankTotalCount = 0
        
        // 각 부서별로 처리
        Object.keys(bankData).forEach(department => {
          const deptData = bankData[department]
          let deptTotalAmount = 0
          let deptCount = 0
          
          // 개별 직원 데이터 추가
          deptData.forEach((employee, index) => {
            const isFirstInDept = index === 0
            const isFirstInBank = Object.keys(bankData).indexOf(department) === 0 && isFirstInDept
            
            // 은행명 셀 병합 (첫 번째 부서의 첫 번째 직원에서만)
            const bankRowSpan = isFirstInBank ? this.getBankRowSpan(groupedData, bankName) : ''
            const bankCellContent = isFirstInBank ? employee.bankName : ''
            const bankCellClass = isFirstInBank ? ' bank-cell' : ''
            
            // 부서명 셀 병합 (부서의 첫 번째 직원에서만)
            const deptRowSpan = isFirstInDept ? deptData.length : ''
            const deptCellContent = isFirstInDept ? employee.department : ''
            const deptCellClass = isFirstInDept ? ' dept-cell' : ''
            
            html += `
              <tr>
                <td class="col-bank${bankCellClass}"${bankRowSpan ? ` rowspan="${bankRowSpan}"` : ''}>${bankCellContent}</td>
                <td class="col-dept${deptCellClass}"${deptRowSpan ? ` rowspan="${deptRowSpan}"` : ''}>${deptCellContent}</td>
                <td class="col-id">${employee.employeeId}</td>
                <td class="col-name">${employee.employeeName}</td>
                <td class="col-account">${employee.accountNumber}</td>
                <td class="col-amount amount">${employee.amount.toLocaleString()}</td>
              </tr>
            `
            deptTotalAmount += employee.amount
            deptCount++
          })
          
          // 부서계 추가
          html += `
            <tr class="dept-summary">
              <td class="col-bank"></td>
              <td class="col-dept"></td>
              <td class="col-id"></td>
              <td class="col-name"></td>
              <td class="col-account">${deptCount}건</td>
              <td class="col-amount amount">${deptTotalAmount.toLocaleString()}</td>
            </tr>
          `
          
          bankTotalAmount += deptTotalAmount
          bankTotalCount += deptCount
        })
        
        // 은행계 추가
        html += `
          <tr class="bank-summary">
            <td class="col-bank"></td>
            <td class="col-dept"></td>
            <td class="col-id"></td>
            <td class="col-name"></td>
            <td class="col-account">${bankTotalCount}건</td>
            <td class="col-amount amount">${bankTotalAmount.toLocaleString()}</td>
          </tr>
        `
        
        totalAmount += bankTotalAmount
        totalCount += bankTotalCount
      })
      
      // 전체 합계 추가
      html += `
            <tr class="summary">
              <td class="col-bank"></td>
              <td class="col-dept"></td>
              <td class="col-id"></td>
              <td class="col-name"></td>
              <td class="col-account">${totalCount}건</td>
              <td class="col-amount amount">${totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        </body>
        </html>
      `
      
      return html
    },
    
    // 은행별 총 행 수 계산 (셀 병합용)
    getBankRowSpan(groupedData, bankName) {
      const bankData = groupedData[bankName]
      let totalRows = 0
      
      Object.keys(bankData).forEach(department => {
        const deptData = bankData[department]
        totalRows += deptData.length + 1 // 개별 데이터 + 부서계
      })
      totalRows += 1 // 은행계
      
      return totalRows
    },
    
    // PDF용 HTML 생성 (올바른 셀 병합 로직 - 수직 정렬 및 색상 문제 해결)
    generatePDFHTMLFixed() {
      const groupedData = this.groupDataByBankAndDepartment()
      let totalAmount = 0
      let totalCount = 0
      
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>급여이체명세서</title>
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
              height: 35px;
              line-height: 1.2;
              box-sizing: border-box;
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
            .bank-summary { 
              background-color: #E0E0E0; 
              font-weight: bold; 
            }
            .dept-summary { 
              background-color: #F0F8FF; 
              font-weight: bold; 
            }
            .bank-cell {
              background-color: #E0E0E0 !important;
              font-weight: bold;
              text-align: center !important;
              vertical-align: middle !important;
              display: table-cell;
              position: relative;
            }
            .dept-cell {
              background-color: #F0F8FF !important;
              font-weight: bold;
              text-align: center !important;
              vertical-align: middle !important;
              display: table-cell;
              position: relative;
            }
            .col-bank { width: 15%; }
            .col-dept { width: 15%; }
            .col-id { width: 10%; }
            .col-name { width: 12%; }
            .col-account { width: 20%; }
            .col-amount { width: 15%; }
            @media screen {
              * { 
                -webkit-print-color-adjust: exact !important; 
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            @media print {
              body { margin: 0; }
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
              .bank-summary { 
                background-color: #E0E0E0 !important;
                color: #000 !important;
              }
              .dept-summary { 
                background-color: #F0F8FF !important;
                color: #000 !important;
              }
              .bank-cell { 
                background-color: #E0E0E0 !important;
                color: #000 !important;
                vertical-align: middle !important;
                text-align: center !important;
              }
              .dept-cell { 
                background-color: #F0F8FF !important;
                color: #000 !important;
                vertical-align: middle !important;
                text-align: center !important;
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
            <div class="title">09월분 급여이체명세서</div>
            <div class="date">생성일: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div class="filename-suggestion" style="font-size: 11px; color: #666; margin-top: 5px;">
              권장 파일명: 급여이체명세서_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${new Date().toTimeString().slice(0, 8).replace(/:/g, '')}.pdf
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th class="col-bank">은행</th>
                <th class="col-dept">부서</th>
                <th class="col-id">사번</th>
                <th class="col-name">예금주</th>
                <th class="col-account">계좌번호</th>
                <th class="col-amount">입금액</th>
              </tr>
            </thead>
            <tbody>
      `
      
      // 각 은행별로 처리
      Object.keys(groupedData).forEach(bankName => {
        const bankData = groupedData[bankName]
        let bankTotalAmount = 0
        let bankTotalCount = 0
        
        // 각 부서별로 처리
        Object.keys(bankData).forEach(department => {
          const deptData = bankData[department]
          let deptTotalAmount = 0
          let deptCount = 0
          
          // 개별 직원 데이터 추가
          deptData.forEach((employee, index) => {
            const isFirstInDept = index === 0
            const isFirstInBank = Object.keys(bankData).indexOf(department) === 0 && isFirstInDept
            
            html += `
              <tr>
            `
            
            // 은행명 셀 (첫 번째 부서의 첫 번째 직원에서만)
            if (isFirstInBank) {
              const bankRowSpan = this.getBankRowSpan(groupedData, bankName)
              html += `<td class="col-bank bank-cell" rowspan="${bankRowSpan}" style="vertical-align: middle; text-align: center; background-color: #E0E0E0;">${employee.bankName}</td>`
            }
            
            // 부서명 셀 (부서의 첫 번째 직원에서만)
            if (isFirstInDept) {
              html += `<td class="col-dept dept-cell" rowspan="${deptData.length + 1}" style="vertical-align: middle; text-align: center; background-color: #F0F8FF;">${employee.department}</td>`
            }
            
            // 나머지 데이터 셀들
            html += `
                <td class="col-id">${employee.employeeId}</td>
                <td class="col-name">${employee.employeeName}</td>
                <td class="col-account">${employee.accountNumber}</td>
                <td class="col-amount amount">${employee.amount.toLocaleString()}</td>
              </tr>
            `
            deptTotalAmount += employee.amount
            deptCount++
          })
          
          // 부서계 추가 (건수와 금액을 올바른 위치에 배치)
          html += `
            <tr class="dept-summary" style="background-color: #F0F8FF;">
              <td class="col-id" colspan="2" style="background-color: #F0F8FF; font-weight: bold;">부서계</td>
              <td class="col-account" style="background-color: #F0F8FF; font-weight: bold;">${deptCount}건</td>
              <td class="col-amount amount" style="background-color: #F0F8FF; font-weight: bold;">${deptTotalAmount.toLocaleString()}</td>
            </tr>
          `
          
          bankTotalAmount += deptTotalAmount
          bankTotalCount += deptCount
        })
        
        // 은행계 추가 (건수와 금액을 올바른 위치에 배치)
        html += `
          <tr class="bank-summary" style="background-color: #E0E0E0;">
            <td class="col-id" style="background-color: #E0E0E0;"></td>
            <td class="col-dept" colspan="2" style="background-color: #E0E0E0; font-weight: bold;">은행계</td>
            <td class="col-account" style="background-color: #E0E0E0; font-weight: bold;">${bankTotalCount}건</td>
            <td class="col-amount amount" style="background-color: #E0E0E0; font-weight: bold;">${bankTotalAmount.toLocaleString()}</td>
          </tr>
        `
        
        totalAmount += bankTotalAmount
        totalCount += bankTotalCount
      })
      
      // 전체 합계 추가 (건수와 금액을 올바른 위치에 배치)
      html += `
            <tr class="summary" style="background-color: #E6F7E6;">
              <td class="col-bank" style="background-color: #E6F7E6;"></td>
              <td class="col-dept" colspan="3" style="background-color: #E6F7E6; font-weight: bold;">총계</td>
              <td class="col-account" style="background-color: #E6F7E6; font-weight: bold;">${totalCount}건</td>
              <td class="col-amount amount" style="background-color: #E6F7E6; font-weight: bold;">${totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        </body>
        </html>
      `
      
      return html
    }
  }
}
</script>

<style scoped>
.payroll-transfer-output {
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

.transfer-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.transfer-table {
  margin-top: 20px;
}
</style>
