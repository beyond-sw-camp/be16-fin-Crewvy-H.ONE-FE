<template>
  <div class="policy-management">
    <div class="content-card">
      <div class="card-header">
        <h3>근태 정책 관리</h3>
        <el-button type="primary" @click="openNewPolicyDialog">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">새 정책 추가</span>
        </el-button>
      </div>
      <div class="policy-layout">
        <div class="policy-list-panel">
          <el-menu :default-active="selectedPolicy?.id.toString()" class="policy-menu" @select="handlePolicySelect">
            <el-sub-menu v-for="(group, type) in groupedPolicies" :key="type" :index="type">
              <template #title>
                <span>{{ policyTypeNames[type] }}</span>
              </template>
              <el-menu-item v-for="policy in group" :key="policy.id" :index="policy.id.toString()">
                <el-icon><Document /></el-icon>
                <span>{{ policy.name }}</span>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>
        <div class="policy-details-panel" v-if="selectedPolicy">
          <div class="panel-header">
            <h4>{{ selectedPolicy.name }} 상세</h4>
            <el-button 
              v-if="selectedPolicy.type === 'leave' || selectedPolicy.type === 'trip' || selectedPolicy.type === 'work'"
              type="primary" 
              plain 
              @click="editPolicy(selectedPolicy)"
            >세부 정책 수정</el-button>
          </div>
          <div class="details-content">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="정책명">{{ selectedPolicy.name }}</el-descriptions-item>
              <el-descriptions-item label="적용 대상">{{ selectedPolicy.target }}</el-descriptions-item>
              <el-descriptions-item v-if="selectedPolicy.autoGrant" label="자동 부여 기준">
                <el-tag>{{ selectedPolicy.autoGrant }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="규칙">
                <el-timeline style="margin-top: 10px;">
                  <el-timeline-item v-for="(rule, index) in selectedPolicy.rules" :key="index" :timestamp="rule.condition">
                    {{ rule.action }}
                  </el-timeline-item>
                </el-timeline>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        <div v-else class="policy-details-panel placeholder">
          <p>왼쪽에서 정책을 선택해주세요.</p>
        </div>
      </div>
    </div>

    <!-- 새 정책 유형 선택 다이얼로그 -->
    <el-dialog v-model="newPolicyDialogVisible" title="새 정책 생성" width="500px">
      <el-form label-position="top">
        <el-form-item label="생성할 정책 유형을 선택하세요.">
          <el-select v-model="selectedNewPolicyType" style="width: 100%;">
            <el-option label="연차 정책" value="leave"></el-option>
            <el-option label="근무 정책" value="work"></el-option>
            <el-option label="출장 정책" value="trip"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="newPolicyDialogVisible = false">취소</el-button>
        <el-button type="primary" @click="confirmNewPolicy">생성</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Document, Plus } from '@element-plus/icons-vue';

export default {
  name: 'PolicyManagement',
  components: { Document, Plus },
  setup() {
    const router = useRouter();

    const policies = ref([
      {
        id: 1,
        type: 'leave',
        name: '연차 정책',
        target: '전사',
        autoGrant: '매년 1월 1일',
        rules: [
          { condition: '1년 미만', action: '1개월 만근 시 1일 발생' },
          { condition: '1년 이상', action: '15일 부여' },
          { condition: '3년 이상', action: '16일 부여 (매 2년마다 1일 가산)' },
        ]
      },
      {
        id: 2,
        type: 'work',
        name: '기본 근무 정책',
        target: '전사',
        rules: [
          { condition: '근무 시간', action: '09:00 ~ 18:00' },
          { condition: '휴게 시간', action: '12:00 ~ 13:00' },
          { condition: '코어 타임', action: '10:00 ~ 16:00' },
        ]
      },
      {
        id: 3,
        type: 'trip',
        name: '출장 정책',
        target: '영업팀, 마케팅팀',
        rules: [
          { condition: '일일 한도', action: '100,000원' },
          { condition: '필수 제출', action: '영수증, 출장 보고서' },
        ]
      },
    ]);

    const policyTypeNames = {
      leave: '연차 정책',
      work: '근무 정책',
      trip: '출장 정책',
    };

    const selectedPolicyId = ref(1);
    const newPolicyDialogVisible = ref(false);
    const selectedNewPolicyType = ref('leave');

    const groupedPolicies = computed(() => {
      return policies.value.reduce((acc, policy) => {
        (acc[policy.type] = acc[policy.type] || []).push(policy);
        return acc;
      }, {});
    });

    const selectedPolicy = computed(() => 
      policies.value.find(p => p.id === selectedPolicyId.value)
    );

    const handlePolicySelect = (index) => {
      selectedPolicyId.value = parseInt(index, 10);
    };

    const openNewPolicyDialog = () => {
      selectedNewPolicyType.value = 'leave'; // Reset to default
      newPolicyDialogVisible.value = true;
    };

    const confirmNewPolicy = () => {
      if (selectedNewPolicyType.value === 'leave') {
        router.push('/admin/policy-management/leave-editor');
      } else if (selectedNewPolicyType.value === 'work') {
        router.push('/admin/policy-management/work-editor');
      } else if (selectedNewPolicyType.value === 'trip') {
        router.push('/admin/policy-management/trip-editor');
      }
      newPolicyDialogVisible.value = false;
    };

    const editPolicy = (policy) => {
      if (policy.type === 'leave') {
        router.push('/admin/policy-management/leave-editor');
      } else if (policy.type === 'trip') {
        router.push('/admin/policy-management/trip-editor');
      } else if (policy.type === 'work') {
        router.push('/admin/policy-management/work-editor');
      }
      // Add other policy types here in the future
    };

    return {
      policies,
      groupedPolicies,
      policyTypeNames,
      selectedPolicyId,
      selectedPolicy,
      newPolicyDialogVisible,
      selectedNewPolicyType,
      handlePolicySelect,
      openNewPolicyDialog,
      confirmNewPolicy,
      editPolicy,
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