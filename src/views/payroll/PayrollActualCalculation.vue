<template>
  <div class="payroll-actual-calculation">
    <!-- 헤더 영역 -->
    <div class="page-header">
      <div class="header-content">
        <h1>급여 계산</h1>
        <p>실제 직원들의 급여를 계산하여 급여대장을 생성합니다.</p>
      </div>
    </div>

    <!-- 검색 및 필터 영역 -->
    <div class="content-section">
      <el-card class="filter-card">
        <div class="filter-toolbar">
          <!-- 모든 필드와 계산하기 버튼을 한 행에 -->
          <el-row class="search-row">
          <el-col :span="4">
            <div class="search-item">
              <label>급여년월</label>
              <el-date-picker
                v-model="searchForm.payrollMonth"
                type="month"
                placeholder="2025.09"
                format="YYYY.MM"
                value-format="YYYY.MM"
                size="small"
                style="width: 150px"
                @change="onPayrollMonthChange"
              />
            </div>
          </el-col>
          <el-col :span="3">
            <div class="search-item">
              <label>지급일</label>
              <el-date-picker
                v-model="searchForm.paymentDate"
                type="date"
                placeholder="2025.09.26"
                format="YYYY.MM.DD"
                value-format="YYYY.MM.DD"
                size="small"
                style="width: 150px"
            readonly
              />
            </div>
          </el-col>
          <!-- <el-col :span="3">
            <div class="search-item">
              <label>급여내역</label>
              <el-input v-model="searchForm.payrollDetails" placeholder="급여내역" size="small" />
            </div>
          </el-col>
          <el-col :span="3">
            <div class="search-item">
              <label>급여구분</label>
              <el-select v-model="searchForm.payrollType" placeholder="급여" size="small">
                <el-option label="급여" value="salary" />
                <el-option label="상여금" value="bonus" />
                <el-option label="퇴직금" value="severance" />
              </el-select>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="search-item">
              <label>부서</label>
              <el-select v-model="searchForm.department" placeholder="부서" size="small">
                <el-option label="전체" value="" />
                <el-option label="개발팀" value="개발팀" />
                <el-option label="디자인팀" value="디자인팀" />
                <el-option label="마케팅팀" value="마케팅팀" />
                <el-option label="인사팀" value="인사팀" />
                <el-option label="회계팀" value="회계팀" />
                <el-option label="영업팀" value="영업팀" />
                <el-option label="고객지원팀" value="고객지원팀" />
              </el-select>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="search-item">
              <label>전체</label>
              <el-input v-model="searchForm.searchAll" placeholder="전체" size="small" />
            </div>
          </el-col>
          <el-col :span="3">
            <div class="search-item">
            </div>
          </el-col>
          <el-col :span="3">
            <div class="search-item">
              <el-button @click="calculatePayroll" class="calculate-btn">계산하기</el-button>
            </div>
          </el-col> -->
          </el-row>
          <div class="button-row">
            <el-button @click="searchPayroll" class="action-btn">조회</el-button>
            <el-button @click="savePayroll" class="action-btn">저장</el-button>
            <el-button @click="printPayroll" class="primary-btn">인쇄</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 급여 테이블 -->
    <div class="content-section">
      <el-card>
        <div class="table-wrap">
          <el-table 
            :data="payrollData" 
            style="width: 100%"
            border
            max-height="540"
            stripe
            :show-summary="true"
            :summary-method="getSummaries"
            class="payroll-employee-table"
            @selection-change="handleSelectionChange"
            v-loading="loading"
            element-loading-text="데이터를 불러오는 중..."
          >
          <!-- 선택 컬럼 -->
          <el-table-column type="selection" width="55" align="center" />
          
          <!-- 직원 정보 (고정 컬럼) -->
          <!-- <el-table-column prop="employeeId" label="사번" width="80" align="center" header-align="center" fixed="left" /> -->
          <el-table-column prop="name" label="성명" width="100" align="center" header-align="center" fixed="left" />
          <el-table-column prop="department" label="부서" width="100" align="center" header-align="center" fixed="left" />
          <el-table-column prop="workDays" label="급여일수" width="100" align="center" header-align="center" fixed="left" />
          
          <!-- 합계 컬럼 -->
          <el-table-column prop="netPay" label="실지급액" width="120" align="right" header-align="center" fixed="left">
            <template #default="scope">
              <strong>{{ formatCurrency(scope.row.netPay) }}</strong>
            </template>
          </el-table-column>
          <el-table-column prop="totalAllowance" label="총지급액" width="120" align="right" header-align="center">
            <template #default="scope">
              {{ formatCurrency(scope.row.totalAllowance) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalDeduction" label="총공제액" width="120" align="right" header-align="center">
            <template #default="scope">
              {{ formatCurrency(scope.row.totalDeduction) }}
            </template>
          </el-table-column>
          
          <!-- 지급항목 -->
          <el-table-column label="지급항목" align="center">
            <el-table-column 
              v-for="item in allowanceItems" 
              :key="item.name"
              :prop="item.property" 
              :label="item.name" 
              width="120" 
              align="right" 
              header-align="center"
            >
              <template #default="scope">
                {{ formatCurrency(scope.row[item.property]) }}
              </template>
            </el-table-column>
          </el-table-column>
          
          <!-- 공제항목 -->
          <el-table-column label="공제항목" align="center">
            <el-table-column 
              v-for="item in deductionItems" 
              :key="item.name"
              :prop="item.property" 
              :label="item.name" 
              width="120" 
              align="right" 
              header-align="center"
            >
              <template #default="scope">
                {{ formatCurrency(scope.row[item.property]) }}
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
        </div>
      </el-card>
    </div>

    <!-- 급여 합계 섹션 -->
    <div class="content-section">
      <el-card>
        <div class="summary-title">
          급여합계 
          <span v-if="selectedEmployees.length > 0" class="selected-count">
            (선택된 사원 {{ selectedEmployees.length }}명)
          </span>
          <span v-else class="no-selection">
            (사원을 선택해주세요)
          </span>
        </div>
         <div class="summary-table-container">
           <table class="summary-table">
             <tbody>
               <tr>
                 <td class="label-cell">지급총액</td>
                 <td class="value-cell">{{ formatCurrency(summary.totalPayments) }}</td>
                 <td class="label-cell">과세금액</td>
                 <td class="value-cell">{{ formatCurrency(summary.taxableAmount) }}</td>
                 <td class="label-cell">비과세금액</td>
                 <td class="value-cell">{{ formatCurrency(summary.nonTaxableAmount) }}</td>
               </tr>
               <tr>
                 <td class="label-cell">공제총액</td>
                 <td class="value-cell">{{ formatCurrency(summary.totalDeductions) }}</td>
                 <td class="label-cell">소득세</td>
                 <td class="value-cell">{{ formatCurrency(summary.incomeTax) }}</td>
                 <td class="label-cell">지방소득세</td>
                 <td class="value-cell">{{ formatCurrency(summary.localIncomeTax) }}</td>
               </tr>
               <tr>
                 <td class="label-cell">실지급액</td>
                 <td class="value-cell highlight">{{ formatCurrency(summary.netPayment) }}</td>
                 <td class="label-cell">환급소득세</td>
                 <td class="value-cell">{{ formatCurrency(summary.refundableIncomeTax) }}</td>
                 <td class="label-cell">환급지방소득세</td>
                 <td class="value-cell">{{ formatCurrency(summary.refundableLocalTax) }}</td>
               </tr>
             </tbody>
           </table>
         </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import apiClient from '@/api/http'
import { getAuthHeadersFromToken } from '@/utils/authUtils'

export default {
  name: 'PayrollActualCalculation',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      activeTab: 'usage',
      showPersonalInfo: false,
      selectedEmployees: [], // 선택된 사원들
      searchForm: {
        payrollMonth: (() => {
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, '0')
          return `${year}.${month}`
        })(),
        paymentDate: '',
        payrollDetails: '',
        payrollType: 'salary',
        department: '',
        searchAll: ''
      },
      payrollData: [],
      loading: false,
      allowanceItems: [], // 지급항목 목록
      deductionItems: [] // 공제항목 목록
    }
  },
  computed: {
    totals() {
      if (!this.payrollData || this.payrollData.length === 0) {
        return {}
      }
      
      // 모든 지급/공제 항목의 합계를 동적으로 계산
      const totals = {}
      
      // 지급항목 합계 계산
      this.allowanceItems.forEach(item => {
        totals[item.property] = this.payrollData.reduce((sum, row) => 
          sum + (Number(row[item.property]) || 0), 0)
      })
      
      // 공제항목 합계 계산
      this.deductionItems.forEach(item => {
        totals[item.property] = this.payrollData.reduce((sum, row) => 
          sum + (Number(row[item.property]) || 0), 0)
      })
      
      return totals
    },
    summary() {
      // 선택된 사원들의 급여 합계 계산
      if (this.selectedEmployees.length === 0) {
        return {
          totalPayments: 0,
          totalDeductions: 0,
          netPayment: 0,
          taxableAmount: 0,
          incomeTax: 0,
          refundableIncomeTax: 0,
          nonTaxableAmount: 0,
          localIncomeTax: 0,
          refundableLocalTax: 0
        }
      }

      // 동적으로 지급액과 공제액 합계 계산
      let totalPayments = 0
      let totalDeductions = 0
      
      this.selectedEmployees.forEach(employee => {
        this.allowanceItems.forEach(item => {
          totalPayments += Number(employee[item.property]) || 0
        })
        
        this.deductionItems.forEach(item => {
          totalDeductions += Number(employee[item.property]) || 0
        })
      })
      
      return {
        totalPayments: totalPayments,
        totalDeductions: totalDeductions,
        netPayment: totalPayments - totalDeductions,
        taxableAmount: totalPayments,
        incomeTax: 0,
        refundableIncomeTax: 0,
        nonTaxableAmount: 0,
        localIncomeTax: 0,
        refundableLocalTax: 0
      }
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('ko-KR').format(amount || 0)
    },
    handleSelectionChange(selection) {
      this.selectedEmployees = selection
    },
    
    // 급여년월 변경 시 지급일 자동 계산
    async onPayrollMonthChange(value) {
      if (!value) {
        this.searchForm.paymentDate = ''
        return
      }
      
      try {
        const companyId = 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0'
        // '2025.09' 형식을 'YYYY-MM' 형식으로 변환
        const yearMonth = value.replace('.', '-')
        
        const response = await apiClient.get(`/workforce-service/salary-policy/payment-date`, {
          params: {
            companyId: companyId,
            yearMonth: yearMonth
          }
        })
        
        // 응답 데이터에서 지급일 추출
        if (response.data) {
          // 응답이 직접 날짜 문자열인 경우
          if (typeof response.data === 'string') {
            // YYYY-MM-DD 형식을 YYYY.MM.DD로 변환
            this.searchForm.paymentDate = response.data.replace(/-/g, '.')
          } 
          // 응답이 객체이고 paymentDate 필드가 있는 경우
          else if (response.data.paymentDate) {
            this.searchForm.paymentDate = response.data.paymentDate.replace(/-/g, '.')
          }
          // 응답이 data 속성을 가진 경우
          else if (response.data.data) {
            const paymentDate = response.data.data
            if (typeof paymentDate === 'string') {
              this.searchForm.paymentDate = paymentDate.replace(/-/g, '.')
            } else if (paymentDate.paymentDate) {
              this.searchForm.paymentDate = paymentDate.paymentDate.replace(/-/g, '.')
            }
          }
        }
      } catch (err) {
        console.error('지급일 조회 실패:', err)
        const errorMessage = err.response?.data?.message || '지급일을 불러오는데 실패했습니다.'
        this.error(errorMessage)
      }
    },
    getSummaries({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) { sums[index] = ''; return }
        if (['성명','부서','급여일수'].includes(column.label)) { sums[index] = ''; return }
        const values = data.map(item => Number(item[column.property]))
        const total = values.reduce((acc, cur) => acc + (isNaN(cur) ? 0 : cur), 0)
        sums[index] = this.formatCurrency(total)
      })
      return sums
    },
    
    // 급여 항목 목록 로드
    async loadPayrollItems() {
      try {
        const companyId = 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0'
        
        // 인증 헤더 가져오기
        const authHeaders = getAuthHeadersFromToken()
        
        const response = await apiClient.get(`/workforce-service/payrollItem/list`, {
          params: { companyId },
          headers: authHeaders ? {
            'Authorization': authHeaders['Authorization'],
            'X-User-MemberPositionId': authHeaders['X-User-MemberPositionId']
          } : {}
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
        
        // 지급항목과 공제항목 분리
        const allowanceItems = items
          .filter(item => item.salaryType === 'ALLOWANCE')
          .map(item => ({
            name: item.name,
            property: `allowance_${item.id}` // 동적 프로퍼티명 생성
          }))
        
        const deductionItems = items
          .filter(item => item.salaryType === 'DEDUCTION')
          .map(item => ({
            name: item.name,
            property: `deduction_${item.id}` // 동적 프로퍼티명 생성
          }))
        
        // 기본급 항목을 지급항목 맨 앞으로 정렬
        this.allowanceItems = allowanceItems.sort((a, b) => {
          if (a.name === '기본급') return -1
          if (b.name === '기본급') return 1
          return 0
        })
        
        this.deductionItems = deductionItems
        
      } catch (error) {
        console.error('급여 항목 로드 실패:', error)
        this.allowanceItems = []
        this.deductionItems = []
      }
    },

    // API 응답 데이터를 테이블 구조로 변환
    transformApiData(apiData) {
      return apiData.map(salary => {
        const transformed = {
          salaryId: salary.salaryId,
          employeeId: salary.memberId,
          name: salary.memberName,
          department: salary.department,
          workDays: salary.workingDays,
          periodStartDate: salary.periodStartDate,
          periodEndDate: salary.periodEndDate,
          paymentDate: salary.paymentDate,
          totalAllowance: salary.totalAllowance || 0,
          totalDeduction: salary.totalDeduction || 0,
          netPay: salary.netPay || 0
        }

        // 지급항목 매핑 - 동적으로 프로퍼티 생성
        if (salary.allowanceList) {
          salary.allowanceList.forEach(item => {
            // 항목 이름으로 해당하는 항목 찾기
            const allowanceItem = this.allowanceItems.find(a => a.name === item.salaryName)
            if (allowanceItem) {
              transformed[allowanceItem.property] = Number(item.amount) || 0
            }
          })
        }

        // 공제항목 매핑 - 동적으로 프로퍼티 생성
        if (salary.deductionList) {
          salary.deductionList.forEach(item => {
            // 항목 이름으로 해당하는 항목 찾기
            const deductionItem = this.deductionItems.find(d => d.name === item.salaryName)
            if (deductionItem) {
              transformed[deductionItem.property] = Number(item.amount) || 0
            }
          })
        }

        // 고정수당 매핑 - 동적으로 프로퍼티 생성 (지급항목으로 처리)
        if (salary.fixedList) {
          salary.fixedList.forEach(item => {
            // 항목 이름으로 해당하는 지급항목 찾기
            const allowanceItem = this.allowanceItems.find(a => a.name === item.salaryName || a.name === item.allowanceName)
            if (allowanceItem) {
              // 기존 값이 있으면 더하기, 없으면 설정
              const currentAmount = transformed[allowanceItem.property] || 0
              const fixedAmount = Number(item.amount) || 0
              transformed[allowanceItem.property] = currentAmount + fixedAmount
            }
          })
        }

        return transformed
      })
    },

    async searchPayroll() {
      try {
        this.loading = true
        const companyId = 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0'
        // '2025.09' 형식을 'YYYY-MM' 형식으로 변환
        const yearMonth = this.searchForm.payrollMonth.replace('.', '-') // '2025-09' 형식
        
        // 급여 정보 조회
        const memberPositionId = localStorage.getItem('memberPositionId')
        const response = await apiClient.post(`/workforce-service/salary/calculate`, {
          companyId: companyId
        }, {
          params: {
            yearMonth: yearMonth
          },
          headers: {
            ...(memberPositionId ? { 'X-User-MemberPositionId': memberPositionId } : {})
          }
        })
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          this.payrollData = this.transformApiData(response.data)
          this.success('급여 정보를 조회했습니다.')
        } else if (response.data && !Array.isArray(response.data)) {
          if (response.data.data && Array.isArray(response.data.data)) {
            // 빈 배열인 경우 체크
            if (response.data.data.length === 0) {
              this.payrollData = []
              this.warning('조회된 급여 정보가 없습니다.')
            } else {
              this.payrollData = this.transformApiData(response.data.data)
              this.success('급여 정보를 조회했습니다.')
            }
          } else {
            this.payrollData = []
            this.warning('조회된 급여 정보가 없습니다.')
          }
        } else {
          this.payrollData = []
          this.warning('조회된 급여 정보가 없습니다.')
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || '급여 정보 조회에 실패했습니다.'
        this.error(errorMessage)
        this.payrollData = []
      } finally {
        this.loading = false
      }
    },
    
    async savePayroll() {
      if (this.selectedEmployees.length === 0) {
        this.warning('저장할 사원을 선택해주세요.')
        return
      }
      
      try {
        this.loading = true
        const companyId = 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0'
        
        // 인증 헤더 가져오기
        const authHeaders = getAuthHeadersFromToken()
        if (!authHeaders || !authHeaders['X-User-MemberPositionId']) {
          this.error('인증 정보를 찾을 수 없습니다.')
          return
        }
        
        // paymentDate 형식 변환 (YYYY.MM.DD -> YYYY-MM-DD)
        let paymentDate = this.searchForm.paymentDate || ''
        if (paymentDate && paymentDate.includes('.')) {
          paymentDate = paymentDate.replace(/\./g, '-')
        }
        
        // salaryName 생성 (급여년월 기반)
        const salaryName = `급여 ${this.searchForm.payrollMonth || ''}`
        
        // 선택된 사원들의 데이터를 API 형식으로 변환
        const salaryCreateReqList = this.selectedEmployees.map(employee => {
          // 지급항목 리스트 생성 및 총지급액 계산
          const allowanceList = []
          let totalAllowance = 0
          let baseSalary = 0
          
          // 기본급 찾기 및 분리
          const baseSalaryItem = this.allowanceItems.find(item => item.name === '기본급')
          if (baseSalaryItem) {
            const amount = Number(employee[baseSalaryItem.property]) || 0
            if (amount > 0) {
              baseSalary = amount
            }
          }
          
          // 모든 지급항목들
          this.allowanceItems.forEach(item => {
            const amount = Number(employee[item.property]) || 0
            if (amount > 0) {
              allowanceList.push({
                salaryName: item.name,
                amount: amount.toString()
              })
              totalAllowance += amount
            }
          })
          
          // 공제항목 리스트 생성 및 총공제액 계산
          const deductionList = []
          let totalDeduction = 0
          this.deductionItems.forEach(item => {
            const amount = Number(employee[item.property]) || 0
            if (amount > 0) {
              deductionList.push({
                salaryName: item.name,
                amount: amount.toString()
              })
              totalDeduction += amount
            }
          })
          
          // 총지급액과 총공제액이 이미 계산되어 있는 경우 사용, 없으면 합산값 사용
          const finalTotalAllowance = employee.totalAllowance || totalAllowance
          const finalTotalDeduction = employee.totalDeduction || totalDeduction
          const finalNetPay = employee.netPay || (finalTotalAllowance - finalTotalDeduction)
          
          return {
            memberId: employee.employeeId,
            salaryName: salaryName,
            baseSalary: baseSalary.toString(),
            totalAllowance: finalTotalAllowance.toString(),
            totalDeduction: finalTotalDeduction.toString(),
            netPay: finalNetPay.toString(),
            paymentDate: paymentDate,
            allowanceList: allowanceList,
            deductionList: deductionList
          }
        })
        
        // API 요청
        await apiClient.post(
          `/workforce-service/salary/save`,
          salaryCreateReqList,
          {
            headers: {
              'Authorization': authHeaders['Authorization'],
              'X-User-MemberPositionId': authHeaders['X-User-MemberPositionId']
            },
            params: {
              companyId: companyId
            }
          }
        )
        
        this.success(`${this.selectedEmployees.length}명의 급여 정보를 저장했습니다.`)
        
        // 저장 후 데이터 재조회
        await this.searchPayroll()
      } catch (err) {
        console.error('급여 저장 실패:', err)
        const errorMessage = err.response?.data?.message || '급여 정보 저장에 실패했습니다.'
        this.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    
    printPayroll() {
      this.info('급여 정보를 인쇄합니다.')
    },
    
    calculatePayroll() {
      this.success('급여 계산이 완료되었습니다.')
    },
    
    adjustBonus() {
      this.info('상여조정 기능을 실행합니다.')
    },
    
    copyPayroll() {
      this.info('급여복사 기능을 실행합니다.')
    },
    
    annualLeavePayment() {
      this.info('연차지급 기능을 실행합니다.')
    }
  },
  
  async mounted() {
    // 급여 항목 목록 로드
    await this.loadPayrollItems()
    // 현재 급여년월 기준 지급일 자동 조회
    await this.onPayrollMonthChange(this.searchForm.payrollMonth)
    // 컴포넌트 마운트 시 자동 조회
    await this.searchPayroll()
  }
}
</script>

<style scoped>
.payroll-actual-calculation {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.header-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.header-tabs {
  margin-top: 8px;
}

.content-section {
  margin-bottom: 24px;
}

.content-section :deep(.el-card) {
  border-radius: var(--surface-radius);
  box-shadow: var(--surface-shadow);
  border: none;
}

.content-section :deep(.el-card__body) {
  border-radius: var(--surface-radius);
}

/* 필터 카드 스타일 */
.filter-card {
  margin-bottom: 16px;
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.search-row {
  flex: 1 1 0;
  align-items: flex-end;
  display: flex !important;
  box-sizing: border-box;
  margin: 0 !important;
  gap: 0;
}

.search-row .el-col {
  padding-left: 10px;
  padding-right: 10px;
}

.search-row .el-col:first-child {
  padding-left: 0;
}

.search-row .el-col:last-child {
  padding-right: 0;
}

/* 입력 필드 높이를 버튼과 맞추기 */
.search-row .el-input,
.search-row .el-date-editor,
.search-row .el-select {
  height: 32px !important;
  width: 100%;
}

.search-row .el-input__inner,
.search-row .el-date-editor .el-input__inner,
.search-row .el-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
  padding: 0 11px !important;
}

/* 날짜 선택기 강제 높이 조정 */
.search-row .el-date-editor {
  height: 32px !important;
  line-height: 32px !important;
}

.search-row .el-date-editor.el-input {
  height: 32px !important;
}

.search-row .el-date-editor .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

/* 셀렉트 박스 강제 높이 조정 */
.search-row .el-select {
  height: 32px !important;
}

.search-row .el-select .el-input {
  height: 32px !important;
}

.search-row .el-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

.search-row .el-input__suffix,
.search-row .el-input__prefix {
  line-height: 32px !important;
}

.search-row .el-date-editor .el-input__suffix,
.search-row .el-date-editor .el-input__prefix {
  line-height: 32px !important;
}

.search-row .el-select .el-input__suffix {
  line-height: 32px !important;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: flex-end;
  height: 60px;
}

.search-item label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  min-width: 40px;
}

/* 버튼 섹션 스타일 - 깔끔한 디자인 */
.button-section {
  margin-top: 20px;
  padding: 0;
}

.button-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 0;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.button-row:last-child {
  margin-bottom: 0;
}

/* 기본 액션 버튼 */
.action-btn {
  background-color: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  color: #333333 !important;
  font-weight: 400 !important;
  padding: 8px 16px !important;
  min-width: 80px !important;
  border-radius: 4px;
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  background-color: #f5f5f5 !important;
  border-color: #d0d0d0 !important;
  color: #333333 !important;
}

/* 주요 버튼 (인쇄) */
.primary-btn {
  background-color: rgb(64, 158, 255) !important;
  border: 1px solid rgb(64, 158, 255) !important;
  color: #ffffff !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  min-width: 80px !important;
  border-radius: 4px;
  transition: all 0.2s ease !important;
}

.primary-btn:hover {
  background-color: rgb(53, 138, 230) !important;
  border-color: rgb(53, 138, 230) !important;
  color: #ffffff !important;
}

/* 계산하기 버튼 */
.calculate-btn {
  background-color: #1976d2 !important;
  border: 1px solid #1976d2 !important;
  color: #ffffff !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  width: 100% !important;
  border-radius: var(--surface-radius) !important;
  transition: all 0.2s ease !important;
}

.calculate-btn:hover {
  background-color: #1565c0 !important;
  border-color: #1565c0 !important;
  color: #ffffff !important;
}


.total-row {
  display: flex;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-top: none;
  padding: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.total-label {
  width: 400px;
  text-align: center;
  border-right: 1px solid #e9ecef;
  padding-right: 10px;
}

.total-values {
  display: flex;
  flex: 1;
  gap: 20px;
  justify-content: space-around;
  align-items: center;
}


.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.selected-count {
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
}

.no-selection {
  color: #909399;
  font-size: 14px;
  font-weight: 400;
}

/* 급여 합계 테이블 스타일 */
.summary-table-container {
  margin-top: 16px;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e4e7ed;
  border-radius: var(--surface-radius);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  table-layout: fixed;
}


.summary-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  border-right: 1px solid #e4e7ed;
  font-size: 13px;
}

.summary-table td:last-child {
  border-right: none;
}

.summary-table tbody tr:last-child td {
  border-bottom: none;
}


.label-cell {
  background-color: #fafbfc;
  font-weight: 500;
  color: #606266;
  text-align: left;
  width: 15%;
  font-size: 13px;
}

.value-cell {
  background-color: #ffffff;
  font-weight: 600;
  color: #2c3e50;
  text-align: right;
  width: 18.33%;
  font-size: 13px;
}

.value-cell.highlight {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 700;
  font-size: 14px;
}

/* 테이블 스타일 */
.table-wrap {
  overflow-x: auto;
}

.payroll-employee-table {
  width: 100%;
  border-radius: var(--surface-radius);
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.payroll-employee-table :deep(.el-table__footer-wrapper .cell) {
  font-weight: 600;
}

/* Footer와 Body 사이 공간 제거 */
.payroll-employee-table :deep(.el-table__footer-wrapper) {
  width: 100% !important;
  margin-top: 0 !important;
}

.payroll-employee-table :deep(.el-table__body-wrapper) {
  margin-bottom: 0 !important;
}

.payroll-employee-table :deep(.el-table__footer) {
  width: 100% !important;
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

/* 기본 헤더 스타일 */
.payroll-employee-table :deep(.el-table__header-wrapper .el-table__header th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  padding: 8px 4px;
  font-size: 12px;
}

.payroll-employee-table :deep(.el-table__header-wrapper .el-table__header th:last-child) {
  border-right: none;
}

/* 테이블 셀 테두리 통일 */
.payroll-employee-table :deep(.el-table__body td) {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.payroll-employee-table :deep(.el-table__body td:last-child) {
  border-right: none;
}


/* 반응형 디자인 */
@media (max-width: 1200px) {
  .summary-table {
    font-size: 12px;
  }
  
  .summary-table td {
    padding: 6px 8px;
  }
  
  .payroll-employee-table {
    font-size: 12px;
    width: 100% !important;
    min-width: 100%;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-row .el-col {
    margin-bottom: 15px;
  }
  
  .header-actions {
    width: 100%;
    align-items: flex-start;
  }
  
  /* 모바일에서 버튼 섹션 조정 */
  .button-row {
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .action-btn,
  .primary-btn {
    min-width: 70px !important;
    font-size: 13px !important;
    padding: 6px 12px !important;
  }
  
  .calculate-btn {
    min-width: 100px !important;
    font-size: 14px !important;
    padding: 8px 20px !important;
  }
  
  .payroll-employee-table {
    font-size: 11px;
    width: 100% !important;
    min-width: 100%;
  }
}
</style>
