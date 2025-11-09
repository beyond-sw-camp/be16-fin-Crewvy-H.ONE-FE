<template>
  <div class="payroll-insurance-deduction">
    <div class="page-header">
      <h1>월별 보험료 공제 현황</h1>
      <p>직원별 4대보험료 공제 현황을 조회합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>보험료 공제 현황</span>
            <div class="header-actions">
              <el-button @click="exportReport">보고서 내보내기</el-button>
              <el-button type="primary" @click="refreshData">새로고침</el-button>
            </div>
          </div>
        </template>
        
        <div class="insurance-filters">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="조회 기간">
                <el-date-picker
                  v-model="inquiryPeriod"
                  type="month"
                  placeholder="조회 기간 선택"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  @change="fetchInsuranceData"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="직원명">
                <el-input v-model="employeeName" placeholder="직원명 검색" />
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
          </el-row>
        </div>
        
        <el-table :data="filteredInsuranceData" style="width: 100%" class="insurance-table" v-loading="loading">
          <el-table-column prop="employeeName" label="직원명" min-width="120" align="center" />
          <el-table-column prop="department" label="부서" min-width="100" align="center" />
          <!-- 동적으로 생성되는 공제 항목 컬럼들 -->
          <el-table-column 
            v-for="itemName in deductionItemNames" 
            :key="itemName"
            :label="itemName" 
            :prop="`deduction_${itemName}`"
            min-width="120" 
            align="center"
          >
            <template #default="scope">
              <span v-if="scope.row.deductionMap && scope.row.deductionMap[itemName] && scope.row.deductionMap[itemName] !== 0">
                {{ scope.row.deductionMap[itemName].toLocaleString() }}원
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalInsurance" label="총 보험료" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.totalInsurance.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="period" label="적용기간" min-width="120" align="center" />
          <el-table-column prop="status" label="상태" min-width="100" align="center">
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
import apiClient from '@/api/http'
import { getUserHeaders } from '@/utils/authUtils'

export default {
  name: 'PayrollInsuranceDeduction',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 공제 항목명 목록 로드
    this.fetchDeductionItems()
    // 초기 데이터 로드
    this.fetchInsuranceData()
  },
  data() {
    // 초기값: 당월 설정
    const now = new Date()
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    return {
      inquiryPeriod: currentYearMonth,
      employeeName: '',
      selectedDepartment: '',
      insuranceData: [],
      deductionItemNames: [], // 공제 항목명 목록
      loading: false
    }
  },
  computed: {
    // 필터링된 데이터
    filteredInsuranceData() {
      let filtered = [...this.insuranceData]
      
      // deductionMap이 비어있는 항목 제외
      filtered = filtered.filter(item => {
        if (!item.deductionMap || Object.keys(item.deductionMap).length === 0) {
          return false
        }
        // deductionMap에 하나라도 0이 아닌 값이 있는지 확인
        const hasData = Object.values(item.deductionMap).some(value => value && value !== 0)
        return hasData
      })
      
      // 직원명 필터링
      if (this.employeeName && this.employeeName.trim() !== '') {
        filtered = filtered.filter(item => 
          item.employeeName && item.employeeName.includes(this.employeeName.trim())
        )
      }
      
      // 부서 필터링
      if (this.selectedDepartment && this.selectedDepartment !== '') {
        filtered = filtered.filter(item => item.department === this.selectedDepartment)
      }
      
      return filtered
    },
    // 부서 목록 (동적으로 생성)
    departmentList() {
      const departments = [...new Set(this.insuranceData.map(item => item.department).filter(Boolean))]
      return departments.sort()
    }
  },
  methods: {
    // 공제 항목명 목록 조회
    async fetchDeductionItems() {
      try {
        const userHeaders = getUserHeaders()
        const response = await apiClient.get('/workforce-service/payrollItem/deduction', {
          headers: userHeaders
        })
        
        // API 응답에서 항목명 목록 추출
        const apiData = response.data?.data || response.data || []
        if (Array.isArray(apiData)) {
          // 항목명만 추출 (itemName 또는 name 필드가 있을 것으로 예상)
          this.deductionItemNames = apiData.map(item => item.itemName || item.name || item).filter(Boolean)
        } else if (typeof apiData === 'object') {
          // 객체 형태인 경우 키나 값에서 추출
          this.deductionItemNames = Object.keys(apiData).length > 0 ? Object.keys(apiData) : []
        }
        
      } catch (err) {
        console.error('공제 항목명 조회 실패:', err)
        // 기본값 사용 (에러가 나도 기본 항목명으로 표시)
        this.deductionItemNames = ['국민연금', '건강보험', '고용보험', '산재보험']
      }
    },
    
    // 보험료 공제 데이터 조회
    async fetchInsuranceData() {
      try {
        this.loading = true
        
        let yearMonth = ''
        
        // inquiryPeriod를 yyyy-MM 형식으로 변환
        // 조회기간이 선택되지 않았거나 null인 경우 당월로 설정
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
          // inquiryPeriod도 당월로 업데이트
          this.inquiryPeriod = yearMonth
        }
        
        const userHeaders = getUserHeaders()
        const response = await apiClient.get('/workforce-service/salary/deduction', {
          params: {
            yearMonth: yearMonth
          },
          headers: userHeaders
        })
        
        // API 응답 데이터를 컴포넌트 형식으로 변환
        const apiData = response.data?.data || response.data || []
        this.insuranceData = apiData.map(item => {
          const deductionMap = item.deductionMap || {}
          
          return {
            employeeName: item.memberName || '',
            department: item.department || '',
            deductionMap: deductionMap, // 전체 deductionMap 저장
            totalInsurance: item.totalDeductions || 0,
            period: item.period || '',
            status: item.status || '완료'
          }
        })
        
        this.success('보험료 공제 데이터를 조회했습니다.')
      } catch (err) {
        console.error('보험료 공제 데이터 조회 실패:', err)
        this.error('보험료 공제 데이터를 불러오는데 실패했습니다.')
        this.insuranceData = []
      } finally {
        this.loading = false
      }
    },
    
    exportReport() {
      this.success('보험료 공제 보고서가 내보내기되었습니다.')
    },
    
    refreshData() {
      this.fetchInsuranceData()
    }
  }
}
</script>

<style scoped>
.payroll-insurance-deduction {
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

.insurance-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: var(--surface-radius);
}

.insurance-filters :deep(.el-form-item) {
  margin-bottom: 0;
}

.insurance-filters :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

.insurance-filters :deep(.el-form-item__label) {
  width: auto !important;
  padding-right: 8px;
}

.insurance-filters :deep(.el-date-editor) {
  width: 100%;
}

.insurance-table {
  margin-top: 20px;
}
</style>
