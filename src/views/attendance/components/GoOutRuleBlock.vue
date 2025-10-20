<template>
  <div class="rule-block">
    <el-form-item label="외출 정책 유형">
      <el-radio-group v-model="rule.type">
        <el-radio-button label="SIMPLE_RECORD">단순 기록</el-radio-button>
        <el-radio-button label="APPROVAL_REQUIRED">결재 필수</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="결재 없는 외출 허용 시간 (분)">
      <el-input-number v-model="rule.allowedMinutesWithoutApproval" :min="0" />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'GoOutRuleBlock',
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
