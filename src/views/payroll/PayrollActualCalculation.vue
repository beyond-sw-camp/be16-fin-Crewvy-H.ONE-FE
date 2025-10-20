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
        <div class="button-row">
            <el-button @click="searchPayroll" class="action-btn">조회</el-button>
            <el-button @click="savePayroll" class="action-btn">저장</el-button>
            <el-button @click="deletePayroll" class="action-btn">삭제</el-button>
            <el-button @click="printPayroll" class="primary-btn">인쇄</el-button>
        </div>
        <!-- 모든 필드와 계산하기 버튼을 한 행에 -->
        <el-row :gutter="20" class="search-row">
          <el-col :span="3">
            <div class="search-item">
              <label>급여년월</label>
              <el-date-picker
                v-model="searchForm.payrollMonth"
                type="month"
                placeholder="2025.09"
                format="YYYY.MM"
                value-format="YYYY.MM"
                size="mini"
                style="width: 100%"
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
                size="mini"
                style="width: 100%"
              />
            </div>
          </el-col>
          <el-col :span="3">
            <div class="search-item">
              <label>급여내역</label>
              <el-input v-model="searchForm.payrollDetails" placeholder="급여내역" size="mini" />
            </div>
          </el-col>
          <el-col :span="3">
            <div class="search-item">
              <label>급여구분</label>
              <el-select v-model="searchForm.payrollType" placeholder="급여" size="mini">
                <el-option label="급여" value="salary" />
                <el-option label="상여금" value="bonus" />
                <el-option label="퇴직금" value="severance" />
              </el-select>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="search-item">
              <label>부서</label>
              <el-select v-model="searchForm.department" placeholder="부서" size="mini">
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
              <el-input v-model="searchForm.searchAll" placeholder="전체" size="mini" />
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
          </el-col>
        </el-row>
        
        <!-- 하단 버튼들 -->
        <div class="button-section">
          <div class="button-row">
            <el-button @click="adjustBonus" class="action-btn">상여조정</el-button>
            <el-button @click="copyPayroll" class="action-btn">급여복사</el-button>
            <el-button @click="annualLeavePayment" class="action-btn">연차지급</el-button>
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
            height="540"
            stripe
            :show-summary="true"
            :summary-method="getSummaries"
            class="payroll-employee-table"
            @selection-change="handleSelectionChange"
          >
          <!-- 선택 컬럼 -->
          <el-table-column type="selection" width="55" align="center" />
          
          <!-- 직원 정보 -->
          <el-table-column prop="employeeId" label="사번" width="80" align="center" header-align="center" />
          <el-table-column prop="name" label="성명" width="100" align="center" header-align="center" />
          <el-table-column prop="department" label="부서" width="100" align="center" header-align="center" />
          <el-table-column prop="workDays" label="급여일수" width="100" align="center" header-align="center" />
          
          <!-- 지급항목 -->
          <el-table-column label="지급항목" align="center">
            <el-table-column prop="basicSalary" label="기본급" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.basicSalary) }}
              </template>
            </el-table-column>
            <el-table-column prop="overtimeAllowance" label="연장수당" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.overtimeAllowance) }}
              </template>
            </el-table-column>
            <el-table-column prop="nightAllowance" label="야간수당" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.nightAllowance) }}
              </template>
            </el-table-column>
            <el-table-column prop="positionAllowance" label="직책수당" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.positionAllowance) }}
              </template>
            </el-table-column>
            <el-table-column prop="certificationAllowance" label="자격증수당" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.certificationAllowance) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="mealAllowance" label="식대" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.mealAllowance) }}
              </template>
            </el-table-column>
            <el-table-column prop="bonus" label="상여금" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.bonus) }}
              </template>
            </el-table-column>
            <el-table-column prop="otherAllowance" label="수당" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.otherAllowance) }}
              </template>
            </el-table-column>
          </el-table-column>
          
          <!-- 공제항목 -->
          <el-table-column label="공제항목" align="center">
            <el-table-column prop="nationalPension" label="국민연금" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.nationalPension) }}
              </template>
            </el-table-column>
            <el-table-column prop="healthInsurance" label="건강보험" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.healthInsurance) }}
              </template>
            </el-table-column>
            <el-table-column prop="employmentInsurance" label="고용보험" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.employmentInsurance) }}
              </template>
            </el-table-column>
            <el-table-column prop="longTermCareInsurance" label="장기요양보험" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.longTermCareInsurance) }}
              </template>
            </el-table-column>
            <el-table-column prop="incomeTax" label="소득세" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.incomeTax) }}
              </template>
            </el-table-column>
            <el-table-column prop="localIncomeTax" label="지방소득세" width="120" align="right" header-align="center">
              <template #default="scope">
                {{ formatCurrency(scope.row.localIncomeTax) }}
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
        payrollMonth: '2025.09',
        paymentDate: '2025.09.26',
        payrollDetails: '',
        payrollType: 'salary',
        department: '',
        searchAll: ''
      },
      payrollData: [
        {
          employeeId: 'EMP001',
          name: '김철수',
          department: '개발팀',
          workDays: 20,
          basicSalary: 4500000,
          overtimeAllowance: 150000,
          nightAllowance: 80000,
          positionAllowance: 200000,
          certificationAllowance: 100000,
          cashierAllowance: 0,
          fireSafetyAllowance: 0,
          mealAllowance: 200000,
          bonus: 0,
          otherAllowance: 50000,
          nationalPension: 202500,
          healthInsurance: 159525,
          employmentInsurance: 27000,
          longTermCareInsurance: 12762,
          incomeTax: 180000,
          localIncomeTax: 18000
        },
        {
          employeeId: 'EMP002',
          name: '박민수',
          department: '개발팀',
          workDays: 20,
          basicSalary: 3800000,
          overtimeAllowance: 120000,
          nightAllowance: 60000,
          positionAllowance: 150000,
          certificationAllowance: 80000,
          cashierAllowance: 0,
          fireSafetyAllowance: 0,
          mealAllowance: 200000,
          bonus: 0,
          otherAllowance: 30000,
          nationalPension: 171000,
          healthInsurance: 134710,
          employmentInsurance: 22800,
          longTermCareInsurance: 10777,
          incomeTax: 140000,
          localIncomeTax: 14000
        },
        {
          employeeId: 'EMP003',
          name: '이지은',
          department: '디자인팀',
          workDays: 20,
          basicSalary: 3200000,
          overtimeAllowance: 80000,
          nightAllowance: 40000,
          positionAllowance: 100000,
          certificationAllowance: 60000,
          cashierAllowance: 0,
          fireSafetyAllowance: 0,
          mealAllowance: 200000,
          bonus: 0,
          otherAllowance: 20000,
          nationalPension: 144000,
          healthInsurance: 113440,
          employmentInsurance: 19200,
          longTermCareInsurance: 9075,
          incomeTax: 95000,
          localIncomeTax: 9500
        },
        {
          employeeId: 'EMP004',
          name: '최영희',
          department: '마케팅팀',
          workDays: 20,
          basicSalary: 3500000,
          overtimeAllowance: 100000,
          nightAllowance: 50000,
          positionAllowance: 120000,
          certificationAllowance: 70000,
          cashierAllowance: 0,
          fireSafetyAllowance: 0,
          mealAllowance: 200000,
          bonus: 0,
          otherAllowance: 25000,
          nationalPension: 157500,
          healthInsurance: 124075,
          employmentInsurance: 21000,
          longTermCareInsurance: 9946,
          incomeTax: 110000,
          localIncomeTax: 11000
        },
        {
          employeeId: 'EMP005',
          name: '정민호',
          department: '인사팀',
          workDays: 20,
          basicSalary: 4000000,
          overtimeAllowance: 0,
          nightAllowance: 0,
          positionAllowance: 180000,
          certificationAllowance: 90000,
          cashierAllowance: 0,
          fireSafetyAllowance: 0,
          mealAllowance: 200000,
          bonus: 0,
          otherAllowance: 40000,
          nationalPension: 180000,
          healthInsurance: 141800,
          employmentInsurance: 24000,
          longTermCareInsurance: 11344,
          incomeTax: 160000,
          localIncomeTax: 16000
        },
        {
          employeeId: 'EMP006',
          name: '김수진',
          department: '회계팀',
          workDays: 20,
          basicSalary: 3600000,
          overtimeAllowance: 0,
          nightAllowance: 0,
          positionAllowance: 130000,
          certificationAllowance: 75000,
          cashierAllowance: 0,
          fireSafetyAllowance: 0,
          mealAllowance: 200000,
          bonus: 0,
          otherAllowance: 30000,
          nationalPension: 162000,
          healthInsurance: 127620,
          employmentInsurance: 21600,
          longTermCareInsurance: 10210,
          incomeTax: 120000,
          localIncomeTax: 12000
        },
        {
          employeeId: 'EMP007',
          name: '박지훈',
          department: '영업팀',
          workDays: 20,
          basicSalary: 4200000,
          overtimeAllowance: 200000,
          nightAllowance: 100000,
          positionAllowance: 160000,
          certificationAllowance: 85000,
          cashierAllowance: 0,
          fireSafetyAllowance: 0,
          mealAllowance: 200000,
          bonus: 500000,
          otherAllowance: 60000,
          nationalPension: 189000,
          healthInsurance: 148890,
          employmentInsurance: 25200,
          longTermCareInsurance: 11831,
          incomeTax: 200000,
          localIncomeTax: 20000
        },
        {
          employeeId: 'EMP008',
          name: '이하늘',
          department: '고객지원팀',
          workDays: 20,
          basicSalary: 2800000,
          overtimeAllowance: 60000,
          nightAllowance: 30000,
          positionAllowance: 80000,
          certificationAllowance: 50000,
          cashierAllowance: 0,
          fireSafetyAllowance: 0,
          mealAllowance: 200000,
          bonus: 0,
          otherAllowance: 15000,
          nationalPension: 126000,
          healthInsurance: 99260,
          employmentInsurance: 16800,
          longTermCareInsurance: 7930,
          incomeTax: 75000,
          localIncomeTax: 7500
        }
      ]
    }
  },
  computed: {
    totals() {
      return {
        basicSalary: this.payrollData.reduce((sum, item) => sum + item.basicSalary, 0),
        overtimeAllowance: this.payrollData.reduce((sum, item) => sum + item.overtimeAllowance, 0),
        nightAllowance: this.payrollData.reduce((sum, item) => sum + item.nightAllowance, 0),
        positionAllowance: this.payrollData.reduce((sum, item) => sum + item.positionAllowance, 0),
        certificationAllowance: this.payrollData.reduce((sum, item) => sum + item.certificationAllowance, 0),
        cashierAllowance: this.payrollData.reduce((sum, item) => sum + item.cashierAllowance, 0),
        fireSafetyAllowance: this.payrollData.reduce((sum, item) => sum + item.fireSafetyAllowance, 0),
        mealAllowance: this.payrollData.reduce((sum, item) => sum + item.mealAllowance, 0),
        bonus: this.payrollData.reduce((sum, item) => sum + item.bonus, 0),
        otherAllowance: this.payrollData.reduce((sum, item) => sum + item.otherAllowance, 0),
        nationalPension: this.payrollData.reduce((sum, item) => sum + item.nationalPension, 0),
        healthInsurance: this.payrollData.reduce((sum, item) => sum + item.healthInsurance, 0),
        employmentInsurance: this.payrollData.reduce((sum, item) => sum + item.employmentInsurance, 0),
        longTermCareInsurance: this.payrollData.reduce((sum, item) => sum + item.longTermCareInsurance, 0),
        incomeTax: this.payrollData.reduce((sum, item) => sum + item.incomeTax, 0),
        localIncomeTax: this.payrollData.reduce((sum, item) => sum + item.localIncomeTax, 0)
      }
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

      const selectedTotals = this.selectedEmployees.reduce((acc, employee) => {
        acc.basicSalary += employee.basicSalary || 0
        acc.overtimeAllowance += employee.overtimeAllowance || 0
        acc.nightAllowance += employee.nightAllowance || 0
        acc.positionAllowance += employee.positionAllowance || 0
        acc.certificationAllowance += employee.certificationAllowance || 0
        acc.cashierAllowance += employee.cashierAllowance || 0
        acc.fireSafetyAllowance += employee.fireSafetyAllowance || 0
        acc.mealAllowance += employee.mealAllowance || 0
        acc.bonus += employee.bonus || 0
        acc.otherAllowance += employee.otherAllowance || 0
        acc.nationalPension += employee.nationalPension || 0
        acc.healthInsurance += employee.healthInsurance || 0
        acc.employmentInsurance += employee.employmentInsurance || 0
        acc.longTermCareInsurance += employee.longTermCareInsurance || 0
        acc.incomeTax += employee.incomeTax || 0
        acc.localIncomeTax += employee.localIncomeTax || 0
        return acc
      }, {
        basicSalary: 0, overtimeAllowance: 0, nightAllowance: 0, positionAllowance: 0,
        certificationAllowance: 0, cashierAllowance: 0, fireSafetyAllowance: 0,
        mealAllowance: 0, bonus: 0, otherAllowance: 0, nationalPension: 0,
        healthInsurance: 0, employmentInsurance: 0, longTermCareInsurance: 0,
        incomeTax: 0, localIncomeTax: 0
      })

      const totalPayments = selectedTotals.basicSalary + selectedTotals.overtimeAllowance + 
                           selectedTotals.nightAllowance + selectedTotals.positionAllowance + 
                           selectedTotals.certificationAllowance + selectedTotals.cashierAllowance + 
                           selectedTotals.fireSafetyAllowance + selectedTotals.mealAllowance + 
                           selectedTotals.bonus + selectedTotals.otherAllowance
      
      const totalDeductions = selectedTotals.nationalPension + selectedTotals.healthInsurance + 
                             selectedTotals.employmentInsurance + selectedTotals.longTermCareInsurance + 
                             selectedTotals.incomeTax + selectedTotals.localIncomeTax
      
      return {
        totalPayments: totalPayments,
        totalDeductions: totalDeductions,
        netPayment: totalPayments - totalDeductions,
        taxableAmount: totalPayments - selectedTotals.mealAllowance, // 식대는 비과세
        incomeTax: selectedTotals.incomeTax,
        refundableIncomeTax: 0,
        nonTaxableAmount: selectedTotals.mealAllowance,
        localIncomeTax: selectedTotals.localIncomeTax,
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
    searchPayroll() {
      this.success('급여 정보를 조회했습니다.')
    },
    savePayroll() {
      this.success('급여 정보를 저장했습니다.')
    },
    deletePayroll() {
      this.warning('급여 정보를 삭제했습니다.')
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
  }
}
</script>

<style scoped>
.payroll-actual-calculation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
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

/* 필터 카드 스타일 */
.filter-card {
  margin-bottom: 16px;
}

.search-row {
  margin-bottom: 20px;
  align-items: flex-end;
  width: 100%;
  display: flex;
}

/* 검색 행 스타일 */
.search-row .el-col {
  padding-left: 0;
  padding-right: 0;
}

/* 입력 필드 높이를 버튼과 맞추기 */
.search-row .el-input,
.search-row .el-date-editor,
.search-row .el-select {
  height: 32px !important;
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
  margin-bottom: 16px;
  flex-wrap: wrap;
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
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  background-color: #f5f5f5 !important;
  border-color: #d0d0d0 !important;
  color: #333333 !important;
}

/* 주요 버튼 (인쇄) */
.primary-btn {
  background-color: #1976d2 !important;
  border: 1px solid #1976d2 !important;
  color: #ffffff !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  min-width: 80px !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

.primary-btn:hover {
  background-color: #1565c0 !important;
  border-color: #1565c0 !important;
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
  border-radius: 4px !important;
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
  border-radius: 8px;
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.payroll-employee-table :deep(.el-table__footer-wrapper .cell) {
  font-weight: 600;
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
