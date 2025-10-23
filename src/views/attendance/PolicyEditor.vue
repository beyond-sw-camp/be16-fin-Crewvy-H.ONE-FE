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
            <el-form-item label="정책 이름">
              <el-input v-model="policy.name" placeholder="예: 2024년 하계 유연근무 정책"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="정책 유형">
              <el-select v-model="policy.typeCode" placeholder="정책 유형을 선택하세요" style="width: 100%;">
                <el-option
                  v-for="type in policyTypes"
                  :key="type.policyTypeId"
                  :label="type.typeName"
                  :value="type.typeCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="정책 적용 시작일">
              <el-date-picker
                v-model="policy.effectiveFrom"
                type="date"
                placeholder="시작일을 선택하세요 (필수)"
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
           <el-switch v-model="policy.isPaid"></el-switch>
        </el-form-item>
      </el-form>

      <el-divider>규칙 블록 추가</el-divider>

      <div class="rule-block-section">
        <p class="description-text">
          정책에 적용할 규칙 블록을 추가하세요. 각 규칙은 조합하여 사용할 수 있습니다.
        </p>
        <div class="rule-block-actions">
          <el-button @click="addBlock('workTimeRule')" :disabled="!!policy.ruleDetails.workTimeRule">+ 근무 시간</el-button>
        <el-button @click="addBlock('authRule')" :disabled="!!policy.ruleDetails.authRule">+ 인증</el-button>
        <el-button @click="addBlock('breakRule')" :disabled="!!policy.ruleDetails.breakRule">+ 휴게</el-button>
        <el-button @click="addBlock('latenessRule')" :disabled="!!policy.ruleDetails.latenessRule">+ 지각/조퇴</el-button>
        <el-button @click="addBlock('goOutRuleDto')" :disabled="!!policy.ruleDetails.goOutRuleDto">+ 외출</el-button>
        <el-button @click="addBlock('leaveRule')" :disabled="!!policy.ruleDetails.leaveRule">+ 휴가</el-button>
        <el-button @click="addBlock('tripRule')" :disabled="!!policy.ruleDetails.tripRule">+ 출장</el-button>
        <el-button @click="addBlock('expenseRule')" :disabled="!!policy.ruleDetails.expenseRule">+ 경비</el-button>
        </div>
      </div>

      <!-- 동적으로 추가된 규칙 블록 렌더링 -->
      <div v-if="policy.ruleDetails.workTimeRule" class="rule-block-container">
        <div class="block-header">
          <h4>근무 시간 규칙</h4>
          <el-button type="danger" @click="removeBlock('workTimeRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <WorkTimeRuleBlock v-model="policy.ruleDetails.workTimeRule" />
      </div>
      <div v-if="policy.ruleDetails.authRule" class="rule-block-container">
        <div class="block-header">
          <h4>인증 규칙</h4>
          <el-button type="danger" @click="removeBlock('authRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <AuthRuleBlock v-model="policy.ruleDetails.authRule" />
      </div>
      <div v-if="policy.ruleDetails.goOutRuleDto" class="rule-block-container">
        <div class="block-header">
          <h4>외출 규칙</h4>
          <el-button type="danger" @click="removeBlock('goOutRuleDto')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <GoOutRuleBlock v-model="policy.ruleDetails.goOutRuleDto" />
      </div>
      <div v-if="policy.ruleDetails.leaveRule" class="rule-block-container">
        <div class="block-header">
          <h4>휴가 규칙</h4>
          <el-button type="danger" @click="removeBlock('leaveRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <LeaveRuleBlock v-model="policy.ruleDetails.leaveRule" />
      </div>
      <div v-if="policy.ruleDetails.tripRule" class="rule-block-container">
        <div class="block-header">
          <h4>출장 규칙</h4>
          <el-button type="danger" @click="removeBlock('tripRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <TripRuleBlock v-model="policy.ruleDetails.tripRule" />
      </div>
      <div v-if="policy.ruleDetails.breakRule" class="rule-block-container">
        <div class="block-header">
          <h4>휴게 규칙</h4>
          <el-button type="danger" @click="removeBlock('breakRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <BreakRuleBlock v-model="policy.ruleDetails.breakRule" />
      </div>
      <div v-if="policy.ruleDetails.expenseRule" class="rule-block-container">
        <div class="block-header">
          <h4>경비 규칙</h4>
          <el-button type="danger" @click="removeBlock('expenseRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <ExpenseRuleBlock v-model="policy.ruleDetails.expenseRule" />
      </div>
      <div v-if="policy.ruleDetails.latenessRule" class="rule-block-container">
        <div class="block-header">
          <h4>지각/조퇴 규칙</h4>
          <el-button type="danger" @click="removeBlock('latenessRule')" text circle><el-icon><CloseBold /></el-icon></el-button>
        </div>
        <LatenessRuleBlock v-model="policy.ruleDetails.latenessRule" />
      </div>

      <!-- 하단 액션 버튼 -->
      <div class="page-actions">
        <el-button @click="$router.back()">취소</el-button>
        <el-button type="primary" @click="savePolicy">저장</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'; // watch 제거
