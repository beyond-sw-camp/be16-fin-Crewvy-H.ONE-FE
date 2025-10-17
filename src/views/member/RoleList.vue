<template>
  <div class="role-list-page">
    <div class="page-header">
      <h1>역할 목록</h1>
      <el-button type="primary" @click="goToCreateRole">
        <el-icon>
          <Plus />
        </el-icon> 새로운 역할 생성
      </el-button>
    </div>

    <el-row :gutter="24">
      <!-- Left Column: Role Cards -->
      <el-col :span="8">
        <draggable v-model="role" item-key="id" handle=".role-card" @end="handleRoleReorder"
          class="role-cards-container">
          <template #item="{ element }">
            <el-card :key="element.id" class="role-card"
              :class="{ active: selectedRole && selectedRole.id === element.id }" @click="selectRole(element)">
              <div class="role-card-header">
                <span class="role-name">{{ element.name }}</span>
                <span class="member-count">{{ element.memberCount }}명</span>
              </div>
              <p class="role-description">{{ element.description }}</p>
            </el-card>
          </template>
        </draggable>
      </el-col>

      <!-- Right Column: Role Details -->
      <el-col :span="16">
        <el-card class="details-card" v-if="selectedRole">
          <template #header>
            <div class="details-header">
              <h3>{{ selectedRole.name }}</h3>
              <div>
                <el-button type="primary" plain size="small" @click="editRole(selectedRole)">수정</el-button>
                <el-button type="danger" plain size="small" @click="deleteRole(selectedRole)">삭제</el-button>
              </div>
            </div>
          </template>

          <div class="details-section">
            <h4>권한</h4>
            <el-scrollbar max-height="140px">
              <div class="permissions-list">
                <el-tag v-for="permission in selectedRole.permissionList" :key="permission" class="permission-tag">
                  {{ permission }}
                </el-tag>
              </div>
            </el-scrollbar>
          </div>

          <div class="details-section">
            <h4>할당된 멤버 ({{ selectedRole.memberCount }})</h4>
            <el-table :data="selectedRole.memberList" stripe style="width: 100%" height="300">
              <el-table-column prop="name" label="이름"></el-table-column>
              <el-table-column prop="department" label="부서"></el-table-column>
              <el-table-column prop="position" label="직책"></el-table-column>
            </el-table>
          </div>
        </el-card>
        <div v-else class="no-selection">
          <el-empty description="왼쪽에서 역할을 선택하세요." />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessageBox } from 'element-plus'; // ElMessage 임포트 제거
import { useSnackbar } from '@/composables/useSnackbar';
import draggable from 'vuedraggable'; // draggable 임포트
import { Plus } from '@element-plus/icons-vue'; // Plus 아이콘은 이미 사용 중
import roleService from '@/api/roleService'; // roleService 임포트

const router = useRouter();
const { success, error, info } = useSnackbar(); // Destructure success and info as well
const role = ref([]);
const selectedRole = ref(null);

const fetchRole = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const memberId = localStorage.getItem('memberId');
    const memberPositionId = localStorage.getItem('memberPositionId');

    const headers = {
      'Authorization': token ? `Bearer ${token}` : null,
      'X-User-UUID': memberId,
      'X-User-MemberPositionId': memberPositionId
    };

    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/role`, { headers });
    role.value = response.data.data;
    if (role.value.length > 0) {
      selectedRole.value = role.value[0];
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || '역할 목록을 불러오는 데 실패했습니다.';
    error(errorMessage);
    console.error(err);
  }
};

const selectRole = (role) => {
  selectedRole.value = role;
};

const goToCreateRole = () => {
  router.push('/employee/role/create');
};

const editRole = (role) => {
  router.push(`/employee/role/edit/${role.id}`);
};

const deleteRole = (role) => {
  ElMessageBox.confirm(`'${role.name}' 역할을 삭제하시겠습니까?`, '경고', {
    confirmButtonText: '삭제',
    cancelButtonText: '취소',
    type: 'warning'
  }).then(async () => {
    try {
      const memberPositionId = localStorage.getItem('memberPositionId');
      if (!memberPositionId) {
        throw new Error("MemberPositionId not found.");
      }
      await roleService.deleteRole(memberPositionId, role.id);
      success('삭제되었습니다.');
      selectedRole.value = null;
      fetchRole();
    } catch (error) {
      const errorMessage = error.response?.data?.message || '삭제에 실패했습니다.';
      error(errorMessage);
      console.error(error);
    }
  }).catch(() => {
    info('삭제가 취소되었습니다.');
  });
};

const handleRoleReorder = async () => {
  try {
    const roleIds = role.value.map(r => r.id);
    const memberPositionId = localStorage.getItem('memberPositionId'); // memberPositionId 가져오기
    console.log('Reordering roles with:', { memberPositionId, roleIds }); // 디버깅 로그 추가
    if (!memberPositionId) {
      throw new Error("MemberPositionId not found.");
    }
    await roleService.reorderRole(memberPositionId, roleIds);
    success('역할 순서가 변경되었습니다.');
  } catch (err) {
    const errorMessage = err.response?.data?.message || '역할 순서 변경에 실패했습니다.';
    error(errorMessage);
    console.error(err);
  }
};

onMounted(() => {
  fetchRole();
});
</script>

<style scoped>
.role-list-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.header-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.role-cards-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.role-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-radius: 8px;
}

.role-card.active {
  border-color: #4f46e5;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.role-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
}

.member-count {
  font-size: 14px;
  color: #909399;
}

.role-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.details-card {
  height: calc(60vh + 32px);
  border-radius: 8px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-header h3 {
  font-size: 20px;
  font-weight: 600;
}

.details-section {
  margin-bottom: 32px;
}

.details-section:last-child {
  margin-bottom: 0;
}

.details-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.no-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
</style>