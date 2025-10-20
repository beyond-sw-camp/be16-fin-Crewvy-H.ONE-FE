<template>
  <div class="rule-block">
    <el-form-item label="근무 유형">
      <el-radio-group v-model="rule.type" @change="onTypeChange">
        <el-radio-button label="FIXED">고정 근무</el-radio-button>
        <el-radio-button label="FLEXIBLE">시차 출퇴근</el-radio-button>
        <!-- <el-radio-button label="DEEMED">간주 근무</el-radio-button> -->
      </el-radio-group>
    </el-form-item>

    <div v-if="rule.type === 'FIXED'">
      <el-form-item label="총 근무 시간 (휴게 제외)">
        <el-input-number v-model="rule.fixedWorkMinutes" :min="0" :step="30" />
        <span class="unit-label">분</span>
      </el-form-item>
    </div>

    <div v-if="rule.type === 'FLEXIBLE'">
      <el-form-item label="코어 타임">
        <el-time-picker
          v-model="coreTimeRange"
          is-range
          range-separator="-"
          start-placeholder="시작 시간"
          end-placeholder="종료 시간"
          format="HH:mm"
        ></el-time-picker>
      </el-form-item>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkTimeRuleBlock',
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  computed: {
    rule: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    coreTimeRange: {
      get() {
        if (this.rule.coreTimeStart && this.rule.coreTimeEnd) {
          const startDate = new Date();
          const [startH, startM] = this.rule.coreTimeStart.split(':');
          startDate.setHours(startH, startM);

          const endDate = new Date();
          const [endH, endM] = this.rule.coreTimeEnd.split(':');
          endDate.setHours(endH, endM);
          
          return [startDate, endDate];
        }
        return [];
      },
      set(val) {
        const formatTime = (date) => {
          return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
        };
        this.rule.coreTimeStart = val ? formatTime(val[0]) : null;
        this.rule.coreTimeEnd = val ? formatTime(val[1]) : null;
      }
    }
  },
  methods: {
    onTypeChange(type) {
      // 근무 유형 변경 시 기존 값 초기화
      const newRule = { type };
      if (type === 'FIXED') {
        newRule.fixedWorkMinutes = 480; // 기본값 8시간
      } else if (type === 'FLEXIBLE') {
        newRule.coreTimeStart = '10:00';
        newRule.coreTimeEnd = '16:00';
      }
      this.rule = newRule;
    }
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
.unit-label {
  margin-left: 8px;
  color: #606266;
}
</style>
