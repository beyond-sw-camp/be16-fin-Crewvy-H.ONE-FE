<template>
  <div class="attendance">
    <div class="page-header">
      <div class="header-content">
        <h1>근태 관리</h1>
        <p>출퇴근 기록과 휴가 신청을 관리하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="success" @click="recordEvent('CLOCK_IN')" :disabled="workStatus !== 'BEFORE_WORK'">
          <el-icon><VideoPlay /></el-icon>
          <span style="margin-left: 8px;">출근</span>
        </el-button>
        <el-button type="danger" @click="recordEvent('CLOCK_OUT')" :disabled="workStatus === 'BEFORE_WORK' || workStatus === 'CLOCKED_OUT'">
          <el-icon><VideoPause /></el-icon>
          <span style="margin-left: 8px;">퇴근</span>
        </el-button>
      </div>
    </div>

    <!-- 근태 현황 카드 -->
    <div class="attendance-cards">
      <div class="attendance-card">
        <div class="card-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">오늘 근무</div>
          <div class="card-value">{{ totalWorkTime }}</div>
          <div class="card-subtitle">{{ workStatusText }}</div>
        </div>
      </div>

      <div class="attendance-card">
        <div class="card-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">이번 달 근무일</div>
          <div class="card-value">{{ monthlyWorkDays }}일</div>
          <div class="card-subtitle">출근 {{ clockInTime || '--:--' }}</div>
        </div>
      </div>

      <div class="attendance-card">
        <div class="card-icon">
          <el-icon><Sunny /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">잔여 휴가</div>
          <div class="card-value">{{ balanceInfo.remaining }}일</div>
          <div class="card-subtitle">총 {{ balanceInfo.totalGranted }}일 중</div>
        </div>
      </div>

      <div class="attendance-card">
        <div class="card-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">사용 휴가</div>
          <div class="card-value">{{ balanceInfo.totalUsed }}일</div>
          <div class="card-subtitle">퇴근 {{ clockOutTime || '--:--' }}</div>
        </div>
      </div>
    </div>

    <!-- 추가 작업 버튼 -->
    <div class="quick-actions">
      <el-button @click="recordEvent('BREAK_START')" :disabled="workStatus !== 'WORKING'">
        <el-icon><CoffeeCup /></el-icon>
        휴게 시작
      </el-button>
      <el-button @click="recordEvent('BREAK_END')" :disabled="workStatus !== 'ON_BREAK'">
        <el-icon><Check /></el-icon>
        휴게 종료
      </el-button>
      <el-button type="info" plain @click="registerCurrentDevice">
        <el-icon><Monitor /></el-icon>
        현재 기기 등록
      </el-button>
    </div>

    <!-- 탭 메뉴 -->
    <div class="attendance-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="월별 현황" name="monthly">
          <div class="records-section">
            <div class="section-header">
              <h3>월별 근태 현황</h3>
              <div class="filter-options">
                <el-button :icon="ArrowLeft" @click="prevMonth" circle />
                <h2>{{ currentMonthYear }}</h2>
                <el-button :icon="ArrowRight" @click="nextMonth" circle />
              </div>
            </div>

            <el-calendar v-model="calendarDate">
              <template #date-cell="{ data }">
                <p>{{ data.day.split('-').slice(2).join('-') }}</p>
                <span class="status-text" :class="getWorkStatusClass(data.day)">
                  {{ getWorkStatusForDate(data.day) }}
                </span>
              </template>
            </el-calendar>
          </div>
        </el-tab-pane>

        <el-tab-pane label="휴가 관리" name="leave">
          <div class="vacation-section">
            <!-- 휴가 정책 보유 현황 -->
            <div class="section-header">
              <h3>보유 휴가 정책</h3>
            </div>

            <div class="balance-cards" v-if="allBalances.length > 0">
              <div class="balance-card" v-for="balance in allBalances" :key="balance.id">
                <div class="balance-header">
                  <h4>{{ balance.balanceTypeCode?.codeName || '알 수 없음' }}</h4>
                  <el-tag :type="balance.isPaid ? 'success' : 'info'" size="small">
                    {{ balance.isPaid ? '유급' : '무급' }}
                  </el-tag>
                </div>
                <div class="balance-stats">
                  <div class="stat-item">
                    <span class="stat-label">총 부여</span>
                    <span class="stat-value">{{ balance.totalGranted || 0 }}일</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">사용</span>
                    <span class="stat-value used">{{ balance.totalUsed || 0 }}일</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">잔여</span>
                    <span class="stat-value remaining">{{ balance.remaining || 0 }}일</span>
                  </div>
                </div>
                <div class="balance-footer">
                  <span class="expiry-info">{{ balance.year }}년 유효</span>
                  <el-progress
                    :percentage="balance.totalGranted > 0 ? Math.round((balance.totalUsed / balance.totalGranted) * 100) : 0"
                    :stroke-width="6"
                    :color="getProgressColor(balance)"
                  />
                </div>
              </div>
            </div>
            <div v-else class="empty-balance">
              <el-icon><Calendar /></el-icon>
              <p>할당된 휴가 정책이 없습니다.</p>
            </div>

            <!-- 휴가 신청 현황 -->
            <div class="section-header" style="margin-top: 40px;">
              <h3>휴가 신청 현황</h3>
              <el-button type="primary" @click="goToLeaveRequest">
                <el-icon><Plus /></el-icon>
                휴가 신청
              </el-button>
            </div>

            <div class="vacation-list">
              <div class="vacation-item" v-for="leave in leaveRequests" :key="leave.id">
                <div class="vacation-info">
                  <div class="vacation-dates">
                    <span class="start-date">{{ formatDate(leave.startDateTime) }}</span>
                    <span class="separator">~</span>
                    <span class="end-date">{{ formatDate(leave.endDateTime) }}</span>
                    <span class="duration">({{ leave.deductionDays }}일)</span>
                  </div>
                  <div class="vacation-reason">{{ leave.policyTypeName }}</div>
                </div>
                <div class="vacation-status">
                  <el-tag :type="getVacationStatusType(leave.status)" size="small">
                    {{ leave.status }}
                  </el-tag>
                </div>
              </div>
            </div>

            <el-pagination
              background
              layout="prev, pager, next"
              :total="leavePagination.totalElements"
              :page-size="leavePagination.size"
              :current-page="leavePagination.page + 1"
              @current-change="handleLeavePageChange"
              class="pagination"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="근태 통계" name="statistics">
          <div class="statistics-section">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-title">이번 달 총 근무일</div>
                <div class="stat-value">{{ monthlyWorkDays }}일</div>
                <div class="stat-change positive">평균 근무</div>
              </div>
              <div class="stat-item">
                <div class="stat-title">총 근무시간</div>
                <div class="stat-value">{{ totalMonthlyWorkHours }}시간</div>
                <div class="stat-change neutral">이번 달</div>
              </div>
              <div class="stat-item">
                <div class="stat-title">잔여 연차</div>
                <div class="stat-value">{{ balanceInfo.remaining }}일</div>
                <div class="stat-change positive">사용 가능</div>
              </div>
              <div class="stat-item">
                <div class="stat-title">휴가 신청</div>
                <div class="stat-value">{{ leaveRequests.length }}건</div>
                <div class="stat-change neutral">전체</div>
              </div>
            </div>

            <div class="chart-section">
              <h4>근무 시간 추이</h4>
              <div class="chart-placeholder">
                <el-icon><TrendCharts /></el-icon>
                <p>차트 데이터 준비 중입니다</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, ArrowRight, Clock, Calendar, Sunny, TrendCharts, VideoPlay, VideoPause, Plus, CoffeeCup, Check, Monitor } from '@element-plus/icons-vue';
