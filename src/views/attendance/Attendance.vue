<template>
  <div class="attendance">
    <div class="page-header">
      <div class="header-content">
        <h1>근태 관리</h1>
        <p>출퇴근 기록과 휴가 신청을 관리하세요.</p>
      </div>
      <div class="header-actions">
        <div class="action-buttons">
          <el-button
            type="success"
            @click="recordEvent('CLOCK_IN')"
            :disabled="workStatus !== 'BEFORE_WORK' || !isWithinWorkTimeRange"
          >
            <el-icon><VideoPlay /></el-icon>
            <span style="margin-left: 8px;">출근</span>
          </el-button>
          <el-button
            type="danger"
            @click="recordEvent('CLOCK_OUT')"
            :disabled="workStatus === 'BEFORE_WORK' || workStatus === 'CLOCKED_OUT' || !isWithinWorkTimeRange"
          >
            <el-icon><VideoPause /></el-icon>
            <span style="margin-left: 8px;">퇴근</span>
          </el-button>
        </div>
        <div v-if="!isWithinWorkTimeRange && effectivePolicy" class="time-warning">
          <el-icon><Warning /></el-icon>
          <span>출퇴근 가능 시간: {{ effectivePolicy.ruleDetails?.workTimeRule?.workStartTime }} ~ {{ effectivePolicy.ruleDetails?.workTimeRule?.workEndTime }}</span>
        </div>
      </div>
    </div>

    <!-- 출퇴근 시간 표시 -->
    <div class="work-time-display">
      <div class="time-item">
        <span class="time-label">출근 시간</span>
        <span class="time-value">{{ clockInTime || '--:--:--' }}</span>
      </div>
      <div class="time-item">
        <span class="time-label">퇴근 시간</span>
        <span class="time-value">{{ clockOutTime || '--:--:--' }}</span>
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
          <div class="card-subtitle">총 {{ totalMonthlyWorkHours }}시간</div>
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
          <div class="card-subtitle">전체 사용 내역</div>
        </div>
      </div>
    </div>

    <!-- 추가 작업 버튼 -->
    <div class="quick-actions">
      <el-button @click="recordEvent('BREAK_START')" :disabled="!isBreakManualMode || workStatus !== 'WORKING'">
        <el-icon><CoffeeCup /></el-icon>
        휴게 시작
      </el-button>
      <el-button @click="recordEvent('BREAK_END')" :disabled="!isBreakManualMode || workStatus !== 'ON_BREAK'">
        <el-icon><Check /></el-icon>
        휴게 종료
      </el-button>
      <el-button @click="recordEvent('GO_OUT')" :disabled="workStatus !== 'WORKING'">
        <el-icon><VideoPlay /></el-icon>
        외출
      </el-button>
      <el-button @click="recordEvent('COME_BACK')" :disabled="workStatus !== 'AWAY'">
        <el-icon><VideoPause /></el-icon>
        복귀
      </el-button>
    </div>

    <!-- 탭 메뉴 -->
    <div class="attendance-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="근태 현황" name="monthly">
          <div class="records-section">
            <div class="calendar-controls-top">
              <el-radio-group v-model="calendarView" size="small">
                <el-radio-button label="month">월</el-radio-button>
                <el-radio-button label="week">주</el-radio-button>
              </el-radio-group>
              <div class="date-navigator">
                <el-button-group>
                  <el-button :icon="ArrowLeft" @click="navigateCalendar(-1)"></el-button>
                  <el-button @click="goToToday">오늘</el-button>
                  <el-button :icon="ArrowRight" @click="navigateCalendar(1)"></el-button>
                </el-button-group>
                <span class="current-date-display">{{ currentCalendarDisplay }}</span>
              </div>
            </div>

            <div class="calendar-grid-container">
              <div class="calendar-weekdays">
                <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
              </div>
              <div class="calendar-days">
                <div
                  v-for="day in calendarDays"
                  :key="day.date"
                  class="calendar-day"
                  :class="{
                    'other-month': !day.currentMonth,
                    'today': day.isToday,
                    'has-events': day.events.length > 0
                  }"
                >
                  <div class="day-number">{{ day.day }}</div>
                  <div class="day-events">
                    <div
                      v-for="(event, idx) in day.events.slice(0, 2)"
                      :key="`${event.date}-${idx}`"
                      class="event-item"
                      :class="event.type"
                    >
                      {{ event.title }}
                    </div>
                    <div v-if="day.events.length > 2" class="more-events">
                      +{{ day.events.length - 2 }}개 더
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="휴가 관리" name="leave">
          <div class="vacation-section">
            <!-- 휴가 정책 보유 현황 -->
            <div class="section-header">
              <h3>보유 휴가 정책</h3>
            </div>

            <div class="balance-cards" v-if="allBalances.length > 0">
              <div class="balance-card" v-for="balance in allBalances" :key="balance.balanceTypeCode?.codeValue">
                <div class="balance-header">
                  <h4>{{ balance.balanceTypeCode?.codeName || '알 수 없음' }}</h4>
                  <div class="balance-tags">
                    <el-tag :type="balance.isPaid ? 'success' : 'info'" size="small">
                      {{ balance.isPaid ? '유급' : '무급' }}
                    </el-tag>
                    <el-tag v-if="!balance.balanceTypeCode?.isBalanceDeductible" type="warning" size="small">
                      승인 필요
                    </el-tag>
                  </div>
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
                  <!-- 분할 사용 현황 (maxSplitCount가 설정된 경우만) -->
                  <div v-if="balance.maxSplitCount != null" class="stat-item split-usage">
                    <span class="stat-label">분할 사용</span>
                    <span class="stat-value split-count" :class="{ 'split-warning': balance.currentSplitCount >= balance.maxSplitCount }">
                      {{ balance.currentSplitCount || 0 }}/{{ balance.maxSplitCount }}회
                    </span>
                  </div>
                </div>
                <div class="balance-footer">
                  <span class="expiry-info">{{ balance.year }}년 유효</span>
                  <el-progress
                    v-if="balance.totalGranted > 0"
                    :percentage="Math.round((balance.totalUsed / balance.totalGranted) * 100)"
                    :stroke-width="6"
                    :color="getProgressColor(balance)"
                  />
                  <span v-else class="no-balance-info">부여 내역 없음</span>
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
import { ArrowLeft, ArrowRight, Clock, Calendar, Sunny, TrendCharts, VideoPlay, VideoPause, Plus, CoffeeCup, Check, Warning } from '@element-plus/icons-vue';
import { useSnackbar } from '@/composables/useSnackbar';
import { getMyMonthlyAttendance, getMyLeaveRequests, recordAttendanceEvent, getMyTodayAttendance, getMyAllBalances, getMyEffectivePolicy } from '@/api/attendance';

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
    const leaveRequests = ref([]); // 리스트용 (페이징)
    const allLeaveRequests = ref([]); // 캘린더용 (전체)
    const leavePagination = ref({ page: 0, size: 10, totalElements: 0 });
    const balanceInfo = ref({
      remaining: 0,
      totalGranted: 0,
      totalUsed: 0
    });
    const allBalances = ref([]);
    const effectivePolicy = ref(null);

    const calendarView = ref('month'); // 'month' or 'week'
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    const formatLocalDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const allEvents = computed(() => {
      const events = [];

      // 1. 근태 기록 (정상출근, 지각 등)
      monthlyAttendances.value.forEach(att => {
        if (att.statusName) {
          events.push({
            date: att.attendanceDate,
            title: att.statusName,
            type: getAttendanceEventType(att.statusName)
          });
        }
      });

      // 2. 승인된 휴가/출장 (APPROVED만) - 캘린더용 전체 데이터 사용
      allLeaveRequests.value
        .filter(leave => leave.status === 'APPROVED')
        .forEach(leave => {
          const startDate = new Date(leave.startDateTime);
          const endDate = new Date(leave.endDateTime);

          // 시작일부터 종료일까지 각 날짜에 이벤트 추가
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = formatLocalDate(d);
            events.push({
              date: dateStr,
              title: leave.policyTypeName || '휴가',
              type: leave.policyTypeCode === 'PTC007' ? 'businessTrip' : 'vacation'
            });
          }
        });

      return events;
    });

    const getAttendanceEventType = (statusName) => {
      const typeMap = {
        '정상': 'normal',
        '지각': 'late',
        '조퇴': 'earlyLeave',
        '결근': 'absent'
      };
      return typeMap[statusName] || 'normal';
    };

    const calendarDays = computed(() => {
      const year = calendarDate.value.getFullYear();
      const month = calendarDate.value.getMonth();
      const today = new Date();

      let startDate;
      if (calendarView.value === 'month') {
        const firstDayOfMonth = new Date(year, month, 1);
        startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
      } else { // week view
        startDate = new Date(calendarDate.value);
        startDate.setDate(startDate.getDate() - calendarDate.value.getDay());
      }

      const days = [];
      const numDays = calendarView.value === 'month' ? 42 : 7;

      for (let i = 0; i < numDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dateStr = formatLocalDate(date);
        const dayEvents = allEvents.value.filter(event => event.date === dateStr);
        
        days.push({
          date: dateStr,
          day: date.getDate(),
          currentMonth: calendarView.value === 'month' ? date.getMonth() === month : true,
          isToday: date.toDateString() === today.toDateString(),
          events: dayEvents
        });
      }
      return days;
    });

    const currentCalendarDisplay = computed(() => {
      const year = calendarDate.value.getFullYear();
      const month = calendarDate.value.getMonth();
      if (calendarView.value === 'month') {
        return `${year}년 ${month + 1}월`;
      } else {
        const startOfWeek = new Date(calendarDate.value);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `${startOfWeek.getMonth() + 1}월 ${startOfWeek.getDate()}일 - ${endOfWeek.getMonth() + 1}월 ${endOfWeek.getDate()}일`;
      }
    });

    const navigateCalendar = (direction) => {
      if (calendarView.value === 'month') {
        calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() + direction, 1);
      } else { // week view
        calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth(), calendarDate.value.getDate() + (direction * 7));
      }
    };

    const goToToday = () => {
      calendarDate.value = new Date();
    };
    const fetchMonthlyData = async () => {
      try {
        // FullCalendar는 자체적으로 날짜를 관리하므로, API 호출 시 필요한 날짜 정보를 가져와야 함
        // 이 부분은 FullCalendar의 viewDidMount나 datesSet 콜백에서 처리하는 것이 더 정확함
        // 우선 기존 로직을 유지하되, 향후 개선 예정
        const year = calendarDate.value.getFullYear();
        const month = calendarDate.value.getMonth() + 1;
        monthlyAttendances.value = await getMyMonthlyAttendance({ year, month });
      } catch (err) {
        error(err.message || '월별 현황 데이터를 불러오는 데 실패했습니다.');
      }
    };

    const fetchLeaveData = async () => {
      try {
        // 리스트용 페이징 데이터
        const params = { page: leavePagination.value.page, size: leavePagination.value.size };
        const response = await getMyLeaveRequests(params);
        leaveRequests.value = response.content || [];
        leavePagination.value.totalElements = response.totalElements || 0;
      } catch (err) {
        error(err.message || '휴가 내역을 불러오는 데 실패했습니다.');
      }
    };

    const fetchAllLeaveData = async () => {
      try {
        // 캘린더 표시용 전체 데이터 (100개)
        const params = { page: 0, size: 100 };
        const response = await getMyLeaveRequests(params);
        allLeaveRequests.value = response.content || [];
      } catch (err) {
        console.error('전체 휴가 내역을 불러오는 데 실패했습니다.');
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

    const fetchEffectivePolicy = async () => {
      try {
        const policy = await getMyEffectivePolicy();
        effectivePolicy.value = policy;
        console.log('🔄 정책 업데이트:', {
          breakRuleType: policy?.ruleDetails?.breakRule?.type,
          fullPolicy: policy
        });
      } catch (err) {
        console.error('적용된 정책을 불러오는 데 실패했습니다.');
      }
    };

    onMounted(() => {
      timer.value = setInterval(() => { currentTime.value = new Date().toLocaleTimeString(); }, 1000);
      fetchTodayData();
      fetchMonthlyData();
      fetchLeaveData();
      fetchAllLeaveData(); // 캘린더용 전체 휴가 데이터
      fetchEffectivePolicy();
      fetchBalance();
    });

    onUnmounted(() => {
      clearInterval(timer.value);
    });

    watch(calendarDate, () => {
      fetchMonthlyData();
      fetchAllLeaveData(); // 월이 바뀔 때 휴가 데이터도 새로 로드
    });

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

    // 휴게 규칙 타입이 MANUAL인 경우에만 휴게 버튼 활성화
    const isBreakManualMode = computed(() => {
      const isManual = effectivePolicy.value?.ruleDetails?.breakRule?.type === 'MANUAL';
      console.log('🔍 휴게 버튼 활성화 조건:', {
        isManual,
        workStatus: workStatus.value,
        breakRuleType: effectivePolicy.value?.ruleDetails?.breakRule?.type,
        shouldEnable: isManual && workStatus.value === 'WORKING'
      });
      return isManual;
    });

    // 현재 시간이 출퇴근 가능 시간 범위 내인지 확인
    const isWithinWorkTimeRange = computed(() => {
      if (!effectivePolicy.value?.ruleDetails?.workTimeRule) {
        return true; // 정책이 없으면 항상 허용
      }

      const workTimeRule = effectivePolicy.value.ruleDetails.workTimeRule;
      const { workStartTime, workEndTime } = workTimeRule;

      if (!workStartTime || !workEndTime) {
        return true; // 시간 설정이 없으면 항상 허용
      }

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // 현재 시각을 분 단위로 변환

      // workStartTime, workEndTime을 분 단위로 변환 (HH:mm 형식)
      const [startHour, startMin] = workStartTime.split(':').map(Number);
      const [endHour, endMin] = workEndTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      // 자정을 넘어가는 경우 처리 (예: 18:00 ~ 02:00)
      if (endMinutes < startMinutes) {
        // 자정 이전 또는 자정 이후 허용
        return currentTime >= startMinutes || currentTime <= endMinutes;
      } else {
        // 정상적인 시간 범위 (예: 07:00 ~ 19:00)
        return currentTime >= startMinutes && currentTime <= endMinutes;
      }
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
        // deviceId는 근태 인증에 불필요 (로그인으로 사용자 판별)
        // const fp = await FingerprintJS.load();
        // const result = await fp.get();
        // const deviceId = result.visitorId;
        const deviceType = detectDeviceType();
        const gpsLocation = await getGpsLocation();

        await recordAttendanceEvent({
          eventType: eventType,
          // deviceId: deviceId,
          deviceType: deviceType,
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
        });
        success(`${eventType} 기록 완료`);
        await fetchTodayData();

        // 출근 시 정책을 다시 조회 (관리자가 정책을 변경했을 수 있음)
        if (eventType === 'CLOCK_IN') {
          await fetchEffectivePolicy();
        }
      } catch (err) {
        error(err.message || '근태 기록에 실패했습니다.');
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
      currentMonthYear,
      leaveRequests, leavePagination, handleLeavePageChange, goToLeaveRequest,
      ArrowLeft, ArrowRight, Clock, Calendar, Sunny, TrendCharts, VideoPlay, VideoPause, Plus, CoffeeCup, Check,
      monthlyWorkDays, balanceInfo, totalMonthlyWorkHours,
      formatDate, getVacationStatusType, allBalances, getProgressColor,
      isBreakManualMode, isWithinWorkTimeRange, effectivePolicy,
      calendarView, weekdays, calendarDays, currentCalendarDisplay, navigateCalendar, goToToday,
      allEvents, Warning
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
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.time-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 14px;
}

.time-warning .el-icon {
  font-size: 16px;
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

.calendar-controls-top {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-bottom: 1px solid #f0f0f0;
}

.date-navigator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-date-display {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
  text-align: center;
}

.calendar-grid-container {
  padding: 24px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 8px;
}

.weekday {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #606266;
  background: #f5f7fa;
  border-radius: 4px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-day {
  min-height: 100px;
  padding: 8px;
  background: white;
  border-right: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day:nth-last-child(-n + 7) {
  border-bottom: none;
}

.calendar-day.other-month {
  background: #f8f9fa;
  color: #909399;
}

.calendar-day.today {
  background: #f0f9ff;
  border: 2px solid #4f46e5;
}

.day-number {
  font-weight: 600;
  margin-bottom: 4px;
  color: #2c3e50;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-item {
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 근태 상태 */
.event-item.normal {
  background: #dcfce7;
  color: #166534;
}

.event-item.late {
  background: #fef3c7;
  color: #92400e;
}

.event-item.earlyLeave {
  background: #fce7f3;
  color: #9d174d;
}

.event-item.absent {
  background: #fee2e2;
  color: #dc2626;
}

/* 휴가/출장 */
.event-item.vacation {
  background: #e0e7ff;
  color: #3730a3;
}

.event-item.businessTrip {
  background: #ffe4e6;
  color: #be123c;
}

.more-events {
  font-size: 10px;
  color: #606266;
  font-style: italic;
}

.work-time-display {
  display: flex;
  gap: 24px;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.time-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.time-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* ... 기존 스타일 ... */
.time-value {
  font-size: 28px;
  font-weight: 600;
  color: #4f46e5;
}

/* 휴가 관리 탭 스타일 */
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

.balance-tags {
  display: flex;
  gap: 8px;
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

.balance-stats .stat-value.split-count {
  color: #67c23a;
}

.balance-stats .stat-value.split-count.split-warning {
  color: #f56c6c;
  font-weight: 700;
}

.balance-stats .stat-item.split-usage {
  border-left: 1px solid #f0f0f0;
  padding-left: 12px;
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

.no-balance-info {
  font-size: 13px;
  color: #e6a23c;
  font-weight: 500;
  text-align: center;
  padding: 8px;
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

/* 근태 통계 탭 스타일 */
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
