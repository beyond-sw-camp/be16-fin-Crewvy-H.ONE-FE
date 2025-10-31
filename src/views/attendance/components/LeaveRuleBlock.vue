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
        <el-select v-model="rule.minimumRequestUnit" placeholder="선택" @change="updateAllowedRequestUnits">
          <el-option label="일" value="DAY"></el-option>
          <el-option label="반차" value="HALF_DAY"></el-option>
          <el-option label="시간" value="HOUR"></el-option>
        </el-select>
        <span class="form-description">
          설정한 최소 단위 이상으로 신청 가능
          (예: 반차 선택 시 → 반차, 일 단위 신청 가능)
        </span>
      </el-form-item>
      <el-form-item label="신청 마감일 (N일 전)">
        <el-input-number v-model="rule.requestDeadlineDays" :min="0" />
      </el-form-item>
      <el-divider content-position="left">사후 신청 설정</el-divider>
      <el-form-item label="사후 신청 허용">
        <el-switch v-model="rule.allowRetrospectiveRequest" />
        <span class="form-description">급한 개인 사정으로 사전 신청이 어려운 경우 허용</span>
      </el-form-item>
      <el-form-item v-if="rule.allowRetrospectiveRequest" label="사후 신청 가능 기간 (일)">
        <el-input-number v-model="rule.retrospectiveRequestDays" :min="1" :max="30" />
        <span class="form-description">휴가 시작일로부터 최대 며칠 이내 신청 가능</span>
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
      <el-form-item label="최소 신청 단위">
        <el-select v-model="rule.minimumRequestUnit" placeholder="선택" @change="updateAllowedRequestUnits">
          <el-option label="일" value="DAY"></el-option>
          <el-option label="반차" value="HALF_DAY"></el-option>
          <el-option label="시간" value="HOUR"></el-option>
        </el-select>
        <span class="form-description">
          설정한 최소 단위 이상으로 신청 가능
        </span>
      </el-form-item>
      <el-form-item label="최대 분할 횟수">
        <el-input-number v-model="rule.maxSplitCount" :min="1" :max="2" />
        <span class="form-description">출산 전/후 분할 (최대 2회)</span>
      </el-form-item>
      <el-divider content-position="left">사후 신청 설정</el-divider>
      <el-form-item label="사후 신청 허용">
        <el-switch v-model="rule.allowRetrospectiveRequest" />
        <span class="form-description">급한 개인 사정으로 사전 신청이 어려운 경우 허용</span>
      </el-form-item>
      <el-form-item v-if="rule.allowRetrospectiveRequest" label="사후 신청 가능 기간 (일)">
        <el-input-number v-model="rule.retrospectiveRequestDays" :min="1" :max="30" />
        <span class="form-description">휴가 시작일로부터 최대 며칠 이내 신청 가능</span>
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
      <el-form-item label="신청 마감일 (N일 전)">
        <el-input-number v-model="rule.requestDeadlineDays" :min="0" />
        <span class="form-description">휴가 시작일로부터 며칠 전까지 신청해야 하는지</span>
      </el-form-item>
      <el-form-item label="최소 신청 단위">
        <el-select v-model="rule.minimumRequestUnit" placeholder="선택" @change="updateAllowedRequestUnits">
          <el-option label="일" value="DAY"></el-option>
          <el-option label="반차" value="HALF_DAY"></el-option>
          <el-option label="시간" value="HOUR"></el-option>
        </el-select>
        <span class="form-description">
          설정한 최소 단위 이상으로 신청 가능
        </span>
      </el-form-item>
      <el-form-item label="최대 분할 횟수">
        <el-input-number v-model="rule.maxSplitCount" :min="1" :max="2" />
        <span class="form-description">최대 2회 분할 가능</span>
      </el-form-item>
      <el-divider content-position="left">사후 신청 설정</el-divider>
      <el-form-item label="사후 신청 허용">
        <el-switch v-model="rule.allowRetrospectiveRequest" />
        <span class="form-description">급한 개인 사정으로 사전 신청이 어려운 경우 허용</span>
      </el-form-item>
      <el-form-item v-if="rule.allowRetrospectiveRequest" label="사후 신청 가능 기간 (일)">
        <el-input-number v-model="rule.retrospectiveRequestDays" :min="1" :max="30" />
        <span class="form-description">휴가 시작일로부터 최대 며칠 이내 신청 가능</span>
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
      <el-form-item label="신청 마감일 (N일 전)">
        <el-input-number v-model="rule.requestDeadlineDays" :min="0" />
        <span class="form-description">휴가 시작일로부터 며칠 전까지 신청해야 하는지 (육아휴직은 장기 휴직이므로 사전 계획 권장)</span>
      </el-form-item>
      <el-form-item label="최소 신청 단위">
        <el-select v-model="rule.minimumRequestUnit" placeholder="선택" @change="updateAllowedRequestUnits">
          <el-option label="일" value="DAY"></el-option>
          <el-option label="반차" value="HALF_DAY"></el-option>
          <el-option label="시간" value="HOUR"></el-option>
        </el-select>
        <span class="form-description">
          설정한 최소 단위 이상으로 신청 가능
        </span>
      </el-form-item>
      <el-divider content-position="left">사후 신청 설정</el-divider>
      <el-form-item label="사후 신청 허용">
        <el-switch v-model="rule.allowRetrospectiveRequest" />
        <span class="form-description">급한 개인 사정으로 사전 신청이 어려운 경우 허용</span>
      </el-form-item>
      <el-form-item v-if="rule.allowRetrospectiveRequest" label="사후 신청 가능 기간 (일)">
        <el-input-number v-model="rule.retrospectiveRequestDays" :min="1" :max="30" />
        <span class="form-description">휴가 시작일로부터 최대 며칠 이내 신청 가능</span>
      </el-form-item>
    </div>

    <!-- 5. 가족돌봄휴가 (PTC005) -->
    <div v-else-if="policyTypeCode === 'PTC005'">
      <el-form-item label="연간 부여 일수" required>
        <el-input-number v-model="rule.defaultDays" :min="1" :max="10" />
        <span class="form-description">법정: 연간 최대 10일</span>
      </el-form-item>
      <el-divider content-position="left">사용 제한 설정 (법정 필수)</el-divider>
      <el-form-item label="사용 제한 주기">
        <el-input value="연간" disabled />
        <span class="form-description">가족돌봄휴가는 연간 단위로 제한됩니다</span>
      </el-form-item>
      <el-form-item label="연간 최대 사용 일수" required>
        <el-input-number v-model="rule.maxDaysPerPeriod" :min="1" :max="10" />
        <span class="form-description">법정: 연간 최대 10일 (부여 일수와 동일하게 설정 권장)</span>
      </el-form-item>
      <el-form-item label="신청 마감일 (N일 전)">
        <el-input-number v-model="rule.requestDeadlineDays" :min="0" />
        <span class="form-description">휴가 시작일로부터 며칠 전까지 신청해야 하는지</span>
      </el-form-item>
      <el-form-item label="최소 신청 단위">
        <el-select v-model="rule.minimumRequestUnit" placeholder="선택" @change="updateAllowedRequestUnits">
          <el-option label="일" value="DAY"></el-option>
          <el-option label="반차" value="HALF_DAY"></el-option>
          <el-option label="시간" value="HOUR"></el-option>
        </el-select>
        <span class="form-description">
          설정한 최소 단위 이상으로 신청 가능
        </span>
      </el-form-item>
      <el-divider content-position="left">사후 신청 설정</el-divider>
      <el-form-item label="사후 신청 허용">
        <el-switch v-model="rule.allowRetrospectiveRequest" />
        <span class="form-description">급한 개인 사정으로 사전 신청이 어려운 경우 허용</span>
      </el-form-item>
      <el-form-item v-if="rule.allowRetrospectiveRequest" label="사후 신청 가능 기간 (일)">
        <el-input-number v-model="rule.retrospectiveRequestDays" :min="1" :max="30" />
        <span class="form-description">휴가 시작일로부터 최대 며칠 이내 신청 가능</span>
      </el-form-item>
    </div>

    <!-- 6. 생리휴가 (PTC006) -->
    <div v-else-if="policyTypeCode === 'PTC006'">
      <el-form-item label="월간 부여 일수" required>
        <el-input-number v-model="rule.defaultDays" :min="1" :max="3" />
        <span class="form-description">법정: 월 1일</span>
      </el-form-item>
      <el-divider content-position="left">사용 제한 설정 (법정 필수)</el-divider>
      <el-form-item label="사용 제한 주기">
        <el-input value="월간" disabled />
        <span class="form-description">생리휴가는 월 단위로 제한됩니다</span>
      </el-form-item>
      <el-form-item label="월간 최대 사용 일수" required>
        <el-input-number v-model="rule.maxDaysPerPeriod" :min="1" :max="3" />
        <span class="form-description">법정: 월 1일 (부여 일수와 동일하게 설정 권장)</span>
      </el-form-item>
      <el-form-item label="신청 마감일 (N일 전)">
        <el-input-number v-model="rule.requestDeadlineDays" :min="0" />
        <span class="form-description">휴가 시작일로부터 며칠 전까지 신청해야 하는지</span>
      </el-form-item>
      <el-form-item label="최소 신청 단위">
        <el-select v-model="rule.minimumRequestUnit" placeholder="선택" @change="updateAllowedRequestUnits">
          <el-option label="일" value="DAY"></el-option>
          <el-option label="반차" value="HALF_DAY"></el-option>
          <el-option label="시간" value="HOUR"></el-option>
        </el-select>
        <span class="form-description">
          설정한 최소 단위 이상으로 신청 가능
        </span>
      </el-form-item>
      <el-divider content-position="left">사후 신청 설정</el-divider>
      <el-form-item label="사후 신청 허용">
        <el-switch v-model="rule.allowRetrospectiveRequest" />
        <span class="form-description">급한 개인 사정으로 사전 신청이 어려운 경우 허용</span>
      </el-form-item>
      <el-form-item v-if="rule.allowRetrospectiveRequest" label="사후 신청 가능 기간 (일)">
        <el-input-number v-model="rule.retrospectiveRequestDays" :min="1" :max="30" />
        <span class="form-description">휴가 시작일로부터 최대 며칠 이내 신청 가능</span>
      </el-form-item>
    </div>
    
    <div v-else>
      <p class="rule-placeholder">이 정책 유형에는 해당하는 휴가 규칙이 없습니다.</p>
    </div>
  </div>