import { useSnackbar } from '@/composables/useSnackbar';
import { getMyMonthlyAttendance, getMyLeaveRequests, recordAttendanceEvent, getMyTodayAttendance, registerDevice, getMyAllBalances } from '@/api/attendance';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default {
  name: 'AttendancePage',
  components: {},
  setup() {
    const router = useRouter();
    const { success, error } = useSnackbar();
    const activeTab = ref('monthly');
    const currentTime = ref(new Date().toLocaleTimeString());
    const timer = ref(null);

    const workStatus = ref('BEFORE_WORK');
    const clockInTime = ref(null);
    const clockOutTime = ref(null);
    const totalWorkTime = ref('00시간 00분');

    const calendarDate = ref(new Date());
    const monthlyAttendances = ref([]);
    const leaveRequests = ref([]);
    const leavePagination = ref({ page: 0, size: 10, totalElements: 0 });
    const balanceInfo = ref({
      remaining: 0,
      totalGranted: 0,
      totalUsed: 0
    });
    const allBalances = ref([]); // 모든 휴가 정책 잔액

    const fetchMonthlyData = async () => {
      try {
        const year = calendarDate.value.getFullYear();
        const month = calendarDate.value.getMonth() + 1;
        monthlyAttendances.value = await getMyMonthlyAttendance({ year, month });
      } catch (err) {
        error(err.message || '월별 현황 데이터를 불러오는 데 실패했습니다.');
      }
    };

    const fetchLeaveData = async () => {
      try {
        const params = { page: leavePagination.value.page, size: leavePagination.value.size };
        const response = await getMyLeaveRequests(params);
        leaveRequests.value = response.content || [];
        leavePagination.value.totalElements = response.totalElements || 0;
      } catch (err) {
        error(err.message || '휴가 내역을 불러오는 데 실패했습니다.');
      }
    };

    const fetchTodayData = async () => {
      try {
        const todayStatusResponse = await getMyTodayAttendance();
        if (todayStatusResponse && todayStatusResponse.dailyAttendance) {
          const todayStatus = todayStatusResponse.dailyAttendance;
          const lastEventType = todayStatusResponse.lastEventType;

          clockInTime.value = todayStatus.firstClockIn ? new Date(todayStatus.firstClockIn).toLocaleTimeString('ko-KR') : null;
          clockOutTime.value = todayStatus.lastClockOut ? new Date(todayStatus.lastClockOut).toLocaleTimeString('ko-KR') : null;

          if(todayStatus.workedMinutes) {
            const hours = Math.floor(todayStatus.workedMinutes / 60);
            const minutes = todayStatus.workedMinutes % 60;
            totalWorkTime.value = `${String(hours).padStart(2, '0')}시간 ${String(minutes).padStart(2, '0')}분`;
          }

          // 마지막 이벤트를 기준으로 현재 상태를 명확하게 결정
          switch(lastEventType) {
            case 'CLOCK_IN':
            case 'COME_BACK':
            case 'BREAK_END':
              workStatus.value = 'WORKING';
              break;
            case 'GO_OUT':
              workStatus.value = 'AWAY';
              break;
            case 'BREAK_START':
              workStatus.value = 'ON_BREAK';
              break;
            case 'CLOCK_OUT':
              workStatus.value = 'CLOCKED_OUT';
              break;
            default:
              workStatus.value = 'BEFORE_WORK';
          }
        } else {
          // 출근 전 상태로 초기화
          workStatus.value = 'BEFORE_WORK';
          clockInTime.value = null;
          clockOutTime.value = null;
          totalWorkTime.value = '00시간 00분';
        }
      } catch (err) {
        workStatus.value = 'BEFORE_WORK';
      }
    };

    const fetchBalance = async () => {
      try {
        // 모든 휴가 정책 잔액 조회
        const balances = await getMyAllBalances();
        allBalances.value = balances || [];

        // 연차(ANNUAL_LEAVE) 정보를 balanceInfo에 설정 (기존 호환성 유지)
        const annualLeave = balances.find(b => b.balanceTypeCode?.codeValue === 'ANNUAL_LEAVE');
        if (annualLeave) {
          balanceInfo.value = {
            remaining: annualLeave.remaining || 0,
            totalGranted: annualLeave.totalGranted || 0,
            totalUsed: annualLeave.totalUsed || 0
          };
        }
      } catch (err) {
        console.error('잔여 휴가를 불러오는 데 실패했습니다.');
      }
    };

    onMounted(() => {
      timer.value = setInterval(() => { currentTime.value = new Date().toLocaleTimeString(); }, 1000);
      fetchTodayData();
      fetchMonthlyData();
      fetchLeaveData();
      fetchBalance();
    });

    onUnmounted(() => {
      clearInterval(timer.value);
    });

    watch(calendarDate, fetchMonthlyData);

    const workStatusText = computed(() => {
      switch(workStatus.value) {
        case 'WORKING': return '근무 중';
        case 'AWAY': return '외출 중';
        case 'ON_BREAK': return '휴게 중';
        case 'CLOCKED_OUT': return '퇴근';
        default: return '출근 전';
      }
    });

    const monthlyWorkDays = computed(() => {
      return monthlyAttendances.value.length;
    });

    const totalMonthlyWorkHours = computed(() => {
      const totalMinutes = monthlyAttendances.value.reduce((sum, attendance) => {
        return sum + (attendance.workedMinutes || 0);
      }, 0);
      return Math.floor(totalMinutes / 60);
    });

    const currentMonthYear = computed(() => {
      return calendarDate.value.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    });

    // 디바이스 타입 감지 함수
    const detectDeviceType = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      return isMobile ? 'MOBILE' : 'LAPTOP';
    };

    // GPS 위치 정보 가져오기 함수
    const getGpsLocation = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          console.warn('Geolocation API를 지원하지 않는 브라우저입니다.');
          resolve({ latitude: null, longitude: null });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (err) => {
            console.warn('GPS 위치 정보를 가져올 수 없습니다:', err.message);
            resolve({ latitude: null, longitude: null });
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });
    };

    const recordEvent = async (eventType) => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const deviceId = result.visitorId;
        const deviceType = detectDeviceType();
        const gpsLocation = await getGpsLocation();

        await recordAttendanceEvent({
          eventType: eventType,
          deviceId: deviceId,
          deviceType: deviceType,
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
        });
        success(`${eventType} 기록 완료`);
        await fetchTodayData();
      } catch (err) {
        error(err.message || '근태 기록에 실패했습니다.');
      }
    };

    const registerCurrentDevice = async () => {
      try {
        const deviceType = detectDeviceType();
        const deviceTypeText = deviceType === 'MOBILE' ? '모바일 기기' : '노트북/데스크톱';

        const deviceName = prompt(`이 기기의 이름을 입력하세요 (감지된 타입: ${deviceTypeText}):`);
        if (!deviceName) {
          error('기기 이름이 입력되지 않아 취소되었습니다.');
          return;
        }

        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const deviceId = result.visitorId;

        await registerDevice({
          deviceId: deviceId,
          deviceName: deviceName,
          deviceType: deviceType,
        });
        success(`기기 등록 요청이 완료되었습니다. (타입: ${deviceTypeText})`);
      } catch (err) {
        error(err.message || '기기 등록에 실패했습니다.');
      }
    };

    const prevMonth = () => {
      calendarDate.value = new Date(calendarDate.value.setMonth(calendarDate.value.getMonth() - 1));
    };
    const nextMonth = () => {
      calendarDate.value = new Date(calendarDate.value.setMonth(calendarDate.value.getMonth() + 1));
    };

    const getWorkStatusForDate = (day) => {
      const record = monthlyAttendances.value.find(d => d.attendanceDate === day);
      return record ? record.statusName : '';
    };

    const getWorkStatusClass = (day) => {
      const record = monthlyAttendances.value.find(d => d.attendanceDate === day);
      if (!record) return '';
      switch(record.statusName) {
        case '정상': return 'status-normal';
        case '지각': return 'status-late';
        case '조퇴': return 'status-early';
        case '연차': return 'status-leave';
        default: return '';
      }
    };

    const handleLeavePageChange = (newPage) => {
      leavePagination.value.page = newPage - 1;
      fetchLeaveData();
    };

    const goToLeaveRequest = () => {
      router.push('/leave-request');
    };

    const formatDate = (dateTimeString) => {
      if (!dateTimeString) return '';
      return dateTimeString.substring(0, 10);
    };

    const getVacationStatusType = (status) => {
      const statusMap = {
        'PENDING': 'warning',
        'APPROVED': 'success',
        'REJECTED': 'danger'
      };
      return statusMap[status] || 'info';
    };

    const getProgressColor = (balance) => {
      if (!balance.totalGranted || balance.totalGranted === 0) return '#909399';
      const usageRate = (balance.totalUsed / balance.totalGranted) * 100;
      if (usageRate >= 80) return '#f56c6c'; // 80% 이상 사용 - 빨강
      if (usageRate >= 50) return '#e6a23c'; // 50% 이상 사용 - 주황
      return '#67c23a'; // 50% 미만 사용 - 녹색
    };

    return {
      activeTab, currentTime, workStatus, clockInTime, clockOutTime,
      totalWorkTime, workStatusText, recordEvent, calendarDate,
      currentMonthYear, prevMonth, nextMonth, getWorkStatusForDate, getWorkStatusClass,
      leaveRequests, leavePagination, handleLeavePageChange, goToLeaveRequest,
      ArrowLeft, ArrowRight, Clock, Calendar, Sunny, TrendCharts, VideoPlay, VideoPause, Plus, CoffeeCup, Check, Monitor,
      registerCurrentDevice, monthlyWorkDays, balanceInfo, totalMonthlyWorkHours,
      formatDate, getVacationStatusType, allBalances, getProgressColor,
    };
  },
};
</script>