// import { useStore } from 'vuex'; // TODO: 토큰에 companyId 추가되면 복구
import { useRouter, useRoute } from 'vue-router';
import { useSnackbar } from '@/composables/useSnackbar';
import WorkTimeRuleBlock from './components/WorkTimeRuleBlock.vue';
import AuthRuleBlock from './components/AuthRuleBlock.vue';
import GoOutRuleBlock from './components/GoOutRuleBlock.vue';
import LeaveRuleBlock from './components/LeaveRuleBlock.vue';
import TripRuleBlock from './components/TripRuleBlock.vue';
import BreakRuleBlock from './components/BreakRuleBlock.vue';
import ExpenseRuleBlock from './components/ExpenseRuleBlock.vue';
import LatenessRuleBlock from './components/LatenessRuleBlock.vue';
import { createPolicy, getPolicyById, updatePolicy, getPolicyTypes } from '@/api/attendance';

export default {
  name: 'PolicyEditor',
  components: {
    WorkTimeRuleBlock, AuthRuleBlock, GoOutRuleBlock, LeaveRuleBlock, TripRuleBlock,
    BreakRuleBlock, ExpenseRuleBlock, LatenessRuleBlock
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { success, error } = useSnackbar();

    const isLoading = ref(false);
    const policyTypes = ref([]);
    const policy = ref({
      name: '',
      typeCode: null,
      effectiveFrom: null,
      effectiveTo: null,
      isPaid: false,
      ruleDetails: {
        workTimeRule: null, authRule: null, goOutRuleDto: null, leaveRule: null,
        tripRule: null, breakRule: null, expenseRule: null, latenessRule: null,
      }
    });

    const policyId = computed(() => route.params.policyId || null);
    const isEditMode = computed(() => !!policyId.value);

    const fetchPolicyTypes = async () => {
      try {
        const response = await getPolicyTypes();
        console.log('✅ Policy Types API Response:', response);
        policyTypes.value = response;

        if (policyTypes.value && policyTypes.value.length > 0) {
          success(`정책 유형 ${policyTypes.value.length}개를 불러왔습니다.`);
        } else {
          error('정책 유형이 없습니다. 백엔드에 PolicyType 데이터가 있는지 확인하세요.');
        }
      } catch (err) {
        console.error('❌ Policy Types API Error:', err);
        error(err.response?.data?.message || '정책 유형 목록을 불러오는 데 실패했습니다.');
      }
    };

    const fetchPolicy = async () => {
      isLoading.value = true;
      try {
        const fetchedPolicy = await getPolicyById(policyId.value);
        policy.value.name = fetchedPolicy.name;
        policy.value.typeCode = fetchedPolicy.typeCode;
        policy.value.isPaid = fetchedPolicy.isPaid;
        policy.value.effectiveFrom = fetchedPolicy.effectiveFrom;
        policy.value.effectiveTo = fetchedPolicy.effectiveTo;
        policy.value.ruleDetails = Object.assign({
          workTimeRule: null, authRule: null, goOutRuleDto: null, leaveRule: null,
          tripRule: null, breakRule: null, expenseRule: null, latenessRule: null,
        }, fetchedPolicy.ruleDetails);

        // authRule이 존재하지만 methods 배열이 없을 경우를 대비한 방어 코드
        if (policy.value.ruleDetails.authRule && !policy.value.ruleDetails.authRule.methods) {
          policy.value.ruleDetails.authRule.methods = [];
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
    
    const removeBlock = (blockName) => {
      policy.value.ruleDetails[blockName] = null;
    };

    const addBlock = (blockName) => {
        if (blockName === 'workTimeRule' && !policy.value.ruleDetails.workTimeRule) {
            policy.value.ruleDetails.workTimeRule = { type: 'FIXED', fixedWorkMinutes: 480 };
        } else if (blockName === 'authRule' && !policy.value.ruleDetails.authRule) {
            policy.value.ruleDetails.authRule = { methods: [] };
        } else if (blockName === 'goOutRuleDto' && !policy.value.ruleDetails.goOutRuleDto) {
            policy.value.ruleDetails.goOutRuleDto = { type: 'SIMPLE_RECORD', allowedMinutesWithoutApproval: 60 };
        } else if (blockName === 'leaveRule' && !policy.value.ruleDetails.leaveRule) {
            policy.value.ruleDetails.leaveRule = { type: '연차', defaultDays: 15, allowCarryOver: true, accrualType: 'YEARLY', firstYearMaxAccrual: 11 };
        } else if (blockName === 'tripRule' && !policy.value.ruleDetails.tripRule) {
            policy.value.ruleDetails.tripRule = { type: '국내', perDiemAmount: 50000 };
        } else if (blockName === 'breakRule' && !policy.value.ruleDetails.breakRule) {
            policy.value.ruleDetails.breakRule = { type: 'AUTO', defaultBreakMinutesFor8Hours: 60, mandatoryBreakMinutes: 60 };
        } else if (blockName === 'expenseRule' && !policy.value.ruleDetails.expenseRule) {
            policy.value.ruleDetails.expenseRule = { type: '식대', transactionLimit: 15000 };
        } else if (blockName === 'latenessRule' && !policy.value.ruleDetails.latenessRule) {
            policy.value.ruleDetails.latenessRule = { latenessGraceMinutes: 10, deductionType: 'DEDUCT_PER_MINUTE' };
        }
    };

    const savePolicy = async () => {
      const requestData = {
        name: policy.value.name,
        typeCode: policy.value.typeCode,
        isPaid: policy.value.isPaid,
        effectiveFrom: policy.value.effectiveFrom,
        effectiveTo: policy.value.effectiveTo,
        ruleDetails: policy.value.ruleDetails,
      };
      try {
        if (isEditMode.value) {
          await updatePolicy(policyId.value, requestData);
          success('정책이 성공적으로 수정되었습니다.');
        } else {
          await createPolicy(requestData);
          success('새로운 정책이 성공적으로 생성되었습니다.');
        }
        router.push({ name: 'PolicyManagement' });
      } catch (err) {
        error(err.message || '정책 저장에 실패했습니다.');
      }
    };

    return {
      isLoading,
      policyTypes,
      policy,
      isEditMode,
      removeBlock,
      addBlock,
      savePolicy,
    };
  }
};
</script>

<style scoped>
.policy-editor {
  max-width: none;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 80px; /* 하단 버튼 공간 확보 */
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
}
.rule-block-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
}
.description-text {
  color: #6b7280;
  margin-bottom: 16px;
}
.rule-block-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.rule-block-container {
  margin-top: 20px;
  position: relative;
}
.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.block-header h4 {
  margin: 0;
  font-size: 1.1rem;
}
.page-actions {
  margin-top: 20px;
  text-align: right;
}
</style>