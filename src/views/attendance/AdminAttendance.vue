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
        </div>
      </el-tab-pane>

      <el-tab-pane label="연차 현황" name="balance">
        <div v-if="activeTab === 'balance'">
          <div class="table-card">
            <div class="card-header">
              <h3>연차 현황 관리</h3>
              <div style="display: flex; gap: 12px;">
                <el-button type="success" @click="runMonthlyAccrualBatch" :loading="monthlyBatchLoading">
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
              <el-select v-model="balanceYearFilter" placeholder="년도 선택" style="width: 140px;">
                <el-option :label="String(new Date().getFullYear())" :value="new Date().getFullYear()" />
                <el-option :label="String(new Date().getFullYear() - 1)" :value="new Date().getFullYear() - 1" />
              </el-select>
              <el-select v-model="yearsOfServiceFilter" placeholder="근속년수" clearable style="width: 180px;">
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
              <el-table :data="filteredBalanceData" v-loading="balanceLoading" style="width: 100%">
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
                <el-table-column prop="policyTypeName" label="유형" width="140" />
                <el-table-column prop="year" label="년도" width="80" />
                <el-table-column label="부여" width="80" align="right">
                  <template #default="scope">
                    {{ scope.row.totalGranted || 0 }}일
                  </template>
                </el-table-column>
                <el-table-column label="사용" width="80" align="right">
                  <template #default="scope">
                    {{ scope.row.totalUsed || 0 }}일
                  </template>
                </el-table-column>
                <el-table-column label="잔여" width="80" align="right">
                  <template #default="scope">
                    {{ scope.row.remaining || 0 }}일
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
            </div>
          </div>
        </div>
      </el-tab-pane>

                  <el-tab-pane label="배치 관리" name="batch">
                    <div class="batch-management">
                      <el-card>
                        <template #header>
                          <h3>연차 자동 발생 배치</h3>
                        </template>
            
                        <el-descriptions :column="2" border>
                          <el-descriptions-item label="실행 주기">
                            매월 1일 새벽 3시 (자동)
                          </el-descriptions-item>
                          <el-descriptions-item label="다음 실행">
                            {{ getNextBatchDate() }}
                          </el-descriptions-item>
                          <el-descriptions-item label="발생 규칙" :span="2">
                            • 1년 미만: 매월 1일씩 발생 (최대 11일)<br />
                            • 1년 이상: 매년 1월 1일 발생 (15일 + 2년마다 1일, 최대 25일)
                          </el-descriptions-item>
                        </el-descriptions>
            
                        <div style="margin-top: 20px;">
                          <el-button
                            type="primary"
                            @click="runAnnualLeaveAccrualBatch"
                            :loading="batchLoading"
                          >
                            수동 실행 (테스트용)
                          </el-button>
                          <el-button @click="viewBatchHistory">
                            실행 이력 조회
                          </el-button>
                        </div>
                      </el-card>
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
                        <el-option label="정상 근무" value="정상 근무" />
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
            import * as XLSX from 'xlsx';
            import { Bar } from 'vue-chartjs';
            import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
            import { useSnackbar } from '@/composables/useSnackbar';
            import { getTeamAttendanceStatus, runAnnualLeaveAccrualBatch as runBatchAPI, getLeaveBalanceStatus, updateDailyAttendance } from '@/api/attendance';
            import { Download, Search, Refresh, Tools, Calendar } from '@element-plus/icons-vue';

            ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

            export default {
              name: 'AdminAttendance',
              components: { Bar, Download, Search, Refresh, Tools, Calendar },
              setup() {
                const { success, info, error } = useSnackbar();

                const barChart = ref(null);
                const chartKey = ref(0);
                const activeTab = ref('status');
                const batchLoading = ref(false);
                const correctionLoading = ref(false);
                const monthlyBatchLoading = ref(false);

                // 연차 현황 관련 상태
                const balanceData = ref([]);
                const balanceLoading = ref(false);
                const balanceSearchQuery = ref('');
                const balanceYearFilter = ref(new Date().getFullYear());
                const yearsOfServiceFilter = ref('');
                const balanceEditDialogVisible = ref(false);
                const editingBalance = ref(null);
    const selectedDate = ref(new Date().toISOString().slice(0, 10));
    const searchQuery = ref('');
    const editDialogVisible = ref(false);
    const editingRecord = ref(null);
    const isLoading = ref(false);

    const attendanceData = ref([]);

    const filteredAttendanceData = computed(() => {
      return attendanceData.value.filter(item => {
        const matchesSearch = !searchQuery.value ||
                              item.employeeName.includes(searchQuery.value) ||
                              item.department.includes(searchQuery.value);
        return matchesSearch;
      });
    });

    const summaryStats = computed(() => {
        const data = filteredAttendanceData.value;
        return {
            total: data.length,
            onTime: data.filter(item => item.status === '정상 근무').length,
            late: data.filter(item => item.status === '지각').length,
            leave: data.filter(item => item.status.includes('휴가')).length,
        };
    });

    const chartData = computed(() => ({
      labels: ['정상 근무', '지각', '조퇴', '휴가', '출장', '결근', '미출근'],
      datasets: [{
        label: '직원 수',
        backgroundColor: ['#67C23A', '#E6A23C', '#409EFF', '#909399', '#17A2B8', '#F56C6C', '#6C757D'],
        data: [
          attendanceData.value.filter(item => item.status === '정상 근무').length,
          attendanceData.value.filter(item => item.status === '지각').length,
          attendanceData.value.filter(item => item.status === '조퇴').length,
          attendanceData.value.filter(item => item.status.includes('휴가')).length,
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
      if (status === '정상 근무') return 'success';
      if (status === '지각') return 'warning';
      if (status.includes('휴가')) return 'info';
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
          '정상 근무': 'AS001',        // NORMAL_WORK
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

    // 백엔드 API로부터 근태 데이터 조회 (권한 기반 자동 범위 결정)
    const fetchAttendanceData = async () => {
      isLoading.value = true;
      try {
        const response = await getTeamAttendanceStatus({
          startDate: selectedDate.value,
          endDate: selectedDate.value
        });

        // Page 객체에서 content 추출
        const data = response.content || [];

        // 백엔드 응답을 프론트엔드 형식으로 변환 (이제 한글은 백엔드에서 전달)
        attendanceData.value = data.map((item) => {
          let displayStatus = item.status || '-';
          if (displayStatus === '정상근무' && item.isLate) {
            displayStatus = '지각';
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
      const worksheet = XLSX.utils.json_to_sheet(filteredAttendanceData.value);
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

    // 연차 데이터 필터링
    const filteredBalanceData = computed(() => {
      return balanceData.value.filter(item => {
        // 검색 필터
        const matchesSearch = !balanceSearchQuery.value ||
                              item.memberName.includes(balanceSearchQuery.value) ||
                              (item.organizationName && item.organizationName.includes(balanceSearchQuery.value));

        // 근속년수 필터
        let matchesYears = true;
        if (yearsOfServiceFilter.value && item.joinDate) {
          const years = calculateYearsOfService(item.joinDate);
          if (yearsOfServiceFilter.value === '<1') {
            matchesYears = years < 1;
          } else if (yearsOfServiceFilter.value.startsWith('>=')) {
            const minYears = parseInt(yearsOfServiceFilter.value.substring(2));
            matchesYears = years >= minYears;
          }
        }

        return matchesSearch && matchesYears;
      });
    });

    // 연차 현황 조회
    const fetchBalanceData = async () => {
      balanceLoading.value = true;
      try {
        const response = await getLeaveBalanceStatus({ year: balanceYearFilter.value });
        balanceData.value = response || [];
        success(`연차 현황을 조회했습니다. (총 ${balanceData.value.length}건)`);
      } catch (err) {
        error(err.message || '연차 데이터를 불러오는 데 실패했습니다.');
        balanceData.value = [];
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
    const handleBalanceSave = () => {
      if (editingBalance.value) {
        const index = balanceData.value.findIndex(item => item.memberId === editingBalance.value.memberId);
        if (index !== -1) {
          // 잔여 재계산
          editingBalance.value.remaining = editingBalance.value.totalGranted - editingBalance.value.totalUsed;
          balanceData.value[index] = editingBalance.value;
          success('연차 정보가 성공적으로 수정되었습니다.');
        } else {
          error('연차 정보 수정에 실패했습니다.');
        }
        balanceEditDialogVisible.value = false;
        editingBalance.value = null;
      }
    };

    // 연차 엑셀 내보내기
    const exportBalanceToExcel = () => {
      info('연차 현황을 엑셀로 내보냅니다.');
      const exportData = filteredBalanceData.value.map(item => ({
        이름: item.memberName,
        부서: item.organizationName || '-',
        직책: item.titleName || '-',
        입사일: item.joinDate || '-',
        근속년수: calculateYearsOfService(item.joinDate),
        유형: item.policyTypeName,
        년도: item.year,
        부여: item.totalGranted,
        사용: item.totalUsed,
        잔여: item.remaining,
        상태: item.isUsable === false ? '사용불가' : '정상'
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '연차 현황');
      XLSX.writeFile(workbook, `연차_현황_${balanceYearFilter.value}.xlsx`);
      success('엑셀 내보내기가 완료되었습니다.');
    };

    // 근태 보정 배치 실행
    const runAttendanceCorrection = async () => {
      correctionLoading.value = true;
      try {
        // TODO: 근태 보정 배치 API 호출
        await new Promise(resolve => setTimeout(resolve, 1500)); // 임시 딜레이
        success('근태 보정 배치가 성공적으로 실행되었습니다.');
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

    // 컴포넌트 마운트 시 데이터 조회
    onMounted(() => {
      fetchAttendanceData();
    });

    // 탭 변경 시 데이터 조회
    watch(activeTab, (tab) => {
      if (tab === 'balance' && balanceData.value.length === 0) {
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
      runAnnualLeaveAccrualBatch,
      getNextBatchDate,
      viewBatchHistory,
      // 연차 현황
      balanceData,
      balanceLoading,
      balanceSearchQuery,
      balanceYearFilter,
      yearsOfServiceFilter,
      filteredBalanceData,
      balanceEditDialogVisible,
      editingBalance,
      calculateYearsOfService,
      fetchBalanceData,
      handleBalanceEdit,
      handleBalanceSave,
      exportBalanceToExcel,
      runAttendanceCorrection,
      monthlyBatchLoading,
      runMonthlyAccrualBatch
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
</style>
