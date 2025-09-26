<template>
  <div class="leave-management">
    <div class="content-card">
      <div class="card-header">
        <h3>관리자 연차 현황</h3>
        <el-button type="primary" @click="exportToExcel">
          <el-icon><Download /></el-icon>
          <span style="margin-left: 8px;">엑셀로 내보내기</span>
        </el-button>
      </div>
      <div class="filter-section">
        <el-input
          v-model="searchQuery"
          placeholder="이름 또는 부서로 검색"
          clearable
          style="width: 240px;"
        >
          <template #prepend>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="leave-table">
        <el-table :data="filteredLeaveData" style="width: 100%">
          <el-table-column prop="employeeName" label="이름" width="150" />
          <el-table-column prop="department" label="부서" width="180" />
          <el-table-column prop="totalLeave" label="총 연차" width="120" />
          <el-table-column prop="usedLeave" label="사용 연차" width="120" />
          <el-table-column prop="remainingLeave" label="잔여 연차" width="120">
            <template #default="scope">
              <span style="font-weight: bold; color: #4f46e5;">{{ scope.row.remainingLeave }}</span>
            </template>
          </el-table-column>
          <el-table-column label="연차 사용률">
            <template #default="scope">
              <el-progress :percentage="scope.row.usageRate" :color="getUsageRateColor(scope.row.usageRate)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import { useSnackbar } from '@/composables/useSnackbar';

export default {
  name: 'LeaveManagement',
  setup() {
    const { success, info } = useSnackbar();

    const searchQuery = ref('');

    const leaveData = ref([
      { id: 1, employeeName: '김철수', department: '개발팀', totalLeave: 15, usedLeave: 5 },
      { id: 2, employeeName: '이영희', department: '디자인팀', totalLeave: 15, usedLeave: 10 },
      { id: 3, employeeName: '박민준', department: '개발팀', totalLeave: 21, usedLeave: 20 },
      { id: 4, employeeName: '최지우', department: '마케팅팀', totalLeave: 18, usedLeave: 7 },
      { id: 5, employeeName: '정다솜', department: '개발팀', totalLeave: 15, usedLeave: 2 },
      { id: 6, employeeName: '홍길동', department: '영업팀', totalLeave: 15, usedLeave: 15 },
    ]);

    const processedLeaveData = computed(() => {
      return leaveData.value.map(item => ({
        ...item,
        remainingLeave: item.totalLeave - item.usedLeave,
        usageRate: Math.round((item.usedLeave / item.totalLeave) * 100)
      }));
    });

    const filteredLeaveData = computed(() => {
      return processedLeaveData.value.filter(item => {
        const matchesSearch = !searchQuery.value || 
                              item.employeeName.includes(searchQuery.value) ||
                              item.department.includes(searchQuery.value);
        return matchesSearch;
      });
    });

    const getUsageRateColor = (rate) => {
      if (rate > 80) return '#f56c6c'; // Danger
      if (rate > 50) return '#e6a23c'; // Warning
      return '#67c23a'; // Success
    };

    const exportToExcel = () => {
      info('연차 현황을 엑셀로 내보냅니다.');
      const worksheet = XLSX.utils.json_to_sheet(filteredLeaveData.value);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '연차 현황');
      XLSX.writeFile(workbook, '연차_현황.xlsx');
      success('엑셀 내보내기가 완료되었습니다.');
    };

    return {
      searchQuery,
      filteredLeaveData,
      getUsageRateColor,
      exportToExcel,
      success, info, // Return snackbar functions
    };
  }
}
</script>

<style scoped>
.leave-management {
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

.filter-section {
  padding: 20px 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  background-color: #f8f9fa;
}

.leave-table {
  padding: 0 24px 24px;
}
</style>
