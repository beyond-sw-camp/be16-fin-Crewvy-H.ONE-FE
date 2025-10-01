<template>
  <div class="team-goal-detail-container">
    <div class="header">
      <el-page-header @back="goBack"></el-page-header>
      <h1 class="main-goal-title">{{ teamGoalDetail.title }}</h1>
    </div>

    <div class="goal-summary">
      <p>{{ teamGoalDetail.contents }}</p>
      <div class="meta">
        <span>{{ teamGoalDetail.startDate }} ~ {{ teamGoalDetail.endDate }}</span>
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
import axios from 'axios';

export default {
  name: 'TeamGoalDetail',
  data() {
    return {
      teamGoalDetail: { // API 응답을 담을 단일 객체
        title: '',
        contents: '',
        startDate: '',
        endDate: '',
        goalList: [],
      },
    };
  },
  methods: {
    goBack() {
      this.$router.push('/performance/team-goal');
    },
    async fetchTeamGoalDetail() {
      const goalId = this.$route.params.id;
      try {
        // In a real environment, you would use the actual API call:
        const response = await axios.get(`http://localhost:8080/performance/team-goal/${goalId}`);
        this.teamGoalDetail = response.data;

        // Using mock data provided by the user for demonstration:
        // this.teamGoalDetail = {
        //     "title": "2025년 4분기 팀 매출 20% 성장 달성 (API)",
        //     "contents": "신규 고객 확보 및 기존 고객 유지 전략을 통해 4분기 팀 목표 매출액 1억 2천만원을 달성하는 것을 목표로 합니다.",
        //     "startDate": "2025-10-01",
        //     "endDate": "2025-12-31",
        //     "goalList": [
        //         {
        //             "goalId": "89f9f7fb-e59b-4e31-b90d-2d6829cabe93",
        //             "title": "신규 클라이언트 5곳 발굴 및 계약",
        //             "contents": "4분기 내 잠재 고객 리스트를 기반으로 신규 클라이언트 5곳과 계약을 체결하여 팀 매출 목표 달성에 기여합니다.",
        //             "startDate": "2025-10-01",
        //             "endDate": "2025-12-31",
        //             "status": "APPROVED"
        //         }
        //     ]
        // };

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
  },
  created() {
    this.fetchTeamGoalDetail();
  },
};
</script>

<style scoped>
.team-goal-detail-container {
  padding: 16px;
}

.header {
  margin-bottom: 16px;
}

.main-goal-title {
    font-size: 28px;
    font-weight: 600;
    margin-top: 8px;
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

.sub-goal-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.sub-goal-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
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
</style>
