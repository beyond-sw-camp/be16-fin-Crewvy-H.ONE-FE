<template>
  <div class="payroll-calculation">
    <div class="page-header">
      <h1>급여 계산</h1>
      <p>급여 계산 설정을 조정하고 임의로 급여를 계산해볼 수 있습니다.</p>
    </div>
    
    <!-- 급여계산 설정 섹션 -->
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여계산</span>
          </div>
        </template>
        
        <div class="calculation-settings">
          <el-row :gutter="40">
            <!-- 왼쪽 설정 영역 -->
            <el-col :span="12">
              <div class="settings-group">
                <!-- 일수기준 -->
                <div class="setting-item">
                  <label class="setting-label">일수기준</label>
                  <el-radio-group v-model="calculationSettings.dayBasis">
                    <el-radio label="30일">30일</el-radio>
                    <el-radio label="실일수">실일수</el-radio>
                  </el-radio-group>
                </div>

                <!-- 고용보험 -->
                <div class="setting-item">
                  <label class="setting-label">고용보험</label>
                  <div class="insurance-inputs">
                    <div class="input-group">
                      <label>회사부담</label>
                      <el-input v-model="calculationSettings.employmentInsurance.company" suffix="%" />
                    </div>
                    <div class="input-group">
                      <label>본인부담</label>
                      <el-input v-model="calculationSettings.employmentInsurance.employee" suffix="%" />
                    </div>
                  </div>
                </div>

                <!-- 계산단위 -->
                <div class="setting-item">
                  <label class="setting-label">계산단위</label>
                  <div class="unit-inputs">
                    <el-select v-model="calculationSettings.calculationUnit.unit" placeholder="원단위">
                      <el-option label="원단위" value="won" />
                      <el-option label="천원단위" value="thousand" />
                    </el-select>
                    <el-select v-model="calculationSettings.calculationUnit.rounding" placeholder="사사오입">
                      <el-option label="사사오입" value="round_half_up" />
                      <el-option label="절사" value="truncate" />
                      <el-option label="올림" value="ceil" />
                    </el-select>
                  </div>
                </div>

                <!-- 연차적용 -->
                <div class="setting-item">
                  <label class="setting-label">연차적용</label>
                  <el-radio-group v-model="calculationSettings.annualLeave">
                    <el-radio label="기본">기본</el-radio>
                    <el-radio label="연봉제">연봉제</el-radio>
                  </el-radio-group>
                </div>

                <!-- 근태관리 사용 -->
                <div class="setting-item">
                  <label class="setting-label">근태관리 사용</label>
                  <el-radio-group v-model="calculationSettings.attendanceManagement">
                    <el-radio label="근태관리1">근태관리1</el-radio>
                    <el-radio label="근태관리2">근태관리2</el-radio>
                  </el-radio-group>
                </div>

                <!-- 지급대장문구 -->
                <div class="setting-item">
                  <label class="setting-label">지급대장문구</label>
                  <div class="ledger-inputs">
                    <el-input v-model="calculationSettings.ledgerPhrase1" placeholder="지급대장 문구 1" />
                    <el-input v-model="calculationSettings.ledgerPhrase2" placeholder="지급대장 문구 2" />
                  </div>
                </div>
              </div>
            </el-col>

            <!-- 오른쪽 설정 영역 -->
            <el-col :span="12">
              <div class="settings-group">
                <!-- 급여계산 시작일 -->
                <div class="setting-item">
                  <label class="setting-label">급여계산 시작일</label>
                  <el-input v-model="calculationSettings.payrollStartDay" suffix="일" />
                </div>

                <!-- 국민연금 비공제연령 -->
                <div class="setting-item">
                  <label class="setting-label">국민연금 비공제연령</label>
                  <el-input v-model="calculationSettings.nationalPensionAge" prefix="만" suffix="세" />
                </div>

                <!-- 건강보험 자동계산 -->
                <div class="setting-item">
                  <label class="setting-label">건강보험 자동계산</label>
                  <el-radio-group v-model="calculationSettings.healthInsuranceAuto">
                    <el-radio label="자동계산">자동계산</el-radio>
                    <el-radio label="자동계산안함">자동계산안함</el-radio>
                  </el-radio-group>
                </div>

                <!-- 장기요양보험 분리여부 -->
                <div class="setting-item">
                  <label class="setting-label">장기요양보험 분리여부</label>
                  <el-radio-group v-model="calculationSettings.longTermCareInsurance">
                    <el-radio label="건강보험료에 포함">건강보험료에 포함</el-radio>
                    <el-radio label="분리">분리</el-radio>
                  </el-radio-group>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 급여 계산기 섹션 -->
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 계산기</span>
            <div class="header-actions">
              <el-button @click="resetCalculation">초기화</el-button>
              <el-button type="primary" @click="calculatePayroll">계산하기</el-button>
            </div>
          </div>
        </template>
        
        <div class="calculator-section">
          <el-row :gutter="40">
            <!-- 입력 영역 -->
            <el-col :span="12">
              <div class="input-section">
                <h3>급여 정보 입력</h3>
                <el-form :model="payrollInput" label-width="120px">
                  <el-form-item label="기본급">
                    <el-input v-model.number="payrollInput.basicSalary" placeholder="기본급 입력" suffix="원" />
                  </el-form-item>
                  <el-form-item label="수당">
                    <el-input v-model.number="payrollInput.allowance" placeholder="수당 입력" suffix="원" />
                  </el-form-item>
                  <el-form-item label="야근수당">
                    <el-input v-model.number="payrollInput.overtime" placeholder="야근수당 입력" suffix="원" />
                  </el-form-item>
                  <el-form-item label="기타수당">
                    <el-input v-model.number="payrollInput.otherAllowance" placeholder="기타수당 입력" suffix="원" />
                  </el-form-item>
                  <el-form-item label="근무일수">
                    <el-input v-model.number="payrollInput.workDays" placeholder="근무일수 입력" suffix="일" />
                  </el-form-item>
                </el-form>
              </div>
            </el-col>

            <!-- 결과 영역 -->
            <el-col :span="12">
              <div class="result-section">
                <h3>계산 결과</h3>
                <div class="result-display">
                  <div class="result-item">
                    <span class="result-label">총 지급액:</span>
                    <span class="result-value">{{ formatCurrency(calculationResult.totalIncome) }}원</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">소득세:</span>
                    <span class="result-value">{{ formatCurrency(calculationResult.incomeTax) }}원</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">국민연금:</span>
                    <span class="result-value">{{ formatCurrency(calculationResult.nationalPension) }}원</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">건강보험:</span>
                    <span class="result-value">{{ formatCurrency(calculationResult.healthInsurance) }}원</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">고용보험:</span>
                    <span class="result-value">{{ formatCurrency(calculationResult.employmentInsurance) }}원</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">장기요양보험:</span>
                    <span class="result-value">{{ formatCurrency(calculationResult.longTermCareInsurance) }}원</span>
                  </div>
                  <div class="result-item total">
                    <span class="result-label">총 공제액:</span>
                    <span class="result-value">{{ formatCurrency(calculationResult.totalDeduction) }}원</span>
                  </div>
                  <div class="result-item final">
                    <span class="result-label">실수령액:</span>
                    <span class="result-value">{{ formatCurrency(calculationResult.netPay) }}원</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'PayrollCalculation',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      // 급여계산 설정
      calculationSettings: {
        dayBasis: '실일수',
        employmentInsurance: {
          company: '0.9',
          employee: '0.9'
        },
        calculationUnit: {
          unit: 'won',
          rounding: 'round_half_up'
        },
        annualLeave: '기본',
        attendanceManagement: '근태관리1',
        ledgerPhrase1: '',
        ledgerPhrase2: '',
        payrollStartDay: '',
        nationalPensionAge: '60',
        healthInsuranceAuto: '자동계산',
        longTermCareInsurance: '건강보험료에 포함'
      },
      // 급여 입력 데이터
      payrollInput: {
        basicSalary: 0,
        allowance: 0,
        overtime: 0,
        otherAllowance: 0,
        workDays: 0
      },
      // 계산 결과
      calculationResult: {
        totalIncome: 0,
        incomeTax: 0,
        nationalPension: 0,
        healthInsurance: 0,
        employmentInsurance: 0,
        longTermCareInsurance: 0,
        totalDeduction: 0,
        netPay: 0
      }
    }
  },
  methods: {
    // 급여 계산
    calculatePayroll() {
      const { basicSalary, allowance, overtime, otherAllowance } = this.payrollInput
      
      // 총 지급액 계산
      this.calculationResult.totalIncome = basicSalary + allowance + overtime + otherAllowance
      
      // 소득세 계산 (간단한 계산식)
      this.calculationResult.incomeTax = Math.round(this.calculationResult.totalIncome * 0.1)
      
      // 국민연금 계산 (4.5%)
      this.calculationResult.nationalPension = Math.round(this.calculationResult.totalIncome * 0.045)
      
      // 건강보험 계산 (3.545%)
      this.calculationResult.healthInsurance = Math.round(this.calculationResult.totalIncome * 0.03545)
      
      // 고용보험 계산 (회사부담 + 본인부담)
      const employmentRate = (parseFloat(this.calculationSettings.employmentInsurance.company) + 
                             parseFloat(this.calculationSettings.employmentInsurance.employee)) / 100
      this.calculationResult.employmentInsurance = Math.round(this.calculationResult.totalIncome * employmentRate)
      
      // 장기요양보험 계산 (건강보험의 8.51%)
      this.calculationResult.longTermCareInsurance = Math.round(this.calculationResult.healthInsurance * 0.0851)
      
      // 총 공제액 계산
      this.calculationResult.totalDeduction = 
        this.calculationResult.incomeTax + 
        this.calculationResult.nationalPension + 
        this.calculationResult.healthInsurance + 
        this.calculationResult.employmentInsurance + 
        this.calculationResult.longTermCareInsurance
      
      // 실수령액 계산
      this.calculationResult.netPay = this.calculationResult.totalIncome - this.calculationResult.totalDeduction
      
      this.success('급여 계산이 완료되었습니다.')
    },
    
    // 계산 초기화
    resetCalculation() {
      this.payrollInput = {
        basicSalary: 0,
        allowance: 0,
        overtime: 0,
        otherAllowance: 0,
        workDays: 0
      }
      this.calculationResult = {
        totalIncome: 0,
        incomeTax: 0,
        nationalPension: 0,
        healthInsurance: 0,
        employmentInsurance: 0,
        longTermCareInsurance: 0,
        totalDeduction: 0,
        netPay: 0
      }
      this.info('계산이 초기화되었습니다.')
    },
    
    // 통화 포맷팅
    formatCurrency(amount) {
      return new Intl.NumberFormat('ko-KR').format(amount || 0)
    }
  }
}
</script>

<style scoped>
.payroll-calculation {
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
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 급여계산 설정 스타일 */
.calculation-settings {
  padding: 20px 0;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 8px;
}

.insurance-inputs {
  display: flex;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-size: 12px;
  color: #606266;
}

.unit-inputs {
  display: flex;
  gap: 10px;
}

.ledger-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 급여 계산기 스타일 */
.calculator-section {
  padding: 20px 0;
}

.input-section h3,
.result-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.result-display {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item.total {
  border-top: 2px solid #dee2e6;
  margin-top: 8px;
  padding-top: 12px;
  font-weight: 600;
}

.result-item.final {
  background: #e3f2fd;
  margin-top: 8px;
  padding: 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 16px;
  color: #1976d2;
}

.result-label {
  color: #606266;
  font-size: 14px;
}

.result-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.result-item.final .result-value {
  color: #1976d2;
  font-size: 18px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .calculation-settings .el-row {
    flex-direction: column;
  }
  
  .calculator-section .el-row {
    flex-direction: column;
  }
  
  .insurance-inputs {
    flex-direction: column;
  }
  
  .unit-inputs {
    flex-direction: column;
  }
}
</style>
