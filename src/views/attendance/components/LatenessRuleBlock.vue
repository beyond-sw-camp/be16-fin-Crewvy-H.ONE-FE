<template>
  <div class="rule-block">
    <el-form-item label="지각 허용 시간 (분)">
      <el-input-number v-model="rule.latenessGraceMinutes" :min="0" />
    </el-form-item>
    <el-form-item label="조퇴 허용 시간 (분)">
      <el-input-number v-model="rule.earlyLeaveGraceMinutes" :min="0" />
    </el-form-item>
    <!-- <el-form-item label="급여 차감 방식">
      <el-radio-group v-model="rule.deductionType">
        <el-radio-button label="DEDUCT_PER_MINUTE">분 단위 차감</el-radio-button>
        <el-radio-button label="DEDUCT_AS_HALF_DAY">반차로 차감</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="월별 지각/조퇴 허용 횟수">
      <el-input-number v-model="rule.monthlyAllowedCount" :min="0" />
    </el-form-item> -->
  </div>
</template>

<script>
export default {
  name: 'LatenessRuleBlock',
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
