<template>
  <div class="payroll-basic-info">
    <div class="page-header">
      <h1>급여 기본 정보</h1>
      <p>사원별 급여 항목과 합계를 확인하고 입력 방법을 전환할 수 있습니다.</p>
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
              <el-button type="success" @click="savePayrollData" :loading="saving">
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
            :data="filteredRows" 
            border 
            height="540" 
            stripe 
            :show-summary="true" 
            :summary-method="getSummaries" 
            class="payroll-employee-table"
          >
            <el-table-column prop="empNo" label="사번" width="100" align="center" fixed="left" />
            <el-table-column prop="name" label="성명" width="120" align="center" fixed="left" />
            <el-table-column prop="dept" label="부서" width="120" align="center" />
            <el-table-column prop="position" label="직급" width="120" align="center" />
            <el-table-column prop="payTotal" label="지급합계" width="140" align="right" header-align="center">
              <template #default="{ row }">{{ format(row.payTotal) }}</template>
            </el-table-column>
            <el-table-column prop="deductTotal" label="공제합계" width="140" align="right" header-align="center">
              <template #default="{ row }">{{ format(row.deductTotal) }}</template>
            </el-table-column>
            <!-- 지급항목 그룹 -->
            <el-table-column label="지급항목" align="center" v-if="allowanceItems.length > 0" class-name="allowance-group">
              <el-table-column 
                v-for="item in allowanceItems" 
                :key="item.id" 
                :prop="getItemProperty(item.name)" 
                :label="item.name" 
                :width="getColumnWidth()" 
                align="center"
                class-name="allowance-item"
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
            </el-table-column>
            
            <!-- 공제항목 그룹 -->
            <el-table-column label="공제항목" align="center" v-if="deductionItems.length > 0" class-name="deduction-group">
              <el-table-column 
                v-for="item in deductionItems" 
                :key="item.id"
                :prop="getItemProperty(item.name)" 
                :label="item.name" 
                :width="getColumnWidth()" 
                align="center"
                class-name="deduction-item"
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
            :data="itemRows" 
            border 
            height="540" 
            stripe 
            :show-summary="true" 
            :summary-method="getItemSummaries" 
            class="pay-grid auto-width-table"
          >
            <el-table-column prop="itemName" label="급여항목" min-width="120" align="center" fixed="left" />
            <el-table-column prop="itemType" label="구분" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.itemType === '지급' ? 'success' : 'danger'" size="small">
                  {{ row.itemType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="employeeCount" label="대상인원" width="100" align="center">
              <template #default="{ row }">{{ row.employeeCount }}명</template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="총액" min-width="120" align="right">
              <template #default="{ row }">{{ format(row.totalAmount) }}</template>
            </el-table-column>
            <el-table-column prop="averageAmount" label="평균금액" min-width="120" align="right">
              <template #default="{ row }">{{ format(row.averageAmount) }}</template>
            </el-table-column>
            <el-table-column prop="maxAmount" label="최대금액" min-width="120" align="right">
              <template #default="{ row }">{{ format(row.maxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="minAmount" label="최소금액" min-width="120" align="right">
              <template #default="{ row }">{{ format(row.minAmount) }}</template>
            </el-table-column>
            <el-table-column prop="description" label="비고" min-width="150" align="center">
              <template #default="{ row }">{{ row.description }}</template>
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
            <li>항목별 입력에서는 각 급여 항목의 총합과 통계 정보를 확인할 수 있습니다.</li>
            <li>지급 항목은 급여 지급액, 공제 항목은 급여 공제액을 나타냅니다.</li>
          </ul>
        </div>
      </el-card>  
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import { Loading } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'PayrollBasicInfo',
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
      originalRows: [], // 원본 데이터 저장소 (변경 감지용)
      filteredRows: [], // 필터링된 데이터
      itemRows: [],
      payrollItems: [], // API에서 가져온 급여 항목 목록
      loading: false,
      saving: false,
      screenWidth: window.innerWidth,
      // 필터링 관련 데이터
      selectedDepartment: '',
      searchEmpNo: '',
      searchName: '',
      departmentList: [], // 부서 목록
      searchTimeout: null // 디바운싱을 위한 타이머
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
    }
  },
  methods: {
    // 회사 ID 가져오기
    getCompanyId() {
      return 'f1e85c26-14fa-4603-8edd-bfbdd82234ab'
    },
    
    // 화면 크기 변경 핸들러
    handleResize() {
      this.screenWidth = window.innerWidth
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

    // 급여 항목 목록 로드
    async loadPayrollItems() {
      try {
        this.loading = true
        
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem/list`, {
          params: { companyId: this.getCompanyId() }
        })
        
        // API 응답에 따라 데이터 구조 조정
        let items = []
        if (response.data) {
          if (Array.isArray(response.data)) {
            items = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            items = response.data.data
          } else if (response.data.payrollItems && Array.isArray(response.data.payrollItems)) {
            items = response.data.payrollItems
          }
        }
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        this.payrollItems = items.map(item => ({
          id: item.id,
          type: item.salaryType || item.type,
          name: item.name || item.itemName,
          description: item.description || '',
          isActive: item.isActive === 'TRUE' || item.isActive === true,
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
      // 동적 속성명 생성: 한글을 영문으로 변환하거나 기존 패턴 사용
      return itemName.toLowerCase()
        .replace(/[가-힣]/g, '') // 한글 제거
        .replace(/\s+/g, '') // 공백 제거
        .replace(/[^a-zA-Z0-9]/g, '') // 특수문자 제거
        .substring(0, 20) // 길이 제한
    },

    // 컬럼 너비 설정
    getColumnWidth() {
      // 모든 항목에 대해 기본 너비 사용
      return 130
    },

    // 합계 계산
    calculateTotals(row) {
      // 지급합계 계산 (동적으로 지급 항목들의 합계)
      row.payTotal = this.allowanceItems.reduce((sum, item) => {
        const property = this.getItemProperty(item.name)
        return sum + (row[property] || 0)
      }, 0)
      
      // 공제합계 계산 (동적으로 공제 항목들의 합계)
      row.deductTotal = this.deductionItems.reduce((sum, item) => {
        const property = this.getItemProperty(item.name)
        return sum + (row[property] || 0)
      }, 0)
    },

    format(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('ko-KR').format(val)
    },
    getSummaries({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) { sums[index] = ''; return }
        if (['성명','부서','직급'].includes(column.label)) { sums[index] = ''; return }
        const values = data.map(item => Number(item[column.property]))
        const total = values.reduce((acc, cur) => acc + (isNaN(cur) ? 0 : cur), 0)
        sums[index] = this.format(total)
      })
      return sums
    },
    getItemSummaries({ columns, data }) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) { sums[index] = '합계'; return }
        if (['구분', '비고'].includes(column.label)) { sums[index] = ''; return }
        if (column.label === '대상인원') {
          const total = data.reduce((acc, cur) => acc + cur.employeeCount, 0)
          sums[index] = `${total}명`
          return
        }
        const values = data.map(item => Number(item[column.property]))
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

        const nonZeroAmounts = amounts.filter(amount => amount > 0)
        const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0)
        const averageAmount = nonZeroAmounts.length > 0 ? totalAmount / nonZeroAmounts.length : 0
        const maxAmount = Math.max(...amounts)
        const minAmount = Math.min(...nonZeroAmounts.length > 0 ? nonZeroAmounts : [0])

        return {
          itemName: item.name,
          itemType: item.type,
          totalAmount: totalAmount,
          employeeCount: nonZeroAmounts.length,
          averageAmount: Math.round(averageAmount),
          maxAmount: maxAmount,
          minAmount: minAmount,
          description: item.description
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

    // 변경된 데이터 감지 (POST 요청용)
    getChangedData() {
      const changedData = []
      
      this.filteredRows.forEach((currentEmployee) => {
        const originalEmployee = this.originalRows.find(orig => 
          orig.empNo === currentEmployee.empNo && orig.name === currentEmployee.name
        )
        
        if (!originalEmployee) {
          // 새로운 사원인 경우 모든 데이터를 변경된 것으로 처리
          this.payrollItems.forEach(item => {
            const property = this.getItemProperty(item.name)
            const amount = currentEmployee[property] || 0
            if (amount > 0) {
              changedData.push({
                companyId: this.getCompanyId(),
                memberId: currentEmployee.memberId,
                payrollItemId: item.id,
                amount: amount
              })
            }
          })
          return
        }
        
        // 기존 사원의 경우 변경된 항목만 찾기
        this.payrollItems.forEach(item => {
          const property = this.getItemProperty(item.name)
          const currentAmount = currentEmployee[property] || 0
          const originalAmount = originalEmployee[property] || 0
          
          if (currentAmount !== originalAmount) {
            changedData.push({
              companyId: this.getCompanyId(),
              memberId: currentEmployee.memberId,
              payrollItemId: item.id,
              amount: currentAmount
            })
          }
        })
      })
      
      return changedData
    },

    // 급여 데이터 저장
    async savePayrollData() {
      this.saving = true
      
      try {
        // 변경된 데이터만 가져오기
        const changedData = this.getChangedData()
        
        if (changedData.length === 0) {
          this.info('변경된 데이터가 없습니다.')
          return
        }

        // POST 요청으로 변경된 데이터만 전송
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/workforce-service/salaryInfo/save`,
          changedData
        )

        if (response.data && response.data.success) {
          this.success(`${changedData.length}개의 급여 항목이 업데이트되었습니다.`)
          // 성공 시 원본 데이터 업데이트
          this.originalRows = JSON.parse(JSON.stringify(this.rows))
        } else {
          throw new Error(response.data?.message || '저장에 실패했습니다.')
        }
      } catch (error) {
        this.error(`급여 데이터 저장 중 오류가 발생했습니다: ${error.message}`)
      } finally {
        this.saving = false
      }
    },

    // 필터 초기화
    resetFilters() {
      this.selectedDepartment = ''
      this.searchEmpNo = ''
      this.searchName = ''
      // resetFilters 호출 시에는 performSearch가 자동으로 실행됨
    },

    // UUID 생성 함수
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },

    // 급여 데이터 조회
    async fetchPayrollData() {
      this.loading = true
      
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/workforce-service/salaryInfo/list`,
          {
            params: { companyId: this.getCompanyId() }
          }
        )

        if (response.data.data && Array.isArray(response.data.data)) {
          // 백엔드 데이터를 화면용 데이터로 변환
          this.processFetchedData(response.data.data)
          this.success('급여 데이터를 성공적으로 조회했습니다.')
        } else {
          this.warning('조회된 급여 데이터가 없습니다.')
          // 데이터가 없을 때도 원본 데이터 초기화
          this.originalRows = []
        }
      } catch (error) {
        this.error('급여 데이터 조회 중 오류가 발생했습니다.')
      } finally {
        this.loading = false
      }
    },

    // 조회된 데이터를 화면용으로 변환
    processFetchedData(backendData) {
      // memberId별로 그룹화
      const groupedByMember = {}
      
      backendData.forEach(item => {
        const memberId = item.memberId
        if (!groupedByMember[memberId]) {
          groupedByMember[memberId] = {
            memberId: memberId,
            payrollItems: []
          }
        }
        groupedByMember[memberId].payrollItems.push(item)
      })

      // 각 memberId별로 사원 정보 생성 및 데이터 매핑
      const employeeData = Object.values(groupedByMember).map((memberData, index) => {
        const employee = this.createEmployeeInfo(index)
        // memberId 추가
        employee.memberId = memberData.memberId
        
        // 급여 항목 데이터 매핑
        memberData.payrollItems.forEach(payrollItem => {
          const item = this.payrollItems.find(p => p.id === payrollItem.payrollItemId)
          if (item) {
            const property = this.getItemProperty(item.name)
            employee[property] = payrollItem.amount
            employee[property + 'Display'] = this.formatCurrency(payrollItem.amount)
            // 각 급여 항목의 ID 저장 (PUT 요청용)
            employee[property + 'Id'] = payrollItem.id
          }
        })

        // 합계 계산
        this.calculateTotals(employee)
        
        return employee
      })

      this.rows = employeeData
      this.originalRows = JSON.parse(JSON.stringify(employeeData)) // 원본 데이터 깊은 복사
      this.filteredRows = [...employeeData]
      this.generateDepartmentList()
    },

    // 임의 사원 정보 생성
    createEmployeeInfo(index) {
      const names = ['김철수', '박민수', '이지은', '최영희', '정민호', '김수진', '박지훈', '이하늘', '최동현', '윤서연', '강태우', '임소영', '한지우', '오민수', '신예린', '조현우', '송지민', '배준호', '류하늘', '문지훈', '권서연', '황민수', '안지우', '노현우', '홍예린']
      const departments = ['인사팀', '회계팀', '영업팀', '마케팅팀', '개발팀', '디자인팀', '고객지원팀', '구매팀', '생산팀', '품질관리팀']
      const positions = ['사원', '주임', '대리', '과장', '차장', '부장', '이사', '상무', '전무', '사장']

      return {
        empNo: String(221101 + index),
        name: names[index % names.length],
        dept: departments[index % departments.length],
        position: positions[index % positions.length],
        // 급여 항목들은 기본값 0으로 초기화
        baseSalary: 0,
        nightPay: 0,
        otCenter: 0,
        mealNontax: 0,
        bizExpense: 0,
        otComm: 0,
        otEtc: 0,
        annualPay: 0,
        holidayPay: 0,
        nationalPension: 0,
        healthInsurance: 0,
        employmentInsurance: 0,
        incomeTax: 0,
        localIncomeTax: 0,
        payTotal: 0,
        deductTotal: 0
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
.payroll-basic-info {
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

.table-wrap {
  overflow-x: auto;
}

.pay-grid .el-table__footer-wrapper .cell {
  font-weight: 600;
}

.footnotes {
  margin-top: 12px;
  background: #f6f8fa;
  border: 1px solid #ebeef5;
  border-radius: 6px;
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
  table-layout: auto !important;
}

.auto-width-table :deep(.el-table__body-wrapper) {
  width: 100% !important;
}

.auto-width-table :deep(.el-table__header-wrapper) {
  width: 100% !important;
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
  .payroll-employee-table :deep(.el-table__body-wrapper) {
    width: 100% !important;
  }
  
  /* 컬럼들을 min-width로 변경하여 유연하게 조정 */
  .payroll-employee-table :deep(.el-table__header th),
  .payroll-employee-table :deep(.el-table__body td) {
    min-width: auto !important;
  }
}

@media (max-width: 768px) {
  .payroll-basic-info {
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
  .payroll-employee-table :deep(.el-table__body-wrapper) {
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
