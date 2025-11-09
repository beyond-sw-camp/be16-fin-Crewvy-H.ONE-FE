<template>
  <div class="rule-block">
    <el-form-item label="주간 최대 연장근무 한도 (분)">
      <el-input-number v-model="rule.maxWeeklyOvertimeMinutes" :min="0" :max="720" />
      <span class="form-description">법정 한도: 주 12시간 (720분)</span>
    </el-form-item>
    <el-form-item label="연장근무 가산율">
      <el-input-number v-model="rule.overtimeRate" :min="1.5" :step="0.1" :precision="2" />
      <span class="form-description">법정 기준: 1.5배 이상</span>
    </el-form-item>
    <el-form-item label="야간근무 가산율">
      <el-input-number v-model="rule.nightWorkRate" :min="1.5" :step="0.1" :precision="2" />
      <span class="form-description">법정 기준: 1.5배 이상</span>
    </el-form-item>
    <el-form-item label="휴일근무 가산율 (8시간 이내)">
      <el-input-number v-model="rule.holidayWorkRate" :min="1.5" :step="0.1" :precision="2" />
      <span class="form-description">법정 기준: 1.5배 이상</span>
    </el-form-item>
    <el-form-item label="휴일근무 가산율 (8시간 초과)">
      <el-input-number v-model="rule.holidayOvertimeRate" :min="2.0" :step="0.1" :precision="2" />
      <span class="form-description">법정 기준: 2.0배 이상</span>
    </el-form-item>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'OvertimeRuleBlock',
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const rule = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    return {
      rule
    };
  }
};
</script>

<style scoped>
.rule-block {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-top: 10px;
}
.form-description {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}
</style>
