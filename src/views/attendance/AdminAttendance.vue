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
          <div class="stat-label">휴가</div>
          <div class="stat-number">{{ summaryStats.leave }}</div>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="content-card">
      <el-tab-pane label="근태 현황" name="status">
        <div v-if="activeTab === 'status'">
          <!-- 일일 근태 차트 -->
          <div class="chart-card">
            <div class="card-header">
              <h3>일일 근태 요약</h3>
            </div>
            <div class="chart-container" v-if="activeTab === 'status'">
              <Bar ref="barChart" :key="chartKey" :data="chartData" :options="chartOptions" />
            </div>
          </div>

          <!-- 근태 현황 목록 -->
          <div class="table-card">
            <div class="card-header">
              <h3>근태 현황 (권한에 따라 조회 범위가 결정됩니다)</h3>
              <div style="display: flex; gap: 12px;">
                <el-button type="warning" @click="runAttendanceCorrection" :loading="correctionLoading">
                  <el-icon><Tools /></el-icon>
                  <span style="margin-left: 8px;">근태 보정 배치 실행</span>
                </el-button>
                <el-button type="primary" @click="exportToExcel">
                  <el-icon><Download /></el-icon>
                  <span style="margin-left: 8px;">엑셀로 내보내기</span>
                </el-button>
              </div>
            </div>
            <div class="filter-section">
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="날짜 선택"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="fetchAttendanceData"
                :cell-class-name="getCellClassName"
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
              <el-button @click="fetchAttendanceData" :loading="isLoading">
                <el-icon><Refresh /></el-icon>
                <span style="margin-left: 8px;">새로고침</span>
              </el-button>
            </div>
            <div class="attendance-table">
              <el-table :data="filteredAttendanceData" v-loading="isLoading" style="width: 100%">
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
                <el-table-column prop="clockIn" label="출근 시간" width="120" />
                <el-table-column prop="clockOut" label="퇴근 시간" width="120" />
                <el-table-column prop="workHours" label="기본 근무" width="120" />
                <el-table-column prop="extraWorkHours" label="추가 근무" width="120" />
                <el-table-column prop="totalWorkHours" label="총 근무" width="120" />
                <el-table-column label="작업" width="120">
                  <template #default="scope">
                    <el-button size="small" @click="handleEdit(scope.row)">수정</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="attendanceTotalPages > 1" class="pagination-container">
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :total="filteredAttendanceData.length"
                  :page-size="attendancePageSize"
                  v-model:current-page="attendanceCurrentPage"
                  @current-change="handleAttendancePageChange"
                />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="휴가 현황" name="balance">
        <div v-if="activeTab === 'balance'">
          <div class="table-card">
            <div class="card-header">
              <h3>휴가 현황 관리</h3>
              <div style="display: flex; gap: 12px;">
                <el-button type="info" @click="goToLeaveDetail">
                  <el-icon><View /></el-icon>
                  <span style="margin-left: 8px;">휴가현황 상세보기</span>
                </el-button>
                <el-button type="success" @click="runMonthlyAccrualBatch" :loading="monthlyBatchLoading" :disabled="!isMonthlyBatchEnabled">
                  <el-icon><Calendar /></el-icon>
                  <span style="margin-left: 8px;">월별 연차 배치 실행</span>
                </el-button>
                <el-button type="primary" @click="exportBalanceToExcel">
                  <el-icon><Download /></el-icon>
                  <span style="margin-left: 8px;">엑셀로 내보내기</span>
                </el-button>
              </div>
            </div>

            <div class="filter-section">
              <el-select v-model="policyTypeFilter" placeholder="유형 선택" clearable style="width: 180px;">
                <el-option label="전체" value="" />
                <el-option label="연차유급휴가" value="PTC001" />
                <el-option label="출산전후휴가" value="PTC002" />
                <el-option label="배우자 출산휴가" value="PTC003" />
                <el-option label="육아휴직" value="PTC004" />
                <el-option label="가족돌봄휴가" value="PTC005" />
                <el-option label="생리휴가" value="PTC006" />
              </el-select>
              <el-select v-model="yearsOfServiceFilter" placeholder="근속년수" clearable style="width: 150px;">
                <el-option label="전체" value="" />
                <el-option label="1년 미만" value="<1" />
                <el-option label="1년 이상" value=">=1" />
                <el-option label="3년 이상" value=">=3" />
                <el-option label="5년 이상" value=">=5" />
                <el-option label="10년 이상" value=">=10" />
              </el-select>
              <el-input
                v-model="balanceSearchQuery"
                placeholder="이름 또는 부서로 검색"
                clearable
                style="width: 240px;"
              >
                <template #prepend>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button @click="fetchBalanceData" :loading="balanceLoading">
                <el-icon><Refresh /></el-icon>
                <span style="margin-left: 8px;">새로고침</span>
              </el-button>
            </div>

            <div class="balance-table">
              <el-table :data="balanceData" v-loading="balanceLoading" style="width: 100%">
                <el-table-column prop="memberName" label="이름" width="120" />
                <el-table-column prop="organizationName" label="부서" width="150" />
                <el-table-column prop="titleName" label="직책" width="120" />
                <el-table-column label="입사일" width="120">
                  <template #default="scope">
                    {{ scope.row.joinDate || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="근속년수" width="100">
                  <template #default="scope">
                    {{ calculateYearsOfService(scope.row.joinDate) }}년
                  </template>
                </el-table-column>
                <el-table-column label="전월 근속률" width="120" align="center">
                  <template #default="scope">
                    <span :class="{ 'low-attendance': scope.row.previousMonthAttendanceRate < 80 }">
                      {{ scope.row.previousMonthAttendanceRate ? scope.row.previousMonthAttendanceRate.toFixed(1) : '0.0' }}%
                    </span>
                    <el-tag v-if="scope.row.previousMonthAttendanceRate < 80" type="danger" size="small" style="margin-left: 4px;">미달</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="policyTypeName" label="유형" width="140" />
                <el-table-column label="부여" width="80" align="right">
                  <template #default="scope">
                    {{ (scope.row.totalGranted || 0).toFixed(1) }}일
                  </template>
                </el-table-column>
                <el-table-column label="사용" width="80" align="right">
                  <template #default="scope">
                    {{ (scope.row.totalUsed || 0).toFixed(1) }}일
                  </template>
                </el-table-column>
                <el-table-column label="잔여" width="80" align="right">
                  <template #default="scope">
                    {{ (scope.row.remainingBalance || 0).toFixed(1) }}일
                  </template>
                </el-table-column>
                <el-table-column label="상태" width="100">
                  <template #default="scope">
                    <el-tag v-if="scope.row.isUsable === false" type="danger" size="small">사용불가</el-tag>
                    <el-tag v-else type="success" size="small">정상</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="작업" width="120" fixed="right">
                  <template #default="scope">
                    <el-button size="small" @click="handleBalanceEdit(scope.row)">수정</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="balanceTotalPages > 1" class="pagination-container">
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :total="balanceTotalElements"
                  :page-size="balancePageSize"
                  v-model:current-page="balanceCurrentPage"
                  @current-change="handleBalancePageChange"
                />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
                </el-tabs>
            
                <!-- 연차 수정 다이얼로그 -->
                <el-dialog v-model="balanceEditDialogVisible" title="연차 수정" width="500px">
                  <el-form :model="editingBalance" label-width="120px" v-if="editingBalance">
                    <el-form-item label="이름">
                      <el-input v-model="editingBalance.memberName" disabled />
                    </el-form-item>
                    <el-form-item label="부서">
                      <el-input v-model="editingBalance.organizationName" disabled />
                    </el-form-item>
                    <el-form-item label="유형">
                      <el-input v-model="editingBalance.policyTypeName" disabled />
                    </el-form-item>
                    <el-form-item label="년도">
                      <el-input v-model="editingBalance.year" disabled />
                    </el-form-item>
                    <el-form-item label="부여 일수">
                      <el-input-number v-model="editingBalance.totalGranted" :min="0" :max="365" :precision="1" style="width: 100%;" />
                    </el-form-item>
                    <el-form-item label="사용 일수">
                      <el-input-number v-model="editingBalance.totalUsed" :min="0" :max="365" :precision="1" style="width: 100%;" />
                    </el-form-item>
                    <el-form-item label="잔여 일수">
                      <el-input :value="(editingBalance.totalGranted - editingBalance.totalUsed).toFixed(1)" disabled />
                    </el-form-item>
                    <el-form-item label="사용 가능">
                      <el-switch v-model="editingBalance.isUsable" />
                    </el-form-item>
                  </el-form>
                  <template #footer>
                    <span class="dialog-footer">
                      <el-button @click="balanceEditDialogVisible = false">취소</el-button>
                      <el-button type="primary" @click="handleBalanceSave">저장</el-button>
                    </span>
                  </template>
                </el-dialog>

                <!-- 근태 기록 수정 다이얼로그 -->
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
                        <el-option label="정상 출근" value="정상 출근" />
                        <el-option label="지각" value="지각" />
                        <el-option label="조퇴" value="조퇴" />
                        <el-option label="연차" value="연차" />
                        <el-option label="오전 반차" value="오전 반차" />
                        <el-option label="오후 반차" value="오후 반차" />
                        <el-option label="출장" value="출장" />
                        <el-option label="결근" value="결근" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="출근 시간">
                      <el-time-picker
                        v-model="editingRecord.clockIn"
                        placeholder="출근 시간"
                        format="HH:mm"
                        value-format="HH:mm"
                        clearable
                        style="width: 100%;"
                      />
                    </el-form-item>
                    <el-form-item label="퇴근 시간">
                      <el-time-picker
                        v-model="editingRecord.clockOut"
                        placeholder="퇴근 시간"
                        format="HH:mm"
                        value-format="HH:mm"
                        clearable
                        style="width: 100%;"
                      />
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
            import { ref, computed, onMounted, nextTick, watch} from 'vue';
            import { useRouter } from 'vue-router';
            import * as XLSX from 'xlsx';
            import { Bar } from 'vue-chartjs';
            import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
            import { useSnackbar } from '@/composables/useSnackbar';
            import { getTeamAttendanceStatus, runAnnualLeaveAccrualBatch as runBatchAPI, getLeaveBalanceStatus, updateDailyAttendance, runAttendanceCorrectionBatch, updateMemberBalance, getHolidays } from '@/api/attendance';
            import { Download, Search, Refresh, Tools, Calendar, View } from '@element-plus/icons-vue';

            ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

            export default {
              name: 'AdminAttendance',
              components: { Bar, Download, Search, Refresh, Tools, Calendar, View },
              setup() {
                const router = useRouter();
                const { success, info, error } = useSnackbar();

                const barChart = ref(null);
                const chartKey = ref(0);
                const activeTab = ref('status');
                const batchLoading = ref(false);
                const correctionLoading = ref(false);
                const monthlyBatchLoading = ref(false);

                // 휴가 현황 관련 상태
                const balanceData = ref([]);
                const balanceLoading = ref(false);
                const balanceSearchQuery = ref('');
                const policyTypeFilter = ref('');  // 유형 필터
                const yearsOfServiceFilter = ref('');
                const balanceEditDialogVisible = ref(false);
                const editingBalance = ref(null);
                const balanceCurrentPage = ref(1);
                const balancePageSize = ref(20);
                const balanceTotalElements = ref(0);
    const selectedDate = ref(new Date().toISOString().slice(0, 10));
    const searchQuery = ref('');
    const editDialogVisible = ref(false);
    const editingRecord = ref(null);
    const isLoading = ref(false);

    const attendanceData = ref([]);
    const attendanceCurrentPage = ref(1);
    const attendancePageSize = ref(20);
    const attendanceTotalElements = ref(0);

    // 공휴일 데이터
    const holidays = ref([]);

    const filteredAttendanceData = computed(() => {
      return attendanceData.value.filter(item => {
        const matchesSearch = !searchQuery.value ||
                              item.employeeName.includes(searchQuery.value) ||
                              item.department.includes(searchQuery.value);
        return matchesSearch;
      });
    });

    const attendanceTotalPages = computed(() => Math.ceil(attendanceTotalElements.value / attendancePageSize.value));

    const summaryStats = computed(() => {
        const data = filteredAttendanceData.value;
        return {
            total: data.length,
            onTime: data.filter(item => item.status === '정상 출근').length,
            late: data.filter(item => item.status === '지각').length,
            leave: data.filter(item => item.status.includes('휴가') || item.status.includes('연차') || item.status.includes('반차')).length,
        };
    });

    const chartData = computed(() => ({
      labels: ['정상 출근', '지각', '조퇴', '휴가/연차', '출장', '결근', '미출근'],
      datasets: [{
        label: '직원 수',
        backgroundColor: ['#67C23A', '#E6A23C', '#F39C12', '#909399', '#17A2B8', '#F56C6C', '#6C757D'],
        data: [
          attendanceData.value.filter(item => item.status === '정상 출근').length,
          attendanceData.value.filter(item => item.status === '지각').length,
          attendanceData.value.filter(item => item.status === '조퇴').length,
          attendanceData.value.filter(item => item.status.includes('휴가') || item.status.includes('연차') || item.status.includes('반차')).length,
          attendanceData.value.filter(item => item.status === '출장').length,
          attendanceData.value.filter(item => item.status === '결근').length,
          attendanceData.value.filter(item => item.status === '미출근').length,
        ]
      }]
    }));

    const chartOptions = ref({
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 200, // Chart.js 덜 터지게
      animation: {
        duration: 0
      },
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45,
            font: {
              size: 11
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: {
              size: 11
            }
          }
        }
      }
    });

    watch(activeTab, async (tab) => {
      if (tab === 'status') {
        await nextTick();
        if (barChart.value?.chartInstance) {
          barChart.value.chartInstance.resize();
        } else {
          window.dispatchEvent(new Event('resize'));
        }
      }
    });

    const getStatusTagType = (status) => {
      if (status === '정상 출근') return 'success';
      if (status === '지각') return 'warning';
      if (status === '조퇴') return 'warning';
      if (status.includes('휴가') || status.includes('연차') || status.includes('반차')) return 'info';
      if (status === '출장') return '';
      if (status === '결근') return 'danger';
      if (status === '미출근') return '';
      return '';
    };

    const handleEdit = (row) => {
      editingRecord.value = {
        ...row,
        // time-picker는 "-" 문자열을 처리하지 못하므로 null로 변환
        clockIn: row.clockIn === '-' ? null : row.clockIn,
        clockOut: row.clockOut === '-' ? null : row.clockOut
      };
      editDialogVisible.value = true;
    };

    const handleSave = async () => {
      if (!editingRecord.value) return;

      // dailyAttendanceId가 없으면 근태 기록이 없는 것이므로 수정 불가
      if (!editingRecord.value.dailyAttendanceId) {
        error('근태 기록이 없어 수정할 수 없습니다.');
        return;
      }

      try {
        // 상태 문자열을 AttendanceStatus 코드값으로 매핑
        const statusMap = {
          '정상 출근': 'AS001',        // NORMAL_WORK
          '지각': 'AS001',              // NORMAL_WORK (지각은 isLate=true로 표현)
          '조퇴': 'AS001',              // NORMAL_WORK (조퇴는 isEarlyLeave=true로 표현)
          '연차': 'AS101',              // ANNUAL_LEAVE
          '오전 반차': 'AS102',         // HALF_DAY_AM
          '오후 반차': 'AS103',         // HALF_DAY_PM
          '출장': 'AS002',              // BUSINESS_TRIP
          '결근': 'AS201'               // ABSENT
        };

        // 시간을 LocalDateTime 형식으로 변환
        const date = editingRecord.value.date;
        const clockInDateTime = editingRecord.value.clockIn
          ? `${date}T${editingRecord.value.clockIn}:00`
          : null;
        const clockOutDateTime = editingRecord.value.clockOut
          ? `${date}T${editingRecord.value.clockOut}:00`
          : null;

        // 백엔드 API 요청 데이터
        const requestData = {
          firstClockIn: clockInDateTime,
          lastClockOut: clockOutDateTime,
          status: statusMap[editingRecord.value.status] || 'AS001',
          isLate: editingRecord.value.status === '지각',
          isEarlyLeave: editingRecord.value.status === '조퇴',
          adminComment: '관리자 수정'
        };

        // 백엔드 API 호출
        await updateDailyAttendance(editingRecord.value.dailyAttendanceId, requestData);

        // 성공 시 로컬 데이터 업데이트
        const index = attendanceData.value.findIndex(item => item.id === editingRecord.value.id);
        if (index !== -1) {
          attendanceData.value[index] = {
            ...editingRecord.value,
            clockIn: editingRecord.value.clockIn || '-',
            clockOut: editingRecord.value.clockOut || '-'
          };
        }

        success('근태 기록이 성공적으로 수정되었습니다.');
        editDialogVisible.value = false;
        editingRecord.value = null;

        // 데이터 새로고침
        fetchAttendanceData();

      } catch (err) {
        error(err.message || '근태 기록 수정에 실패했습니다.');
      }
    };

    // 주말 체크 함수
    const isWeekend = (date) => {
      const day = date.getDay();
      return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
    };

    // 공휴일 체크 함수
    const isHoliday = (date) => {
      const dateStr = date.toISOString().split('T')[0];
      return holidays.value.some(h => h.date === dateStr);
    };

    // 캘린더 셀 클래스 설정 (주말: 빨간 숫자, 공휴일: 빨간 원)
    const getCellClassName = (date) => {
      const targetDate = new Date(date);
      if (isWeekend(targetDate)) {
        return 'weekend-cell'; // 주말 (숫자만 빨간색)
      }
      if (isHoliday(targetDate)) {
        return 'holiday-cell'; // 공휴일 (선택 시 빨간 원)
      }
      return '';
    };

    // 공휴일 조회 (1년치)
    const fetchHolidays = async () => {
      try {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), 0, 1); // 올해 1월 1일
        const endDate = new Date(today.getFullYear(), 11, 31); // 올해 12월 31일

        const params = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };

        const response = await getHolidays(params);
        holidays.value = response || [];
        console.log('공휴일 데이터 로드 완료:', holidays.value.length, '개');
      } catch (err) {
        console.error('공휴일 조회 실패:', err);
        // 공휴일 조회 실패해도 계속 진행
      }
    };

    // 백엔드 API로부터 근태 데이터 조회 (권한 기반 자동 범위 결정)
    const fetchAttendanceData = async () => {
      isLoading.value = true;
      try {
        const response = await getTeamAttendanceStatus({
          startDate: selectedDate.value,
          endDate: selectedDate.value,
          page: attendanceCurrentPage.value - 1,
          size: attendancePageSize.value
        });

        // Page 객체에서 content 추출
        const data = response.content || [];
        attendanceTotalElements.value = response.totalElements || 0;

        // 백엔드 응답을 프론트엔드 형식으로 변환 (이제 한글은 백엔드에서 전달)
        attendanceData.value = data.map((item) => {
          let displayStatus = item.status || '-';
          // 정상 출근이지만 지각인 경우
          if (displayStatus === '정상 출근' && item.isLate) {
            displayStatus = '지각';
          }
          // 정상 출근이지만 조퇴인 경우
          else if (displayStatus === '정상 출근' && item.isEarlyLeave) {
            displayStatus = '조퇴';
          }

          return {
            id: item.memberId,
            dailyAttendanceId: item.dailyAttendanceId,  // 수정 시 필요
            employeeName: item.name || '-',
            department: item.department || '-',
            date: item.date,
            status: displayStatus,  // 수정된 상태 사용
            clockIn: item.clockInTime || '-',
            clockOut: item.clockOutTime || '-',
            workHours: item.workHours || '-',
            extraWorkHours: item.extraWorkHours || '-',  // 추가 근무
            totalWorkHours: item.totalWorkHours || '-',  // 총 근무
            requestType: item.requestType,  // 휴가/출장 유형
            requestReason: item.requestReason,  // 신청 사유
          };
        });
        chartKey.value += 1; // 차트 강제 리렌더링

        success(`근태 현황을 조회했습니다. (총 ${response.totalElements || data.length}건)`);

      } catch (err) {
        error(err.message || '근태 데이터를 불러오는 데 실패했습니다.');
        attendanceData.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const exportToExcel = () => {
      info('근태 현황을 엑셀로 내보냅니다.');
      const exportData = filteredAttendanceData.value.map(item => ({
        이름: item.employeeName,
        부서: item.department,
        날짜: item.date,
        상태: item.status,
        출근시간: item.clockIn,
        퇴근시간: item.clockOut,
        기본근무시간: item.workHours,
        추가근무시간: item.extraWorkHours,
        총근무시간: item.totalWorkHours,
        요청유형: item.requestType || '-',
        신청사유: item.requestReason || '-'
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '근태 현황');
      XLSX.writeFile(workbook, '근태_현황.xlsx');
      success('엑셀 내보내기가 완료되었습니다.');
    };

    const runAnnualLeaveAccrualBatch = async () => {
      batchLoading.value = true;
      try {
        await runBatchAPI();
        success('연차 자동 발생 배치가 성공적으로 실행되었습니다.');
      } catch (err) {
        error(err.message || '배치 실행에 실패했습니다.');
      }
      batchLoading.value = false;
    };

    const getNextBatchDate = () => {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
    };

    const viewBatchHistory = () => {
      info('실행 이력 조회 기능은 현재 개발 중입니다.');
    };

    // ========== 연차 현황 관련 함수 ==========

    // 근속년수 계산
    const calculateYearsOfService = (joinDate) => {
      if (!joinDate) return 0;
      const today = new Date();
      const join = new Date(joinDate);
      const years = today.getFullYear() - join.getFullYear();
      const monthDiff = today.getMonth() - join.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < join.getDate())) {
        return years - 1;
      }
      return years;
    };

    // 월별 배치 버튼 활성화 조건
    const isMonthlyBatchEnabled = computed(() => {
      return yearsOfServiceFilter.value === '<1';
    });

    const balanceTotalPages = computed(() => Math.ceil(balanceTotalElements.value / balancePageSize.value));

    // 휴가 현황 조회
    const fetchBalanceData = async () => {
      balanceLoading.value = true;
      try {
        const currentYear = new Date().getFullYear();
        const response = await getLeaveBalanceStatus({
          year: currentYear,
          page: balanceCurrentPage.value - 1,
          size: balancePageSize.value,
          searchQuery: balanceSearchQuery.value || undefined,
          policyTypeCode: policyTypeFilter.value || undefined,
          yearsOfService: yearsOfServiceFilter.value || undefined
        });
        balanceData.value = response.content || [];
        balanceTotalElements.value = response.totalElements || 0;
        success(`${currentYear}년 휴가 현황을 조회했습니다. (총 ${balanceTotalElements.value}건)`);
      } catch (err) {
        error(err.message || '휴가 데이터를 불러오는 데 실패했습니다.');
        balanceData.value = [];
        balanceTotalElements.value = 0;
      } finally {
        balanceLoading.value = false;
      }
    };

    // 연차 수정
    const handleBalanceEdit = (row) => {
      editingBalance.value = { ...row };
      balanceEditDialogVisible.value = true;
    };

    // 연차 저장
    const handleBalanceSave = async () => {
      if (editingBalance.value) {
        try {
          // 유효성 검증
          if (editingBalance.value.totalUsed > editingBalance.value.totalGranted) {
            error('사용일수가 부여일수를 초과할 수 없습니다.');
            return;
          }

          // 백엔드 API 호출
          await updateMemberBalance(editingBalance.value.balanceId, {
            totalGranted: editingBalance.value.totalGranted,
            totalUsed: editingBalance.value.totalUsed
          });

          // 로컬 상태 업데이트
          const index = balanceData.value.findIndex(item => item.memberId === editingBalance.value.memberId);
          if (index !== -1) {
            editingBalance.value.remaining = editingBalance.value.totalGranted - editingBalance.value.totalUsed;
            balanceData.value[index] = editingBalance.value;
          }

          success('연차 정보가 성공적으로 수정되었습니다.');
          balanceEditDialogVisible.value = false;
          editingBalance.value = null;
        } catch (err) {
          error(err.response?.data?.message || '연차 정보 수정에 실패했습니다.');
        }
      }
    };

    // 휴가 엑셀 내보내기
    const exportBalanceToExcel = () => {
      info('휴가 현황을 엑셀로 내보냅니다.');
      const currentYear = new Date().getFullYear();
      const exportData = balanceData.value.map(item => ({
        이름: item.memberName,
        부서: item.organizationName || '-',
        직책: item.titleName || '-',
        입사일: item.joinDate || '-',
        근속년수: `${calculateYearsOfService(item.joinDate)}년`,
        유형: item.policyTypeName,
        부여: `${(item.totalGranted || 0).toFixed(1)}일`,
        사용: `${(item.totalUsed || 0).toFixed(1)}일`,
        잔여: `${(item.remainingBalance || 0).toFixed(1)}일`,
        상태: item.isUsable === false ? '사용불가' : '정상'
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '휴가 현황');
      XLSX.writeFile(workbook, `휴가_현황_${currentYear}.xlsx`);
      success('엑셀 내보내기가 완료되었습니다.');
    };

    // 근태 보정 배치 실행
    const runAttendanceCorrection = async () => {
      correctionLoading.value = true;
      try {
        await runAttendanceCorrectionBatch();
        success('근태 보정 배치가 성공적으로 실행되었습니다. 미완료 퇴근이 자동 처리되었습니다.');
        // 실행 후 데이터 새로고침
        fetchAttendanceData();
      } catch (err) {
        error(err.message || '근태 보정 배치 실행에 실패했습니다.');
      } finally {
        correctionLoading.value = false;
      }
    };

    // 월별 연차 배치 실행 (1년 미만 근속자 월별 연차 부여)
    const runMonthlyAccrualBatch = async () => {
      monthlyBatchLoading.value = true;
      try {
        await runBatchAPI(); // 기존 연차 발생 배치 API 사용
        success('월별 연차 배치가 성공적으로 실행되었습니다. 1년 미만 근속자에게 연차가 부여되었습니다.');
        // 실행 후 연차 데이터 새로고침
        fetchBalanceData();
      } catch (err) {
        error(err.message || '월별 연차 배치 실행에 실패했습니다.');
      } finally {
        monthlyBatchLoading.value = false;
      }
    };

    // 연차현황 상세보기 페이지로 이동
    const goToLeaveDetail = () => {
      router.push('/admin/leave-management');
    };

    // 페이지 변경 핸들러
    const handleAttendancePageChange = (page) => {
      attendanceCurrentPage.value = page;
      fetchAttendanceData();
    };

    const handleBalancePageChange = (page) => {
      balanceCurrentPage.value = page;
      fetchBalanceData();
    };

    // 컴포넌트 마운트 시 데이터 조회
    onMounted(() => {
      fetchAttendanceData();
      fetchHolidays();
    });

    // 탭 변경 시 데이터 조회
    watch(activeTab, (tab) => {
      if (tab === 'balance' && balanceData.value.length === 0) {
        fetchBalanceData();
      }
    });

    // 휴가 현황 필터 변경 시 첫 페이지로 돌아가고 데이터 재조회
    watch([balanceSearchQuery, policyTypeFilter, yearsOfServiceFilter], () => {
      if (activeTab.value === 'balance') {
        balanceCurrentPage.value = 1;
        fetchBalanceData();
      }
    });

    return {
      barChart,
      chartKey,
      activeTab,
      batchLoading,
      correctionLoading,
      selectedDate,
      searchQuery,
      filteredAttendanceData,
      editDialogVisible,
      editingRecord,
      summaryStats,
      chartData,
      chartOptions,
      isLoading,
      getStatusTagType,
      handleEdit,
      handleSave,
      exportToExcel,
      fetchAttendanceData,
      getCellClassName,
      runAnnualLeaveAccrualBatch,
      getNextBatchDate,
      viewBatchHistory,
      // 근태 현황 페이징
      attendanceData,
      attendanceCurrentPage,
      attendancePageSize,
      attendanceTotalElements,
      attendanceTotalPages,
      handleAttendancePageChange,
      // 휴가 현황
      balanceData,
      balanceLoading,
      balanceSearchQuery,
      policyTypeFilter,
      yearsOfServiceFilter,
      isMonthlyBatchEnabled,
      balanceEditDialogVisible,
      editingBalance,
      calculateYearsOfService,
      fetchBalanceData,
      handleBalanceEdit,
      handleBalanceSave,
      exportBalanceToExcel,
      runAttendanceCorrection,
      monthlyBatchLoading,
      runMonthlyAccrualBatch,
      goToLeaveDetail,
      // 휴가 현황 페이징
      balanceCurrentPage,
      balancePageSize,
      balanceTotalElements,
      balanceTotalPages,
      handleBalancePageChange
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

.table-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.chart-container {
  padding: 24px;
  height: 350px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.low-attendance {
  color: #f56c6c;
  font-weight: 600;
}

.warning-text {
  color: #f56c6c;
}

/* Element Plus DatePicker 주말 스타일 */
:deep(.el-date-table td.weekend) {
  color: #f56c6c !important;
}

:deep(.el-date-table td.weekend .el-date-table-cell__text) {
  color: #f56c6c !important;
}

/* 캘린더 주말 스타일 (숫자만 빨간색) */
:deep(.weekend-cell) {
  color: #f56c6c !important;
}

:deep(.weekend-cell .el-date-table-cell__text) {
  color: #f56c6c !important;
}

/* 캘린더 공휴일 스타일 */
:deep(.holiday-cell) {
  color: #f56c6c !important;
}

:deep(.holiday-cell .el-date-table-cell__text) {
  color: #f56c6c !important;
}

:deep(.holiday-cell.in-range),
:deep(.holiday-cell.start-date),
:deep(.holiday-cell.end-date),
:deep(.holiday-cell.selected) {
  background-color: #f56c6c !important;
  color: #fff !important;
}
</style>
