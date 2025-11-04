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
      <el-form-item label="출퇴근 시간" required>
        <el-time-picker
          v-model="workTimeRange"
          is-range
          range-separator="-"
          start-placeholder="출근 시간"
          end-placeholder="퇴근 시간"
          format="HH:mm"
        ></el-time-picker>
        <div class="form-description">
          고정된 출퇴근 시간 (예: 09:00 - 18:00)
        </div>
      </el-form-item>

      <el-form-item label="총 근무 시간 (휴게 제외)" required>
        <el-input-number v-model="rule.fixedWorkMinutes" :min="0" :step="30" />
        <span class="unit-label">분</span>
        <div class="form-description">
          {{ workHoursDisplay }} ({{ rule.fixedWorkMinutes }}분)
        </div>
      </el-form-item>
    </div>

    <div v-if="rule.type === 'FLEXIBLE'">
      <el-alert type="info" :closable="false" style="margin-bottom: 15px;">
        <strong>시차 출퇴근제란?</strong><br>
        직원이 출퇴근 시간을 자유롭게 선택할 수 있되, 코어타임에는 반드시 근무해야 하는 제도입니다.<br>
        예: 출근 가능 시간 07:00-10:00, 코어타임 10:00-16:00, 퇴근 가능 시간 16:00-19:00
      </el-alert>

      <el-form-item label="출퇴근 가능 시간 범위" required>
        <el-time-picker
          v-model="workTimeRange"
          is-range
          range-separator="-"
          start-placeholder="최초 출근 가능 시간"
          end-placeholder="최종 퇴근 가능 시간"
          format="HH:mm"
        ></el-time-picker>
        <div class="form-description">
          직원이 출퇴근할 수 있는 시간 범위 (예: 07:00 - 19:00)
        </div>
      </el-form-item>

      <el-form-item label="코어 타임 (필수 근무 시간)" required>
        <el-time-picker
          v-model="coreTimeRange"
          is-range
          range-separator="-"
          start-placeholder="시작 시간"
          end-placeholder="종료 시간"
          format="HH:mm"
        ></el-time-picker>
        <div class="form-description">
          모든 직원이 반드시 근무해야 하는 시간대 (예: 10:00 - 16:00)
        </div>
      </el-form-item>

      <el-form-item label="총 근무 시간 (휴게 제외)" required>
        <el-input-number v-model="rule.fixedWorkMinutes" :min="0" :step="30" />
        <span class="unit-label">분</span>
        <div class="form-description">
          {{ workHoursDisplay }} ({{ rule.fixedWorkMinutes }}분) - 코어타임 외에도 총 이 시간만큼 근무해야 함
        </div>
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

        // rule setter를 거쳐서 부모로 emit되도록 수정
        this.rule = {
          ...this.rule,
          coreTimeStart: val ? formatTime(val[0]) : null,
          coreTimeEnd: val ? formatTime(val[1]) : null
        };
      }
    },
    workTimeRange: {
      get() {
        if (this.rule.workStartTime && this.rule.workEndTime) {
          const startDate = new Date();
          const [startH, startM] = this.rule.workStartTime.split(':');
          startDate.setHours(startH, startM);

          const endDate = new Date();
          const [endH, endM] = this.rule.workEndTime.split(':');
          endDate.setHours(endH, endM);

          return [startDate, endDate];
        }
        return [];
      },
      set(val) {
        const formatTime = (date) => {
          return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
        };

        // rule setter를 거쳐서 부모로 emit되도록 수정
        this.rule = {
          ...this.rule,
          workStartTime: val ? formatTime(val[0]) : null,
          workEndTime: val ? formatTime(val[1]) : null
        };
      }
    },
    workHoursDisplay() {
      if (!this.rule.fixedWorkMinutes) {
        return '0시간';
      }
      const hours = Math.floor(this.rule.fixedWorkMinutes / 60);
      const mins = this.rule.fixedWorkMinutes % 60;

      if (mins === 0) {
        return `${hours}시간`;
      } else {
        return `${hours}시간 ${mins}분`;
      }
    }
  },
  methods: {
    onTypeChange(type) {
      // 근무 유형 변경 시 필요한 필드만 추가하고 기존 값 유지
      const newRule = { ...this.rule, type };

      if (type === 'FIXED') {
        // FIXED 타입에 필요한 필드 설정 (기존 값이 없을 때만)
        if (!newRule.fixedWorkMinutes) newRule.fixedWorkMinutes = 480;
        if (!newRule.workStartTime) newRule.workStartTime = '09:00';
        if (!newRule.workEndTime) newRule.workEndTime = '18:00';

        // FLEXIBLE 전용 필드 제거
        delete newRule.coreTimeStart;
        delete newRule.coreTimeEnd;

      } else if (type === 'FLEXIBLE') {
        // FLEXIBLE 타입에 필요한 모든 필드 설정
        if (!newRule.fixedWorkMinutes) newRule.fixedWorkMinutes = 480;
        if (!newRule.workStartTime) newRule.workStartTime = '07:00';
        if (!newRule.workEndTime) newRule.workEndTime = '19:00';
        if (!newRule.coreTimeStart) newRule.coreTimeStart = '10:00';
        if (!newRule.coreTimeEnd) newRule.coreTimeEnd = '16:00';
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
.form-description {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
