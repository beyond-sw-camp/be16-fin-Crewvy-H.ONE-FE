<template>
  <div class="policy-editor">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>새 근태 정책 생성</h2>
          <div>
            <el-button @click="$router.back()">취소</el-button>
            <el-button type="primary" @click="savePolicy">저장</el-button>
          </div>
        </div>
      </template>

      <el-form :model="policy" label-width="120px" label-position="top">
        <!-- ... (기존 기본 정보 입력란) ... -->
      </el-form>

      <el-divider>규칙 블록 추가</el-divider>

      <div class="rule-block-section">
        <p class="description-text">
          정책에 적용할 규칙 블록을 추가하세요. 각 규칙은 조합하여 사용할 수 있습니다.
        </p>
        <div class="rule-block-actions">
          <el-button @click="addBlock('workTimeRule')" :disabled="!!policy.ruleDetails.workTimeRule">
            + 근무 시간 규칙
          </el-button>
          <el-button @click="addBlock('authRule')" :disabled="!!policy.ruleDetails.authRule">
            + 인증 규칙
          </el-button>
          <el-button disabled>+ 외출 규칙</el-button>
        </div>
      </div>

      <!-- 동적으로 추가된 규칙 블록 렌더링 -->
      <div v-if="policy.ruleDetails.workTimeRule" class="rule-block-container">
        <WorkTimeRuleBlock v-model="policy.ruleDetails.workTimeRule" />
      </div>
      <div v-if="policy.ruleDetails.authRule" class="rule-block-container">
        <AuthRuleBlock v-model="policy.ruleDetails.authRule" />
      </div>

    </el-card>
  </div>
</template>

<script>
import WorkTimeRuleBlock from './components/WorkTimeRuleBlock.vue';
import AuthRuleBlock from './components/AuthRuleBlock.vue';

export default {
  name: 'PolicyEditor',
  components: {
    WorkTimeRuleBlock,
    AuthRuleBlock
  },
  data() {
    return {
      policy: {
        name: '',
        policyTypeId: null,
        effectiveDates: [],
        isPaid: false,
        ruleDetails: {
          workTimeRule: null,
          authRule: null,
          goOutRule: null,
        }
      }
    };
  },
  methods: {
    addBlock(blockName) {
      if (blockName === 'workTimeRule') {
        this.policy.ruleDetails.workTimeRule = { type: 'FIXED', fixedWorkMinutes: 480 };
      } else if (blockName === 'authRule') {
        this.policy.ruleDetails.authRule = { methods: [] };
      }
    },
    savePolicy() {
      console.log('Saving policy:', this.policy);
    }
  }
};
</script>

<style scoped>
/* ... (기존 스타일) ... */
.rule-block-container {
  margin-top: 20px;
}
</style>
