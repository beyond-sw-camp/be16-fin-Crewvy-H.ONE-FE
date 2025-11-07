<template>
  <div class="team-goal-detail-container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <div class="title-row">
          <h1 class="title">{{ teamGoalDetail.title }}</h1>
          <el-tag :type="getTeamGoalStatusType(teamGoalDetail.status)" effect="dark" class="status-tag">
            {{ teamGoalDetail.status }}
          </el-tag>
        </div>
        <p class="subtitle">
          <el-icon><Calendar /></el-icon>
          <span>{{ teamGoalDetail.startDate }} ~ {{ teamGoalDetail.endDate }}</span>
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack" class="back-button" :icon="ArrowLeft">
          목록으로
        </el-button>
      </div>
    </div>

    <!-- Goal Summary Card -->
    <el-card class="summary-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon class="section-icon"><Document /></el-icon>
          <span class="section-title">목표 설명</span>
        </div>
      </template>
      <p class="goal-description">{{ teamGoalDetail.contents }}</p>
    </el-card>

    <!-- Team Members Card -->
    <el-card class="members-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon class="section-icon"><UserFilled /></el-icon>
          <span class="section-title">팀원 목록</span>
        </div>
      </template>
      <div class="team-members-grid">
        <el-card v-for="member in teamGoalDetail.memberList" :key="member.memberPositionId" class="member-card" shadow="never">
          <div class="member-card-header">
            <el-icon v-if="member.isCreater === 'TRUE'" class="member-icon-star"><Star /></el-icon>
            <el-icon v-else class="member-icon-user"><User /></el-icon>
            <h3 class="member-name">{{ member.memberName }}</h3>
          </div>
          <div class="member-details">
            <div class="member-detail-row">
              <span class="detail-label">소속:</span>
              <span class="detail-value">{{ member.memberOrganizationName }}</span>
            </div>
            <div class="member-detail-row">
              <span class="detail-label">직책:</span>
              <span class="detail-value">{{ member.memberTitleName }}</span>
            </div>
          </div>
          <el-tag v-if="member.isCreater === 'TRUE'" size="small" type="warning" class="member-role-tag">관리자</el-tag>
          <el-tag v-else size="small" class="member-role-tag">팀원</el-tag>
        </el-card>
      </div>
    </el-card>

    <!-- Member Goals Section -->
    <div class="sub-goal-section">
      <div v-if="currentMode !== 'complete'">
        <el-card class="goal-list-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon class="section-icon"><CircleCheck /></el-icon>
              <span class="section-title">본인 평가 완료</span>
            </div>
          </template>
          <div v-if="completedGoals.length > 0" class="sub-goal-list">
            <el-card v-for="goal in completedGoals" :key="goal.goalId" class="sub-goal-card" shadow="hover" @click="goToMemberGoalDetail(goal.goalId, 'review')">
              <div class="sub-goal-header">
                <el-icon class="goal-icon"><Flag /></el-icon>
                <h4 class="sub-goal-title">{{ goal.title }}</h4>
                <el-tag :type="getStatusType(goal.status)" class="sub-goal-status" effect="dark" size="small">{{ goal.status }}</el-tag>
              </div>
              <p class="sub-goal-description">{{ goal.contents }}</p>
              <div class="sub-goal-footer">
                <div class="sub-goal-user-info">
                  <el-icon><User /></el-icon>
                  <span class="user-name">{{ goal.memberName }}</span>
                  <span class="user-details">({{ goal.memberOrganization }} / {{ goal.memberPostion }})</span>
                </div>
                <div class="sub-goal-period">
                  <el-icon><Clock /></el-icon>
                  <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
                </div>
              </div>
            </el-card>
          </div>
          <div v-else class="empty-state">
            <el-icon class="empty-icon"><FolderOpened /></el-icon>
            <p class="empty-text">평가 완료된 목표가 없습니다</p>
          </div>
        </el-card>

        <el-card class="goal-list-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon class="section-icon"><Clock /></el-icon>
              <span class="section-title">평가 대기</span>
            </div>
          </template>
          <div v-if="pendingGoals.length > 0" class="sub-goal-list">
            <el-card v-for="goal in pendingGoals" :key="goal.goalId" class="sub-goal-card" shadow="hover" @click="goToMemberGoalDetail(goal.goalId, 'edit')">
              <div class="sub-goal-header">
                <el-icon class="goal-icon"><Flag /></el-icon>
                <h4 class="sub-goal-title">{{ goal.title }}</h4>
                <el-tag :type="getStatusType(goal.status)" class="sub-goal-status" effect="dark" size="small">{{ goal.status }}</el-tag>
              </div>
              <p class="sub-goal-description">{{ goal.contents }}</p>
              <div class="sub-goal-footer">
                <div class="sub-goal-user-info">
                  <el-icon><User /></el-icon>
                  <span class="user-name">{{ goal.memberName }}</span>
                  <span class="user-details">({{ goal.memberOrganization }} / {{ goal.memberPostion }})</span>
                </div>
                <div class="sub-goal-period">
                  <el-icon><Clock /></el-icon>
                  <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
                </div>
              </div>
            </el-card>
          </div>
          <div v-else class="empty-state">
            <el-icon class="empty-icon"><FolderOpened /></el-icon>
            <p class="empty-text">평가 대기중인 목표가 없습니다</p>
          </div>
        </el-card>
      </div>

      <div v-if="currentMode === 'complete'">
        <el-card class="goal-list-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon class="section-icon"><Select /></el-icon>
              <span class="section-title">평가 완료</span>
            </div>
          </template>
          <div v-if="finalCompletedGoals.length > 0" class="sub-goal-list">
            <el-card v-for="goal in finalCompletedGoals" :key="goal.goalId" class="sub-goal-card" shadow="hover" @click="goToMemberGoalDetail(goal.goalId, 'complete')">
              <div class="sub-goal-header">
                <el-icon class="goal-icon"><Flag /></el-icon>
                <h4 class="sub-goal-title">{{ goal.title }}</h4>
                <el-tag :type="getStatusType(goal.status)" class="sub-goal-status" effect="dark" size="small">{{ goal.status }}</el-tag>
              </div>
              <p class="sub-goal-description">{{ goal.contents }}</p>
              <div class="sub-goal-footer">
                <div class="sub-goal-user-info">
                  <el-icon><User /></el-icon>
                  <span class="user-name">{{ goal.memberName }}</span>
                  <span class="user-details">({{ goal.memberOrganization }} / {{ goal.memberPostion }})</span>
                </div>
                <div class="sub-goal-period">
                  <el-icon><Clock /></el-icon>
                  <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
                </div>
              </div>
            </el-card>
          </div>
          <div v-else class="empty-state">
            <el-icon class="empty-icon"><FolderOpened /></el-icon>
            <p class="empty-text">최종 평가 완료된 목표가 없습니다</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/api/http';
