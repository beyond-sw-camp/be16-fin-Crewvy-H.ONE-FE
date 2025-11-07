<template>
  <div class="payroll-item-inquiry">
    <div class="page-header">
      <h1>급여 항목별 조회</h1>
      <p>급여 항목별 상세 내역을 조회합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 항목별 조회</span>
            <div class="header-actions">
              <el-button @click="downloadCSV">CSV 다운로드</el-button>
              <el-button @click="downloadExcel">Excel 다운로드</el-button>
              <el-button type="primary" @click="refreshData">새로고침</el-button>
            </div>
          </div>
        </template>
        
        <div class="inquiry-filters">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="조회 기간">
                <el-date-picker
                  v-model="inquiryPeriod"
                  type="month"
                  placeholder="조회 기간 선택"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="직원명">
                <el-input v-model="employeeName" placeholder="직원명 검색" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="급여 항목">
                <el-select v-model="selectedItem" placeholder="항목 선택">
                  <el-option label="전체" value="" />
                  <el-option label="기본급" value="basic" />
                  <el-option label="수당" value="allowance" />
                  <el-option label="야근수당" value="overtime" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="부서">
                <el-select v-model="selectedDepartment" placeholder="부서 선택">
                  <el-option label="전체" value="" />
                  <el-option label="개발팀" value="dev" />
                  <el-option label="영업팀" value="sales" />
                  <el-option label="인사팀" value="hr" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <el-table 
          :data="combinedItems" 
          style="width: 100%" 
          class="item-table"
          v-loading="loading"
          @row-click="handleRowClick"
        >
          <el-table-column label="급여항목" min-width="200" align="center">
            <template #default="scope">
              <span 
                v-if="scope.row.allowanceItem"
                class="clickable-item"
                @click.stop="openDetailModal(scope.row.allowanceItem)"
              >
                {{ scope.row.allowanceItem.itemName }}
              </span>
              <span v-else class="empty-cell">-</span>
            </template>
          </el-table-column>
          <el-table-column label="지급액" min-width="180" align="center">
            <template #default="scope">
              <span 
                v-if="scope.row.allowanceItem"
                class="amount-text clickable-item"
                @click.stop="openDetailModal(scope.row.allowanceItem)"
              >
                {{ scope.row.allowanceItem.totalAmount.toLocaleString() }}원
              </span>
              <span v-else class="empty-cell">-</span>
            </template>
          </el-table-column>
          <el-table-column label="공제항목" min-width="200" align="center" class-name="deduction-column">
            <template #default="scope">
              <span 
                v-if="scope.row.deductionItem"
                class="clickable-item"
                @click.stop="openDetailModal(scope.row.deductionItem)"
              >
                {{ scope.row.deductionItem.itemName }}
              </span>
              <span v-else class="empty-cell">-</span>
            </template>
          </el-table-column>
          <el-table-column label="공제액" min-width="180" align="center">
            <template #default="scope">
              <span 
                v-if="scope.row.deductionItem"
                class="amount-text deduction-text clickable-item"
                @click.stop="openDetailModal(scope.row.deductionItem)"
              >
                {{ scope.row.deductionItem.totalAmount.toLocaleString() }}원
              </span>
              <span v-else class="empty-cell">-</span>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 상세 정보 모달 -->
        <el-dialog
          v-model="detailModalVisible"
          :title="selectedItemDetail && selectedItemDetail.itemName ? `${selectedItemDetail.itemName} 상세 내역` : '상세 내역'"
          width="80%"
          :before-close="closeDetailModal"
        >
          <el-table :data="detailData" style="width: 100%" border v-loading="detailLoading">
            <el-table-column prop="department" label="부서" min-width="120" align="center" />
            <el-table-column prop="position" label="직급" min-width="100" align="center" />
            <el-table-column prop="sabun" label="사번" min-width="120" align="center" />
            <el-table-column prop="memberName" label="성명" min-width="120" align="center" />
            <el-table-column prop="amount" label="금액" min-width="150" align="center">
              <template #default="scope">
                <span class="amount-text">{{ scope.row.amount.toLocaleString() }}원</span>
              </template>
            </el-table-column>
          </el-table>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="closeDetailModal">닫기</el-button>
            </span>
          </template>
        </el-dialog>
      </el-card>
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import apiClient from '@/api/http'
import { getUserHeaders } from '@/utils/authUtils'

