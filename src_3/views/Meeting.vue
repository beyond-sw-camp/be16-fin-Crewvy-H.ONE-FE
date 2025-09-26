<template>
  <div class="meeting">
    <div class="page-header">
      <div class="header-content">
        <h1>화상회의</h1>
        <p>원격 미팅과 온라인 교육을 위한 화상회의 기능입니다.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="startMeeting">
          <el-icon><VideoCamera /></el-icon>
          <span style="margin-left: 8px;">새 회의 시작</span>
        </el-button>
        <el-button @click="joinMeeting">
          <el-icon><Connection /></el-icon>
          <span style="margin-left: 8px;">회의 참여</span>
        </el-button>
      </div>
    </div>

    <!-- 회의 상태 카드 -->
    <div class="meeting-cards">
      <div class="meeting-card">
        <div class="card-icon">
          <el-icon><VideoCamera /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">진행 중인 회의</div>
          <div class="card-value">{{ activeMeetings }}</div>
          <div class="card-subtitle">현재 활성</div>
        </div>
      </div>
      
      <div class="meeting-card">
        <div class="card-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">오늘 예정된 회의</div>
          <div class="card-value">{{ todayMeetings }}</div>
          <div class="card-subtitle">회의 일정</div>
        </div>
      </div>
      
      <div class="meeting-card">
        <div class="card-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">이번 주 총 회의 시간</div>
          <div class="card-value">{{ weeklyMeetingTime }}시간</div>
          <div class="card-subtitle">회의 시간</div>
        </div>
      </div>
      
      <div class="meeting-card">
        <div class="card-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">참여자 수</div>
          <div class="card-value">{{ totalParticipants }}</div>
          <div class="card-subtitle">평균 참여자</div>
        </div>
      </div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="meeting-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="진행 중인 회의" name="active">
          <div class="active-meetings">
            <div class="meeting-item" v-for="meeting in activeMeetingsList" :key="meeting.id">
              <div class="meeting-info">
                <div class="meeting-title">{{ meeting.title }}</div>
                <div class="meeting-details">
                  <span class="meeting-host">주최: {{ meeting.host }}</span>
                  <span class="meeting-participants">{{ meeting.participants }}명 참여</span>
                  <span class="meeting-duration">{{ meeting.duration }}</span>
                </div>
              </div>
              <div class="meeting-actions">
                <el-button type="primary" @click="joinActiveMeeting(meeting)">
                  <el-icon><Connection /></el-icon>
                  참여
                </el-button>
                <el-button @click="endMeeting">
                  <el-icon><Close /></el-icon>
                  종료
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="예정된 회의" name="scheduled">
          <div class="scheduled-meetings">
            <div class="section-header">
              <h3>예정된 회의</h3>
              <el-button type="primary" @click="scheduleMeeting">
                <el-icon><Plus /></el-icon>
                회의 일정 등록
              </el-button>
            </div>
            
            <div class="meeting-list">
              <div class="meeting-item" v-for="meeting in scheduledMeetings" :key="meeting.id">
                <div class="meeting-info">
                  <div class="meeting-title">{{ meeting.title }}</div>
                  <div class="meeting-details">
                    <span class="meeting-time">{{ meeting.date }} {{ meeting.time }}</span>
                    <span class="meeting-host">주최: {{ meeting.host }}</span>
                    <span class="meeting-participants">{{ meeting.participants }}명 초대</span>
                  </div>
                  <div class="meeting-description">{{ meeting.description }}</div>
                </div>
                <div class="meeting-actions">
                  <el-button type="primary" @click="startScheduledMeeting(meeting)">
                    <el-icon><VideoCamera /></el-icon>
                    시작
                  </el-button>
                  <el-button @click="editMeeting(meeting)">
                    <el-icon><Edit /></el-icon>
                    수정
                  </el-button>
                  <el-button @click="cancelMeeting(meeting)">
                    <el-icon><Delete /></el-icon>
                    취소
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="회의 기록" name="history">
          <div class="meeting-history">
            <div class="section-header">
              <h3>회의 기록</h3>
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
                <el-select v-model="selectedHost" placeholder="주최자 선택" style="width: 150px">
                  <el-option label="전체" value="" />
                  <el-option label="김철수" value="김철수" />
                  <el-option label="박민수" value="박민수" />
                </el-select>
              </div>
            </div>
            
            <div class="history-list">
              <div class="meeting-item" v-for="meeting in meetingHistory" :key="meeting.id">
                <div class="meeting-info">
                  <div class="meeting-title">{{ meeting.title }}</div>
                  <div class="meeting-details">
                    <span class="meeting-date">{{ meeting.date }}</span>
                    <span class="meeting-host">주최: {{ meeting.host }}</span>
                    <span class="meeting-duration">{{ meeting.duration }}</span>
                    <span class="meeting-participants">{{ meeting.participants }}명 참여</span>
                  </div>
                  <div class="meeting-status">
                    <el-tag :type="meeting.status === '완료' ? 'success' : 'warning'" size="small">
                      {{ meeting.status }}
                    </el-tag>
                  </div>
                </div>
                <div class="meeting-actions">
                  <el-button type="text" @click="viewRecording(meeting)">
                    <el-icon><VideoPlay /></el-icon>
                    녹화 보기
                  </el-button>
                  <el-button type="text" @click="downloadTranscript(meeting)">
                    <el-icon><Download /></el-icon>
                    회의록 다운로드
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 회의 시작 모달 -->
    <el-dialog
      v-model="showStartMeeting"
      title="새 회의 시작"
      width="600px"
    >
      <el-form :model="meetingForm" label-width="80px">
        <el-form-item label="회의 제목">
          <el-input v-model="meetingForm.title" placeholder="회의 제목을 입력하세요" />
        </el-form-item>
        <el-form-item label="설명">
          <el-input
            v-model="meetingForm.description"
            type="textarea"
            placeholder="회의 설명을 입력하세요"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="참여자">
          <el-select
            v-model="meetingForm.participants"
            multiple
            placeholder="참여자를 선택하세요"
            style="width: 100%"
          >
            <el-option
              v-for="employee in employees"
              :key="employee.id"
              :label="employee.name"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="녹화">
          <el-switch v-model="meetingForm.recording" />
          <span class="form-help">회의를 자동으로 녹화합니다.</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStartMeeting = false">취소</el-button>
        <el-button type="primary" @click="createMeeting">회의 시작</el-button>
      </template>
    </el-dialog>

    <!-- 회의 참여 모달 -->
    <el-dialog
      v-model="showJoinMeeting"
      title="회의 참여"
      width="400px"
    >
      <el-form :model="joinForm" label-width="80px">
        <el-form-item label="회의 ID">
          <el-input v-model="joinForm.meetingId" placeholder="회의 ID를 입력하세요" />
        </el-form-item>
        <el-form-item label="비밀번호">
          <el-input v-model="joinForm.password" placeholder="비밀번호 (선택사항)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showJoinMeeting = false">취소</el-button>
        <el-button type="primary" @click="joinMeetingRoom">참여</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'MeetingPage',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      activeTab: 'active',
      showStartMeeting: false,
      showJoinMeeting: false,
      dateRange: [],
      selectedHost: '',
      meetingForm: {
        title: '',
        description: '',
        participants: [],
        recording: false
      },
      joinForm: {
        meetingId: '',
        password: ''
      },
      activeMeetings: 2,
      todayMeetings: 3,
      weeklyMeetingTime: 12,
      totalParticipants: 8,
      activeMeetingsList: [
        {
          id: 1,
          title: '주간 팀 미팅',
          host: '김철수',
          participants: 5,
          duration: '45분 진행 중'
        },
        {
          id: 2,
          title: '프로젝트 리뷰',
          host: '박민수',
          participants: 3,
          duration: '20분 진행 중'
        }
      ],
      scheduledMeetings: [
        {
          id: 1,
          title: '월간 보고서 검토',
          date: '2024-01-20',
          time: '14:00',
          host: '김영희',
          participants: 8,
          description: '월간 성과 보고서 검토 및 다음 달 계획 수립'
        },
        {
          id: 2,
          title: '신규 프로젝트 킥오프',
          date: '2024-01-22',
          time: '10:00',
          host: '이지은',
          participants: 12,
          description: '신규 프로젝트 시작을 위한 킥오프 미팅'
        }
      ],
      meetingHistory: [
        {
          id: 1,
          title: '주간 팀 미팅',
          date: '2024-01-15',
          host: '김철수',
          duration: '1시간 15분',
          participants: 6,
          status: '완료'
        },
        {
          id: 2,
          title: '프로젝트 진행상황 공유',
          date: '2024-01-14',
          host: '박민수',
          duration: '45분',
          participants: 4,
          status: '완료'
        },
        {
          id: 3,
          title: '클라이언트 미팅',
          date: '2024-01-12',
          host: '이지은',
          duration: '2시간',
          participants: 8,
          status: '완료'
        }
      ],
      employees: [
        { id: 1, name: '김철수' },
        { id: 2, name: '박민수' },
        { id: 3, name: '이지은' },
        { id: 4, name: '김영희' },
        { id: 5, name: '정수진' }
      ]
    }
  },
  methods: {
    startMeeting() {
      this.showStartMeeting = true
    },
    joinMeeting() {
      this.showJoinMeeting = true
    },
    handleTabChange(tab) {
      this.activeTab = tab
    },
    joinActiveMeeting() {
      this.success('회의에 참여합니다.')
    },
    endMeeting() {
      this.$confirm('정말로 회의를 종료하시겠습니까?', '확인', {
        confirmButtonText: '종료',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        this.success('회의가 종료되었습니다.')
      })
    },
    scheduleMeeting() {
      this.info('회의 일정 등록 기능')
    },
    startScheduledMeeting(meet) {
      this.success(`${meet.title}을 시작합니다.`)
    },
    editMeeting(meet) {
      this.info(`${meet.title} 수정`)
    },
    cancelMeeting() {
      this.$confirm('정말로 회의를 취소하시겠습니까?', '확인', {
        confirmButtonText: '취소',
        cancelButtonText: '돌아가기',
        type: 'warning'
      }).then(() => {
        this.success('회의가 취소되었습니다.')
      })
    },
    viewRecording(meeting) {
      this.info(`${meeting.title} 녹화 보기`)
    },
    downloadTranscript(meeting) {
      this.success(`${meeting.title} 회의록을 다운로드합니다.`)
    },
    createMeeting() {
      this.success('회의가 시작되었습니다.')
      this.showStartMeeting = false
      this.meetingForm = {
        title: '',
        description: '',
        participants: [],
        recording: false
      }
    },
    joinMeetingRoom() {
      this.success('회의에 참여합니다.')
      this.showJoinMeeting = false
      this.joinForm = {
        meetingId: '',
        password: ''
      }
    }
  }
}
</script>

<style scoped>
.meeting {
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

.meeting-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.meeting-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.meeting-card:hover {
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

.meeting-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.meeting-tabs :deep(.el-tabs__nav) {
  padding-left: 20px;
}

.active-meetings, .scheduled-meetings, .meeting-history {
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
}

.meeting-list, .history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meeting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.meeting-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.meeting-info {
  flex: 1;
}

.meeting-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.meeting-details {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.meeting-description {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.meeting-status {
  margin-top: 8px;
}

.meeting-actions {
  display: flex;
  gap: 8px;
}

.meeting-actions .el-button .el-icon {
  margin-right: 4px;
}

.header-actions .el-button .el-icon {
  margin-right: 4px;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}
</style>