import {
  User, Star, ArrowLeft, Calendar, Document, UserFilled, CircleCheck,
  Flag, Clock, FolderOpened, Select
} from '@element-plus/icons-vue';

export default {
  name: 'TeamGoalReviewDetail',
  components: {
    User, Star, Calendar, Document, UserFilled, CircleCheck,
    Flag, Clock, FolderOpened, Select
  },
  data() {
    return {
      ArrowLeft, // For icon prop usage
      teamGoalDetail: { // API 응답을 담을 단일 객체
        title: '',
        contents: '',
        startDate: '',
        endDate: '',
        status: '',
        goalList: [],
        memberList: [], // Added this
        memberPositionId: null, // Manager's memberPositionId for this team goal
      },
      myMemberPositionId: null, // Current user's memberPositionId
      currentMode: 'review', // Default mode
    };
  },
  computed: {
    completedGoals() {
      return this.teamGoalDetail.goalList.filter(goal => goal.status === '본인 평가 완료');
    },
    pendingGoals() {
      return this.teamGoalDetail.goalList.filter(goal => goal.status === '평가 대기');
    },
    finalCompletedGoals() {
      return this.teamGoalDetail.goalList.filter(goal => goal.status === '최종 평가 완료');
    },
  },
  methods: {
    goBack() {
      this.$router.push('/performance/review');
    },
    async fetchTeamGoalDetail() {
      const goalId = this.$route.params.id;
      try {
        // In a real environment, you would use the actual API call:
        const response = await apiClient.get(`/workforce-service/performance/team-goal/${goalId}`);
        this.teamGoalDetail = response.data.data;

        // Sort memberList to place creators (managers) first
        if (this.teamGoalDetail.memberList) {
          this.teamGoalDetail.memberList.sort((a, b) => {
            if (a.isCreater === 'TRUE' && b.isCreater !== 'TRUE') return -1;
            if (a.isCreater !== 'TRUE' && b.isCreater === 'TRUE') return 1;
            return 0;
          });
        }

      } catch (error) {
        console.error('Error fetching team goal details:', error);
        this.$message.error('데이터를 불러오는 데 실패했습니다.');
      }
    },
    getTeamGoalStatusType(status) {
      // 팀 목표 상태
      if (status === '진행중') return 'primary';      // 🔵 파란색
      if (status === '평가대기') return 'warning';    // 🟡 주황색
      if (status === '평가완료') return 'success';    // 🟢 초록색
      if (status === '삭제') return 'info';           // ⚪ 회색
      return '';
    },
    getStatusType(status) {
      // 개인 목표 상태 (영어)
      if (status === 'REQUESTED') return 'warning';     // 🟡 요청 - 주황색
      if (status === 'APPROVED') return 'primary';      // 🔵 승인 - 파란색
      if (status === 'REJECTED') return 'danger';       // 🔴 반려 - 빨간색
      if (status === 'CANCELED') return 'info';         // ⚪ 취소 - 회색
      
      // 개인 목표 상태 (한국어)
      if (status === '요청') return 'warning';            // 🟡 요청 - 주황색
      if (status === '승인') return 'primary';            // 🔵 승인 - 파란색
      if (status === '반려') return 'danger';             // 🔴 반려 - 빨간색
      if (status === '취소') return 'info';               // ⚪ 취소 - 회색
      if (status === '평가 대기') return 'warning';       // 🟡 평가 대기 - 주황색
      if (status === '본인 평가 완료') return 'success';  // 🟢 본인 평가 완료 - 초록색
      if (status === '최종 평가 완료') return 'success';  // 🟢 최종 평가 완료 - 초록색
      
      return '';
    },
    goToMemberGoalDetail(memberGoalId, mode) {
      const teamGoalId = this.$route.params.id;
      this.$router.push({ path: `/performance/team-goal/${teamGoalId}/member-goal/${memberGoalId}`, query: { mode: mode } });
    },
  },
  created() {
    this.myMemberPositionId = localStorage.getItem('memberPositionId');
    if (this.$route.query.mode) {
      this.currentMode = this.$route.query.mode;
    }
    this.fetchTeamGoalDetail();
  },
};
</script>

