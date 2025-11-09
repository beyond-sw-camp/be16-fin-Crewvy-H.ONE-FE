<template>
  <div class="balance-management">
    <div class="content-card">
      <div class="card-header">
        <h3>연차 잔고 관리</h3>
        <div class="header-actions">
          <el-select v-model="selectedYear" placeholder="연도 선택" style="width: 150px; margin-right: 12px;" @change="fetchBalances">
            <el-option
              v-for="year in availableYears"
              :key="year"
              :label="`${year}년`"
              :value="year"
            ></el-option>
          </el-select>
          <el-button type="primary" @click="exportToExcel">
            <el-icon><Download /></el-icon>
            <span style="margin-left: 8px;">엑셀로 내보내기</span>
          </el-button>
        </div>
      </div>
      <div class="filter-section">
        <el-select v-model="selectedDepartment" placeholder="부서 필터" clearable style="width: 200px;">
          <el-option label="전체 부서" value=""></el-option>
          <el-option
            v-for="dept in departments"
            :key="dept"
            :label="dept"
            :value="dept"
          ></el-option>
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="이름으로 검색"
          clearable
          style="width: 240px;"
        >
          <template #prepend>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="balance-table">
        <el-table :data="filteredBalances" v-loading="isLoading" style="width: 100%" empty-text="조회된 데이터가 없습니다">
          <el-table-column prop="memberName" label="이름" width="120"></el-table-column>
          <el-table-column prop="organizationName" label="부서" width="150"></el-table-column>
          <el-table-column prop="titleName" label="직책" width="120"></el-table-column>
          <el-table-column prop="policyTypeName" label="정책 유형" width="150"></el-table-column>
          <el-table-column prop="totalGranted" label="총 부여" align="right" width="100">
            <template #default="scope">
              {{ scope.row.totalGranted || 0 }}일
            </template>
          </el-table-column>
          <el-table-column prop="totalUsed" label="사용" align="right" width="100">
            <template #default="scope">
              {{ scope.row.totalUsed || 0 }}일
            </template>
          </el-table-column>
          <el-table-column prop="remainingBalance" label="잔여" align="right" width="100">
            <template #default="scope">
              <span style="font-weight: bold; color: #4f46e5;">{{ scope.row.remainingBalance || 0 }}일</span>
            </template>
          </el-table-column>
          <el-table-column label="상태" width="110" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.isUsable ? 'success' : 'danger'" size="small">
                {{ scope.row.isUsable ? '사용 가능' : '사용 불가' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="유급 여부" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.isPaid ? 'success' : 'info'" size="small">
                {{ scope.row.isPaid ? '유급' : '무급' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="작업" width="200" align="center" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="adjustBalance(scope.row)">잔고 조정</el-button>
              <el-button size="small" type="info" plain @click="viewHistory(scope.row)">이력 보기</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getLeaveBalanceStatus } from '@/api/attendance';
import { useSnackbar } from '@/composables/useSnackbar';
import { Download, Search } from '@element-plus/icons-vue';

export default {
  name: 'BalanceManagement',
  components: { Download, Search },
  setup() {
    const { success, error } = useSnackbar();

    const balances = ref([]);
    const isLoading = ref(false);
    const searchQuery = ref('');
    const selectedDepartment = ref('');
    const selectedYear = ref(new Date().getFullYear());

    // 최근 5년 연도 옵션
    const availableYears = computed(() => {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, i) => currentYear - i);
    });

    // 부서 목록 (데이터에서 추출)
    const departments = computed(() => {
      const depts = new Set(balances.value.map(b => b.organizationName).filter(Boolean));
      return Array.from(depts);
    });

    // 필터링된 잔액 목록
    const filteredBalances = computed(() => {
      return balances.value.filter(balance => {
        const matchesSearch = !searchQuery.value ||
          balance.memberName?.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesDept = !selectedDepartment.value ||
          balance.organizationName === selectedDepartment.value;
        return matchesSearch && matchesDept;
      });
    });

    const fetchBalances = async () => {
      isLoading.value = true;
      try {
        const data = await getLeaveBalanceStatus({ year: selectedYear.value });
        balances.value = data || [];
      } catch (err) {
        error(err.message || '잔고 데이터를 불러오는 데 실패했습니다.');
        balances.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const exportToExcel = () => {
      // TODO: 엑셀 내보내기 구현
      console.log('Exporting to Excel...');
      success('엑셀 내보내기 기능은 준비 중입니다.');
    };

    const adjustBalance = (row) => {
      // TODO: 잔고 조정 모달 구현
      console.log('Adjusting balance for', row.memberName);
      success(`${row.memberName}님의 잔고 조정 기능은 준비 중입니다.`);
    };

    const viewHistory = (row) => {
      // TODO: 이력 보기 모달 구현
      console.log('Viewing history for', row.memberName);
      success(`${row.memberName}님의 이력 보기 기능은 준비 중입니다.`);
    };

    onMounted(() => {
      fetchBalances();
    });

    return {
      balances,
      isLoading,
      searchQuery,
      selectedDepartment,
      selectedYear,
      availableYears,
      departments,
      filteredBalances,
      fetchBalances,
      exportToExcel,
      adjustBalance,
      viewHistory,
    };
  }
};
</script>

<style scoped>
.balance-management {
  max-width: 1400px;
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
  align-items: center;
}
.filter-section {
  padding: 20px 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  background-color: #f8f9fa;
}
.balance-table {
  padding: 0 24px 24px;
}
</style>
