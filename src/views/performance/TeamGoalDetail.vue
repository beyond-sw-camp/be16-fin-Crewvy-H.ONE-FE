<template>
  <div class="team-goal-detail-container">
    <el-page-header @back="goBack" class="back-button"></el-page-header>
    <div class="header">
      <h1 class="main-goal-title">{{ teamGoalDetail.title }}</h1>
      <div class="header-actions" v-if="isTeamGoalManager">
        <el-button type="primary" @click="handleEdit">수정</el-button>
        <el-button type="danger" @click="handleDelete">삭제</el-button>
      </div>
    </div>

    <div class="goal-summary">
      <p>{{ teamGoalDetail.contents }}</p>
      <div class="meta">
        <span>{{ teamGoalDetail.startDate }} ~ {{ teamGoalDetail.endDate }}</span>
      </div>
    </div>

    <el-divider></el-divider>

    <div class="team-members-section">
      <h2>팀원 목록</h2>
      <div class="team-members-list">
        <el-card v-for="member in teamGoalDetail.memberList" :key="member.memberPositionId" class="member-card">
          <div class="member-card-header">
            <div class="member-info">
              <el-icon v-if="member.isCreater === 'TRUE'"><Star /></el-icon>
              <el-icon v-else><User /></el-icon>
              <span class="member-name">{{ member.memberName }}</span>
            </div>
          </div>
          <div class="member-details">
            <p class="member-org">{{ member.memberOrganizationName }} / {{ member.memberTitleName }}</p>
            <p class="member-role">{{ member.isCreater === 'TRUE' ? '관리자' : '팀원' }}</p>
          </div>
        </el-card>
      </div>
    </div>

    <el-divider></el-divider>

    <div class="sub-goal-section">
      <h2>팀원 목표 목록</h2>
      <div class="sub-goal-list">
        <el-card v-for="goal in teamGoalDetail.goalList" :key="goal.goalId" class="sub-goal-card" @click="goToMemberGoalDetail(goal.goalId)">
          <div class="sub-goal-content">
            <div class="sub-goal-details">
              <h4 class="sub-goal-title">{{ goal.title }}</h4>
              <p class="sub-goal-description">{{ goal.contents }}</p>
              <div class="sub-goal-user-info">
                <span class="user-name">{{ goal.memberName }}</span>
                <span class="user-details"> ({{ goal.memberOrganization }} / {{ goal.memberPostion }})</span>
              </div>
              <p class="sub-goal-period">기간: {{ goal.startDate }} ~ {{ goal.endDate }}</p>
            </div>
            <div class="sub-goal-meta">
              <el-tag :type="getStatusType(goal.status)" class="sub-goal-status" effect="dark">{{ goal.status }}</el-tag>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/api/http';
import { User, Star } from '@element-plus/icons-vue';

export default {
  name: 'TeamGoalDetail',
  components: {
    User,
    Star,
  },
  data() {
    return {
      teamGoalDetail: { // API 응답을 담을 단일 객체
        title: '',
        contents: '',
        startDate: '',
        endDate: '',
        goalList: [],
        memberList: [], // Added this
        memberPositionId: null, // Manager's memberPositionId for this team goal
      },
      myMemberPositionId: null, // Current user's memberPositionId
    };
  },
  computed: {
    isTeamGoalManager() {
      return this.myMemberPositionId === this.teamGoalDetail.memberPositionId;
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
      if (status === 'APPROVED') return 'success';
      if (status === 'REJECTED') return 'danger';
      if (status === 'REQUESTED') return 'warning';
      if (status === 'CANCELED') return 'info';
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
.team-goal-detail-container {
  padding: 16px;
}

.back-button {
  margin-bottom: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.main-goal-title {
    font-size: 28px;
    font-weight: 600;
    margin-top: 0; /* Adjusted margin-top */
}

.goal-summary {
  margin-bottom: 16px;
}

.meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
  margin-top: 8px;
}

.sub-goal-section h2 {
  margin-bottom: 16px;
}

.sub-goal-list {
  display: grid;
  gap: 16px;
}

.sub-goal-card {
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.sub-goal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sub-goal-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-goal-details {
  flex: 1;
}

.sub-goal-user-info {
  margin-bottom: 8px; /* Changed from 12px */
  display: flex;
  align-items: center;
}

.user-name {
  font-weight: 600;
  font-size: 15px;
}

.user-details {
  font-size: 13px;
  color: #909399;
  margin-left: 8px;
}

.sub-goal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px; /* Changed from 4px */
}

.sub-goal-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px; /* Changed from 8px */
}

.sub-goal-period,
.sub-goal-user {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
}

.sub-goal-meta {
  width: 100px;
  text-align: right;
}

.sub-goal-status {
  font-size: 14px;
  font-weight: 500;
}

.team-members-section h2 {
  margin-bottom: 16px;
}

.team-members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.team-members-list .member-card {
  width: 200px; /* Adjust card width as needed */
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.team-members-list .member-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.team-members-list .member-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.team-members-list .member-name {
  font-weight: 600;
  font-size: 14px;
}

.team-members-list .member-details {
  font-size: 12px;
  color: #606266;
  margin-left: 20px; /* Adjust to align with member name */
}

.team-members-list .member-role {
  font-weight: 500;
  font-size: 12px;
  color: #409eff; /* Example color for role */
}
</style>
