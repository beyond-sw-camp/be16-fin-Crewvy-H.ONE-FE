<template>
  <div class="team-goal-detail-container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <div class="title-row">
          <h1 class="main-goal-title">{{ teamGoalDetail.title }}</h1>
          <el-tag :type="getStatusType(teamGoalDetail.status)" effect="dark" class="status-tag">
            {{ teamGoalDetail.status }}
          </el-tag>
        </div>
        <p class="goal-meta">
          <el-icon><Calendar /></el-icon>
          <span>{{ teamGoalDetail.startDate }} ~ {{ teamGoalDetail.endDate }}</span>
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack" class="back-button" :icon="ArrowLeft">
          목록으로
        </el-button>
        <el-button v-if="isTeamGoalManager && teamGoalDetail.status === '진행중'" type="primary" :icon="Edit" @click="handleEdit" class="edit-button">수정</el-button>
        <el-button v-if="isTeamGoalManager && teamGoalDetail.status === '진행중'" type="danger" :icon="Delete" @click="handleDelete" class="delete-button">삭제</el-button>
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

    <!-- Team Members Section -->
    <div class="team-members-section">
      <div class="section-header">
        <el-icon class="section-icon"><UserFilled /></el-icon>
        <h2 class="section-title">팀원 목록</h2>
      </div>
      <div class="team-members-list">
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
    </div>

    <!-- Sub Goals Section -->
    <div class="sub-goal-section">
      <div class="section-header">
        <el-icon class="section-icon"><Flag /></el-icon>
        <h2 class="section-title">팀원 목표 목록</h2>
      </div>
      <div class="sub-goal-list">
        <el-card v-for="goal in sortedGoalList" :key="goal.goalId" class="sub-goal-card" shadow="hover" @click="goToMemberGoalDetail(goal.goalId)">
          <div class="sub-goal-header-row">
            <div class="sub-goal-header">
              <el-icon class="goal-icon"><Flag /></el-icon>
              <h4 class="sub-goal-title">{{ goal.title }}</h4>
            </div>
            <el-tag :type="getStatusType(goal.status)" class="sub-goal-status" effect="dark">{{ goal.status }}</el-tag>
          </div>
          <p class="sub-goal-description">{{ goal.contents }}</p>
          <div class="sub-goal-footer">
            <div class="sub-goal-user-info">
              <el-icon><User /></el-icon>
              <span class="user-name">{{ goal.memberName }}</span>
              <span class="user-details">({{ goal.memberOrganization }} / {{ goal.memberPostion }})</span>
            </div>
            <div class="sub-goal-period">
              <el-icon><Calendar /></el-icon>
              <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/api/http';
import { 
  User, 
  Star, 
  ArrowLeft, 
  Calendar, 
  Edit, 
  Delete, 
  Document, 
  UserFilled, 
  Flag 
} from '@element-plus/icons-vue';

