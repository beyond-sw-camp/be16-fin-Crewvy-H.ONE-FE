<template>
  <div class="role-list-page">
    <div class="page-header">
      <h1>역할 목록</h1>
      <el-button type="primary" @click="goToCreateRole">
        <el-icon><Plus /></el-icon> 새로운 역할 생성
      </el-button>
    </div>

    <el-row :gutter="24">
      <!-- Left Column: Role Cards -->
      <el-col :span="8">
        <div class="role-cards-container">
          <el-card
            v-for="role in role"
            :key="role.id"
            class="role-card"
            :class="{ active: selectedRole && selectedRole.id === role.id }"
            @click="selectRole(role)"
          >
            <div class="role-card-header">
              <span class="role-name">{{ role.name }}</span>
              <span class="member-count">{{ role.memberCount }}명</span>
            </div>
            <p class="role-description">{{ role.description }}</p>
          </el-card>
        </div>
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
            <div class="permissions-list">
              <el-tag v-for="permission in selectedRole.permissionList" :key="permission" class="permission-tag">
                {{ permission }}
              </el-tag>
            </div>
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
import { ElMessageBox } from 'element-plus';
import { useSnackbar } from '@/composables/useSnackbar';

const router = useRouter();
const { success, error, info } = useSnackbar(); // Destructure success and info as well
const role = ref([]);
const selectedRole = ref(null);

const fetchRole = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Authorization': token ? `Bearer ${token}` : null };
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
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': token ? `Bearer ${token}` : null };
      await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/member/role/${role.id}`, { headers });
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

onMounted(() => {
  fetchRole();
});
</script>

<style scoped>
.role-list-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.page-header p {
    font-size: 14px;
    color: #606266;
    margin-top: 8px;
    margin-bottom: 16px;
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
}

.role-card.active {
    border-color: #4f46e5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.role-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
