<template>
  <div class="rule-block">
    <el-form-item label="휴게 시간 적용 방식">
      <el-radio-group v-model="rule.type">
        <el-radio-button label="AUTO">근무시간 비례 자동 차감</el-radio-button>
        <el-radio-button label="MANUAL">휴게 시작/종료 직접 기록</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="rule.type === 'AUTO'">
      <el-form-item label="8시간 근무 시 기본 휴게 시간 (분)">
        <el-input-number v-model="rule.defaultBreakMinutesFor8Hours" :min="0" />
      </el-form-item>
      <el-form-item label="법정 최소 휴게 시간 (분)">
        <el-input-number v-model="rule.mandatoryBreakMinutes" :min="0" placeholder="예: 4시간 근무 시 30분" />
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
</style>