</template>

<script>
import { computed, watch } from 'vue';

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

    /**
     * 최소 신청 단위에 따라 allowedRequestUnits 자동 설정
     * - DAY: 일 단위만
     * - HALF_DAY: 반차(오전/오후) + 일
     * - HOUR: 시간 + 반차(오전/오후) + 일 (모두)
     */
    const updateAllowedRequestUnits = () => {
      const minUnit = rule.value.minimumRequestUnit;

      if (minUnit === 'DAY') {
        rule.value.allowedRequestUnits = ['DAY'];
      } else if (minUnit === 'HALF_DAY') {
        rule.value.allowedRequestUnits = ['HALF_DAY_AM', 'HALF_DAY_PM', 'DAY'];
      } else if (minUnit === 'HOUR') {
        rule.value.allowedRequestUnits = ['TIME_OFF', 'HALF_DAY_AM', 'HALF_DAY_PM', 'DAY'];
      } else {
        // 선택 안 됨 또는 기타
        rule.value.allowedRequestUnits = null;
      }
    };

    /**
     * 정책 타입에 따라 limitPeriod 자동 설정 (법정 필수)
     * - PTC005 (가족돌봄휴가): YEARLY
     * - PTC006 (생리휴가): MONTHLY
     */
    watch(
      () => props.policyTypeCode,
      (newTypeCode) => {
        if (newTypeCode === 'PTC005') {
          rule.value.limitPeriod = 'YEARLY';
        } else if (newTypeCode === 'PTC006') {
          rule.value.limitPeriod = 'MONTHLY';
        }
      },
      { immediate: true }
    );

    return {
      rule,
      updateAllowedRequestUnits
    };
  }
};
</script>

<style scoped>
.rule-block { padding: 16px; border: 1px solid #e4e7ed; border-radius: 4px; margin-top: 10px; }
.form-description { font-size: 12px; color: #909399; margin-left: 10px; }
.rule-placeholder { color: #909399; text-align: center; padding: 20px; }
</style>