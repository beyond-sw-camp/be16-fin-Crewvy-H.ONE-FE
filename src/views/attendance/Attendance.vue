<template>
  <div class="attendance">
    <div class="page-header">
      <div class="header-content">
        <h1>근태 관리</h1>
        <p>출퇴근 기록과 휴가 신청을 관리하세요.</p>
      </div>
      <div class="header-actions">
        <div class="action-buttons">
          <!-- 출근 전: 출근 버튼만 표시 -->
          <el-button
            v-if="workStatus === 'BEFORE_WORK'"
            size="large"
            type="success"
            @click="recordEvent('CLOCK_IN')"
            class="clock-button"
          >
            <el-icon><VideoPlay /></el-icon>
            <span style="margin-left: 8px;">출근</span>
          </el-button>
          <!-- 출근 후: 퇴근 버튼만 표시 -->
          <el-button
            v-else
            size="large"
            type="danger"
            @click="recordEvent('CLOCK_OUT')"
            class="clock-button"
          >
            <el-icon><VideoPause /></el-icon>
            <span style="margin-left: 8px;">퇴근</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 출퇴근 시간 표시 -->
    <div class="work-time-display">
      <div class="time-info">
        <div class="time-item">
          <span class="time-label">출근 시간</span>
          <span class="time-value">{{ clockInTime || '--:--:--' }}</span>
        </div>
        <div class="time-item">
          <span class="time-label">퇴근 시간</span>
          <span class="time-value">{{ clockOutTime || '--:--:--' }}</span>
        </div>
      </div>

      <!-- 휴게/외출 버튼 영역 -->
      <div class="status-actions" v-if="workStatus !== 'BEFORE_WORK'">
        <div class="status-label">근무 상태 관리</div>
        <div class="status-buttons">
          <!-- 휴게 토글 버튼 -->
          <el-button
            v-if="workStatus === 'WORKING' || workStatus === 'AWAY'"
            @click="recordEvent('BREAK_START')"
            type="warning"
            plain
          >
            <el-icon><CoffeeCup /></el-icon>
            <span style="margin-left: 6px;">휴게 시작</span>
          </el-button>
          <el-button
            v-if="workStatus === 'ON_BREAK'"
            @click="recordEvent('BREAK_END')"
            type="success"
            plain
          >
            <el-icon><Check /></el-icon>
            <span style="margin-left: 6px;">휴게 종료</span>
          </el-button>

          <!-- 외출 토글 버튼 -->
          <el-button
            v-if="workStatus === 'WORKING' || workStatus === 'ON_BREAK'"
            @click="recordEvent('GO_OUT')"
            type="info"
            plain
          >
            <el-icon><VideoPlay /></el-icon>
            <span style="margin-left: 6px;">외출</span>
          </el-button>
          <el-button
            v-if="workStatus === 'AWAY'"
            @click="recordEvent('COME_BACK')"
            type="primary"
            plain
          >
            <el-icon><VideoPause /></el-icon>
            <span style="margin-left: 6px;">복귀</span>
          </el-button>
        </div>
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


    <!-- 휴가 관리 섹션 -->
    <div class="attendance-tabs">
      <div class="vacation-section">
            <!-- 휴가 정책 보유 현황 -->
            <div class="section-header">
              <h3>보유 휴가 정책</h3>
            </div>

            <div class="balance-cards" v-if="usableBalances.length > 0">
              <div
                class="balance-card"
                v-for="balance in usableBalances"
                :key="balance.balanceTypeCode?.codeValue"
                @click="goToLeaveRequestWithPolicy(balance.balanceTypeCode?.codeValue)"
              >
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
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, onActivated, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Clock, Calendar, Sunny, TrendCharts, VideoPlay, VideoPause, Plus, CoffeeCup, Check } from '@element-plus/icons-vue';
import { useSnackbar } from '@/composables/useSnackbar';
import { getMyLeaveRequests, recordAttendanceEvent, getMyTodayAttendance, getMyAllBalances, getMyEffectivePolicy, getMyMonthlyAttendance } from '@/api/attendance';

