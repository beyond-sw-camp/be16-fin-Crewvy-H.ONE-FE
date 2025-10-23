<template>
    <div class="attendance-container">
      <el-tabs v-model="activeTab" class="attendance-tabs">
        <el-tab-pane label="출퇴근 기록" name="record">
          <!-- ... 기존 출퇴근 기록 탭 내용 ... -->
        </el-tab-pane>
        <el-tab-pane label="월별 현황" name="monthly">
          <!-- ... 기존 월별 현황 탭 내용 ... -->
        </el-tab-pane>
        <el-tab-pane label="연차/휴가" name="leave">
          <!-- ... 기존 연차/휴가 탭 내용 ... -->
        </el-tab-pane>
        
        <!-- 새로운 '나의 근무 정책' 탭 -->
        <el-tab-pane label="나의 근무 정책" name="my-policy">
          <div class="policy-section">
            <el-card class="box-card policy-card" v-loading="isPolicyLoading">
              <template #header>
                <div class="card-header">
                  <span><el-icon><InfoFilled /></el-icon> 오늘 나에게 적용되는 근무 정책</span>
                </div>
              </template>
              <div v-if="effectivePolicy" class="policy-content">
                <div class="policy-name">
                  <span>{{ effectivePolicy.name }}</span>
                </div>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="정책 유형" v-if="effectivePolicy.policyType">
                    {{ effectivePolicy.policyType.typeName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="근무 유형" v-if="effectivePolicy.ruleDetails.workTimeRule">
                    <el-tag size="small">{{ effectivePolicy.ruleDetails.workTimeRule.type }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="근무 시간" v-if="effectivePolicy.ruleDetails.workTimeRule && effectivePolicy.ruleDetails.workTimeRule.type === 'FIXED'">
                    {{ effectivePolicy.ruleDetails.workTimeRule.workStartTime }} - {{ effectivePolicy.ruleDetails.workTimeRule.workEndTime }}
                  </el-descriptions-item>
                  <el-descriptions-item label="코어 타임" v-if="effectivePolicy.ruleDetails.workTimeRule && effectivePolicy.ruleDetails.workTimeRule.type === 'FLEXIBLE'">
                    {{ effectivePolicy.ruleDetails.workTimeRule.coreTimeStart }} - {{ effectivePolicy.ruleDetails.workTimeRule.coreTimeEnd }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              <div v-else-if="!isPolicyLoading" class="no-policy">
                <p>적용되는 근무 정책 정보를 불러올 수 없거나, 할당된 정책이 없습니다.</p>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script>
    import { ref, onMounted, onUnmounted, computed } from 'vue';
    import { useRouter } from 'vue-router';
    import { ArrowLeft, ArrowRight, InfoFilled } from '@element-plus/icons-vue';
    import { getMyEffectivePolicy } from '@/api/attendance';
    import { useSnackbar } from '@/composables/useSnackbar';
    
    export default {
      name: 'AttendancePage',
      components: { InfoFilled },
      setup() {
        const router = useRouter();
        const { error } = useSnackbar();
        const activeTab = ref('record');
        const currentTime = ref(new Date().toLocaleTimeString());
        const timer = ref(null);
    
        const isClockedIn = ref(false);
        const isClockedOut = ref(false);
        const clockInTime = ref(null);
        const clockOutTime = ref(null);
        const workTimer = ref(null);
        const totalWorkTime = ref('00:00:00');
    
        const calendarDate = ref(new Date());
        const monthlyData = ref({
          '2025-09-01': '정상',
          '2025-09-02': '정상',
          '2025-09-03': '지각',
          '2025-09-04': '정상',
          '2025-09-05': '조퇴',
          '2025-09-08': '휴가',
        });
    
        const leaveHistory = ref([
          { type: '연차', date: '2025-09-08', status: '승인' },
          { type: '반차', date: '2025-08-20', status: '승인' },
          { type: '병가', date: '2025-07-15', status: '승인' },
        ]);
  
        const effectivePolicy = ref(null);
        const isPolicyLoading = ref(false);
  
        const fetchMyEffectivePolicy = async () => {
          isPolicyLoading.value = true;
          try {
            effectivePolicy.value = await getMyEffectivePolicy();
          } catch (err) {
            error(err.response?.data?.message || '적용 정책 정보를 불러오는 데 실패했습니다.');
          } finally {
            isPolicyLoading.value = false;
          }
        };
    
        onMounted(() => {
          timer.value = setInterval(() => {
            currentTime.value = new Date().toLocaleTimeString();
          }, 1000);
          fetchMyEffectivePolicy();
        });
    
        onUnmounted(() => {
          clearInterval(timer.value);
          if(workTimer.value) clearInterval(workTimer.value);
        });
    
        const workStatusText = computed(() => {
          if (isClockedOut.value) return '퇴근';
          if (isClockedIn.value) return '근무 중';
          return '출근 전';
        });
    
        const workStatusClass = computed(() => {
          if (isClockedOut.value) return 'status-off';
          if (isClockedIn.value) return 'status-on';
          return 'status-before';
        });
    
        const currentMonthYear = computed(() => {
          return calendarDate.value.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
          });
        });
    
        const recordAttendance = (type) => {
          const now = new Date();
          if (type === 'clock-in') {
            isClockedIn.value = true;
            clockInTime.value = now.toLocaleTimeString();
            startWorkTimer(now);
          } else if (type === 'clock-out') {
            isClockedOut.value = true;
            clockOutTime.value = now.toLocaleTimeString();
            clearInterval(workTimer.value);
          }
        };
    
        const startWorkTimer = (startTime) => {
          workTimer.value = setInterval(() => {
            const now = new Date();
            const diff = now - startTime;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            totalWorkTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          }, 1000);
        };
    
        const prevMonth = () => {
          calendarDate.value = new Date(calendarDate.value.setMonth(calendarDate.value.getMonth() - 1));
        };
    
        const nextMonth = () => {
          calendarDate.value = new Date(calendarDate.value.setMonth(calendarDate.value.getMonth() + 1));
        };
    
        const getWorkStatusForDate = (day) => {
          return monthlyData.value[day] || '';
        };
    
        const goToLeaveRequest = () => {
          router.push('/leave-request');
        };
    
        return {
          activeTab,
          currentTime,
          isClockedIn,
          isClockedOut,
          clockInTime,
          clockOutTime,
          totalWorkTime,
          workStatusText,
          workStatusClass,
          recordAttendance,
          calendarDate,
          currentMonthYear,
          prevMonth,
          nextMonth,
          getWorkStatusForDate,
          leaveHistory,
          goToLeaveRequest,
          effectivePolicy,
          isPolicyLoading,
          ArrowLeft,
          ArrowRight,
        };
      },
    };
  </script>  
  <style scoped>
    /* ... (기존 스타일) ... */
  .policy-section {
    padding: 10px;
  }
  .policy-card {
    background-color: #f5f7fa;
  }
  .card-header {
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .policy-content .policy-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 16px;
  }
  .no-policy {
    text-align: center;
    color: #909399;
    font-size: 14px;
    padding: 20px 0;
  }
  </style>
