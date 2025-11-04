<template>
  <div class="leave-management">
    <div class="content-card">
      <div class="card-header">
        <h3>연차 현황 (권한에 따라 조회 범위가 결정됩니다)</h3>
        <div style="display: flex; gap: 12px;">
          <el-date-picker
            v-model="selectedYear"
            type="year"
            placeholder="연도 선택"
            format="YYYY년"
            value-format="YYYY"
            style="width: 140px;"
            @change="fetchLeaveData"
          />
          <el-button type="primary" @click="exportToExcel">
            <el-icon><Download /></el-icon>
            <span style="margin-left: 8px;">엑셀로 내보내기</span>
          </el-button>
        </div>
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
        <el-button @click="fetchLeaveData" :loading="isLoading">
          <el-icon><Refresh /></el-icon>
          <span style="margin-left: 8px;">새로고침</span>
        </el-button>
      </div>
      <div class="leave-table">
        <el-table :data="filteredLeaveData" v-loading="isLoading" style="width: 100%">
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
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { useSnackbar } from '@/composables/useSnackbar';
import { getLeaveBalanceStatus } from '@/api/attendance';
import { Download, Search, Refresh } from '@element-plus/icons-vue';

export default {
  name: 'LeaveManagement',
  components: { Download, Search, Refresh },
  setup() {
    const { success, info, error } = useSnackbar();

    const searchQuery = ref('');
    const isLoading = ref(false);
    const selectedYear = ref(new Date().getFullYear().toString());
    const leaveData = ref([]);

    // 백엔드 API로부터 연차 데이터 조회 (권한 기반 자동 범위 결정)
    const fetchLeaveData = async () => {
      isLoading.value = true;
      try {
        const response = await getLeaveBalanceStatus({ year: parseInt(selectedYear.value) });

        // 백엔드 응답을 프론트엔드 형식으로 변환
        leaveData.value = response.map((item) => ({
          id: item.memberId,
          employeeName: item.memberName || '-',
          department: item.organizationName || '-',
          totalLeave: item.totalGranted || 0,
          usedLeave: item.totalUsed || 0,
        }));

        success(`연차 현황을 조회했습니다. (${response.length}명)`);
      } catch (err) {
        error(err.message || '연차 현황을 불러오는 데 실패했습니다.');
        leaveData.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const processedLeaveData = computed(() => {
      return leaveData.value.map(item => ({
        ...item,
        remainingLeave: item.totalLeave - item.usedLeave,
        usageRate: item.totalLeave > 0 ? Math.round((item.usedLeave / item.totalLeave) * 100) : 0
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

    // 컴포넌트 마운트 시 데이터 조회
    onMounted(() => {
      fetchLeaveData();
    });

    return {
      searchQuery,
      selectedYear,
      isLoading,
      filteredLeaveData,
      getUsageRateColor,
      exportToExcel,
      fetchLeaveData,
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