<style scoped>
.attendance {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.attendance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.attendance-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.attendance-card:hover {
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  background: #4f46e5;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 12px;
  color: #909399;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.attendance-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.attendance-tabs :deep(.el-tabs__nav) {
  padding-left: 20px;
}

.records-section, .vacation-section, .statistics-section {
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.filter-options {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-options h2 {
  margin: 0;
  font-size: 18px;
}

.status-text {
  font-size: 12px;
}

.status-late {
  color: #e6a23c;
}

.status-early {
  color: #f56c6c;
}

.status-leave {
  color: #409eff;
}

.status-normal {
  color: #67c23a;
}

.balance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.balance-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.balance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.balance-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.balance-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.balance-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.balance-stats .stat-label {
  font-size: 12px;
  color: #909399;
}

.balance-stats .stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.balance-stats .stat-value.used {
  color: #e6a23c;
}

.balance-stats .stat-value.remaining {
  color: #4f46e5;
}

.balance-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-footer .expiry-info {
  font-size: 12px;
  color: #909399;
}

.empty-balance {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 32px;
}

.empty-balance .el-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-balance p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.vacation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vacation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.vacation-info {
  flex: 1;
}

.vacation-dates {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.start-date, .end-date {
  font-size: 14px;
}

.separator {
  margin: 0 4px;
  color: #909399;
}

.duration {
  color: #667eea;
  font-weight: 500;
}

.vacation-reason {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.vacation-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.pagination {
  justify-content: center;
  margin-top: 20px;
}

.statistics-section {
  padding: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: #67c23a;
}

.stat-change.negative {
  color: #f56c6c;
}

.stat-change.neutral {
  color: #909399;
}

.chart-section {
  margin-top: 32px;
}

.chart-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.chart-placeholder {
  height: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.chart-placeholder .el-icon {
  font-size: 32px;
  margin-bottom: 8px;
}
</style>