export default {
  name: 'AttendancePage',
  components: {},
  setup() {
    const router = useRouter();
    const { success, error } = useSnackbar();
    const currentTime = ref(new Date().toLocaleTimeString());
    const timer = ref(null);

    const workStatus = ref('BEFORE_WORK');
    const clockInTime = ref(null);
    const clockOutTime = ref(null);
    const totalWorkTime = ref('00시간 00분');
    const monthlyWorkDays = ref(0);
    const totalMonthlyWorkHours = ref(0);

    const leaveRequests = ref([]); // 리스트용 (페이징)
    const leavePagination = ref({ page: 0, size: 10, totalElements: 0 });
    const balanceInfo = ref({
      remaining: 0,
      totalGranted: 0,
      totalUsed: 0
    });
    const allBalances = ref([]);
    const effectivePolicy = ref(null);

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

        console.log('🔍 [DEBUG] 보유 휴가 정책 조회 결과:', balances);
        console.log('🔍 [DEBUG] allBalances.value:', allBalances.value);
        console.log('🔍 [DEBUG] usableBalances 필터링 전:', allBalances.value.map(b => ({
          name: b.balanceTypeCode?.codeName,
          isUsable: b.isUsable,
          totalGranted: b.totalGranted
        })));

        // 연차(ANNUAL_LEAVE) 정보를 balanceInfo에 설정 (기존 호환성 유지)
        const annualLeave = balances.find(b => b.balanceTypeCode?.codeValue === 'PTC001');
        if (annualLeave) {
          balanceInfo.value = {
            remaining: annualLeave.remaining || 0,
            totalGranted: annualLeave.totalGranted || 0,
            totalUsed: annualLeave.totalUsed || 0
          };
        }
      } catch (err) {
        console.error('❌ [ERROR] 잔여 휴가를 불러오는 데 실패했습니다:', err);
      }
    };

    const fetchMonthlyData = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const monthlyAttendances = await getMyMonthlyAttendance({ year, month });

        if (monthlyAttendances && monthlyAttendances.length > 0) {
          // 근무일 수 계산 (ABSENT 제외)
          const workDays = monthlyAttendances.filter(att => att.status !== 'ABSENT').length;
          monthlyWorkDays.value = workDays;

          // 총 근무시간 계산
          const totalMinutes = monthlyAttendances.reduce((sum, att) => {
            return sum + (att.workedMinutes || 0);
          }, 0);
          const totalHours = Math.floor(totalMinutes / 60);
          totalMonthlyWorkHours.value = totalHours;
        }
      } catch (err) {
        console.error('❌ [ERROR] 월별 근태 데이터를 불러오는 데 실패했습니다:', err);
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
        console.error('⚠️ [WARNING] 기본근무 정책을 불러오는 데 실패했습니다. (정책 할당이 필요합니다)', err);
        // 정책이 없어도 페이지는 정상 작동해야 함
        effectivePolicy.value = null;
      }
    };

    onMounted(async () => {
      timer.value = setInterval(() => { currentTime.value = new Date().toLocaleTimeString(); }, 1000);

      // 병렬로 데이터 로드 (하나가 실패해도 다른 것들은 계속 실행)
      await Promise.allSettled([
        fetchTodayData(),
        fetchLeaveData(),
        fetchEffectivePolicy(),
        fetchBalance(),
        fetchMonthlyData()
      ]);

      console.log('✅ [INFO] 페이지 초기화 완료');
    });

    onUnmounted(() => {
      clearInterval(timer.value);
    });

    // 다른 페이지(휴가신청)에서 돌아왔을 때 잔액 갱신
    onActivated(() => {
      fetchBalance();
      fetchLeaveData();
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

    // 사용 가능한 휴가 정책만 필터링
    const usableBalances = computed(() => {
      const filtered = allBalances.value.filter(b => b.isUsable === true);
      console.log('🔍 [DEBUG] usableBalances computed 결과:', filtered.map(b => ({
        name: b.balanceTypeCode?.codeName,
        isUsable: b.isUsable
      })));
      return filtered;
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
        const deviceType = detectDeviceType();
        const gpsLocation = await getGpsLocation();

        const response = await recordAttendanceEvent({
          eventType: eventType,
          deviceType: deviceType,
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
        });

        console.log('근태 응답:', eventType, response);

        // 응답 데이터 추출 (이중 래핑 처리)
        const data = response?.data || response;

        // 출근 응답 처리
        if (eventType === 'CLOCK_IN' && data) {
          const { lateMinutes, isLate, monthlyLatenessCount, monthlyAllowedCount } = data;

          if (lateMinutes > 0 && !isLate) {
            // 허용 시간 내 지각 (구제)
            const remaining = monthlyAllowedCount != null ? monthlyAllowedCount - monthlyLatenessCount : '무제한';
            success(`출근 등록 완료 (${lateMinutes}분 지각, 허용 시간 내 정상 처리)\n이번 달 남은 지각 허용: ${remaining}${monthlyAllowedCount != null ? '회' : ''}`);
          } else if (isLate) {
            // 허용 시간 초과 지각
            const remaining = monthlyAllowedCount != null ? monthlyAllowedCount - monthlyLatenessCount : '무제한';
            error(`지각 처리되었습니다 (${lateMinutes}분 초과)\n이번 달 남은 지각 허용: ${remaining}${monthlyAllowedCount != null ? '회' : ''}`);
          } else {
            // 정상 출근
            success('출근 등록 완료');
          }
          await fetchEffectivePolicy();
        }
        // 퇴근 응답 처리
        else if (eventType === 'CLOCK_OUT' && data) {
          const { earlyLeaveMinutes, isEarlyLeave, monthlyEarlyLeaveCount, monthlyAllowedCount } = data;

          if (earlyLeaveMinutes > 0 && !isEarlyLeave) {
            // 허용 시간 내 조퇴 (구제)
            const remaining = monthlyAllowedCount != null ? monthlyAllowedCount - monthlyEarlyLeaveCount : '무제한';
            success(`퇴근 등록 완료 (${earlyLeaveMinutes}분 조퇴, 허용 시간 내 정상 처리)\n이번 달 남은 조퇴 허용: ${remaining}${monthlyAllowedCount != null ? '회' : ''}`);
          } else if (isEarlyLeave) {
            // 허용 시간 초과 조퇴
            const remaining = monthlyAllowedCount != null ? monthlyAllowedCount - monthlyEarlyLeaveCount : '무제한';
            error(`조퇴 처리되었습니다 (${earlyLeaveMinutes}분 초과)\n이번 달 남은 조퇴 허용: ${remaining}${monthlyAllowedCount != null ? '회' : ''}`);
          } else {
            // 정상 퇴근
            success('퇴근 등록 완료');
          }
        } else {
          // 그 외 이벤트 (휴게, 외출 등)
          success(`${eventType} 기록 완료`);
        }

        await fetchTodayData();
        // 출퇴근 시 월별 통계도 업데이트
        if (eventType === 'CLOCK_IN' || eventType === 'CLOCK_OUT') {
          await fetchMonthlyData();
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

    const goToLeaveRequestWithPolicy = (policyTypeCode) => {
      if (!policyTypeCode) return;
      router.push({
        path: '/leave-request',
        query: { policyType: policyTypeCode }
      });
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
      currentTime, workStatus, clockInTime, clockOutTime,
      totalWorkTime, workStatusText, recordEvent,
      leaveRequests, leavePagination, handleLeavePageChange, goToLeaveRequest, goToLeaveRequestWithPolicy,
      Clock, Calendar, Sunny, TrendCharts, VideoPlay, VideoPause, Plus, CoffeeCup, Check,
      balanceInfo,
      formatDate, getVacationStatusType, allBalances, usableBalances, getProgressColor,
      isBreakManualMode, effectivePolicy,
      monthlyWorkDays, totalMonthlyWorkHours
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

.clock-button {
  min-width: 140px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
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
  background: #409EFF;
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

.attendance-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.vacation-section {
  padding: 24px;
}

.work-time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  gap: 32px;
}

.time-info {
  display: flex;
  gap: 48px;
}

.time-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.status-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.status-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
  margin-bottom: 4px;
}

.status-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
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
  color: #409EFF;
}

/* 휴가 관리 탭 스타일 */
.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
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
  cursor: pointer;
}

.balance-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.2);
  border-color: #4f46e5;
}

/* balance-disabled 스타일 제거 - v-show로 숨김 처리하므로 불필요 */

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
</style>
