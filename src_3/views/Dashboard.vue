<template>
  <div class="dashboard">
    <!-- 환영 메시지 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h2>안녕하세요, {{ user.name }}님!</h2>
        <p>오늘도 좋은 하루 되세요. H.ONE에서 효율적인 업무를 시작해보세요.</p>
      </div>
      <div class="welcome-actions">
        <el-button type="primary" @click="$router.push('/attendance')">
          <el-icon><Clock /></el-icon>
          <span style="margin-left: 8px;">출근 체크</span>
        </el-button>
        <el-button @click="$router.push('/chat')">
          <el-icon><ChatDotRound /></el-icon>
          <span style="margin-left: 8px;">채팅 시작</span>
        </el-button>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">156</div>
          <div class="stat-label">전체 직원</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">142</div>
          <div class="stat-label">출근 중</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">23</div>
          <div class="stat-label">휴가 신청</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">8</div>
          <div class="stat-label">대기 결재</div>
        </div>
      </div>
    </div>

    <!-- 메인 컨텐츠 그리드 -->
    <div class="content-grid">
      <!-- 근태 현황 -->
      <div class="content-card">
        <div class="card-header">
          <h3>근태 현황</h3>
          <el-button type="text" @click="$router.push('/attendance')">전체보기</el-button>
        </div>
        <div class="attendance-content">
          <div class="attendance-summary">
            <div class="summary-item">
              <span class="label">출근 시간</span>
              <span class="value">09:15</span>
            </div>
            <div class="summary-item">
              <span class="label">퇴근 예정</span>
              <span class="value">18:15</span>
            </div>
            <div class="summary-item">
              <span class="label">근무 시간</span>
              <span class="value">8시간 30분</span>
            </div>
          </div>
          <div class="attendance-chart">
            <AttendanceChart />
          </div>
        </div>
      </div>

      <!-- 최근 채팅 -->
      <div class="content-card">
        <div class="card-header">
          <h3>최근 채팅</h3>
          <el-button type="text" @click="$router.push('/chat')">전체보기</el-button>
        </div>
        <div class="chat-list">
          <div class="chat-item" v-for="chat in recentChats" :key="chat.id">
            <el-avatar :src="chat.avatar" :size="40" />
            <div class="chat-content">
              <div class="chat-name">{{ chat.name }}</div>
              <div class="chat-message">{{ chat.message }}</div>
            </div>
            <div class="chat-time">{{ chat.time }}</div>
          </div>
        </div>
      </div>

      <!-- 대기 중인 결재 -->
      <div class="content-card">
        <div class="card-header">
          <h3>대기 중인 결재</h3>
          <el-button type="text" @click="$router.push('/approval')">전체보기</el-button>
        </div>
        <div class="approval-list">
          <div class="approval-item" v-for="approval in pendingApprovals" :key="approval.id">
            <div class="approval-content">
              <div class="approval-title">{{ approval.title }}</div>
              <div class="approval-requester">{{ approval.requester }} • {{ approval.time }}</div>
            </div>
            <el-tag :type="approval.priority === 'high' ? 'danger' : 'warning'">
              {{ approval.priority === 'high' ? '긴급' : '일반' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 오늘의 일정 -->
      <div class="content-card">
        <div class="card-header">
          <h3>오늘의 일정</h3>
          <el-button type="text">전체보기</el-button>
        </div>
        <div class="schedule-list">
          <div class="schedule-item" v-for="schedule in todaySchedule" :key="schedule.id">
            <div class="schedule-time">{{ schedule.time }}</div>
            <div class="schedule-content">
              <div class="schedule-title">{{ schedule.title }}</div>
              <div class="schedule-location">{{ schedule.location }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 팀 현황 -->
      <div class="content-card">
        <div class="card-header">
          <h3>팀 현황</h3>
          <el-button type="text" @click="$router.push('/organization')">전체보기</el-button>
        </div>
        <div class="team-stats">
          <div class="team-item" v-for="team in teamStats" :key="team.name">
            <div class="team-name">{{ team.name }}</div>
            <div class="team-members">{{ team.members }}명</div>
            <div class="team-attendance">
              <span class="attendance-rate">{{ team.attendanceRate }}%</span>
              <span class="attendance-label">출근률</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 빠른 액션 -->
      <div class="content-card">
        <div class="card-header">
          <h3>빠른 액션</h3>
        </div>
        <div class="quick-actions">
          <el-button 
            v-for="action in quickActions" 
            :key="action.name"
            :type="action.type"
            @click="handleQuickAction(action.route)"
            class="action-button"
          >
            <el-icon><component :is="action.icon" /></el-icon>
            {{ action.name }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AttendanceChart from '@/components/AttendanceChart.vue'

export default {
  name: 'DashboardPage',
  components: {
    AttendanceChart
  },
  data() {
    return {
      recentChats: [
        {
          id: 1,
          name: '김영희',
          message: '회의 자료 확인했습니다.',
          time: '10분 전',
          avatar: 'https://via.placeholder.com/40'
        },
        {
          id: 2,
          name: '박민수',
          message: '프로젝트 진행상황 공유드립니다.',
          time: '30분 전',
          avatar: 'https://via.placeholder.com/40'
        },
        {
          id: 3,
          name: '이지은',
          message: '내일 미팅 시간 조정 가능한지요?',
          time: '1시간 전',
          avatar: 'https://via.placeholder.com/40'
        }
      ],
      pendingApprovals: [
        {
          id: 1,
          title: '월간 보고서',
          requester: '김영희',
          time: '2시간 전',
          priority: 'high'
        },
        {
          id: 2,
          title: '휴가 신청',
          requester: '박민수',
          time: '4시간 전',
          priority: 'normal'
        },
        {
          id: 3,
          title: '비용 정산',
          requester: '이지은',
          time: '1일 전',
          priority: 'normal'
        }
      ],
      todaySchedule: [
        {
          id: 1,
          time: '14:00',
          title: '팀 미팅',
          location: '회의실 A'
        },
        {
          id: 2,
          time: '16:00',
          title: '프로젝트 리뷰',
          location: '온라인'
        }
      ],
      teamStats: [
        { name: '개발팀', members: 12, attendanceRate: 95 },
        { name: '디자인팀', members: 8, attendanceRate: 88 },
        { name: '마케팅팀', members: 6, attendanceRate: 92 }
      ],
      quickActions: [
        { name: '휴가 신청', icon: 'Calendar', type: 'primary', route: '/attendance' },
        { name: '결재 요청', icon: 'Document', type: 'success', route: '/approval' },
        { name: '화상회의', icon: 'VideoCamera', type: 'info', route: '/meeting' },
        { name: '예약', icon: 'Calendar', type: 'warning', route: '/resource' }
      ]
    }
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    handleQuickAction(route) {
      this.$router.push(route)
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  background: #ffffff;
  color: #2c3e50;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e4e7ed;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.welcome-content h2 {
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 600;
}

.welcome-content p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.welcome-actions {
  display: flex;
  gap: 12px;
}

.welcome-actions .el-button.el-button--primary {
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.welcome-actions .el-button.el-button--primary:hover {
  filter: brightness(0.95);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
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

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
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

.attendance-content {
  padding: 20px 24px;
}

.attendance-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item .label {
  display: block;
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.summary-item .value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.attendance-chart {
  height: 200px;
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.chat-list, .approval-list, .schedule-list {
  padding: 16px 24px;
}

.chat-item, .approval-item, .schedule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.chat-item:last-child, .approval-item:last-child, .schedule-item:last-child {
  border-bottom: none;
}

.chat-content {
  flex: 1;
}

.chat-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.chat-message {
  font-size: 14px;
  color: #606266;
}

.chat-time {
  font-size: 12px;
  color: #909399;
}

.approval-content {
  flex: 1;
}

.approval-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.approval-requester {
  font-size: 12px;
  color: #909399;
}

.schedule-time {
  font-weight: 500;
  color: #667eea;
  min-width: 60px;
}

.schedule-content {
  flex: 1;
}

.schedule-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.schedule-location {
  font-size: 12px;
  color: #909399;
}

.team-stats {
  padding: 16px 24px;
}

.team-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.team-item:last-child {
  border-bottom: none;
}

.team-name {
  font-weight: 500;
  color: #2c3e50;
}

.team-members {
  font-size: 14px;
  color: #606266;
}

.team-attendance {
  text-align: right;
}

.attendance-rate {
  font-weight: 600;
  color: #67c23a;
  margin-right: 4px;
}

.attendance-label {
  font-size: 12px;
  color: #909399;
}

.quick-actions {
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-button {
  height: 48px !important;
  font-size: 14px;
  width: 100% !important;
  min-width: 0 !important;
  flex: 1;
  display: flex !important;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
}

.action-button.el-button {
  width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
}

.action-button .el-icon {
  margin-right: 8px;
}
</style>
