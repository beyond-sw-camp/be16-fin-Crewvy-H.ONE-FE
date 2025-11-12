<template>
  <div class="rule-block">
    <el-form-item label="주간 최대 연장근무 한도 (분)">
      <el-input-number v-model="rule.maxWeeklyOvertimeMinutes" :min="0" :max="720" />
      <span class="form-description">법정 한도: 주 12시간 (720분)</span>
    </el-form-item>

    <!-- 가산율은 급여 서비스에서 계산하므로 근태 정책에서는 표시하지 않음 -->
    <!-- 근태 서비스는 시간만 기록 (overtimeMinutes, nightWorkMinutes, holidayWorkMinutes) -->

    <el-alert
      type="info"
      :closable="false"
      show-icon
      style="margin-top: 10px;"
    >
      <template #title>
        연장/야간/휴일 근무 가산율은 급여 서비스에서 자동 계산됩니다
      </template>
      근태 정책에서는 근무 시간만 기록하며, 가산율(1.5배, 2.0배 등)은 급여 계산 시 적용됩니다.
    </el-alert>
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