<style scoped>
.team-goal-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* Header Section */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-text {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #303133;
}

.status-tag {
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

.subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #909399;
  margin: 0;
  font-weight: 400;
}

.subtitle .el-icon {
  font-size: 18px;
  color: #667eea;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  border-radius: 8px;
  font-weight: 500;
}

/* Card Headers */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 20px;
  color: #667eea;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* Summary Card */
.summary-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
}

.goal-description {
  font-size: 15px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

/* Team Members Card */
.members-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
}

.team-members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.member-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.member-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.member-icon-star {
  font-size: 24px;
  color: #e6a23c;
  flex-shrink: 0;
}

.member-icon-user {
  font-size: 24px;
  color: #909399;
  flex-shrink: 0;
}

.member-name {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  margin: 0;
  flex: 1;
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.member-detail-row {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.detail-label {
  color: #909399;
  font-weight: 500;
  min-width: 45px;
}

.detail-value {
  color: #606266;
  font-weight: 400;
}

.member-role-tag {
  font-weight: 500;
}

/* Sub Goal Section */
.sub-goal-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.goal-list-card {
  border-radius: 16px;
  border: none;
}

.sub-goal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-goal-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sub-goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.sub-goal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.goal-icon {
  font-size: 40px;
  color: #667eea;
  padding: 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  flex-shrink: 0;
}

.sub-goal-title {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.sub-goal-status {
  flex-shrink: 0;
}

.sub-goal-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sub-goal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.sub-goal-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.sub-goal-user-info .el-icon {
  font-size: 16px;
  color: #909399;
}

.user-name {
  font-weight: 600;
  color: #303133;
}

.user-details {
  color: #909399;
  margin-left: 4px;
}

.sub-goal-period {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #909399;
}

.sub-goal-period .el-icon {
  font-size: 16px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #909399;
  margin: 0;
}
</style>
