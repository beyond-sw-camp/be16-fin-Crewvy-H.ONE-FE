<template>
  <div class="policy-editor">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>{{ isEditMode ? '근태 정책 수정' : '새 근태 정책 생성' }}</h2>
        </div>
      </template>

      <el-form :model="policy" label-width="120px" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="정책 이름" required>
              <el-input v-model="policy.name" placeholder="예: 2025년 연차 정책"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="정책 유형" required>
              <el-select v-model="policy.typeCode" placeholder="정책 유형을 선택하세요" style="width: 100%;">
                <el-option
                  v-for="type in policyTypes"
                  :key="type.typeCode"
                  :label="type.typeName"
                  :value="type.typeCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="정책 적용 시작일" required>
              <el-date-picker
                v-model="policy.effectiveFrom"
                type="date"
                placeholder="시작일을 선택하세요"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="정책 적용 종료일 (선택)">
              <el-date-picker
                v-model="policy.effectiveTo"
                type="date"
                placeholder="비워두면 무기한 적용"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                clearable
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="유급 여부">
           <el-switch v-model="policy.isPaid" :disabled="isPaidDisabled"></el-switch>
        </el-form-item>
        <el-form-item label="자동 승인">
          <el-switch v-model="policy.autoApprove"></el-switch>
          <span class="form-help-text">활성화 시 이 정책으로 신청한 요청이 결재 없이 자동으로 승인됩니다 (주로 연장/야간/휴일근무에 사용)</span>
        </el-form-item>
      </el-form>

      <el-divider>규칙 상세 설정</el-divider>

      <div class="rule-block-actions" v-if="policy.typeCode">
        <el-button v-if="POLICY_RULE_MAPPING[policy.typeCode]?.includes('workTimeRule') && !policy.ruleDetails.workTimeRule" @click="addBlock('workTimeRule')">+ 근무 시간</el-button>
        <el-button v-if="POLICY_RULE_MAPPING[policy.typeCode]?.includes('authRule') && !policy.ruleDetails.authRule" @click="addBlock('authRule')">+ 인증</el-button>
        <el-button v-if="POLICY_RULE_MAPPING[policy.typeCode]?.includes('breakRule') && !policy.ruleDetails.breakRule" @click="addBlock('breakRule')">+ 휴게</el-button>
        <el-button v-if="POLICY_RULE_MAPPING[policy.typeCode]?.includes('latenessRule') && !policy.ruleDetails.latenessRule" @click="addBlock('latenessRule')">+ 지각/조퇴</el-button>
        <el-button v-if="POLICY_RULE_MAPPING[policy.typeCode]?.includes('goOutRule') && !policy.ruleDetails.goOutRule" @click="addBlock('goOutRule')">+ 외출</el-button>
        <el-button v-if="POLICY_RULE_MAPPING[policy.typeCode]?.includes('leaveRule') && !policy.ruleDetails.leaveRule" @click="addBlock('leaveRule')">+ 휴가</el-button>
        <el-button v-if="POLICY_RULE_MAPPING[policy.typeCode]?.includes('tripRule') && !policy.ruleDetails.tripRule" @click="addBlock('tripRule')">+ 출장</el-button>
        <el-button v-if="POLICY_RULE_MAPPING[policy.typeCode]?.includes('overtimeRule') && !policy.ruleDetails.overtimeRule" @click="addBlock('overtimeRule')">+ 연장 근무</el-button>
      </div>

      <!-- 동적으로 추가된 규칙 블록 렌더링 -->
      <div v-if="policy.ruleDetails.workTimeRule" class="rule-block-container">
        <div class="block-header">
          <h4>근무 시간 규칙<el-tag v-if="isMandatory('workTimeRule')" type="danger" size="small" style="margin-left: 8px;">필수</el-tag></h4>
          <el-button v-if="!isMandatory('workTimeRule')" type="danger" @click="removeBlock('workTimeRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <WorkTimeRuleBlock v-model="policy.ruleDetails.workTimeRule" />
      </div>
      <div v-if="policy.ruleDetails.authRule" class="rule-block-container">
        <div class="block-header">
          <h4>인증 규칙<el-tag v-if="isMandatory('authRule')" type="danger" size="small" style="margin-left: 8px;">필수</el-tag></h4>
          <el-button v-if="!isMandatory('authRule')" type="danger" @click="removeBlock('authRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <AuthRuleBlock v-model="policy.ruleDetails.authRule" />
      </div>
      <div v-if="policy.ruleDetails.goOutRule" class="rule-block-container">
        <div class="block-header">
          <h4>외출 규칙<el-tag v-if="isMandatory('goOutRule')" type="danger" size="small" style="margin-left: 8px;">필수</el-tag></h4>
          <el-button v-if="!isMandatory('goOutRule')" type="danger" @click="removeBlock('goOutRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <GoOutRuleBlock v-model="policy.ruleDetails.goOutRule" />
      </div>
      <div v-if="policy.ruleDetails.leaveRule" class="rule-block-container">
        <div class="block-header">
          <h4>휴가 규칙<el-tag v-if="isMandatory('leaveRule')" type="danger" size="small" style="margin-left: 8px;">필수</el-tag></h4>
          <el-button v-if="!isMandatory('leaveRule')" type="danger" @click="removeBlock('leaveRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <LeaveRuleBlock v-model="policy.ruleDetails.leaveRule" :policy-type-code="policy.typeCode" />
      </div>
      <div v-if="policy.ruleDetails.tripRule" class="rule-block-container">
        <div class="block-header">
          <h4>출장 규칙<el-tag v-if="isMandatory('tripRule')" type="danger" size="small" style="margin-left: 8px;">필수</el-tag></h4>
          <el-button v-if="!isMandatory('tripRule')" type="danger" @click="removeBlock('tripRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <TripRuleBlock v-model="policy.ruleDetails.tripRule" />
      </div>
      <div v-if="policy.ruleDetails.breakRule" class="rule-block-container">
        <div class="block-header">
          <h4>휴게 규칙<el-tag v-if="isMandatory('breakRule')" type="danger" size="small" style="margin-left: 8px;">필수</el-tag></h4>
          <el-button v-if="!isMandatory('breakRule')" type="danger" @click="removeBlock('breakRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <BreakRuleBlock v-model="policy.ruleDetails.breakRule" :work-time-rule="policy.ruleDetails.workTimeRule" />
      </div>
      <div v-if="policy.ruleDetails.latenessRule" class="rule-block-container">
        <div class="block-header">
          <h4>지각/조퇴 규칙<el-tag v-if="isMandatory('latenessRule')" type="danger" size="small" style="margin-left: 8px;">필수</el-tag></h4>
          <el-button v-if="!isMandatory('latenessRule')" type="danger" @click="removeBlock('latenessRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <LatenessRuleBlock v-model="policy.ruleDetails.latenessRule" />
      </div>
      <div v-if="policy.ruleDetails.overtimeRule" class="rule-block-container">
        <div class="block-header">
          <h4>연장 근무 규칙<el-tag v-if="isMandatory('overtimeRule')" type="danger" size="small" style="margin-left: 8px;">필수</el-tag></h4>
          <el-button v-if="!isMandatory('overtimeRule')" type="danger" @click="removeBlock('overtimeRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <OvertimeRuleBlock v-model="policy.ruleDetails.overtimeRule" />
      </div>

      <!-- 하단 액션 버튼 -->
      <div class="page-actions">
        <el-button @click="$router.back()">취소</el-button>
        <el-button type="primary" @click="savePolicy" :loading="isSaving">저장</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getPolicyTypes, getPolicyById, createPolicy, updatePolicy } from '@/api/attendance';
