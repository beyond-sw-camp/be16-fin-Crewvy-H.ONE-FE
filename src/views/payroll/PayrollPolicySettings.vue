<template>
  <div class="payroll-policy-settings">
    <div class="page-header">
      <h1>급여 정책 설정</h1>
      <p>급여 지급일 유형, 지급일, 휴일 처리 방식, 산정 기간을 설정합니다.</p>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>설정</span>
        </div>
      </template>

      <el-form :model="form" label-width="120px" class="policy-form">
        <div class="horizontal-sections">
          <div class="section">
            <div class="section-title">지급 정책</div>
            <div class="form-grid">
              <el-form-item label="지급일 유형">
                <el-select v-model="form.paymentType" placeholder="선택">
                  <el-option label="특정일" value="specific_day" />
                  <el-option label="말일" value="end_of_month" />
                </el-select>
              </el-form-item>

              <el-form-item v-if="form.paymentType === 'specific_day'" label="지급일(일)">
                <el-input-number v-model="form.paymentDay" :min="1" :max="31" />
                <span class="hint">1~31 사이 숫자</span>
              </el-form-item>

              <el-form-item label="휴일 처리">
                <el-select v-model="form.holidayPolicy" placeholder="선택">
                  <el-option label="전일 지급" value="previous_day" />
                  <el-option label="익일 지급" value="next_day" />
                </el-select>
                <span class="hint">지급일이 휴일일 경우 처리 방식</span>
              </el-form-item>
            </div>
          </div>

          <div class="section">
            <div class="section-title">산정 기간</div>
            <el-form-item label="구분">
              <el-radio-group v-model="form.calcPeriodType">
                <el-radio label="last_month_full">전월 1일 ~ 전월 말일</el-radio>
                <el-radio label="this_month_full">당월 1일 ~ 당월 말일</el-radio>
                <el-radio label="custom">기타 (사용자 지정)</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="form.calcPeriodType === 'custom'">
              <div class="range-inline">
                <div class="range-col">
                  <div class="range-label">시작</div>
                  <div class="range-controls">
                    <el-select v-model="form.calcStartRelation" style="width: 110px">
                      <el-option label="전월" value="prev" />
                      <el-option label="당월" value="current" />
                    </el-select>
                    <el-input-number v-model="form.calcPeriodStart" :min="1" :max="31" />
                  </div>
                </div>
                <div class="range-sep">~</div>
                <div class="range-col">
                  <div class="range-label">종료</div>
                  <div class="range-controls">
                    <el-select v-model="form.calcEndRelation" style="width: 110px">
                      <el-option label="전월" value="prev" />
                      <el-option label="당월" value="current" />
                    </el-select>
                    <el-input-number v-model="form.calcPeriodEnd" :min="1" :max="31" />
                  </div>
                </div>
              </div>
              <div class="range-hint">
                <div class="hint">예: 전월 21일 ~ 당월 20일</div>
              </div>
            </el-form-item>
          </div>
        </div>
        <div class="actions">
          <el-button type="primary" :loading="saving" @click="save">저장</el-button>
          <el-button @click="reset">초기화</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
  
</template>

