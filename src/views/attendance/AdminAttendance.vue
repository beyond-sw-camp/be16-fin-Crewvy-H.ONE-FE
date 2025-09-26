<template>
  <div class="admin-attendance">
    <!-- 대시보드 통계 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-label">총원</div>
          <div class="stat-number">{{ summaryStats.total }}</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-content">
          <div class="stat-label">정상 출근</div>
          <div class="stat-number">{{ summaryStats.onTime }}</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-content">
          <div class="stat-label">지각</div>
          <div class="stat-number">{{ summaryStats.late }}</div>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-content">
          <div class="stat-label">휴가/재택</div>
          <div class="stat-number">{{ summaryStats.leave }}</div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- 근태 현황 목록 -->
      <div class="content-card table-card">
        <div class="card-header">
          <h3>근태 현황 목록</h3>
          <el-button type="primary" @click="exportToExcel">
            <el-icon><Download /></el-icon>
            <span style="margin-left: 8px;">엑셀로 내보내기</span>
          </el-button>
        </div>
        <div class="filter-section">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="날짜 선택"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
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
        <div class="attendance-table">
          <el-table :data="filteredAttendanceData" style="width: 100%">
            <el-table-column prop="employeeName" label="이름" width="120" />
            <el-table-column prop="department" label="부서" width="150" />
            <el-table-column prop="date" label="날짜" width="150" />
            <el-table-column prop="status" label="상태" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="clockIn" label="출근 시간" width="150" />
            <el-table-column prop="clockOut" label="퇴근 시간" width="150" />
            <el-table-column prop="workHours" label="근무 시간" />
            <el-table-column label="작업" width="120">
              <template #default="scope">
                <el-button size="small" @click="handleEdit(scope.row)">수정</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 일일 근태 차트 -->
      <div class="content-card chart-card">
         <div class="card-header">
          <h3>일일 근태 요약</h3>
        </div>
        <div class="chart-container">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <!-- 수정 다이얼로그 -->
    <el-dialog v-model="editDialogVisible" title="근태 기록 수정" width="500px">
      <el-form :model="editingRecord" label-width="100px" v-if="editingRecord">
        <el-form-item label="이름">
          <el-input v-model="editingRecord.employeeName" disabled />
        </el-form-item>
        <el-form-item label="부서">
          <el-input v-model="editingRecord.department" disabled />
        </el-form-item>
        <el-form-item label="날짜">
          <el-input v-model="editingRecord.date" disabled />
        </el-form-item>
        <el-form-item label="상태">
          <el-select v-model="editingRecord.status" placeholder="상태 선택">
            <el-option label="출근" value="출근" />
            <el-option label="지각" value="지각" />
            <el-option label="휴가" value="휴가" />
            <el-option label="결근" value="결근" />
            <el-option label="재택" value="재택" />
          </el-select>
        </el-form-item>
        <el-form-item label="출근 시간">
          <el-time-picker v-model="editingRecord.clockIn" placeholder="출근 시간" format="HH:mm" value-format="HH:mm" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="퇴근 시간">
          <el-time-picker v-model="editingRecord.clockOut" placeholder="퇴근 시간" format="HH:mm" value-format="HH:mm" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">취소</el-button>
          <el-button type="primary" @click="handleSave">저장</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { useSnackbar } from '@/composables/useSnackbar';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'AdminAttendance',
  components: { Bar },
  setup() {
    const { success, info, error } = useSnackbar();

    const selectedDate = ref(new Date().toISOString().slice(0, 10));
    const searchQuery = ref('');
    const editDialogVisible = ref(false);
    const editingRecord = ref(null);

    const attendanceData = ref([
      { id: 1, employeeName: '김철수', department: '개발팀', date: '2025-09-24', status: '출근', clockIn: '09:01', clockOut: '18:05', workHours: '8시간 4분' },
      { id: 2, employeeName: '이영희', department: '디자인팀', date: '2025-09-24', status: '휴가', clockIn: '-', clockOut: '-', workHours: '-' },
      { id: 3, employeeName: '박민준', department: '개발팀', date: '2025-09-24', status: '지각', clockIn: '09:32', clockOut: '18:30', workHours: '7시간 58분' },
      { id: 4, employeeName: '최지우', department: '마케팅팀', date: '2025-09-24', status: '재택', clockIn: '08:55', clockOut: '17:58', workHours: '8시간 3분' },
      { id: 5, employeeName: '정다솜', department: '개발팀', date: '2025-09-24', status: '출근', clockIn: '08:58', clockOut: '18:02', workHours: '8시간 4분' },
      { id: 6, employeeName: '홍길동', department: '영업팀', date: '2025-09-24', status: '결근', clockIn: '-', clockOut: '-', workHours: '-' },
    ]);

    const filteredAttendanceData = computed(() => {
      return attendanceData.value.filter(item => {
        const matchesDate = !selectedDate.value || item.date === selectedDate.value;
        const matchesSearch = !searchQuery.value || 
                              item.employeeName.includes(searchQuery.value) ||
                              item.department.includes(searchQuery.value);
        return matchesDate && matchesSearch;
      });
    });

    const summaryStats = computed(() => {
        const data = filteredAttendanceData.value;
        return {
            total: data.length,
            onTime: data.filter(item => item.status === '출근').length,
            late: data.filter(item => item.status === '지각').length,
            leave: data.filter(item => item.status === '휴가' || item.status === '재택').length,
        };
    });

    const chartData = computed(() => ({
      labels: ['출근', '지각', '휴가', '재택', '결근'],
      datasets: [{
        label: '직원 수',
        backgroundColor: ['#67C23A', '#E6A23C', '#909399', '#409EFF', '#F56C6C'],
        data: [
          attendanceData.value.filter(item => item.status === '출근').length,
          attendanceData.value.filter(item => item.status === '지각').length,
          attendanceData.value.filter(item => item.status === '휴가').length,
          attendanceData.value.filter(item => item.status === '재택').length,
          attendanceData.value.filter(item => item.status === '결근').length,
        ]
      }]
    }));

    const chartOptions = ref({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    });

    const getStatusTagType = (status) => {
      switch (status) {
        case '출근': return 'success';
        case '지각': return 'warning';
        case '휴가': return 'info';
        case '결근': return 'danger';
        case '재택': return 'primary';
        default: return '';
      }
    };

    const handleEdit = (row) => {
      editingRecord.value = { ...row };
      editDialogVisible.value = true;
    };

    const handleSave = () => {
      if (editingRecord.value) {
        const index = attendanceData.value.findIndex(item => item.id === editingRecord.value.id);
        if (index !== -1) {
          attendanceData.value[index] = editingRecord.value;
          success('근태 기록이 성공적으로 수정되었습니다.');
        } else {
          error('근태 기록 수정에 실패했습니다.');
        }
        editDialogVisible.value = false;
        editingRecord.value = null;
      }
    };
    
    const exportToExcel = () => {
      info('근태 현황을 엑셀로 내보냅니다.');
      const worksheet = XLSX.utils.json_to_sheet(filteredAttendanceData.value);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '근태 현황');
      XLSX.writeFile(workbook, '근태_현황.xlsx');
      success('엑셀 내보내기가 완료되었습니다.');
    };

    return {
      selectedDate,
      searchQuery,
      filteredAttendanceData,
      editDialogVisible,
      editingRecord,
      summaryStats,
      chartData,
      chartOptions,
      getStatusTagType,
      handleEdit,
      handleSave,
      exportToExcel,
    };
  }
}
</script>

<style scoped>
.admin-attendance {
  max-width: 1600px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #dcdfe6;
}

.stat-card.success { border-left-color: #67c23a; }
.stat-card.warning { border-left-color: #e6a23c; }
.stat-card.info { border-left-color: #409eff; }

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.content-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 24px;
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

.attendance-table {
  padding: 0 24px 24px;
}

.chart-card {
  height: fit-content;
}

.chart-container {
  padding: 24px;
  height: 350px;
}
</style>
