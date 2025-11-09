<template>
  <div class="leave-management">
    <div class="content-card">
      <div class="card-header">
        <h3>휴가 사용률 현황 (권한에 따라 조회 범위가 결정됩니다)</h3>
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
        <el-select v-model="departmentFilter" placeholder="부서 선택" clearable style="width: 180px;">
          <el-option label="전체" value="" />
          <el-option v-for="dept in uniqueDepartments" :key="dept" :label="dept" :value="dept" />
        </el-select>
        <el-select v-model="policyTypeFilter" placeholder="유형 선택" clearable style="width: 180px;">
          <el-option label="전체" value="" />
          <el-option label="연차유급휴가" value="PTC001" />
          <el-option label="출산전후휴가" value="PTC002" />
          <el-option label="배우자 출산휴가" value="PTC003" />
          <el-option label="육아휴직" value="PTC004" />
          <el-option label="가족돌봄휴가" value="PTC005" />
          <el-option label="생리휴가" value="PTC006" />
        </el-select>
        <el-button @click="fetchLeaveData" :loading="isLoading">
          <el-icon><Refresh /></el-icon>
          <span style="margin-left: 8px;">새로고침</span>
        </el-button>
      </div>
      <div class="leave-table">
        <el-table :data="processedLeaveData" v-loading="isLoading" style="width: 100%">
          <el-table-column prop="employeeName" label="이름" width="150" />
          <el-table-column prop="department" label="부서" width="180" />
          <el-table-column prop="policyTypeName" label="유형" width="150" />
          <el-table-column label="총 부여" width="120" align="right">
            <template #default="scope">
              {{ (scope.row.totalLeave || 0).toFixed(1) }}일
            </template>
          </el-table-column>
          <el-table-column label="사용" width="120" align="right">
            <template #default="scope">
              {{ (scope.row.usedLeave || 0).toFixed(1) }}일
            </template>
          </el-table-column>
          <el-table-column label="잔여" width="120" align="right">
            <template #default="scope">
              <span style="font-weight: bold; color: #4f46e5;">{{ (scope.row.remainingLeave || 0).toFixed(1) }}일</span>
            </template>
          </el-table-column>
          <el-table-column label="사용률" min-width="200">
            <template #default="scope">
              <el-progress :percentage="scope.row.usageRate" :color="getUsageRateColor(scope.row.usageRate)" />
            </template>
          </el-table-column>
        </el-table>
        <div v-if="totalPages > 1" class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="totalElements"
            :page-size="pageSize"
            v-model:current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onActivated, watch } from 'vue';
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
    const departmentFilter = ref('');
    const policyTypeFilter = ref('');
    const isLoading = ref(false);
    const selectedYear = ref(new Date().getFullYear().toString());
    const leaveData = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(20);
    const totalElements = ref(0);

    // 백엔드 API로부터 휴가 데이터 조회 (권한 기반 자동 범위 결정)
    const fetchLeaveData = async () => {
      isLoading.value = true;
      try {
        const response = await getLeaveBalanceStatus({
          year: parseInt(selectedYear.value),
          page: currentPage.value - 1,
          size: pageSize.value,
          searchQuery: searchQuery.value || undefined,
          policyTypeCode: policyTypeFilter.value || undefined,
          yearsOfService: undefined  // 이 화면에서는 근속년수 필터 없음
        });

        // 백엔드 응답을 프론트엔드 형식으로 변환
        const content = response.content || [];
        leaveData.value = content.map((item) => ({
          id: item.memberId,
          employeeName: item.memberName || '-',
          department: item.organizationName || '-',
          policyTypeCode: item.policyTypeCode,
          policyTypeName: item.policyTypeName || '-',
          totalLeave: item.totalGranted || 0,
          usedLeave: item.totalUsed || 0,
        }));

        totalElements.value = response.totalElements || 0;
        success(`휴가 사용률 현황을 조회했습니다. (총 ${totalElements.value}건)`);
      } catch (err) {
        error(err.message || '휴가 사용률 현황을 불러오는 데 실패했습니다.');
        leaveData.value = [];
        totalElements.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    // 고유 부서 목록 추출
    const uniqueDepartments = computed(() => {
      const departments = new Set(leaveData.value.map(item => item.department).filter(d => d !== '-'));
      return Array.from(departments).sort();
    });

    const processedLeaveData = computed(() => {
      return leaveData.value.map(item => ({
        ...item,
        remainingLeave: item.totalLeave - item.usedLeave,
        usageRate: item.totalLeave > 0 ? Math.round((item.usedLeave / item.totalLeave) * 100) : 0
      }));
    });

    const totalPages = computed(() => Math.ceil(totalElements.value / pageSize.value));

    const getUsageRateColor = (rate) => {
      if (rate > 80) return '#f56c6c'; // Danger
      if (rate > 50) return '#e6a23c'; // Warning
      return '#67c23a'; // Success
    };

    const exportToExcel = () => {
      info('휴가 사용률 현황을 엑셀로 내보냅니다.');
      const exportData = processedLeaveData.value.map(item => ({
        이름: item.employeeName,
        부서: item.department,
        유형: item.policyTypeName,
        '총 부여': `${item.totalLeave.toFixed(1)}일`,
        사용: `${item.usedLeave.toFixed(1)}일`,
        잔여: `${item.remainingLeave.toFixed(1)}일`,
        '사용률(%)': item.usageRate
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '휴가 사용률');
      XLSX.writeFile(workbook, `휴가_사용률_${selectedYear.value}.xlsx`);
      success('엑셀 내보내기가 완료되었습니다.');
    };

    const handlePageChange = (page) => {
      currentPage.value = page;
      fetchLeaveData();
    };

    // 컴포넌트 마운트 시 데이터 조회
    onMounted(() => {
      fetchLeaveData();
    });

    // 다른 페이지에서 돌아왔을 때 데이터 갱신
    onActivated(() => {
      fetchLeaveData();
    });

    // 필터 변경 시 첫 페이지로 돌아가고 데이터 재조회
    watch([searchQuery, departmentFilter, policyTypeFilter, selectedYear], () => {
      currentPage.value = 1;
      fetchLeaveData();
    });

    return {
      searchQuery,
      departmentFilter,
      policyTypeFilter,
      selectedYear,
      isLoading,
      uniqueDepartments,
      processedLeaveData,
      getUsageRateColor,
      exportToExcel,
      fetchLeaveData,
      currentPage,
      pageSize,
      totalElements,
      totalPages,
      handlePageChange,
    };
  }
}
</script>

<style scoped>
.leave-management {
  width: 100%;
}

.content-card {
  background: var(--surface-bg);
  border-radius: var(--surface-radius);
  box-shadow: var(--surface-shadow);
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

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>