<script>
import axios from 'axios'
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'PayrollPolicySettings',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      saving: false,
      policyExists: false,
      form: {
        paymentType: 'specific_day',
        paymentDay: 25,
        holidayPolicy: 'previous_day',
        calcPeriodType: 'this_month_full',
        calcStartRelation: 'current',
        calcEndRelation: 'current',
        calcPeriodStart: 1,
        calcPeriodEnd: 31,
        note: ''
      }
    }
  },
  methods: {
    // 회사 ID 가져오기
    getCompanyId() {
      return 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0'
    },
    
    async load() {
      try {
        const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/salary-policy/list`, {
          params: { companyId: this.getCompanyId() }
        })
        let policy = null
        const d = res?.data
        if (Array.isArray(d)) policy = d[0]
        else if (Array.isArray(d?.data)) policy = d.data[0]
        else if (d?.data) policy = d.data

        if (policy) {
          this.policyExists = true
          const paymentType = policy.payDayType === 'SPECIFIC_DAY' ? 'specific_day' : 'end_of_month'
          const holidayPolicy = policy.holidayRule === 'PREPAID' ? 'previous_day' : 'next_day'

          // periodType에 따른 calcPeriodType 결정
          let calcPeriodType = 'custom'
          if (policy.periodType === 'LAST_MONTH_FULL') {
            calcPeriodType = 'last_month_full'
          } else if (policy.periodType === 'THIS_MONTH_FULL') {
            calcPeriodType = 'this_month_full'
          } else { // SPECIFIC
            calcPeriodType = 'custom'
          }
          
          // periodStartMonthType, periodEndMonthType에서 관계 매핑
          const calcStartRelation = policy.periodStartMonthType === 'PREVIOUS_MONTH' ? 'prev' : 'current'
          const calcEndRelation = policy.periodEndMonthType === 'PREVIOUS_MONTH' ? 'prev' : 'current'

          this.form = {
            ...this.form,
            paymentType,
            paymentDay: paymentType === 'specific_day' ? policy.paymentDay : null,
            holidayPolicy,
            calcPeriodType,
            calcStartRelation,
            calcEndRelation,
            calcPeriodStart: policy.periodStartDay ?? 1,
            calcPeriodEnd: policy.periodEndDay ?? 31
          }
        } else {
          this.policyExists = false
        }
      } catch (e) {
        // 정책이 없을 수 있으니 조용히 스킵
      }
    },
    validate() {
      if (this.form.paymentType === 'specific_day' && (!this.form.paymentDay || this.form.paymentDay < 1 || this.form.paymentDay > 31)) {
        this.warning('특정일 지급의 경우 지급일(일)을 1~31 사이로 입력하세요.')
        return false
      }
      if (this.form.paymentType === 'end_of_month') {
        // 말일인 경우 매달 마지막 날을 사용하므로 null 유지
        this.form.paymentDay = null
      }
      if (this.form.calcPeriodType === 'custom') {
        if (this.form.calcPeriodStart < 1 || this.form.calcPeriodStart > 31 || this.form.calcPeriodEnd < 1 || this.form.calcPeriodEnd > 31) {
          this.warning('산정 기간 일자는 1~31 사이여야 합니다.')
          return false
        }
        if (!['prev', 'current'].includes(this.form.calcStartRelation) || !['prev', 'current'].includes(this.form.calcEndRelation)) {
          this.warning('산정 기간의 월 구분을 선택하세요.')
          return false
        }
      }
      return true
    },
    async save() {
      if (!this.validate()) return
      this.saving = true
      try {
        // 백엔드 사양에 맞춘 매핑
        const payDayType = this.form.paymentType === 'specific_day' ? 'SPECIFIC_DAY' : 'END_OF_MONTH'
        const holidayRule = this.form.holidayPolicy === 'previous_day' ? 'PREPAID' : 'POSTPAID'

        // 산정기간 매핑
        let periodType, periodStartMonthType, periodStartDay, periodEndMonthType, periodEndDay
        
        if (this.form.calcPeriodType === 'last_month_full') {
          periodType = 'LAST_MONTH_FULL'
          periodStartMonthType = 'PREVIOUS_MONTH'
          periodStartDay = 1
          periodEndMonthType = 'PREVIOUS_MONTH'
          periodEndDay = 0  // 말일 처리
        } else if (this.form.calcPeriodType === 'this_month_full') {
          periodType = 'THIS_MONTH_FULL'
          periodStartMonthType = 'CURRENT_MONTH'
          periodStartDay = 1
          periodEndMonthType = 'CURRENT_MONTH'
          periodEndDay = 0  // 말일 처리
        } else { // custom
          periodType = 'SPECIFIC'
          periodStartMonthType = this.form.calcStartRelation === 'prev' ? 'PREVIOUS_MONTH' : 'CURRENT_MONTH'
          periodStartDay = this.form.calcPeriodStart
          periodEndMonthType = this.form.calcEndRelation === 'prev' ? 'PREVIOUS_MONTH' : 'CURRENT_MONTH'
          periodEndDay = this.form.calcPeriodEnd
        }

        const payload = {
          companyId: this.getCompanyId(),
          payDayType: payDayType,
          paymentDay: this.form.paymentType === 'specific_day' ? this.form.paymentDay : 0,
          holidayRule: holidayRule,
          periodType: periodType,
          periodStartMonthType: periodStartMonthType,
          periodStartDay: periodStartDay,
          periodEndMonthType: periodEndMonthType,
          periodEndDay: periodEndDay
        }

        const endpoint = this.policyExists ? 'update' : 'create'
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/salary-policy/${endpoint}`, payload)
        this.success('급여 정책이 저장되었습니다.')
      } catch (e) {
        this.error('정책 저장 중 오류가 발생했습니다.')
      } finally {
        this.saving = false
      }
    },
    reset() {
      this.form = {
        paymentType: 'specific_day',
        paymentDay: 25,
        holidayPolicy: 'previous_day',
        calcPeriodType: 'this_month_full',
        calcStartRelation: 'current',
        calcEndRelation: 'current',
        calcPeriodStart: 1,
        calcPeriodEnd: 31,
        note: ''
      }
    }
  },
  watch: {
    'form.paymentType'(val) {
      if (val === 'end_of_month') {
        this.form.paymentDay = null
      }
    }
  },
  created() {
    this.load()
  }
}
</script>

<style scoped>
.payroll-policy-settings {
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

.policy-form {
  width: 100%;
}

.policy-form :deep(.el-form-item) {
  align-items: flex-start;
}
.policy-form :deep(.el-form-item__content) {
  display: flex;
  align-items: flex-start;
}
.policy-form :deep(.el-form-item__label) {
  align-self: flex-start;
}

.horizontal-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 992px) {
  .horizontal-sections {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.section {
  margin-bottom: 12px;
}

.section-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px 16px;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.range-inline {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center; /* 내부 요소 가운데 정렬 */
  align-self: center;  /* 컨테이너 자체도 가운데 */
  width: 100%;
  margin: 16px auto; /* 상하 여백, 좌우 중앙 */
  padding-right: 0; /* 우측 패딩 제거 */
}

.range-inline .tilde {
  margin: 0 4px;
  color: #909399;
}

.range-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center; /* 라벨/컨트롤 가운데 정렬 */
}

.range-label {
  font-size: 13px;
  color: #606266;
  text-align: right;
  width: 100%;
}

.range-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between; /* 입력 컨트롤 가운데 정렬 */
  width: 250px; /* 컨트롤 그룹 너비 고정 */
  margin-left: auto; /* 컨트롤 그룹을 우측으로 정렬 */
}

.range-sep {
  align-self: center;
  color: #909399;
  margin: 8px 0; /* 구분자 주변 여백 확대 */
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
  
}

.range-hint {
  width: 250px;
  margin: 0 auto;
}

.range-hint .hint {
  text-align: right;
  margin-left: 0;
}
</style>


