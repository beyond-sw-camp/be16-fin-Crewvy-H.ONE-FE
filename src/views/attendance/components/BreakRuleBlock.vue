<template>
  <div class="rule-block">
    <el-form-item label="휴게 시간 적용 방식">
      <el-radio-group v-model="rule.type">
        <el-radio-button label="AUTO">근무시간 비례 자동 차감</el-radio-button>
        <el-radio-button label="MANUAL">휴게 시작/종료 직접 기록</el-radio-button>
      </el-radio-group>
      <div class="form-description">
        AUTO: 근무시간에 따라 자동으로 휴게 시간 차감 (퇴근 시 법정 최소 휴게 시간 검증)<br>
        MANUAL: 사용자가 휴게 시작/종료를 직접 기록
      </div>
    </el-form-item>

    <div v-if="rule.type === 'AUTO'">
      <el-divider content-position="left">법정 최소 휴게 시간 (근로기준법 제54조)</el-divider>

      <el-alert type="warning" :closable="false" style="margin-bottom: 15px;">
        <strong>근로기준법 제54조 (휴게)</strong><br>
        • 4시간 근무 시: 30분 이상<br>
        • 8시간 근무 시: 1시간(60분) 이상
      </el-alert>

      <el-form-item label="4시간 근무 시 최소 휴게 시간 (분)" required>
        <el-input-number v-model="rule.mandatoryBreakMinutes" :min="30" :max="60" />
        <span class="form-description">법정 기준: 30분 이상</span>
      </el-form-item>

      <el-form-item label="8시간 근무 시 최소 휴게 시간 (분)" required>
        <el-input-number v-model="rule.defaultBreakMinutesFor8Hours" :min="60" :max="120" />
        <span class="form-description">법정 기준: 60분 이상</span>
      </el-form-item>

      <el-divider content-position="left">추가 설정</el-divider>

      <el-form-item label="일일 최대 휴게 시간 (분)">
        <el-input-number v-model="rule.maxDailyBreakMinutes" :min="0" />
        <span class="form-description">설정 시 이 시간을 초과하면 휴게 종료 불가 (미설정 시 제한 없음)</span>
      </el-form-item>
    </div>

    <div v-if="rule.type === 'MANUAL'">
      <el-form-item label="일일 최대 휴게 시간 (분)">
        <el-input-number v-model="rule.maxDailyBreakMinutes" :min="0" />
        <span class="form-description">설정 시 이 시간을 초과하면 휴게 종료 불가 (미설정 시 제한 없음)</span>
      </el-form-item>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BreakRuleBlock',
  props: { modelValue: { type: Object, required: true } },
  emits: ['update:modelValue'],
  computed: {
    rule: {
      get() { return this.modelValue; },
      set(value) { this.$emit('update:modelValue', value); }
    }
  }
};
</script>

<style scoped>
.rule-block { padding: 16px; border: 1px solid #e4e7ed; border-radius: 4px; margin-top: 10px; }
.form-description { font-size: 12px; color: #909399; margin-left: 10px; display: block; margin-top: 5px; }
</style>