import { useSnackbar } from '@/composables/useSnackbar';
import WorkTimeRuleBlock from './components/WorkTimeRuleBlock.vue';
import AuthRuleBlock from './components/AuthRuleBlock.vue';
import GoOutRuleBlock from './components/GoOutRuleBlock.vue';
import LeaveRuleBlock from './components/LeaveRuleBlock.vue';
import TripRuleBlock from './components/TripRuleBlock.vue';
import BreakRuleBlock from './components/BreakRuleBlock.vue';
import LatenessRuleBlock from './components/LatenessRuleBlock.vue';
import OvertimeRuleBlock from './components/OvertimeRuleBlock.vue';
import { CloseBold } from '@element-plus/icons-vue';

export default {
  name: 'PolicyEditor',
  components: {
    WorkTimeRuleBlock,
    AuthRuleBlock,
    GoOutRuleBlock,
    LeaveRuleBlock,
    TripRuleBlock,
    BreakRuleBlock,
    LatenessRuleBlock,
    OvertimeRuleBlock,
    CloseBold
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { success, error } = useSnackbar();

    const isLoading = ref(false);
    const isSaving = ref(false);
    const isPaidDisabled = ref(false);
    const policyTypes = ref([]);

    // 정책 유형별 사용 가능한 규칙 블록 매핑
    const POLICY_RULE_MAPPING = {
      'PTC001': ['leaveRule'],
      'PTC002': ['leaveRule'],
      'PTC003': ['leaveRule'],
      'PTC004': ['leaveRule'],
      'PTC005': ['leaveRule'],
      'PTC006': ['leaveRule'],
      'PTC101': ['workTimeRule', 'authRule', 'breakRule', 'latenessRule', 'goOutRule'],  // 기본근무: 다양한 규칙 조합 가능
      'PTC102': ['tripRule'],
      'PTC103': ['overtimeRule'],
      'PTC104': ['overtimeRule'],
      'PTC105': ['overtimeRule']
    };

    // 정책 유형별 필수 규칙 블록 매핑
    const MANDATORY_RULES = {
      'PTC001': ['leaveRule'],     // 연차유급휴가 - 휴가 규칙 필수
      'PTC002': ['leaveRule'],     // 출산전후휴가 - 휴가 규칙 필수
      'PTC003': ['leaveRule'],     // 배우자출산휴가 - 휴가 규칙 필수
      'PTC004': ['leaveRule'],     // 육아휴직 - 휴가 규칙 필수
      'PTC005': ['leaveRule'],     // 가족돌봄휴가 - 휴가 규칙 필수
      'PTC006': ['leaveRule'],     // 생리휴가 - 휴가 규칙 필수
      'PTC101': ['workTimeRule', 'authRule'],  // 기본근무 - 근무시간 + 인증 필수
      'PTC102': ['tripRule'],      // 출장 - 출장 규칙 필수
      'PTC103': ['overtimeRule'],  // 연장근무 - 연장근무 규칙 필수
      'PTC104': ['overtimeRule'],  // 야간근무 - 연장근무 규칙 필수
      'PTC105': ['overtimeRule']   // 휴일근무 - 연장근무 규칙 필수
    };

    const MANDATORY_PAID_LEAVE_CODES = ['PTC001', 'PTC002', 'PTC003'];

    const policy = ref({
      name: '',
      typeCode: null,
      effectiveFrom: null,
      effectiveTo: null,
      autoApprove: false,
      isPaid: false,
      ruleDetails: {
        workTimeRule: null, authRule: null, goOutRule: null, leaveRule: null,
        tripRule: null, breakRule: null, latenessRule: null, overtimeRule: null,
      }
    });

    const policyId = computed(() => route.params.policyId || null);
    const isEditMode = computed(() => !!policyId.value);

    const addBlock = (blockName) => {
        if (blockName === 'leaveRule' && !policy.value.ruleDetails.leaveRule) {
            // PTC001 (연차유급휴가)의 경우 더 상세한 초기값 설정
            if (policy.value.typeCode === 'PTC001') {
                policy.value.ruleDetails.leaveRule = {
                    defaultDays: 15,
                    accrualType: 'ACCRUAL',
                    standardType: 'FISCAL_YEAR',
                    baseAnnualLeaveForOverOneYear: 15,
                    additionalAnnualLeaveRules: [],
                    maximumAnnualLeaveLimit: 25,
                    firstYearRule: {
                        monthlyAccrualEnabled: true,
                        monthlyAccrualDays: 1.0,
                        maxAccrualFirstYear: 11
                    },
                    overOneYearRule: {
                        carryOverEnabled: false,
                        carryOverLimitDays: 0,
                        carryOverExpirationMonths: 3
                    },
                    minimumRequestUnit: 'DAY',
                    requestDeadlineDays: 1,
                    allowRetrospectiveRequest: false
                };
            } else {
                // 다른 휴가 유형은 기본 초기값
                policy.value.ruleDetails.leaveRule = { defaultDays: 0 };
            }
        } else if (blockName === 'workTimeRule' && !policy.value.ruleDetails.workTimeRule) {
            policy.value.ruleDetails.workTimeRule = {
                type: 'FIXED',
                fixedWorkMinutes: 480,
                workStartTime: '09:00',
                workEndTime: '18:00'
            };
        } else if (blockName === 'authRule' && !policy.value.ruleDetails.authRule) {
            policy.value.ruleDetails.authRule = { allowedWorkLocationIds: [], requiredAuthTypes: ['GPS'] };
        } else if (blockName === 'breakRule' && !policy.value.ruleDetails.breakRule) {
            policy.value.ruleDetails.breakRule = { mandatoryBreakMinutes: 0 };
        } else if (blockName === 'overtimeRule' && !policy.value.ruleDetails.overtimeRule) {
            policy.value.ruleDetails.overtimeRule = {
                maxWeeklyOvertimeMinutes: 720,
                overtimeRate: 1.5,
                nightWorkRate: 1.5,
                holidayWorkRate: 1.5,
                holidayOvertimeRate: 2.0
            };
        } else if (blockName === 'latenessRule' && !policy.value.ruleDetails.latenessRule) {
            policy.value.ruleDetails.latenessRule = { allowLateness: false };
        } else if (blockName === 'goOutRule' && !policy.value.ruleDetails.goOutRule) {
            policy.value.ruleDetails.goOutRule = { allowGoOut: false };
        } else if (blockName === 'tripRule' && !policy.value.ruleDetails.tripRule) {
            policy.value.ruleDetails.tripRule = {
                type: '',
                perDiemAmount: 0,
                accommodationLimit: 0,
                transportationLimit: 0,
                allowedWorkLocations: []
            };
        }
    };

    watch(() => policy.value.typeCode, (newTypeCode) => {
      if (!newTypeCode) return;

      // 법정 유급 휴가는 유급 여부 강제
      if (MANDATORY_PAID_LEAVE_CODES.includes(newTypeCode)) {
        policy.value.isPaid = true;
        isPaidDisabled.value = true;
      } else {
        isPaidDisabled.value = false;
      }

      // 필수 규칙 블록 자동 추가
      const mandatoryRules = MANDATORY_RULES[newTypeCode] || [];
      mandatoryRules.forEach(ruleName => {
        if (!policy.value.ruleDetails[ruleName]) {
          addBlock(ruleName);
        }
      });
    });

    const fetchPolicyTypes = async () => {
      try {
        policyTypes.value = await getPolicyTypes();
      } catch (err) {
        error(err.message || '정책 유형 목록을 불러오는 데 실패했습니다.');
      }
    };

    const fetchPolicy = async () => {
      isLoading.value = true;
      try {
        const fetchedPolicy = await getPolicyById(policyId.value);
        const defaultRuleDetails = {
          workTimeRule: null, authRule: null, goOutRule: null, leaveRule: null,
          tripRule: null, breakRule: null, latenessRule: null, overtimeRule: null,
        };

        policy.value.name = fetchedPolicy.name;
        policy.value.typeCode = fetchedPolicy.typeCode;
        policy.value.isPaid = fetchedPolicy.isPaid;
        policy.value.autoApprove = fetchedPolicy.autoApprove;
        policy.value.effectiveFrom = fetchedPolicy.effectiveFrom;
        policy.value.effectiveTo = fetchedPolicy.effectiveTo;
        // 깊은 복사로 ruleDetails 설정
        if (fetchedPolicy.ruleDetails) {
          policy.value.ruleDetails = JSON.parse(JSON.stringify(fetchedPolicy.ruleDetails));
        } else {
          policy.value.ruleDetails = { ...defaultRuleDetails };
        }

        // authRule 초기화: WorkLocation 참조 방식
        if (policy.value.ruleDetails.authRule) {
          if (!policy.value.ruleDetails.authRule.allowedWorkLocationIds) {
            policy.value.ruleDetails.authRule.allowedWorkLocationIds = [];
          }
          if (!policy.value.ruleDetails.authRule.requiredAuthTypes) {
            policy.value.ruleDetails.authRule.requiredAuthTypes = ['GPS'];
          }
        }
      } catch (err) {
        error(err.message || '정책 정보를 불러오는 데 실패했습니다.');
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      fetchPolicyTypes();
      if (isEditMode.value) {
        fetchPolicy();
      }
    });

    // 특정 규칙이 필수인지 확인하는 함수
    const isMandatory = (ruleName) => {
      const mandatoryRules = MANDATORY_RULES[policy.value.typeCode] || [];
      return mandatoryRules.includes(ruleName);
    };

    const removeBlock = (blockName) => {
      // 필수 규칙은 삭제 불가
      if (isMandatory(blockName)) {
        error(`${getRuleName(blockName)}은(는) 이 정책 유형의 필수 규칙입니다.`);
        return;
      }
      policy.value.ruleDetails[blockName] = null;
    };

    // 규칙 블록 이름 표시용
    const getRuleName = (ruleName) => {
      const names = {
        workTimeRule: '근무 시간 규칙',
        authRule: '인증 규칙',
        breakRule: '휴게 규칙',
        latenessRule: '지각/조퇴 규칙',
        goOutRule: '외출 규칙',
        leaveRule: '휴가 규칙',
        tripRule: '출장 규칙',
        overtimeRule: '연장 근무 규칙'
      };
      return names[ruleName] || ruleName;
    };

    const savePolicy = async () => {
      if (!policy.value.name || !policy.value.typeCode || !policy.value.effectiveFrom) {
        error("정책 이름, 유형, 시작일은 필수 항목입니다.");
        return;
      }
      isSaving.value = true;
      const requestData = {
        name: policy.value.name,
        typeCode: policy.value.typeCode,
        isPaid: policy.value.isPaid,
        effectiveFrom: policy.value.effectiveFrom,
        effectiveTo: policy.value.effectiveTo,
        ruleDetails: policy.value.ruleDetails,
        autoApprove: policy.value.autoApprove,
      };

      // workTimeRule 타입에 따라 불필요한 속성 제거
      if (requestData.ruleDetails.workTimeRule) {
        const workTimeRule = requestData.ruleDetails.workTimeRule;
        if (workTimeRule.type === 'FIXED') {
          // FIXED 타입: 코어타임 필드 제거
          delete workTimeRule.coreTimeStart;
          delete workTimeRule.coreTimeEnd;
        } else if (workTimeRule.type === 'FLEXIBLE') {
          // FLEXIBLE 타입: 삭제할 필드 없음 (모든 필드 필요)
          // fixedWorkMinutes, workStartTime, workEndTime, coreTimeStart, coreTimeEnd 모두 필요
        }
      }

      // breakRule 타입에 따라 불필요한 속성 제거
      if (requestData.ruleDetails.breakRule) {
        const breakRule = requestData.ruleDetails.breakRule;
        if (breakRule.type === 'FIXED') {
          delete breakRule.defaultBreakMinutesFor8Hours;
          delete breakRule.mandatoryBreakMinutes;
        } else if (breakRule.type === 'AUTO' || breakRule.type === 'MANUAL') {
          delete breakRule.fixedBreakStart;
          delete breakRule.fixedBreakEnd;
        }
      }

      console.log('API 요청 데이터:', JSON.stringify(requestData, null, 2));

      try {
        if (isEditMode.value) {
          await updatePolicy(policyId.value, requestData);
          success("정책이 성공적으로 수정되었습니다.");
        } else {
          await createPolicy(requestData);
          success("정책이 성공적으로 생성되었습니다.");
        }
        router.push('/admin/policy-management');
      } catch (err) {
        error(err.message || "정책 저장에 실패했습니다.");
      } finally {
        isSaving.value = false;
      }
    };

    return {
      isLoading,
      isSaving,
      policyTypes,
      policy,
      isEditMode,
      isPaidDisabled,
      POLICY_RULE_MAPPING,
      isMandatory,
      removeBlock,
      addBlock,
      savePolicy,
    };
  }
};
</script>

<style scoped>
.policy-editor { max-width: 900px; margin: 0 auto; }
.card-header h2 { margin: 0; font-size: 1.5rem; }
.rule-block-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.rule-block-container { margin-bottom: 20px; padding: 16px; border: 1px solid #dcdfe6; border-radius: 4px; background-color: #f5f7fa; }
.block-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.block-header h4 { margin: 0; display: flex; align-items: center; }
.page-actions { margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; }
</style>
