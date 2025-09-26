<template>
  <div class="attendance">
    <div class="page-header">
      <div class="header-content">
        <h1>근태 관리</h1>
        <p>출퇴근 기록과 휴가 신청을 관리하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="checkInOut">
          <el-icon><Clock /></el-icon>
          <span style="margin-left: 8px;">{{ isCheckedIn ? '퇴근 체크' : '출근 체크' }}</span>
        </el-button>
        <el-button @click="showVacationRequest = true">
          <el-icon><Calendar /></el-icon>
          <span style="margin-left: 8px;">휴가 신청</span>
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
          <div class="card-value">{{ todayWorkTime }}</div>
          <div class="card-subtitle">{{ isCheckedIn ? '근무 중' : '출근 전' }}</div>
        </div>
      </div>
      
      <div class="attendance-card">
        <div class="card-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">이번 달 근무일</div>
          <div class="card-value">{{ monthlyWorkDays }}일</div>
          <div class="card-subtitle">목표: 22일</div>
        </div>
      </div>
      
      <div class="attendance-card">
        <div class="card-icon">
          <el-icon><Sunny /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">잔여 휴가</div>
          <div class="card-value">{{ remainingVacation }}일</div>
          <div class="card-subtitle">총 15일 중</div>
        </div>
      </div>
      
      <div class="attendance-card">
        <div class="card-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">출근률</div>
          <div class="card-value">{{ attendanceRate }}%</div>
          <div class="card-subtitle">이번 달</div>
        </div>
      </div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="attendance-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="근태 기록" name="records">
          <div class="records-section">
            <div class="section-header">
              <h3>근태 기록</h3>
              <div class="filter-options">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="~"
                  start-placeholder="시작일"
                  end-placeholder="종료일"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
                <el-select v-model="selectedEmployee" placeholder="직원 선택" style="width: 150px">
                  <el-option label="전체" value="" />
                  <el-option label="김철수" value="김철수" />
                  <el-option label="박민수" value="박민수" />
                  <el-option label="이지은" value="이지은" />
                </el-select>
              </div>
            </div>
            
            <div class="records-table">
              <el-table :data="filteredRecords" style="width: 100%">
                <el-table-column prop="date" label="날짜" width="140" align="center" />
                <el-table-column prop="employee" label="직원" width="120" align="center" />
                <el-table-column prop="checkIn" label="출근" width="120" align="center" />
                <el-table-column prop="checkOut" label="퇴근" width="120" align="center" />
                <el-table-column prop="workTime" label="근무시간" width="140" align="center" />
                <el-table-column prop="overtime" label="초과근무" width="140" align="center" />
                <el-table-column prop="status" label="상태" width="120" align="center">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)" size="small">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="수정" width="100" align="center">
                  <template #default="scope">
                    <el-button type="text" size="small" @click="editRecord(scope.row)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column label="삭제" width="100" align="center">
                  <template #default="scope">
                    <el-button type="text" size="small" @click="deleteRecord(scope.row)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="휴가 관리" name="vacation">
          <div class="vacation-section">
            <div class="section-header">
              <h3>휴가 신청 현황</h3>
              <el-button type="primary" @click="showVacationRequest = true">
                <el-icon><Plus /></el-icon>
                휴가 신청
              </el-button>
            </div>
            
            <div class="vacation-list">
              <div class="vacation-item" v-for="vacation in vacationRequests" :key="vacation.id">
                <div class="vacation-info">
                  <div class="vacation-dates">
                    <span class="start-date">{{ vacation.startDate }}</span>
                    <span class="separator">~</span>
                    <span class="end-date">{{ vacation.endDate }}</span>
                    <span class="duration">({{ vacation.days }}일)</span>
                  </div>
                  <div class="vacation-reason">{{ vacation.reason }}</div>
                  <div class="vacation-employee">{{ vacation.employee }}</div>
                </div>
                <div class="vacation-status">
                  <el-tag :type="getVacationStatusType(vacation.status)" size="small">
                    {{ vacation.status }}
                  </el-tag>
                  <div class="vacation-actions" v-if="vacation.status === '대기'">
                    <el-button type="text" size="small" @click="approveVacation(vacation)">
                      승인
                    </el-button>
                    <el-button type="text" size="small" @click="rejectVacation(vacation)">
                      거부
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="근태 통계" name="statistics">
          <div class="statistics-section">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-title">이번 달 총 근무시간</div>
                <div class="stat-value">{{ monthlyWorkHours }}시간</div>
                <div class="stat-change positive">+2.5시간</div>
              </div>
              <div class="stat-item">
                <div class="stat-title">평균 출근 시간</div>
                <div class="stat-value">{{ averageCheckIn }}</div>
                <div class="stat-change negative">-5분</div>
              </div>
              <div class="stat-item">
                <div class="stat-title">평균 퇴근 시간</div>
                <div class="stat-value">{{ averageCheckOut }}</div>
                <div class="stat-change positive">+10분</div>
              </div>
              <div class="stat-item">
                <div class="stat-title">초과근무 시간</div>
                <div class="stat-value">{{ overtimeHours }}시간</div>
                <div class="stat-change neutral">0시간</div>
              </div>
            </div>
            
            <div class="chart-section">
              <h4>근무 시간 추이</h4>
              <div class="chart-placeholder">
                <el-icon><TrendCharts /></el-icon>
                <p>근무 시간 차트</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 휴가 신청 모달 -->
    <el-dialog
      v-model="showVacationRequest"
      title="휴가 신청"
      width="500px"
    >
      <el-form :model="vacationForm" label-width="80px">
        <el-form-item label="휴가 유형">
          <el-select v-model="vacationForm.type" placeholder="휴가 유형을 선택하세요">
            <el-option label="연차" value="annual" />
            <el-option label="병가" value="sick" />
            <el-option label="경조사" value="family" />
            <el-option label="기타" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="시작일">
          <el-date-picker
            v-model="vacationForm.startDate"
            type="date"
            placeholder="시작일 선택"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="종료일">
          <el-date-picker
            v-model="vacationForm.endDate"
            type="date"
            placeholder="종료일 선택"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="사유">
          <el-input
            v-model="vacationForm.reason"
            type="textarea"
            placeholder="휴가 사유를 입력하세요"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showVacationRequest = false">취소</el-button>
        <el-button type="primary" @click="submitVacationRequest">신청</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'AttendancePage',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      activeTab: 'records',
      isCheckedIn: false,
      checkInTime: null,
      checkOutTime: null,
      showVacationRequest: false,
      dateRange: [],
      selectedEmployee: '',
      vacationForm: {
        type: '',
        startDate: '',
        endDate: '',
        reason: ''
      },
      todayWorkTime: '0시간 0분',
      monthlyWorkDays: 18,
      remainingVacation: 10,
      attendanceRate: 95,
      monthlyWorkHours: 144,
      averageCheckIn: '09:15',
      averageCheckOut: '18:30',
      overtimeHours: 8,
      records: [
        {
          id: 1,
          date: '2024-01-15',
          employee: '김철수',
          checkIn: '09:15',
          checkOut: '18:30',
          workTime: '8시간 15분',
          overtime: '0시간 15분',
          status: '정상'
        },
        {
          id: 2,
          date: '2024-01-14',
          employee: '김철수',
          checkIn: '09:00',
          checkOut: '19:00',
          workTime: '9시간 0분',
          overtime: '1시간 0분',
          status: '정상'
        },
        {
          id: 3,
          date: '2024-01-13',
          employee: '김철수',
          checkIn: '09:30',
          checkOut: '18:00',
          workTime: '7시간 30분',
          overtime: '0시간 0분',
          status: '지각'
        }
      ],
      vacationRequests: [
        {
          id: 1,
          employee: '김영희',
          startDate: '2024-01-20',
          endDate: '2024-01-22',
          days: 3,
          reason: '가족 여행',
          status: '대기'
        },
        {
          id: 2,
          employee: '박민수',
          startDate: '2024-01-25',
          endDate: '2024-01-25',
          days: 1,
          reason: '개인 사정',
          status: '승인'
        },
        {
          id: 3,
          employee: '이지은',
          startDate: '2024-01-18',
          endDate: '2024-01-19',
          days: 2,
          reason: '병가',
          status: '거부'
        }
      ]
    }
  },
  computed: {
    filteredRecords() {
      let filtered = this.records
      
      if (this.selectedEmployee) {
        filtered = filtered.filter(record => record.employee === this.selectedEmployee)
      }
      
      return filtered
    }
  },
  methods: {
    checkInOut() {
      const now = new Date()
      const timeString = now.toTimeString().slice(0, 5)
      
      if (!this.isCheckedIn) {
        this.isCheckedIn = true
        this.checkInTime = timeString
        this.success(`출근 체크 완료: ${timeString}`)
      } else {
        this.isCheckedIn = false
        this.checkOutTime = timeString
        this.success(`퇴근 체크 완료: ${timeString}`)
      }
    },
    handleTabChange(tab) {
      this.activeTab = tab
    },
    getStatusType(status) {
      const statusMap = {
        '정상': 'success',
        '지각': 'warning',
        '조퇴': 'danger',
        '결근': 'info'
      }
      return statusMap[status] || 'info'
    },
    getVacationStatusType(status) {
      const statusMap = {
        '대기': 'warning',
        '승인': 'success',
        '거부': 'danger'
      }
      return statusMap[status] || 'info'
    },
    editRecord(rec) {
      this.info(`${rec.date} 근태 기록을 수정합니다.`)
    },
    deleteRecord() {
      this.$confirm('정말로 삭제하시겠습니까?', '확인', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        this.success('삭제되었습니다.')
      })
    },
    approveVacation(vacation) {
      vacation.status = '승인'
      this.success('휴가가 승인되었습니다.')
    },
    rejectVacation(vacation) {
      vacation.status = '거부'
      this.info('휴가가 거부되었습니다.')
    },
    submitVacationRequest() {
      this.success('휴가 신청이 완료되었습니다.')
      this.showVacationRequest = false
      this.vacationForm = {
        type: '',
        startDate: '',
        endDate: '',
        reason: ''
      }
    }
  }
}
</script>

<style scoped>
.attendance {
  max-width: 1200px;
  margin: 0 auto;
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

.records-table {
  margin-top: 20px;
}

.records-table :deep(.el-table) {
  width: 100%;
}

.records-table :deep(.el-table th) {
  text-align: center;
  padding: 12px 8px;
}

.records-table :deep(.el-table td) {
  text-align: center;
  padding: 12px 8px;
}

.records-table :deep(.el-table__body-wrapper) {
  overflow-x: auto;
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

.vacation-employee {
  font-size: 12px;
  color: #909399;
}

.vacation-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.vacation-actions {
  display: flex;
  gap: 4px;
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
