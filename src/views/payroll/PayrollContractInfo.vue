<template>
  <div class="payroll-contract-info">
    <div class="page-header">
      <h1>급여 계약 정보 설정</h1>
      <p>직원별 기본급과 매월 고정적으로 지급되는 수당 항목을 관리합니다.</p>
    </div>

    <div class="switch-bar">
      <span class="label">입력방법</span>
      <el-radio-group v-model="inputMode" size="small">
        <el-radio-button label="사원별" />
        <el-radio-button label="항목별" />
      </el-radio-group>
    </div>

    <!-- 사원별 입력 -->
    <div class="content-section" v-if="inputMode === '사원별'">
      <!-- 검색 및 필터 영역 -->
      <el-card class="filter-card">
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-item">
              <label>부서</label>
              <el-select v-model="selectedDepartment" placeholder="전체 부서" clearable style="width: 150px;">
                <el-option label="전체 부서" value="" />
                <el-option 
                  v-for="dept in departmentList" 
                  :key="dept" 
                  :label="dept" 
                  :value="dept" 
                />
              </el-select>
            </div>
            <div class="filter-item">
              <label>사번</label>
              <el-input 
                v-model="searchEmpNo" 
                placeholder="사번" 
                style="width: 150px;"
                clearable
              />
            </div>
            <div class="filter-item">
              <label>이름</label>
              <el-input 
                v-model="searchName" 
                placeholder="이름" 
                style="width: 150px;"
                clearable
              />
            </div>
            <div class="filter-actions">
              <el-button type="primary" @click="savePayrollData" :loading="saving">
                <i class="el-icon-check"></i> 저장
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <el-card>
        <!-- 로딩 중일 때 표시 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading" style="font-size: 24px; color: #409EFF;">
            <Loading />
          </el-icon>
          <p style="margin-top: 12px; color: #606266; font-size: 14px;">급여 데이터를 불러오는 중...</p>
        </div>
        
        <!-- 데이터 표시 -->
        <div v-else class="table-wrap">
          <el-table 
            ref="employeeTable"
            :data="filteredRows" 
            border 
            max-height="540" 
            stripe 
            :show-summary="true" 
            :summary-method="getSummaries" 
            class="payroll-employee-table"
          >
            <el-table-column prop="empNo" label="사번" width="100" align="center" fixed="left" />
            <el-table-column prop="name" label="성명" width="120" align="center" fixed="left" />
            <el-table-column prop="dept" label="부서" width="120" align="center" />
            <el-table-column prop="payTotal" label="지급합계" width="140" align="right" header-align="center">
              <template #default="{ row }">{{ format(row.payTotal) }}</template>
            </el-table-column>
            <el-table-column prop="baseSalary" label="기본급" width="140" align="right" header-align="center">
              <template #default="{ row }">
                <el-input
                  v-model="row.baseSalaryDisplay"
                  size="small"
                  @input="(value) => handleCurrencyInput(row, 'baseSalary', value)"
                  placeholder="0"
                />
              </template>
            </el-table-column>
            <!-- 고정 수당 항목들을 단독 컬럼으로 표시 -->
            <el-table-column 
              v-for="item in allowanceItems" 
              :key="item.id" 
              :prop="getItemProperty(item.name)" 
              :label="item.name" 
              :width="getColumnWidth()" 
              align="right"
              header-align="center"
            >
              <template #default="{ row }">
                <el-input
                  v-model="row[getItemProperty(item.name) + 'Display']"
                  size="small"
                  @input="(value) => handleCurrencyInput(row, getItemProperty(item.name), value)"
                  placeholder="0"
                />
              </template>
            </el-table-column>
            
            <!-- 데이터가 없을 때 표시할 내용 -->
            <template #empty>
              <div class="empty-data">
                <i class="el-icon-document-remove" style="font-size: 48px; color: #c0c4cc; margin-bottom: 16px;"></i>
                <p style="color: #909399; font-size: 14px; margin: 0;">급여 데이터가 없습니다.</p>
                <p style="color: #c0c4cc; font-size: 12px; margin: 8px 0 0 0;">새로운 급여 정보를 입력해주세요.</p>
              </div>
            </template>
          </el-table>
        </div>
        <div class="footnotes">
          <ul>
            <li>표준 보수월액으로 국민연금 계산시 표준보수월액에서 천원미만을 절사한 금액으로 계산됩니다.</li>
            <li>2025년도 건강보험요율(3.545%) 조정, 장기요양보험요율(12.81% → 12.95%) 변경되었습니다.</li>
          </ul>
        </div>
      </el-card>
    </div>

    <!-- 항목별 입력 -->
    <div class="content-section" v-if="inputMode === '항목별'">
      <!-- 필터 및 저장 버튼 영역 -->
      <el-card class="filter-card">
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-item">
              <label>항목명</label>
              <el-input 
                v-model="searchItemName" 
                placeholder="항목명 검색" 
                style="width: 150px;"
                clearable
              />
            </div>
            <div class="filter-item">
              <label>구분</label>
              <el-select v-model="selectedItemType" placeholder="전체" clearable style="width: 120px;">
                <el-option label="전체" value="" />
                <el-option label="지급" value="지급" />
                <el-option label="공제" value="공제" />
              </el-select>
            </div>
            <div class="filter-item">
              <label>정렬</label>
              <el-select v-model="itemSortBy" placeholder="정렬 기준" style="width: 140px;">
                <el-option label="항목명" value="itemName" />
                <el-option label="총액" value="totalAmount" />
                <el-option label="대상인원" value="employeeCount" />
                <el-option label="최대금액" value="maxAmount" />
                <el-option label="일괄 적용 금액" value="batchAmount" />
              </el-select>
            </div>
            <div class="filter-item">
              <label>정렬방향</label>
              <el-select v-model="itemSortOrder" placeholder="오름차순/내림차순" style="width: 120px;">
                <el-option label="오름차순" value="asc" />
                <el-option label="내림차순" value="desc" />
              </el-select>
            </div>
            <div class="filter-actions">
              <el-button type="primary" @click="saveItemPayrollData" :loading="saving">
                <i class="el-icon-check"></i> 일괄 저장
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <el-card>
        <!-- 로딩 중일 때 표시 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading" style="font-size: 24px; color: #409EFF;">
            <Loading />
          </el-icon>
          <p style="margin-top: 12px; color: #606266; font-size: 14px;">급여 데이터를 불러오는 중...</p>
        </div>
        
        <!-- 데이터 표시 -->
        <div v-else class="table-wrap">
          <el-table 
            ref="itemTable"
            :data="filteredItemRows" 
            border 
            max-height="540" 
            stripe 
            :show-summary="true" 
            :summary-method="getItemSummaries" 
            class="pay-grid auto-width-table"
          >
            <el-table-column prop="itemName" label="급여항목" width="140" align="center" header-align="center" />
            <el-table-column prop="itemType" label="구분" width="70" align="center" header-align="center">
              <template #default="{ row }">
                <el-tag :type="row.itemType === '지급' ? 'success' : 'danger'" size="small">
                  {{ row.itemType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="employeeCount" label="대상인원" width="60" align="center" header-align="center">
              <template #default="{ row }">{{ row.employeeCount }}명</template>
            </el-table-column>
            <el-table-column label="일괄 적용 금액" width="100" align="right" header-align="center">
              <template #default="{ row }">
                <el-input
                  v-model="row.batchAmountDisplay"
                  size="small"
                  placeholder="0"
                  @input="(value) => handleItemBatchInput(row, value)"
                  style="width: 100%; text-align: right"
                />
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="총액" width="70" align="right" header-align="center">
              <template #default="{ row }">{{ format(row.totalAmount) }}</template>
            </el-table-column>
            <el-table-column prop="maxAmount" label="최대금액" width="70" align="right" header-align="center">
              <template #default="{ row }">{{ format(row.maxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="effectiveDate" label="적용일자" width="100" align="center" header-align="center">
              <template #default="{ row }">
                <el-date-picker
                  v-model="row.batchEffectiveDate"
                  type="date"
                  placeholder="적용일자"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  size="small"
                  style="width: 100%;"
                  @change="(value) => handleEffectiveDateChange(row, value)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="description" label="비고" width="220" align="center" header-align="center">
              <template #default="{ row }">{{ row.description || '' }}</template>
            </el-table-column>
            
            <!-- 데이터가 없을 때 표시할 내용 -->
            <template #empty>
              <div class="empty-data">
                <i class="el-icon-document-remove" style="font-size: 48px; color: #c0c4cc; margin-bottom: 16px;"></i>
                <p style="color: #909399; font-size: 14px; margin: 0;">급여 항목 데이터가 없습니다.</p>
                <p style="color: #c0c4cc; font-size: 12px; margin: 8px 0 0 0;">급여 항목을 먼저 설정해주세요.</p>
              </div>
            </template>
          </el-table>
        </div>
        <div class="footnotes">
          <ul>
            <li>항목별 입력에서는 각 급여 항목에 일괄 적용 금액을 입력하여 모든 사원에게 동일한 금액을 적용할 수 있습니다.</li>
            <li>일괄 적용 금액을 입력한 후 "일괄 저장" 버튼을 클릭하면 모든 사원에게 해당 금액이 저장됩니다.</li>
          </ul>
        </div>
      </el-card>  
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import { Loading } from '@element-plus/icons-vue'
import apiClient from '@/api/http'
import { getAuthHeadersFromToken, getUserHeaders } from '@/utils/authUtils'

export default {
  name: 'PayrollContractInfo',
  components: {
    Loading
  },
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      inputMode: '사원별',
      rows: [],
      filteredRows: [],
      itemRows: [],
      payrollItems: [],
      loading: false,
      saving: false, // 저장 중 상태
      screenWidth: window.innerWidth,
      // 필터링 관련 데이터
      selectedDepartment: '',
      searchEmpNo: '',
      searchName: '',
      departmentList: [], // 부서 목록
      searchTimeout: null, // 디바운싱을 위한 타이머
      // 항목별 필터링/정렬 관련 데이터
      searchItemName: '',
      selectedItemType: '',
      itemSortBy: 'itemName',
      itemSortOrder: 'asc'
    }
  },
  computed: {
    // 지급 항목들만 필터링 (사전 순 정렬)
    allowanceItems() {
      return this.payrollItems
        .filter(item => item.type === 'ALLOWANCE')
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    // 공제 항목들만 필터링 (사전 순 정렬)
    deductionItems() {
      return this.payrollItems
        .filter(item => item.type === 'DEDUCTION')
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    // 작은 화면 여부 확인
    isSmallScreen() {
      return this.screenWidth <= 1200
    },
    // 항목별 필터링 및 정렬된 데이터
    filteredItemRows() {
      let filtered = [...this.itemRows]

      // 항목명 검색 필터링
      if (this.searchItemName) {
        filtered = filtered.filter(item => 
          item.itemName.toLowerCase().includes(this.searchItemName.toLowerCase())
        )
      }

      // 구분 필터링
      if (this.selectedItemType) {
        filtered = filtered.filter(item => item.itemType === this.selectedItemType)
      }

      // 정렬
      if (this.itemSortBy) {
        filtered.sort((a, b) => {
          let aValue = a[this.itemSortBy]
          let bValue = b[this.itemSortBy]

          // 문자열 정렬
          if (this.itemSortBy === 'itemName') {
            aValue = aValue || ''
            bValue = bValue || ''
            const comparison = aValue.localeCompare(bValue)
            return this.itemSortOrder === 'asc' ? comparison : -comparison
          }

          // 숫자 정렬
          aValue = Number(aValue) || 0
          bValue = Number(bValue) || 0
          const diff = aValue - bValue
          return this.itemSortOrder === 'asc' ? diff : -diff
        })
      }

      return filtered
    }
  },
  watch: {
    // 검색 조건들이 변경될 때마다 자동으로 필터링 실행 (디바운싱 적용)
    selectedDepartment() {
      this.debouncedSearch()
    },
    searchEmpNo() {
      this.debouncedSearch()
    },
    searchName() {
      this.debouncedSearch()
    },
    // 항목별 테이블 데이터 변경 시 footer 너비 동기화
    filteredItemRows: {
      handler() {
        this.$nextTick(() => {
          this.syncTableFooterWidths()
        })
      },
      deep: true
    },
    // 사원별 테이블 데이터 변경 시 footer 너비 동기화
    filteredRows: {
      handler() {
        this.$nextTick(() => {
          this.syncTableFooterWidths()
        })
      },
      deep: true
    }
  },
  methods: {
    // 화면 크기 변경 핸들러
    handleResize() {
      this.screenWidth = window.innerWidth
      // 리사이즈 후 footer 너비 동기화
      this.$nextTick(() => {
        this.syncTableFooterWidths()
      })
    },

    // 테이블 footer 셀 너비를 헤더 셀 너비와 동기화
    syncTableFooterWidths() {
      // 약간의 딜레이를 두어 DOM이 완전히 렌더링된 후 실행
      setTimeout(() => {
        this.syncTableFooter(this.$refs.itemTable)
        this.syncTableFooter(this.$refs.employeeTable)
      }, 50)
    },

    // 개별 테이블 footer 동기화
    syncTableFooter(tableRef) {
      if (!tableRef || !tableRef.$el) return
      
      const tableEl = tableRef.$el
      const headerWrapper = tableEl.querySelector('.el-table__header-wrapper')
      const footerWrapper = tableEl.querySelector('.el-table__footer-wrapper')
      
      if (!headerWrapper || !footerWrapper) return
      
      // 헤더 colgroup 가져오기
      const headerTable = headerWrapper.querySelector('table')
      const headerColgroup = headerTable?.querySelector('colgroup')
      
      // Footer colgroup 가져오기 또는 생성
      const footerTable = footerWrapper.querySelector('table')
      if (!footerTable) return
      
      // Footer colgroup 제거 후 헤더와 동일하게 복사
      const existingFooterColgroup = footerTable.querySelector('colgroup')
      if (existingFooterColgroup) {
        existingFooterColgroup.remove()
      }
      
      if (headerColgroup) {
        const newColgroup = headerColgroup.cloneNode(true)
        footerTable.insertBefore(newColgroup, footerTable.firstChild)
      }
      
      // 개별 셀 너비도 동기화
      const headerCells = headerWrapper.querySelectorAll('th')
      const footerCells = footerWrapper.querySelectorAll('th, td')
      
      if (headerCells.length === footerCells.length) {
        headerCells.forEach((headerCell, index) => {
          if (footerCells[index]) {
            const headerWidth = headerCell.getBoundingClientRect().width || headerCell.offsetWidth
            if (headerWidth > 0) {
              footerCells[index].style.width = `${headerWidth}px`
              footerCells[index].style.minWidth = `${headerWidth}px`
              footerCells[index].style.maxWidth = `${headerWidth}px`
            }
          }
        })
      }
      
      // Footer 테이블도 fixed layout 설정
      footerTable.style.tableLayout = 'fixed'
      footerTable.style.width = '100%'
    },
    
    // 화폐 포맷팅 함수 (콤마 추가)
    formatCurrency(value) {
      if (!value && value !== 0) return ''
      const numValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value
      return new Intl.NumberFormat('ko-KR').format(numValue)
    },

    // 화폐 파싱 함수 (콤마 제거)
    parseCurrency(value) {
      if (!value) return 0
      return parseInt(value.toString().replace(/,/g, '')) || 0
    },

    // 입력 필드 포맷팅 핸들러
    handleCurrencyInput(row, field, value) {
      const parsedValue = this.parseCurrency(value)
      row[field] = parsedValue
      this.calculateTotals(row)
      
      // 실시간으로 display 필드 포맷팅
      const displayField = field + 'Display'
      row[displayField] = this.formatCurrency(parsedValue)
    },

    // 급여 항목 목록 로드 (고정 수당 항목)
    async loadPayrollItems() {
      try {
        this.loading = true
        
        const userHeaders = getUserHeaders()
        const response = await apiClient.get(`/workforce-service/payrollItem/fixed-allowance`, {
          headers: userHeaders
        })
        
        // API 응답에 따라 데이터 구조 조정
        let items = []
        if (response.data) {
          if (Array.isArray(response.data)) {
            items = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            items = response.data.data
          }
        }
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        // 모든 항목을 지급 항목으로 처리
        this.payrollItems = items.map(item => ({
          id: item.id,
          type: 'ALLOWANCE',
          name: item.allowanceName || item.name,
          description: item.description || '',
          isActive: true,
        }))
        
      } catch (error) {
        console.error('급여 항목 로드 실패:', error)
        this.payrollItems = []
      } finally {
        this.loading = false
      }
    },

    // 급여 항목명을 속성명으로 변환
    getItemProperty(itemName) {
      if (!itemName) return ''
      // 간단한 해시 함수: 문자열을 숫자로 변환
      let hash = 0
      for (let i = 0; i < itemName.length; i++) {
        const char = itemName.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // 32비트 정수로 변환
      }
      // 절댓값 사용하고 'item' 접두어 추가
      return 'item' + Math.abs(hash).toString()
    },

    // 컬럼 너비 설정
    getColumnWidth() {
      // 모든 항목에 대해 기본 너비 사용
      return 130
    },

    // 합계 계산
    calculateTotals(row) {
      // 기본급을 먼저 더하고, 그 다음 지급 항목들의 합계 계산
      row.payTotal = (row.baseSalary || 0) + this.allowanceItems.reduce((sum, item) => {
        const property = this.getItemProperty(item.name)
        return sum + (row[property] || 0)
      }, 0)
      
      // 공제합계는 0으로 설정 (새 API에서는 공제 항목이 없음)
      row.deductTotal = 0
    },

    format(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('ko-KR').format(val)
    },
    getSummaries({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        // 첫 번째 컬럼 (사번)
        if (index === 0) { sums[index] = ''; return }
        // 성명, 부서는 빈 문자열
        if (['name', 'dept'].includes(column.property)) { sums[index] = ''; return }
        
        // 지급합계는 payTotal 값 사용
        if (column.property === 'payTotal') {
          const values = data.map(item => Number(item.payTotal) || 0)
          const total = values.reduce((acc, cur) => acc + (isNaN(cur) ? 0 : cur), 0)
          sums[index] = this.format(total)
          return
        }
        
        // 기본급은 baseSalaryDisplay 사용
        if (column.property === 'baseSalary') {
          const values = data.map(item => {
            const value = item.baseSalaryDisplay || '0'
            return Number(value.toString().replace(/,/g, '')) || 0
          })
          const total = values.reduce((acc, cur) => acc + (isNaN(cur) ? 0 : cur), 0)
          sums[index] = this.format(total)
          return
        }
        
        // 동적 항목들: label을 기반으로 itemName 찾아서 property 매핑
        const label = column.label
        if (!label) {
          sums[index] = ''
          return
        }
        
        // allowanceItems에서 label과 일치하는 항목 찾기
        const matchingItem = this.allowanceItems.find(item => item.name === label)
        if (!matchingItem) {
          sums[index] = ''
          return
        }
        
        // property 이름 생성
        const property = this.getItemProperty(label)
        if (!property) {
          sums[index] = ''
          return
        }
        
        // 합계 계산 - Display 필드 사용
        const values = data.map(item => {
          const displayProp = property + 'Display'
          if (item[displayProp] !== undefined && item[displayProp] !== null) {
            // 콤마 제거
            return Number(item[displayProp].toString().replace(/,/g, '')) || 0
          }
          // Display 필드가 없으면 원본 필드 사용
          if (item[property] !== undefined && item[property] !== null) {
            return Number(item[property]) || 0
          }
          return 0
        })
        
        const total = values.reduce((acc, cur) => acc + (isNaN(cur) ? 0 : cur), 0)
        sums[index] = this.format(total)
      })
      return sums
    },
    getItemSummaries({ columns, data }) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) { sums[index] = '합계'; return }
        if (['구분', '비고', '일괄 적용 금액', '대상인원', '적용일자'].includes(column.label)) { sums[index] = ''; return }
        
        // 컬럼별로 적절한 계산 방식 적용
        if (column.label === '총액') {
          // 총액: 모든 총액의 합
          const values = data.map(item => Number(item.totalAmount) || 0)
          const total = values.reduce((acc, cur) => acc + (isNaN(cur) ? 0 : cur), 0)
          sums[index] = this.format(total)
          return
        }
        
        if (column.label === '최대금액') {
          // 최대금액: 모든 최대금액 중 최대값
          const values = data.map(item => Number(item.maxAmount) || 0).filter(v => v > 0)
          if (values.length === 0) {
            sums[index] = '0'
            return
          }
          const maxValue = Math.max(...values)
          sums[index] = this.format(maxValue)
          return
        }
        
        
        // 기본 처리: property로 직접 계산
        const values = data.map(item => Number(item[column.property]) || 0)
        const total = values.reduce((acc, cur) => acc + (isNaN(cur) ? 0 : cur), 0)
        sums[index] = this.format(total)
      })
      return sums
    },
    generateItemRows() {
      // API에서 가져온 급여 항목을 사용
      const items = this.payrollItems.map(item => ({
        name: item.name,
        type: item.type === 'ALLOWANCE' ? '지급' : '공제',
        description: item.description
      }))

      // 지급 항목을 먼저, 공제 항목을 나중에 정렬
      const sortedItems = items.sort((a, b) => {
        if (a.type === '지급' && b.type === '공제') return -1
        if (a.type === '공제' && b.type === '지급') return 1
        return 0
      })

      const itemRows = sortedItems.map(item => {
        const property = this.getItemProperty(item.name)
        const amounts = this.rows.map(row => row[property] || 0)

        const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0)
        const averageAmount = this.rows.length > 0 ? totalAmount / this.rows.length : 0
        const maxAmount = Math.max(...amounts)

        // 기존 itemRows에 이미 해당 항목이 있으면 batchAmount, batchEffectiveDate 유지
        const existingItem = this.itemRows.find(r => r.itemName === item.name)
        
        // 기존 데이터에서 effectiveDate 찾기 (첫 번째 사원의 해당 항목)
        let existingEffectiveDate = null
        if (this.rows.length > 0) {
          const property = this.getItemProperty(item.name)
          const firstRowWithAllowance = this.rows.find(row => {
            const allowanceData = row[property + 'EffectiveDate']
            return allowanceData !== undefined && allowanceData !== null
          })
          if (firstRowWithAllowance) {
            existingEffectiveDate = firstRowWithAllowance[property + 'EffectiveDate']
          }
        }
        
        return {
          itemName: item.name,
          itemType: item.type,
          totalAmount: totalAmount,
          employeeCount: this.rows.length, // 전체 직원 수
          averageAmount: Math.round(averageAmount),
          maxAmount: maxAmount,
          description: item.description,
          batchAmount: existingItem?.batchAmount || 0,
          batchAmountDisplay: existingItem?.batchAmountDisplay || '',
          batchEffectiveDate: existingItem?.batchEffectiveDate || existingEffectiveDate || this.getCurrentDate(),
          originalEffectiveDate: existingEffectiveDate || null
        }
      })

      return itemRows
    },

    // 부서 목록 생성
    generateDepartmentList() {
      const departments = [...new Set(this.rows.map(row => row.dept))]
      this.departmentList = departments.sort()
    },

    // 디바운싱된 검색 실행
    debouncedSearch() {
      // 이전 타이머가 있으면 취소
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      // 300ms 후에 검색 실행
      this.searchTimeout = setTimeout(() => {
        this.performSearch()
      }, 300)
    },

    // 실시간 사원 검색 및 필터링
    performSearch() {
      try {
        let filtered = [...this.rows]

        // 부서 필터링
        if (this.selectedDepartment) {
          filtered = filtered.filter(row => row.dept === this.selectedDepartment)
        }

        // 사번 필터링
        if (this.searchEmpNo) {
          filtered = filtered.filter(row => 
            row.empNo.toLowerCase().includes(this.searchEmpNo.toLowerCase())
          )
        }

        // 이름 필터링
        if (this.searchName) {
          filtered = filtered.filter(row => 
            row.name.toLowerCase().includes(this.searchName.toLowerCase())
          )
        }

        this.filteredRows = filtered
      } catch (error) {
        console.error('사원 검색 실패:', error)
        this.error('사원 검색 중 오류가 발생했습니다.')
      }
    },


    // 급여 데이터 조회
    async fetchPayrollData() {
      this.loading = true
      
      try {
        const userHeaders = getUserHeaders()
        const response = await apiClient.get(`/workforce-service/salary-config/list`, {
          headers: userHeaders
        })

        let dataList = []
        if (response.data) {
          if (Array.isArray(response.data)) {
            dataList = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            dataList = response.data.data
          }
        }

        if (dataList.length > 0) {
          // 백엔드 데이터를 화면용 데이터로 변환
          this.processFetchedData(dataList)
          this.success('급여 데이터를 성공적으로 조회했습니다.')
        } else {
          this.warning('조회된 급여 데이터가 없습니다.')
        }
      } catch (error) {
        this.error('급여 데이터 조회 중 오류가 발생했습니다.')
      } finally {
        this.loading = false
      }
    },

    // 조회된 데이터를 화면용으로 변환
    processFetchedData(backendData) {
      const employeeData = backendData.map((employeeConfig) => {
        const employee = {
          id: employeeConfig.id || null, // salary-history id 저장
          memberId: employeeConfig.memberId,
          empNo: employeeConfig.sabun,
          name: employeeConfig.memberName,
          dept: employeeConfig.department,
          position: '', // 직급 정보가 없음
          // 기본급 설정
          baseSalary: employeeConfig.baseSalary || 0,
          baseSalaryDisplay: this.formatCurrency(employeeConfig.baseSalary || 0),
          // 급여 이력 관련 필드 저장
          payType: employeeConfig.payType || 'MONTHLY', // 기본값: MONTHLY (월급)
          customaryWage: employeeConfig.customaryWage || 0,
          effectiveDate: employeeConfig.effectiveDate || null
        }
        
        // fixedAllowanceList가 있으면 각 항목을 매핑
        if (employeeConfig.fixedAllowanceList && employeeConfig.fixedAllowanceList.length > 0) {
          employeeConfig.fixedAllowanceList.forEach(allowance => {
            const property = this.getItemProperty(allowance.allowanceName)
            employee[property] = allowance.amount || 0
            employee[property + 'Display'] = this.formatCurrency(allowance.amount || 0)
            // effectiveDate도 저장
            if (allowance.effectiveDate) {
              employee[property + 'EffectiveDate'] = allowance.effectiveDate
            }
          })
        }
        
        // 모든 급여 항목에 대해 속성이 없으면 0으로 초기화
        this.payrollItems.forEach(item => {
          const property = this.getItemProperty(item.name)
          if (!Object.prototype.hasOwnProperty.call(employee, property)) {
            employee[property] = 0
            employee[property + 'Display'] = '0'
          }
        })

        // 합계 계산
        this.calculateTotals(employee)
        
        return employee
      })

      this.rows = employeeData
      this.filteredRows = [...employeeData]
      this.generateDepartmentList()
      
      // footer 너비 동기화
      this.$nextTick(() => {
        this.syncTableFooterWidths()
      })
    },

    // 급여 데이터 저장
    async savePayrollData() {
      if (this.filteredRows.length === 0) {
        this.warning('저장할 급여 데이터가 없습니다.')
        return
      }

      try {
        this.saving = true
        
        // 프론트엔드 데이터를 백엔드 형식으로 변환 (리스트로 직접 전송)
        const saveData = this.filteredRows.map(row => {
          return {
            id: row.id || null, // 조회 시 받은 id, 없으면 null
            memberId: row.memberId,
            payType: row.payType || 'MONTHLY', // 기본값: MONTHLY (월급)
            baseSalary: row.baseSalary || 0,
            customaryWage: row.customaryWage || 0,
            effectiveDate: row.effectiveDate || this.getCurrentDate()
          }
        })

        const userHeaders = getUserHeaders()
        await apiClient.put(
          `/workforce-service/salary-history/save`,
          saveData, // 리스트로 직접 전송
          {
            headers: userHeaders
          }
        )

        this.success('급여 정보를 저장했습니다.')
        
        // 저장 후 데이터 재조회
        await this.fetchPayrollData()
        this.itemRows = this.generateItemRows()
        
        // footer 너비 동기화
        this.$nextTick(() => {
          this.syncTableFooterWidths()
        })
      } catch (err) {
        console.error('급여 저장 실패:', err)
        this.error('급여 정보 저장에 실패했습니다.')
      } finally {
        this.saving = false
      }
    },

    // 항목별 일괄 적용 금액 입력 핸들러
    handleItemBatchInput(row, value) {
      const parsedValue = this.parseCurrency(value)
      row.batchAmount = parsedValue
      row.batchAmountDisplay = this.formatCurrency(parsedValue)
    },

    // 적용일자 변경 핸들러
    handleEffectiveDateChange(row, value) {
      row.batchEffectiveDate = value || this.getCurrentDate()
    },

    // 현재 날짜를 YYYY-MM-DD 형식으로 반환
    getCurrentDate() {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    },

    // 항목별 일괄 저장
    async saveItemPayrollData() {
      if (this.rows.length === 0) {
        this.warning('저장할 사원 데이터가 없습니다.')
        return
      }

      // 일괄 적용 금액이 입력된 항목 확인
      const itemsWithBatchAmount = this.itemRows.filter(item => item.batchAmount && item.batchAmount > 0)
      
      if (itemsWithBatchAmount.length === 0) {
        this.warning('일괄 적용할 금액을 입력해주세요.')
        return
      }

      try {
        this.saving = true

        // 인증 헤더 가져오기
        const authHeaders = getAuthHeadersFromToken()
        if (!authHeaders || !authHeaders['X-User-MemberPositionId']) {
          this.error('인증 정보를 찾을 수 없습니다.')
          return
        }

        // 변경된 항목만 필터링하여 요청 데이터 생성
        const requestData = []

        // 각 항목별로 변경 확인 (모든 사원에게 동일하게 적용되므로 한 번만 체크)
        itemsWithBatchAmount.forEach(item => {
          // 기본급은 제외
          if (item.itemName === '기본급') {
            return
          }

          // 해당 항목의 기존 데이터 확인 (첫 번째 사원 기준)
          const property = this.getItemProperty(item.itemName)
          let hasChanged = false
          let existingAmount = 0
          let existingEffectiveDate = null

          if (this.rows.length > 0) {
            const firstRow = this.rows[0]
            existingAmount = firstRow[property] || 0
            existingEffectiveDate = firstRow[property + 'EffectiveDate'] || null
          }

          const newAmount = item.batchAmount
          const newEffectiveDate = item.batchEffectiveDate || this.getCurrentDate()

          // amount 또는 effectiveDate가 변경되었는지 확인
          const amountChanged = existingAmount !== newAmount
          const dateChanged = existingEffectiveDate !== newEffectiveDate

          if (amountChanged || dateChanged) {
            // 모든 사원에게 적용하므로 항목당 하나만 추가
            requestData.push({
              allowanceName: item.itemName,
              amount: newAmount, // int 타입으로 전송
              effectiveDate: newEffectiveDate
            })
            hasChanged = true
          }

          // 만약 기존 데이터가 없고 새로 추가하는 경우도 포함
          if (!hasChanged && this.rows.length > 0) {
            // 모든 사원을 확인하여 하나라도 해당 항목이 없는 경우 추가
            const hasAnyEmployeeWithThisItem = this.rows.some(row => {
              const rowProperty = this.getItemProperty(item.itemName)
              return row[rowProperty] && row[rowProperty] > 0
            })
            
            if (!hasAnyEmployeeWithThisItem && newAmount > 0) {
              requestData.push({
                allowanceName: item.itemName,
                amount: newAmount, // int 타입으로 전송
                effectiveDate: newEffectiveDate
              })
            }
          }
        })

        // 변경된 항목이 없으면 종료
        if (requestData.length === 0) {
          this.info('변경된 항목이 없습니다.')
          
          // 일괄 적용 금액 초기화
          this.itemRows.forEach(item => {
            item.batchAmount = 0
            item.batchAmountDisplay = ''
            item.batchEffectiveDate = item.originalEffectiveDate || this.getCurrentDate()
          })
          return
        }

        const userHeaders = getUserHeaders()
        await apiClient.put(
          `/workforce-service/fixed-allowance/update-all`,
          requestData,
          {
            headers: userHeaders
          }
        )

        this.success(`${requestData.length}개 항목을 모든 사원에게 일괄 저장했습니다.`)
        
        // 저장 후 데이터 재조회
        await this.fetchPayrollData()
        
        // 일괄 적용 금액 초기화
        this.itemRows.forEach(item => {
          item.batchAmount = 0
          item.batchAmountDisplay = ''
          item.batchEffectiveDate = item.originalEffectiveDate || this.getCurrentDate()
        })
        
        this.itemRows = this.generateItemRows()
        
        // footer 너비 동기화
        this.$nextTick(() => {
          this.syncTableFooterWidths()
        })
      } catch (err) {
        console.error('항목별 일괄 저장 실패:', err)
        this.error('항목별 일괄 저장에 실패했습니다.')
      } finally {
        this.saving = false
      }
    }
  },
  async created() {
    // 급여 항목 목록을 먼저 로드
    await this.loadPayrollItems()
    
    // 급여 데이터 조회
    await this.fetchPayrollData()
    
    // 항목별 데이터 생성
    this.itemRows = this.generateItemRows()
  },
  mounted() {
    // 화면 크기 변경 감지
    window.addEventListener('resize', this.handleResize)
    // 테이블 footer 너비 동기화
    this.$nextTick(() => {
      this.syncTableFooterWidths()
    })
  },
  updated() {
    // 데이터 변경 시 footer 너비 동기화
    this.$nextTick(() => {
      this.syncTableFooterWidths()
    })
  },
  beforeUnmount() {
    // 이벤트 리스너 제거
    window.removeEventListener('resize', this.handleResize)
    
    // 검색 타이머 정리
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }
}
</script>

