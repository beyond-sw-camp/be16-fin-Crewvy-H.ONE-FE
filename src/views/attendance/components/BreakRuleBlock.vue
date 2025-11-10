<template>
  <div class="rule-block">
    <el-form-item label="휴게 시간 적용 방식">
      <el-radio-group v-model="rule.type">
        <el-radio-button label="FIXED">고정 휴게 시간</el-radio-button>
        <el-radio-button label="AUTO">근무시간 비례 자동 차감</el-radio-button>
      </el-radio-group>
      <div class="form-description">
        FIXED: 정해진 시간대에 고정 휴게 시간 적용<br>
        AUTO: 근무시간에 따라 자동으로 휴게 시간 차감 (퇴근 시 법정 최소 휴게 시간 검증)
      </div>
    </el-form-item>

    <div v-if="rule.type === 'AUTO'">
      <el-divider content-position="left">법정 최소 휴게 시간 (근로기준법 제54조)</el-divider>

      <el-alert type="warning" :closable="false" style="margin-bottom: 15px;">
        <strong>근로기준법 제54조 (휴게)</strong><br>
        • 4시간 근무 시: 30분 이상<br>
        • 8시간 근무 시: 1시간(60분) 이상<br>
        <div v-if="workMinutesDisplay" style="margin-top: 8px; color: #E6A23C; font-weight: bold;">
          ⚠️ 현재 정책의 근무시간: {{ workMinutesDisplay }} → 법정 최소 휴게: {{ calculatedMinBreak }}분
        </div>
      </el-alert>

      <el-form-item label="법정 최소 휴게 시간 (분)" required>
        <el-input-number
          v-model="rule.mandatoryBreakMinutes"
          :min="calculatedMinBreak"
          :max="120"
          :disabled="!workTimeRule"
          :placeholder="workTimeRule ? `최소 ${calculatedMinBreak}분` : '근무 시간 규칙을 먼저 설정하세요'"
        />
        <span class="form-description" v-if="workTimeRule">
          {{ workMinutesDisplay }} 근무 기준 법정 최소값: {{ calculatedMinBreak }}분 (자동 계산됨)
        </span>
        <span class="form-description warning" v-else>
          ⚠️ 근무 시간 규칙(workTimeRule)을 먼저 설정해야 합니다
        </span>
      </el-form-item>

      <el-form-item label="기본 자동 차감 휴게 시간 (분)" required>
        <el-input-number
          v-model="rule.defaultBreakMinutesFor8Hours"
          :min="calculatedMinBreak"
          :max="120"
          :disabled="!workTimeRule"
        />
        <span class="form-description">
          퇴근 시 자동으로 차감할 휴게 시간 (법정 기준 이상으로 설정 가능)
        </span>
      </el-form-item>

      <!-- <el-divider content-position="left">추가 설정</el-divider>

      <el-form-item label="일일 최대 휴게 시간 (분)">
        <el-input-number v-model="rule.maxDailyBreakMinutes" :min="0" />
        <span class="form-description">설정 시 이 시간을 초과하면 휴게 종료 불가 (미설정 시 제한 없음)</span>
      </el-form-item> -->
    </div>

    <div v-if="rule.type === 'FIXED'">
      <el-divider content-position="left">법정 최소 휴게 시간 (근로기준법 제54조)</el-divider>

      <el-alert type="warning" :closable="false" style="margin-bottom: 15px;">
        <strong>근로기준법 제54조 (휴게)</strong><br>
        • 4시간 근무 시: 30분 이상<br>
        • 8시간 근무 시: 1시간(60분) 이상<br>
        <div v-if="workMinutesDisplay" style="margin-top: 8px; color: #E6A23C; font-weight: bold;">
          ⚠️ 현재 정책의 근무시간: {{ workMinutesDisplay }} → 법정 최소 휴게: {{ calculatedMinBreak }}분
        </div>
      </el-alert>

      <el-form-item label="고정 휴게 시간" required>
        <el-time-picker
          v-model="fixedBreakRange"
          is-range
          range-separator="-"
          start-placeholder="시작 시간"
          end-placeholder="종료 시간"
          format="HH:mm"
        />
        <span class="form-description">
          예: 12:00 - 13:00 (점심시간) - 최소 {{ calculatedMinBreak }}분 이상 설정 필요
        </span>
        <span v-if="fixedBreakMinutes > 0 && fixedBreakMinutes < calculatedMinBreak" class="form-description warning">
          ⚠️ 설정된 휴게 시간({{ fixedBreakMinutes }}분)이 법정 최소({{ calculatedMinBreak }}분)보다 짧습니다!
        </span>
      </el-form-item>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BreakRuleBlock',
  props: {
    modelValue: { type: Object, required: true },
    workTimeRule: { type: Object, default: null } // workTimeRule 추가
  },
  emits: ['update:modelValue'],
  computed: {
    rule: {
      get() { return this.modelValue; },
      set(value) { this.$emit('update:modelValue', value); }
    },
    fixedBreakRange: {
      get() {
        if (this.rule.fixedBreakStart && this.rule.fixedBreakEnd) {
          const startDate = new Date();
          const [startH, startM] = this.rule.fixedBreakStart.split(':');
          startDate.setHours(startH, startM);

          const endDate = new Date();
          const [endH, endM] = this.rule.fixedBreakEnd.split(':');
          endDate.setHours(endH, endM);

          return [startDate, endDate];
        }
        return [];
      },
      set(val) {
        const formatTime = (date) =>
          date.getHours().toString().padStart(2, '0') + ':' +
          date.getMinutes().toString().padStart(2, '0');

        // 고정 휴게 시간이 근무시간 내에 있는지 검증
        if (val && val[0] && val[1] && this.workTimeRule && this.workTimeRule.workStartTime && this.workTimeRule.workEndTime) {
          const breakStart = formatTime(val[0]);
          const breakEnd = formatTime(val[1]);
          const workStart = this.workTimeRule.workStartTime;
          const workEnd = this.workTimeRule.workEndTime;

          if (breakStart < workStart || breakEnd > workEnd) {
            this.$message.warning(`휴게 시간(${breakStart}~${breakEnd})이 근무시간(${workStart}~${workEnd}) 밖입니다.`);
            return; // 잘못된 값 설정하지 않음
          }
        }

        this.rule.fixedBreakStart = val ? formatTime(val[0]) : null;
        this.rule.fixedBreakEnd = val ? formatTime(val[1]) : null;
      }
    },
    // 근무시간에 따른 법정 최소 휴게시간 계산 (근로기준법 제54조)
    calculatedMinBreak() {
      if (!this.workTimeRule || !this.workTimeRule.fixedWorkMinutes) {
        return 30; // 기본값
      }

      const workMinutes = this.workTimeRule.fixedWorkMinutes;

      if (workMinutes >= 480) { // 8시간 이상
        return 60;
      } else if (workMinutes >= 240) { // 4시간 이상
        return 30;
      } else {
        return 0; // 4시간 미만은 법적 의무 없음
      }
    },
    // 근무시간 표시용
    workMinutesDisplay() {
      if (!this.workTimeRule || !this.workTimeRule.fixedWorkMinutes) {
        return null;
      }

      const minutes = this.workTimeRule.fixedWorkMinutes;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      if (mins === 0) {
        return `${hours}시간`;
      } else {
        return `${hours}시간 ${mins}분`;
      }
    },
    // FIXED 타입의 고정 휴게 시간 (분 단위)
    fixedBreakMinutes() {
      if (!this.rule.fixedBreakStart || !this.rule.fixedBreakEnd) {
        return 0;
      }

      const [startH, startM] = this.rule.fixedBreakStart.split(':').map(Number);
      const [endH, endM] = this.rule.fixedBreakEnd.split(':').map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      return endMinutes - startMinutes;
    }
  },
  watch: {
    'rule.type'(newType) {
      const newRule = { type: newType };

      // 현재 타입에 필요한 속성만 유지하고 나머지는 null 처리
      if (newType === 'FIXED') {
        newRule.fixedBreakStart = this.rule.fixedBreakStart || '12:00';
        newRule.fixedBreakEnd = this.rule.fixedBreakEnd || '13:00';
      } else if (newType === 'AUTO') {
        // mandatoryBreakMinutes는 근무시간에 따라 자동 계산된 값으로 초기화
        newRule.mandatoryBreakMinutes = this.rule.mandatoryBreakMinutes || this.calculatedMinBreak;
        newRule.defaultBreakMinutesFor8Hours = this.rule.defaultBreakMinutesFor8Hours || Math.max(60, this.calculatedMinBreak);
        newRule.maxDailyBreakMinutes = this.rule.maxDailyBreakMinutes || null;
      }

      // 기존 rule 객체와 병합하여 불필요한 속성 제거 효과
      this.rule = { ...newRule };
    },
    // workTimeRule이 변경되면 mandatoryBreakMinutes 자동 업데이트
    'workTimeRule.fixedWorkMinutes': {
      handler(newValue) {
        if (newValue && this.rule.type === 'AUTO') {
          // 법정 최소값보다 작으면 자동으로 맞춤
          if (!this.rule.mandatoryBreakMinutes || this.rule.mandatoryBreakMinutes < this.calculatedMinBreak) {
            this.rule.mandatoryBreakMinutes = this.calculatedMinBreak;
          }

          // defaultBreakMinutesFor8Hours도 최소값 체크
          if (!this.rule.defaultBreakMinutesFor8Hours || this.rule.defaultBreakMinutesFor8Hours < this.calculatedMinBreak) {
            this.rule.defaultBreakMinutesFor8Hours = Math.max(60, this.calculatedMinBreak);
          }
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.rule-block { padding: 16px; border: 1px solid #e4e7ed; border-radius: 4px; margin-top: 10px; }
.form-description { font-size: 12px; color: #909399; margin-left: 10px; display: block; margin-top: 5px; }
.form-description.warning { color: #E6A23C; font-weight: bold; }
</style>
