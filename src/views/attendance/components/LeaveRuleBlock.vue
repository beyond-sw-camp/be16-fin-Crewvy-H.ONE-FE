<template>
  <div class="rule-block">
    <!-- 1. 연차유급휴가 (PTC001) -->
    <div v-if="policyTypeCode === 'PTC001'">
      <el-form-item label="기본 부여 일수" required>
        <el-input-number v-model="rule.defaultDays" :min="15" />
        <span class="form-description">법정 최소: 15일</span>
      </el-form-item>
      <el-form-item label="발생 유형">
        <el-select v-model="rule.accrualType" placeholder="선택">
          <el-option label="자동 발생 (입사일 기준)" value="ACCRUAL"></el-option>
          <el-option label="수동 관리" value="MANUAL"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="1년 미만 최대 발생 일수">
        <el-input-number v-model="rule.firstYearMaxAccrual" :min="0" :max="11" />
        <span class="form-description">법정 최대: 11일</span>
      </el-form-item>
      <el-form-item label="최소 신청 단위">
        <el-select v-model="rule.minimumRequestUnit" placeholder="선택">
          <el-option label="일" value="DAY"></el-option>
          <el-option label="반차" value="HALF_DAY"></el-option>
          <el-option label="시간" value="HOUR"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="신청 마감일 (N일 전)">
        <el-input-number v-model="rule.requestDeadlineDays" :min="0" />
      </el-form-item>
    </div>

    <!-- 2. 출산전후휴가 (PTC002) -->
    <div v-else-if="policyTypeCode === 'PTC002'">
      <el-form-item label="기본 부여 일수" required>
        <el-input-number v-model="rule.defaultDays" :min="90" :max="150" />
        <span class="form-description">일반 90일, 다태아 120일</span>
      </el-form-item>
      <el-form-item label="신청 마감일 (N일 전)">
        <el-input-number v-model="rule.requestDeadlineDays" :min="0" />
      </el-form-item>
      <el-form-item label="최대 분할 횟수">
        <el-input-number v-model="rule.maxSplitCount" :min="1" :max="2" />
        <span class="form-description">출산 전/후 분할 (최대 2회)</span>
      </el-form-item>
    </div>

    <!-- 3. 배우자 출산휴가 (PTC003) -->
    <div v-else-if="policyTypeCode === 'PTC003'">
      <el-form-item label="기본 부여 일수" required>
        <el-input-number v-model="rule.defaultDays" :min="10" :max="20" />
        <span class="form-description">법정: 10일</span>
      </el-form-item>
      <el-form-item label="출산일 기준 사용 기한 (일)">
        <el-input-number v-model="rule.maxDaysFromEventDate" :min="0" />
        <span class="form-description">권장: 90일 이내</span>
      </el-form-item>
      <el-form-item label="최대 분할 횟수">
        <el-input-number v-model="rule.maxSplitCount" :min="1" :max="2" />
        <span class="form-description">최대 2회 분할 가능</span>
      </el-form-item>
    </div>

    <!-- 4. 육아휴직 (PTC004) -->
    <div v-else-if="policyTypeCode === 'PTC004'">
      <el-form-item label="기본 부여 일수" required>
        <el-input-number v-model="rule.defaultDays" :min="1" :max="365" />
        <span class="form-description">법정 최대: 365일</span>
      </el-form-item>
      <el-form-item label="최대 분할 횟수">
        <el-input-number v-model="rule.maxSplitCount" :min="1" />
      </el-form-item>
      <el-form-item label="최소 연속 사용 일수">
        <el-input-number v-model="rule.minConsecutiveDays" :min="1" />
        <span class="form-description">권장: 30일</span>
      </el-form-item>
    </div>

    <!-- 5. 가족돌봄휴가 (PTC005) -->
    <div v-else-if="policyTypeCode === 'PTC005'">
      <el-form-item label="연간 부여 일수" required>
        <el-input-number v-model="rule.defaultDays" :min="1" :max="10" />
        <span class="form-description">법정: 연간 최대 10일</span>
      </el-form-item>
    </div>

    <!-- 6. 생리휴가 (PTC006) -->
    <div v-else-if="policyTypeCode === 'PTC006'">
      <el-form-item label="월간 부여 일수" required>
        <el-input-number v-model="rule.defaultDays" :min="1" :max="3" />
        <span class="form-description">법정: 월 1일</span>
      </el-form-item>
    </div>
    
    <div v-else>
      <p class="rule-placeholder">이 정책 유형에는 해당하는 휴가 규칙이 없습니다.</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'LeaveRuleBlock',
  props: {
    modelValue: { type: Object, required: true },
    policyTypeCode: { type: String, required: true }
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
.rule-block { padding: 16px; border: 1px solid #e4e7ed; border-radius: 4px; margin-top: 10px; }
.form-description { font-size: 12px; color: #909399; margin-left: 10px; }
.rule-placeholder { color: #909399; text-align: center; padding: 20px; }
</style>