<style scoped>
.payroll-contract-info {
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

.switch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.switch-bar .label {
  color: #606266;
  font-size: 13px;
}

.content-section {
  margin-bottom: 20px;
}

.content-section :deep(.el-card) {
  border-radius: var(--surface-radius);
  box-shadow: var(--surface-shadow);
  border: none;
}

/* 필터 카드 스타일 */
.filter-card {
  margin-bottom: 16px;
}

.filter-section {
  padding: 0;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  min-width: 40px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.filter-actions .el-button {
  min-width: 80px;
}

.pay-grid .el-table__footer-wrapper .cell {
  font-weight: 600;
}

.footnotes {
  margin-top: 12px;
  background: #f6f8fa;
  border: 1px solid #ebeef5;
  border-radius: var(--surface-radius);
  padding: 10px 12px;
}

.footnotes ul {
  margin: 0;
  padding-left: 18px;
  color: #606266;
  font-size: 12px;
}

/* 자동 너비 조정 테이블 */
.auto-width-table {
  width: 100% !important;
  table-layout: fixed !important;
}

/* 항목별 테이블의 일괄 적용 금액 입력 필드 오른쪽 정렬 */
.auto-width-table :deep(.el-table__body .el-input .el-input__inner) {
  text-align: right !important;
  font-size: 12px !important;
}

.auto-width-table :deep(.el-table__body .el-date-picker .el-input__inner) {
  font-size: 12px !important;
}

.auto-width-table :deep(.el-table__body .el-date-editor) {
  font-size: 12px !important;
}

.auto-width-table :deep(.el-table__body .el-date-editor .el-input__inner) {
  font-size: 12px !important;
}

.auto-width-table :deep(.el-table__body-wrapper) {
  width: 100% !important;
  overflow-x: hidden !important;
}

.auto-width-table :deep(.el-table__header-wrapper) {
  width: 100% !important;
  overflow-x: hidden !important;
}

.auto-width-table :deep(.el-table__body) {
  width: 100% !important;
}

.auto-width-table :deep(.el-table__header) {
  width: 100% !important;
}

/* 테이블이 카드 너비에 맞도록 조정 */
.content-section .el-card__body {
  padding: 20px;
  border-radius: var(--surface-radius);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

/* 지급항목 그룹 헤더 - 연한 녹색 */
.payroll-employee-table :deep(.el-table__header-wrapper .el-table__header th.allowance-group) {
  background-color: #e8f5e8 !important;
  color: #2d5016 !important;
  font-weight: 700 !important;
  padding: 6px 4px !important;
  font-size: 12px !important;
}

/* 공제항목 그룹 헤더 - 연한 빨간색 */
.payroll-employee-table :deep(.el-table__header-wrapper .el-table__header th.deduction-group) {
  background-color: #fef0f0 !important;
  color: #8b0000 !important;
  font-weight: 700 !important;
  padding: 6px 4px !important;
  font-size: 12px !important;
}

/* 서브 헤더 스타일 */
.payroll-employee-table :deep(.el-table__header-wrapper .el-table__header th.allowance-item),
.payroll-employee-table :deep(.el-table__header-wrapper .el-table__header th.deduction-item) {
  background-color: #f8f9fa !important;
  color: #495057 !important;
  font-weight: 600 !important;
  border-top: none !important;
  padding: 6px 4px !important;
  font-size: 12px !important;
}

/* 기본 헤더 스타일 */
.payroll-employee-table :deep(.el-table__header-wrapper .el-table__header th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
  padding: 8px 4px;
  border-right: none;
  font-size: 12px;
}

/* 테이블 셀 테두리 통일 */
.payroll-employee-table :deep(.el-table__body td) {
  border-right: none;
  border-bottom: 1px solid #ebeef5;
}

.payroll-employee-table :deep(.el-table__header th) {
  border-right: none;
}

/* Element UI 테이블 스타일 */
.payroll-employee-table {
  width: 100%;
  border-radius: var(--surface-radius);
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 테이블이 전체 너비를 사용하도록 설정 */
.payroll-employee-table :deep(.el-table__header-wrapper),
.payroll-employee-table :deep(.el-table__body-wrapper) {
  width: 100% !important;
}

.payroll-employee-table :deep(.el-table__body),
.payroll-employee-table :deep(.el-table__header) {
  width: 100% !important;
}

.payroll-employee-table .amount {
  font-weight: 500;
  color: #2c3e50;
}

/* 입력 필드 스타일 */
.payroll-employee-table :deep(.el-input) {
  width: 100%;
}

.payroll-employee-table :deep(.el-input .el-input__inner) {
  text-align: right;
  border: none;
  border-radius: 0;
  transition: none;
  padding-right: 8px;
  background: transparent;
  box-shadow: none;
}

.payroll-employee-table :deep(.el-input .el-input__inner:focus) {
  border: none;
  box-shadow: none;
  background: transparent;
}

/* 반응형 처리 - 화면이 작을 때만 공백 제거 */
@media (max-width: 1200px) {
  .payroll-employee-table {
    font-size: 12px;
    width: 100% !important;
    min-width: 100%;
  }
  
  .payroll-employee-table :deep(.el-input .el-input__inner) {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  /* 작은 화면에서만 컬럼 너비를 유연하게 조정 */
  .payroll-employee-table :deep(.el-table__header-wrapper),
  .payroll-employee-table :deep(.el-table__body-wrapper),
  .payroll-employee-table :deep(.el-table__footer-wrapper) {
    width: 100% !important;
  }
  
  /* 컬럼들을 min-width로 변경하여 유연하게 조정 */
  .payroll-employee-table :deep(.el-table__header th),
  .payroll-employee-table :deep(.el-table__body td),
  .payroll-employee-table :deep(.el-table__footer th) {
    min-width: auto !important;
  }
}

@media (max-width: 768px) {
  .payroll-contract-info {
    padding: 10px;
  }
  
  .table-wrap {
    margin: 0 -10px;
    padding: 0 10px;
  }
  
  .payroll-employee-table {
    font-size: 11px;
    width: 100% !important;
    min-width: 100%;
  }
  
  .payroll-employee-table :deep(.el-input .el-input__inner) {
    font-size: 11px;
    padding: 2px 6px;
  }
  
  /* 작은 화면에서만 컬럼 너비를 유연하게 조정 */
  .payroll-employee-table :deep(.el-table__header-wrapper),
  .payroll-employee-table :deep(.el-table__body-wrapper),
  .payroll-employee-table :deep(.el-table__footer-wrapper) {
    width: 100% !important;
  }
}

/* 빈 데이터 표시 스타일 */
.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  width: 100%;
}

/* 테이블이 비어있을 때 헤더가 전체 너비를 차지하도록 설정 */
.el-table__empty-block {
  width: 100% !important;
}

.el-table__empty-text {
  width: 100%;
}

/* 테이블 헤더가 전체 너비를 차지하도록 설정 */
.payroll-employee-table .el-table__header-wrapper {
  width: 100% !important;
}

.payroll-employee-table .el-table__header {
  width: 100% !important;
}

.payroll-employee-table .el-table__header th {
  width: auto !important;
}

/* 테이블 footer(tfoot) 스타일 */
.payroll-employee-table :deep(.el-table__footer-wrapper) {
  width: 100% !important;
  margin-top: 0 !important;
}

.payroll-employee-table :deep(.el-table__footer) {
  width: 100% !important;
  table-layout: fixed !important;
}

/* Footer 셀 너비 강제 고정 */
.payroll-employee-table :deep(.el-table__footer th),
.payroll-employee-table :deep(.el-table__footer td) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.payroll-employee-table :deep(.el-table__body-wrapper) {
  margin-bottom: 0 !important;
}

.payroll-employee-table :deep(.el-table__footer th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #606266;
  padding: 8px 4px;
  border-bottom: 1px solid #ebeef5;
  border-right: none;
  border-top: 1px solid #ebeef5;
  font-size: 12px;
}

.payroll-employee-table :deep(.el-table__footer td) {
  border-right: none;
  border-bottom: 1px solid #ebeef5;
}

/* 항목별 테이블 footer 스타일 - 사원별 테이블과 동일한 스타일 적용 */
.auto-width-table :deep(.el-table__footer-wrapper) {
  margin-top: 0 !important;
  width: 100% !important;
}

.auto-width-table :deep(.el-table__footer) {
  width: 100% !important;
  table-layout: fixed !important;
}

.auto-width-table :deep(.el-table__body-wrapper) {
  margin-bottom: 0 !important;
}

.auto-width-table :deep(.el-table__footer th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #606266;
  padding: 8px 4px;
  border-bottom: 1px solid #ebeef5;
  border-right: none;
  border-top: 1px solid #ebeef5;
  font-size: 12px;
}

.auto-width-table :deep(.el-table__footer td) {
  border-right: none;
  border-bottom: 1px solid #ebeef5;
  padding: 8px 4px;
}

/* footer 셀 너비를 헤더/바디와 일치시키기 */
.auto-width-table :deep(.el-table__footer th),
.auto-width-table :deep(.el-table__footer td) {
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* footer 셀 너비는 JavaScript로 자동 동기화되므로 고정 너비 제거 */

/* 로딩 컨테이너 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 300px;
}

.loading-container .el-icon {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

