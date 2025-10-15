<template>
  <div class="rule-block">
    <el-form-item label="경비 유형">
      <el-input v-model="rule.type" placeholder="예: 식대, 교통비"></el-input>
    </el-form-item>
    <el-form-item label="1회 사용 한도">
      <el-input-number v-model="rule.transactionLimit" :min="0" :precision="2" />
    </el-form-item>
    <el-form-item label="월간 총 한도">
      <el-input-number v-model="rule.monthlyLimit" :min="0" :precision="2" />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'ExpenseRuleBlock',
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
