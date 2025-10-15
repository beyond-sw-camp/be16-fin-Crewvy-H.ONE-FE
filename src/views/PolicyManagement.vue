<template>
  <div class="policy-management">
    <div class="content-card">
      <div class="card-header">
        <h3>근태 정책 관리</h3>
        <el-button type="primary" @click="goToCreatePage">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">새 정책 추가</span>
        </el-button>
      </div>
      <div class="policy-layout" v-loading="isLoading">
        <div class="policy-list-panel">
          <el-menu :default-active="selectedPolicyId" class="policy-menu" @select="handlePolicySelect">
            <el-sub-menu v-for="(group, type) in groupedPolicies" :key="type" :index="type">
              <template #title>
                <span>{{ policyTypeNames[type] }}</span>
              </template>
              <el-menu-item v-for="policy in group" :key="policy.policyId" :index="policy.policyId">
                <el-icon><Document /></el-icon>
                <span>{{ policy.name }}</span>
                <el-tag v-if="policy.isActive" type="success" size="small" style="margin-left: 8px;">활성</el-tag>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>
        <div class="policy-details-panel" v-if="selectedPolicy">
          <div class="panel-header">
            <h4>{{ selectedPolicy.name }} 상세</h4>
            <div>
              <el-button v-if="!selectedPolicy.isActive" type="success" @click="handleActivate(selectedPolicy.policyId)">활성화</el-button>
              <el-button type="danger" plain @click="handleDelete(selectedPolicy.policyId)">삭제</el-button>
              <el-button type="primary" plain @click="editPolicy(selectedPolicy)">정책 수정</el-button>
            </div>
          </div>
          <div class="details-content">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="정책명">{{ selectedPolicy.name }}</el-descriptions-item>
              <el-descriptions-item label="적용 기간">
                {{ selectedPolicy.effectiveFrom }} ~ {{ selectedPolicy.effectiveTo || '무기한' }}
              </el-descriptions-item>
              <el-descriptions-item v-if="selectedPolicy.ruleDetails.workTimeRule" label="근무 유형">
                <el-tag>{{ selectedPolicy.ruleDetails.workTimeRule.type }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="selectedPolicy.ruleDetails.authRule" label="인증 방식">
                <el-tag v-for="method in selectedPolicy.ruleDetails.authRule.methods" :key="method.deviceType" type="info" style="margin-right: 5px;">
                  {{ method.deviceType }}: {{ method.authMethod }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        <div v-else class="policy-details-panel placeholder">
          <p>왼쪽에서 정책을 선택해주세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Document, Plus} from '@element-plus/icons-vue';
import { getPolicies, deletePolicy, activatePolicy } from '@/api/attendance';
import { useSnackbar } from '@/composables/useSnackbar';
import { ElMessageBox } from 'element-plus';

export default {
  name: 'PolicyManagement',
  components: { Document, Plus },
  setup() {
    const router = useRouter();
    const store = useStore();
    const { success, error } = useSnackbar();

    const policies = ref([]);
    const isLoading = ref(false);
    const selectedPolicyId = ref(null);

    const companyId = computed(() => store.state.user?.companyId);

    const policyTypeNames = {
      leave: '연차 정책',
      work: '근무 정책',
      trip: '출장 정책',
    };

    const groupedPolicies = computed(() => {
      return policies.value.reduce((acc, policy) => {
        const type = policy.isBalanceDeductible ? 'leave' : 'work';
        (acc[type] = acc[type] || []).push(policy);
        return acc;
      }, {});
    });

    const selectedPolicy = computed(() =>
      policies.value.find(p => p.policyId === selectedPolicyId.value)
    );

    const fetchPolicies = async () => {
      if (!companyId.value) {
        error('회사 정보를 찾을 수 없습니다.');
        return;
      }
      isLoading.value = true;
      try {
        const params = { companyId: companyId.value, page: 0, size: 20 };
        const response = await getPolicies(params);
        policies.value = response.content.map(policy => ({ ...policy, isActive: policy.isActive ?? false }));
        if (policies.value.length > 0 && !selectedPolicyId.value) {
          selectedPolicyId.value = policies.value[0].policyId;
        }
      } catch (err) {
        error(err.message || '정책 목록을 불러오는 데 실패했습니다.');
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(fetchPolicies);

    const handlePolicySelect = (index) => {
      selectedPolicyId.value = index;
    };

    const goToCreatePage = () => {
      router.push({ name: 'PolicyCreate' });
    };

    const editPolicy = (policy) => {
      router.push({ name: 'PolicyEdit', params: { policyId: policy.policyId } });
    };

    const handleDelete = async (policyId) => {
      try {
        await ElMessageBox.confirm('정말로 이 정책을 삭제하시겠습니까?', '경고', { type: 'warning' });
        await deletePolicy(policyId);
        success('정책이 삭제되었습니다.');
        selectedPolicyId.value = null;
        fetchPolicies();
      } catch (err) {
        if (err !== 'cancel') {
          error(err.message || '정책 삭제에 실패했습니다.');
        }
      }
    };

    const handleActivate = async (policyId) => {
      try {
        await activatePolicy(policyId);
        success('정책이 성공적으로 활성화되었습니다.');
        fetchPolicies();
      } catch (err) {
        error(err.message || '정책 활성화에 실패했습니다.');
      }
    };

    return {
      policies,
      isLoading,
      groupedPolicies,
      policyTypeNames,
      selectedPolicyId,
      selectedPolicy,
      handlePolicySelect,
      goToCreatePage,
      editPolicy,
      handleDelete,
      handleActivate,
    };
  },
};
</script>
<style scoped>
.policy-management {
  max-width: 1200px;
  margin: 0 auto;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.policy-layout {
  display: flex;
  min-height: 600px;
}

.policy-list-panel {
  width: 280px;
  border-right: 1px solid #f0f0f0;
  background-color: #f8f9fa;
}

.policy-menu {
  border-right: none;
  background: transparent;
}

.policy-menu .el-menu-item {
  font-size: 14px;
}

.policy-menu .el-menu-item.is-active {
  background-color: #eef2ff;
  color: #4f46e5;
  font-weight: bold;
}

.policy-details-panel {
  flex: 1;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.details-content {
    padding: 20px;
}

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 16px;
}
</style>