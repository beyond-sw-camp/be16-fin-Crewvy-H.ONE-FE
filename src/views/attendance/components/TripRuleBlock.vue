<template>
  <div class="rule-block">
    <el-form-item label="출장 종류">
      <el-input v-model="rule.type" placeholder="예: 국내, 해외"></el-input>
    </el-form-item>
    <el-form-item label="일비 (Per Diem)">
      <el-input-number v-model="rule.perDiemAmount" :min="0" :precision="2" />
    </el-form-item>
    <el-form-item label="숙박비 한도">
      <el-input-number v-model="rule.accommodationLimit" :min="0" :precision="2" />
    </el-form-item>
    <el-form-item label="교통비 한도">
      <el-input-number v-model="rule.transportationLimit" :min="0" :precision="2" />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'TripRuleBlock',
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
