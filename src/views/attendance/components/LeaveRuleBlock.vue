<template>
  <div class="rule-block">
    <el-form-item label="휴가 종류">
      <el-input v-model="rule.type" placeholder="예: 연차, 병가, 경조사"></el-input>
    </el-form-item>
    <el-form-item label="기본 부여 일수">
      <el-input-number v-model="rule.defaultDays" :min="0" />
    </el-form-item>
    <el-form-item label="연차 이월 허용">
      <el-switch v-model="rule.allowCarryOver"></el-switch>
    </el-form-item>
    <el-form-item label="연차 발생 기준">
      <el-radio-group v-model="rule.accrualType">
        <el-radio-button label="YEARLY">회계연도 기준</el-radio-button>
        <el-radio-button label="ENTRY_DATE">입사일 기준</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="1년 미만 근속자 최대 연차 (일)">
      <el-input-number v-model="rule.firstYearMaxAccrual" :min="0" placeholder="법정 기준 11일" />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'LeaveRuleBlock',
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
</style>