export default {
  name: 'PayrollItemInquiry',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 초기 데이터 로드
    this.loadSummaryData()
  },
  data() {
    // 초기값: 당월 설정
    const now = new Date()
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    return {
      inquiryPeriod: currentYearMonth,
      employeeName: '',
      selectedItem: '',
      selectedDepartment: '',
      summaryData: [], // 항목별 요약 데이터
      detailModalVisible: false,
      selectedItemDetail: null, // 선택된 항목 정보
      detailData: [], // 모달에 표시할 상세 데이터
      loading: false,
      detailLoading: false // 모달 상세 데이터 로딩
    }
  },
  computed: {
    // 지급 항목 필터링
    allowanceItems() {
      return this.summaryData.filter(item => item.itemType === '지급')
    },
    
    // 공제 항목 필터링
    deductionItems() {
      return this.summaryData.filter(item => item.itemType === '공제')
    },
    
    // 지급 항목과 공제 항목을 결합하여 하나의 테이블로 표시
    combinedItems() {
      const allowances = this.allowanceItems
      const deductions = this.deductionItems
      const maxLength = Math.max(allowances.length, deductions.length)
      const combined = []
      
      for (let i = 0; i < maxLength; i++) {
        combined.push({
          allowanceItem: allowances[i] || null,
          deductionItem: deductions[i] || null
        })
      }
      
      return combined
    },
    
  },
  methods: {
    // 항목별 요약 데이터 로드
    async loadSummaryData() {
      try {
        this.loading = true
        
        let yearMonth = ''
        
        // 조회기간을 yyyy-MM 형식으로 변환
        if (this.inquiryPeriod && this.inquiryPeriod !== null && this.inquiryPeriod !== '') {
          if (typeof this.inquiryPeriod === 'string') {
            yearMonth = this.inquiryPeriod
          } else {
            const date = new Date(this.inquiryPeriod)
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
          this.inquiryPeriod = yearMonth
        }
        
        const userHeaders = getUserHeaders()
        const response = await apiClient.get('/workforce-service/salary/summary', {
          params: {
            yearMonth: yearMonth
          },
          headers: userHeaders
        })
        
        const responseData = response.data?.data || response.data || {}
        const paymentItems = responseData.paymentItems || []
        const deductionItems = responseData.deductionItems || []
        
        // API 응답을 컴포넌트 형식으로 변환
        const paymentData = paymentItems.map(item => ({
          itemName: item.name || '',
          itemType: '지급',
          totalAmount: item.totalAmount || 0
        }))
        
        const deductionData = deductionItems.map(item => ({
          itemName: item.name || '',
          itemType: '공제',
          totalAmount: item.totalAmount || 0
        }))
        
        this.summaryData = [...paymentData, ...deductionData]
        
        this.success('급여 항목별 조회 데이터를 불러왔습니다.')
      } catch (err) {
        console.error('급여 항목별 조회 데이터 로드 실패:', err)
        this.error('급여 항목별 조회 데이터를 불러오는데 실패했습니다.')
        this.summaryData = []
      } finally {
        this.loading = false
      }
    },
    
    // 행 클릭 핸들러
    handleRowClick(row) {
      // 행 전체 클릭 시에는 지급 항목이 있으면 지급 항목의 상세, 없으면 공제 항목의 상세 표시
      if (row.allowanceItem) {
        this.openDetailModal(row.allowanceItem)
      } else if (row.deductionItem) {
        this.openDetailModal(row.deductionItem)
      }
    },
    
    // 상세 모달 열기
    async openDetailModal(item) {
      if (!item || !item.itemName) {
        console.error('Invalid item:', item)
        this.error('항목 정보를 불러올 수 없습니다.')
        return
      }
      
      // 선택된 항목 정보 저장 (깊은 복사)
      this.selectedItemDetail = { ...item }
      
      // 모달 열기
      this.detailModalVisible = true
      this.detailData = []
      
      try {
        this.detailLoading = true
        
        let yearMonth = ''
        
        // 조회기간을 yyyy-MM 형식으로 변환
        if (this.inquiryPeriod && this.inquiryPeriod !== null && this.inquiryPeriod !== '') {
          if (typeof this.inquiryPeriod === 'string') {
            yearMonth = this.inquiryPeriod
          } else {
            const date = new Date(this.inquiryPeriod)
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
        }
        
        const userHeaders = getUserHeaders()
        const response = await apiClient.get('/workforce-service/salary/summary-details', {
          params: {
            yearMonth: yearMonth,
            name: item.itemName
          },
          headers: userHeaders
        })
        
        const apiData = response.data?.data || response.data || []
        
        // API 응답을 컴포넌트 형식으로 변환
        this.detailData = apiData.map(detail => ({
          department: detail.department || '',
          position: detail.role || '',
          sabun: detail.sabun || '',
          memberName: detail.memberName || '',
          amount: detail.amount || 0
        }))
        
      } catch (err) {
        console.error('상세 데이터 로드 실패:', err)
        this.error('상세 데이터를 불러오는데 실패했습니다.')
        this.detailData = []
      } finally {
        this.detailLoading = false
      }
    },
    
    // 상세 모달 닫기
    closeDetailModal() {
      this.detailModalVisible = false
      this.selectedItemDetail = null
      this.detailData = []
    },
    
    refreshData() {
      this.loadSummaryData()
      this.success('데이터가 새로고침되었습니다.')
    },
    // CSV 파일 다운로드
    downloadCSV() {
      const headers = ['항목명', '항목구분', '총액']
      const csvContent = [
        headers.join(','),
        ...this.summaryData.map(item => [
          item.itemName,
          item.itemType,
          item.totalAmount
        ].join(','))
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `급여항목별조회_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.success('CSV 파일이 다운로드되었습니다.')
    },
    // Excel 파일 다운로드
    async downloadExcel() {
      try {
        // XLSX 라이브러리 동적 로드
        const XLSX = await import('xlsx')
        
        // 데이터 준비
        const worksheetData = [
          ['급여 항목별 조회'],
          [`생성일: ${new Date().toLocaleDateString()}`],
          [''],
          ['항목명', '항목구분', '총액']
        ]
        
        // 데이터 행 추가
        this.summaryData.forEach(item => {
          worksheetData.push([
            item.itemName,
            item.itemType,
            item.totalAmount
          ])
        })
        
        // 워크시트 생성
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
        
        // 워크북 생성
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, '급여항목별조회')
        
        // Excel 파일 생성 및 다운로드
        XLSX.writeFile(workbook, `급여항목별조회_${new Date().toISOString().slice(0, 10)}.xlsx`)
        
        this.success('Excel 파일이 다운로드되었습니다.')
        
      } catch (error) {
        console.error('Excel 생성 오류:', error)
        this.error('Excel 생성 중 오류가 발생했습니다.')
      }
    }
  }
}
</script>

<style scoped>
.payroll-item-inquiry {
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

.inquiry-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
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

.item-table {
  margin-top: 20px;
}

.item-table :deep(.el-table__row) {
  cursor: pointer;
}

.item-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 지급액과 공제항목 사이 세로선 */
.item-table :deep(.el-table__header .deduction-column),
.item-table :deep(.el-table__body .deduction-column) {
  border-left: 0.5px solid #e4e7ed;
  position: relative;
}

.item-table :deep(.deduction-column .cell) {
  padding-left: 12px;
}

.item-table :deep(.deduction-column)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0.5px;
  background-color: #e4e7ed;
}

.clickable-item {
  cursor: pointer;
  transition: color 0.3s;
}

.clickable-item:hover {
  color: #409eff;
  text-decoration: underline;
}

.empty-cell {
  color: #c0c4cc;
}

.amount-text {
  color: #303133;
}

.deduction-text {
  color: #303133;
}

.dialog-footer {
  text-align: right;
}
</style>
