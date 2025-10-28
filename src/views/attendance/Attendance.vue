<template>
  <div class="attendance-page">
    <el-card>
      <div class="header">
        <h1>내 근태 현황</h1>
        <div class="time-display">
          <span>{{ new Date().toLocaleDateString('ko-KR') }}</span>
          <strong>{{ currentTime }}</strong>
        </div>
      </div>

      <div class="status-panel">
        <div class="clock-actions">
          <div :class="['status-indicator', workStatusClass]">{{ workStatusText }}</div>
          <el-button type="primary" size="large" @click="recordEvent('CLOCK_IN')" :disabled="workStatus !== 'BEFORE_WORK'">출근</el-button>
          <el-button type="danger" size="large" @click="recordEvent('CLOCK_OUT')" :disabled="workStatus === 'BEFORE_WORK' || workStatus === 'CLOCKED_OUT'">퇴근</el-button>
          <el-divider direction="vertical" />
          <el-button @click="recordEvent('GO_OUT')" :disabled="workStatus !== 'WORKING'">외출</el-button>
          <el-button @click="recordEvent('COME_BACK')" :disabled="workStatus !== 'AWAY'">복귀</el-button>
          <el-divider direction="vertical" />
          <el-button @click="recordEvent('BREAK_START')" :disabled="workStatus !== 'WORKING'">휴게 시작</el-button>
          <el-button @click="recordEvent('BREAK_END')" :disabled="workStatus !== 'ON_BREAK'">휴게 종료</el-button>
          <el-divider direction="vertical" />
          <el-button type="info" plain @click="registerCurrentDevice">현재 기기 등록하기</el-button>
        </div>
        <div class="work-summary">
          <div><span>출근 시간</span><strong>{{ clockInTime || '--:--:--' }}</strong></div>
          <div><span>퇴근 시간</span><strong>{{ clockOutTime || '--:--:--' }}</strong></div>
          <div><span>총 근무 시간</span><strong>{{ totalWorkTime }}</strong></div>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="월별 현황" name="monthly">
          <div class="calendar-header">
            <el-button :icon="ArrowLeft" @click="prevMonth" circle />
            <h2>{{ currentMonthYear }}</h2>
            <el-button :icon="ArrowRight" @click="nextMonth" circle />
          </div>
          <el-calendar v-model="calendarDate">
            <template #date-cell="{ data }">
              <p>{{ data.day.split('-').slice(2).join('-') }}</p>
              <span class="status-text" :class="getWorkStatusClass(data.day)">
                {{ getWorkStatusForDate(data.day) }}
              </span>
            </template>
          </el-calendar>
        </el-tab-pane>

        <el-tab-pane label="휴가 내역" name="leave">
          <div class="leave-header">
            <el-button type="primary" @click="goToLeaveRequest">휴가 신청하기</el-button>
          </div>
          <el-table :data="leaveRequests" stripe>
            <el-table-column prop="policyTypeName" label="휴가 종류" />
            <el-table-column label="시작일">
              <template #default="{ row }">
                {{ row.startDateTime ? row.startDateTime.substring(0, 10) : '' }}
              </template>
            </el-table-column>
            <el-table-column label="종료일">
              <template #default="{ row }">
                {{ row.endDateTime ? row.endDateTime.substring(0, 10) : '' }}
              </template>
            </el-table-column>
            <el-table-column prop="deductionDays" label="차감 일수" />
            <el-table-column prop="status" label="상태">
              <template #default="{ row }">
                <el-tag>{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            layout="prev, pager, next"
            :total="leavePagination.totalElements"
            :page-size="leavePagination.size"
            :current-page="leavePagination.page + 1"
            @current-change="handleLeavePageChange"
            class="pagination"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { useSnackbar } from '@/composables/useSnackbar';
import { getMyMonthlyAttendance, getMyLeaveRequests, recordAttendanceEvent, getMyTodayAttendance, registerDevice } from '@/api/attendance';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default {
  name: 'AttendancePage',
  components: { },
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

    onMounted(() => {
      timer.value = setInterval(() => { currentTime.value = new Date().toLocaleTimeString(); }, 1000);
      fetchTodayData();
      fetchMonthlyData();
      fetchLeaveData();
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

    const workStatusClass = computed(() => {
      switch(workStatus.value) {
        case 'WORKING': return 'status-on';
        case 'AWAY':
        case 'ON_BREAK': return 'status-away';
        case 'CLOCKED_OUT': return 'status-off';
        default: return 'status-before';
      }
    });

    const currentMonthYear = computed(() => {
      return calendarDate.value.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    });

    const recordEvent = async (eventType) => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const deviceId = result.visitorId;

        await recordAttendanceEvent({
          eventType: eventType,
          deviceId: deviceId,
          deviceType: 'LAPTOP',
        });
        success(`${eventType} 기록 완료`);
        await fetchTodayData();
      } catch (err) {
        error(err.message || '근태 기록에 실패했습니다.');
      }
    };

    const registerCurrentDevice = async () => {
      try {
        const deviceName = prompt('이 기기의 이름을 입력하세요 (예: 업무용 노트북):');
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
          deviceType: 'LAPTOP',
        });
        success(`기기 등록 요청이 완료되었습니다. ID: ${deviceId}`);
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

    return {
      activeTab, currentTime, workStatus, clockInTime, clockOutTime,
      totalWorkTime, workStatusText, workStatusClass, recordEvent, calendarDate,
      currentMonthYear, prevMonth, nextMonth, getWorkStatusForDate, getWorkStatusClass,
      leaveRequests, leavePagination, handleLeavePageChange, goToLeaveRequest,
      ArrowLeft, ArrowRight,
      registerCurrentDevice,
    };
  },
};
</script>

<style scoped>
.attendance-page { max-width: 1200px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.time-display { text-align: right; }
.status-panel { display: flex; justify-content: space-between; align-items: center; background: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.clock-actions { display: flex; align-items: center; gap: 15px; }
.status-indicator { font-size: 1.5rem; font-weight: bold; }
.status-on { color: #67c23a; }
.status-off { color: #f56c6c; }
.status-before { color: #909399; }
.status-away { color: #e6a23c; }
.work-summary { display: flex; gap: 30px; text-align: right; }
.work-summary div { display: flex; flex-direction: column; }
.work-summary span { font-size: 0.9rem; color: #909399; }
.work-summary strong { font-size: 1.2rem; }
.main-tabs { margin-top: 20px; }
.calendar-header { display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 20px; }
.calendar-header h2 { margin: 0; }
.status-text { font-size: 12px; }
.status-late { color: #e6a23c; }
.status-early { color: #f56c6c; }
.status-leave { color: #409eff; }
.leave-header { text-align: right; margin-bottom: 10px; }
.pagination { justify-content: center; margin-top: 20px; }
</style>