export default {
  name: 'TeamGoalDetail',
  components: {
    User,
    Star,
    Calendar,
    Document,
    UserFilled,
    Flag,
  },
  data() {
    return {
      teamGoalDetail: {
        title: '',
        contents: '',
        startDate: '',
        endDate: '',
        goalList: [],
        memberList: [],
        memberPositionId: null,
      },
      myMemberPositionId: null,
      ArrowLeft,
      Edit,
      Delete,
    };
  },
  computed: {
    isTeamGoalManager() {
      return this.myMemberPositionId === this.teamGoalDetail.memberPositionId;
    },
    sortedGoalList() {
      if (!this.teamGoalDetail.goalList) return [];
      
      // 상태별 우선순위 정의
      const statusPriority = {
        '요청': 1,
        '승인': 2,
        '평가 대기': 3,
        '본인 평가 완료': 4,
        '최종 평가 완료': 5,
        '반려': 6,
        '취소': 999 // 취소는 필터링될 것이므로 높은 값
      };
      
      // 취소된 목표 제외 및 정렬
      return this.teamGoalDetail.goalList
        .filter(goal => goal.status !== '취소')
        .sort((a, b) => {
          const priorityA = statusPriority[a.status] || 100;
          const priorityB = statusPriority[b.status] || 100;
          return priorityA - priorityB;
        });
    },
  },
  methods: {
    goBack() {
      this.$router.push('/performance/team-goal');
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
    getStatusType(status) {
      // 팀 목표 상태
      if (status === '진행중') return 'primary';      // 🔵 파란색
      if (status === '평가대기') return 'warning';    // 🟡 주황색
      if (status === '평가완료') return 'success';    // 🟢 초록색
      if (status === '삭제') return 'info';           // ⚪ 회색
      
      // 개인 목표 상태 (팀원 목표 목록용)
      if (status === '요청') return 'warning';            // 🟡 요청 - 주황색
      if (status === '승인') return 'primary';            // 🔵 승인 - 파란색
      if (status === '반려') return 'danger';             // 🔴 반려 - 빨간색
      if (status === '취소') return 'info';               // ⚪ 취소 - 회색
      if (status === '평가 대기') return 'warning';       // 🟡 평가 대기 - 주황색
      if (status === '본인 평가 완료') return 'success';  // 🟢 본인 평가 완료 - 초록색
      if (status === '최종 평가 완료') return 'success';  // 🟢 최종 평가 완료 - 초록색
      
      return '';
    },
    goToMemberGoalDetail(memberGoalId) {
      const teamGoalId = this.$route.params.id;
      this.$router.push(`/performance/team-goal/${teamGoalId}/member-goal/${memberGoalId}`);
    },
    handleEdit() {
      this.$router.push(`/performance/team-goal/edit/${this.$route.params.id}`);
    },
    async handleDelete() {
      try {
        await this.$confirm('정말로 이 팀 목표를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.', '팀 목표 삭제', {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning',
        });

        const teamGoalId = this.$route.params.id;
        await apiClient.delete(`/workforce-service/performance/delete-team-goal/${teamGoalId}`);

        this.$message.success('팀 목표가 성공적으로 삭제되었습니다.');
        this.$router.push('/performance/team-goal');

      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('삭제가 취소되었습니다.');
        } else {
          console.error('Error deleting team goal:', error);
          this.$message.error('팀 목표 삭제에 실패했습니다.');
        }
      }
    },
  },
  created() {
    this.myMemberPositionId = localStorage.getItem('memberPositionId');
    this.fetchTeamGoalDetail();
  },
};
</script>

<style scoped>
/* Container */
.team-goal-detail-container {
  padding: 32px;
  background: #f5f7fa;
  min-height: 100vh;
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

.main-goal-title {
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

.goal-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #909399;
  margin: 0;
  font-weight: 400;
}

.goal-meta .el-icon {
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

/* Edit Button */
.edit-button {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.edit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.edit-button:active {
  transform: translateY(0);
}

/* Delete Button */
.delete-button {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #f56c6c 0%, #d9534f 100%);
  box-shadow: 0 3px 12px rgba(245, 108, 108, 0.3);
  transition: all 0.3s ease;
}

.delete-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(245, 108, 108, 0.5);
  background: linear-gradient(135deg, #d9534f 0%, #f56c6c 100%);
}

.delete-button:active {
  transform: translateY(0);
}

/* Summary Card */
.summary-card {
  margin-bottom: 32px;
  border-radius: 16px;
  border: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.section-icon {
  font-size: 24px;
  color: #667eea;
}

.goal-description {
  font-size: 16px;
  line-height: 1.8;
  color: #606266;
  margin: 0;
  white-space: pre-wrap;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* Team Members Section */
.team-members-section {
  margin-bottom: 32px;
}

.team-members-list {
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

/* Sub Goals Section */
.sub-goal-section {
  margin-bottom: 32px;
}

.sub-goal-list {
  display: grid;
  gap: 20px;
}

.sub-goal-card {
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sub-goal-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.sub-goal-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sub-goal-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.goal-icon {
  font-size: 40px;
  color: #667eea;
  padding: 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
}

.sub-goal-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.sub-goal-description {
  font-size: 15px;
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
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
}

.sub-goal-user-info,
.sub-goal-period {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.sub-goal-user-info .el-icon,
.sub-goal-period .el-icon {
  font-size: 16px;
  color: #c0c4cc;
}

.user-name {
  font-weight: 600;
  color: #606266;
}

.user-details {
  color: #909399;
  margin-left: 4px;
}

.sub-goal-status {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .team-goal-detail-container {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions .el-button {
    width: 100%;
  }

  .team-members-list {
    grid-template-columns: 1fr;
  }

  .sub-goal-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
