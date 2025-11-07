<template>
  <div class="team-attendance-status">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>팀원 근태 현황</h2>
          <el-button @click="fetchTeamStatus" :loading="isLoading">
            <el-icon><Refresh /></el-icon>
            <span style="margin-left: 8px;">새로고침</span>
          </el-button>
        </div>
      </template>

      <p class="page-description">
        현재 나의 권한 범위 내에 있는 직원들의 실시간 근태 현황입니다.
      </p>

      <el-table
        :data="teamMembers"
        v-loading="isLoading"
        border
        stripe
        style="width: 100%; margin-top: 20px;"
        empty-text="데이터가 없거나 조회 권한이 없습니다."
      >
        <el-table-column prop="name" label="직원 이름" min-width="120"></el-table-column>
        <el-table-column prop="title" label="직책" min-width="120"></el-table-column>
        <el-table-column prop="status" label="현재 상태" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="clockInTime" label="출근 시간" min-width="120" align="center"></el-table-column>
        <el-table-column prop="effectivePolicy" label="적용 정책" min-width="200"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSnackbar } from '@/composables/useSnackbar';
import { Refresh } from '@element-plus/icons-vue';
import { getTeamAttendanceStatus } from '@/api/attendance';

const teamMembers = ref([]);
const isLoading = ref(false);
const { success, error } = useSnackbar();

const fetchTeamStatus = async () => {
  isLoading.value = true;
  try {
    const response = await getTeamAttendanceStatus();

    if (response && Array.isArray(response)) {
      teamMembers.value = response;
      success(`팀원 현황을 조회했습니다. (${response.length}명)`);
    } else {
      teamMembers.value = [];
      success('팀원 현황을 조회했습니다. (0명)');
    }

  } catch (err) {
    error(err.message || '팀원 근태 현황 조회에 실패했습니다.');
    teamMembers.value = [];
  } finally {
    isLoading.value = false;
  }
};

const getStatusTag = (status) => {
  if (status.includes('정상')) return 'success';
  if (status.includes('지각')) return 'warning';
  if (status.includes('휴가')) return 'info';
  return '';
};

onMounted(() => {
  fetchTeamStatus();
});
</script>

<style scoped>
.team-attendance-status {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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
.page-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 20px;
}
</style>
