<template>
  <div class="policy-management">
    <div class="content-card">
      <div class="card-header">
        <h3>근태 정책 관리</h3>
        <div class="header-actions">
          <el-button type="primary" @click="goToCreatePage">
            <el-icon><Plus /></el-icon>
            <span style="margin-left: 8px;">새 정책 추가</span>
          </el-button>
        </div>
      </div>
      <div class="policy-layout" v-loading="isLoading">
        <div class="policy-list-panel">
          <el-menu
            :default-active="selectedPolicyId"
            :default-openeds="openedMenus"
            class="policy-menu"
            @select="handlePolicySelect"
            @open="handleMenuOpen"
            @close="handleMenuClose"
          >
            <el-sub-menu v-for="(group, type) in groupedPolicies" :key="type" :index="type">
              <template #title>
                <span>{{ policyTypeNames[type] }}</span>
              </template>
              <el-menu-item v-for="policy in group" :key="policy.policyId" :index="policy.policyId">
                <el-icon><Document /></el-icon>
                <span class="policy-name">{{ policy.name }}</span>
                <el-tag v-if="policy.isActive" type="success" size="small" class="policy-status-tag">활성</el-tag>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>
        <div class="policy-details-panel" v-if="selectedPolicy">
          <div class="panel-header">
            <h4>{{ selectedPolicy.name }} 상세</h4>
            <div>
              <el-button v-if="!selectedPolicy.isActive" type="success" @click="handleActivate(selectedPolicy.policyId)">활성화</el-button>
              <el-button v-if="selectedPolicy.isActive" type="warning" plain @click="handleDeactivate(selectedPolicy.policyId)">비활성화</el-button>
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
// import { useStore } from 'vuex'; // TODO: 토큰에 companyId 추가되면 복구
import { Document, Plus } from '@element-plus/icons-vue';
import { getPolicies, deletePolicy, activatePolicies, deactivatePolicies } from '@/api/attendance';
import { useSnackbar } from '@/composables/useSnackbar';
import { ElMessageBox } from 'element-plus';

export default {
  name: 'PolicyManagement',
  components: { Document, Plus },
  setup() {
    const router = useRouter();
    const { success, error } = useSnackbar();

    const policies = ref([]);
    const isLoading = ref(false);
    const selectedPolicyId = ref(null);

    // localStorage에서 초기값 즉시 로드
    const getInitialOpenedMenus = () => {
      try {
        const saved = localStorage.getItem('policyManagement_openedMenus');
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('저장된 메뉴 상태 로드:', parsed);
          return parsed;
        }
      } catch (e) {
        console.error('메뉴 상태 로드 실패:', e);
      }
      return [];
    };

    const openedMenus = ref(getInitialOpenedMenus());

    const policyTypeNames = {
      leave: '휴가 정책',
      work: '근무 정책',
      trip: '출장 정책',
      overtime: '연장/야간/휴일 근무',
    };

    // localStorage에 열린 메뉴 상태 저장
    const saveOpenedMenus = () => {
      try {
        console.log('메뉴 상태 저장:', openedMenus.value);
        localStorage.setItem('policyManagement_openedMenus', JSON.stringify(openedMenus.value));
      } catch (e) {
        console.error('메뉴 상태 저장 실패:', e);
      }
    };

    // 메뉴 열림 처리
    const handleMenuOpen = (index) => {
      console.log('메뉴 열림:', index);
      if (!openedMenus.value.includes(index)) {
        openedMenus.value.push(index);
        saveOpenedMenus();
      }
    };

    // 메뉴 닫힘 처리
    const handleMenuClose = (index) => {
      console.log('메뉴 닫힘:', index);
      const idx = openedMenus.value.indexOf(index);
      if (idx > -1) {
        openedMenus.value.splice(idx, 1);
        saveOpenedMenus();
      }
    };

    const groupedPolicies = computed(() => {
      return policies.value.reduce((acc, policy) => {
        let type = 'work'; // 기본값

        // typeCode 기준으로 분류
        if (policy.typeCode) {
          if (['PTC001', 'PTC002', 'PTC003', 'PTC004', 'PTC005', 'PTC006'].includes(policy.typeCode)) {
            type = 'leave'; // 휴가 정책
          } else if (policy.typeCode === 'PTC101') {
            type = 'work'; // 기본 근무 정책
          } else if (policy.typeCode === 'PTC102') {
            type = 'trip'; // 출장 정책
          } else if (['PTC103', 'PTC104', 'PTC105'].includes(policy.typeCode)) {
            type = 'overtime'; // 연장/야간/휴일 근무
          }
        }

        (acc[type] = acc[type] || []).push(policy);
        return acc;
      }, {});
    });

    const selectedPolicy = computed(() =>
      policies.value.find(p => p.policyId === selectedPolicyId.value)
    );

    const fetchPolicies = async () => {
      isLoading.value = true;
      try {
        const params = { page: 0, size: 20 }; // companyId 제거
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

    onMounted(() => {
      console.log('컴포넌트 마운트, 현재 openedMenus:', openedMenus.value);
      fetchPolicies();
    });

    const handlePolicySelect = (index) => {
      selectedPolicyId.value = index;
    };

    const goToCreatePage = () => {
      router.push({ name: 'PolicyCreate' });
    };

    const goToAssignPage = () => {
      router.push({ name: 'PolicyAssignment' });
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
        await activatePolicies([policyId]); // 배열을 직접 전달
        success('정책이 성공적으로 활성화되었습니다.');
        fetchPolicies();
      } catch (err) {
        error(err.message || '정책 활성화에 실패했습니다.');
      }
    };

    const handleDeactivate = async (policyId) => {
      try {
        await ElMessageBox.confirm('이 정책을 비활성화하시겠습니까?', '비활성화 확인', { type: 'warning' });
        await deactivatePolicies([policyId]); // 배열을 직접 전달
        success('정책이 비활성화되었습니다.');
        fetchPolicies();
      } catch (err) {
        if (err !== 'cancel') {
          error(err.message || '정책 비활성화에 실패했습니다.');
        }
      }
    };

    return {
      policies,
      isLoading,
      groupedPolicies,
      policyTypeNames,
      selectedPolicyId,
      selectedPolicy,
      openedMenus,
      handlePolicySelect,
      handleMenuOpen,
      handleMenuClose,
      goToCreatePage,
      goToAssignPage,
      editPolicy,
      handleDelete,
      handleActivate,
      handleDeactivate,
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

.header-actions {
  display: flex;
  gap: 10px;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.policy-menu .el-menu-item .policy-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.policy-menu .el-menu-item .policy-status-tag {
  flex-shrink: 0;
  margin-left: auto;
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