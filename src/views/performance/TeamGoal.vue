<template>
  <div class="team-goal-container">
    <div class="header">
      <h1 class="title">팀 목표 관리</h1>
      <el-button type="primary" @click="addTeamGoal">팀 목표 추가</el-button>
    </div>

    <div class="goal-list">
      <el-card v-for="goal in teamGoals" :key="goal.teamGoalId" class="goal-card" @click="goToDetail(goal.teamGoalId)">
        <div class="goal-content">
          <div class="goal-details">
            <div class="goal-title-line">
              <h3 class="goal-title">{{ goal.title }}</h3>
              <el-tag :type="getStatusType(goal.status)" effect="dark" class="status-tag">{{ goal.status }}</el-tag>
            </div>
            <p class="goal-description">{{ goal.contents }}</p>
          </div>
          <div class="goal-meta">
            <div class="goal-author">
              <span>{{ goal.memberName }} ({{ goal.memberPosition }})</span>
            </div>
            <div class="goal-period">
              <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

  </div>
</template>

<script>
import apiClient from '@/api/http';

export default {
  name: 'TeamGoal',
  data() {
    return {
      teamGoals: [],
    };
  },
  methods: {
    async fetchTeamGoals() {
      try {
        // In a real environment, you would uncomment the following lines:
        const response = await apiClient.get('/workforce-service/performance/team-goal');
        this.teamGoals = response.data.data;

        // Using mock data provided by the user:
        // this.teamGoals = [
        //   {
        //       "teamGoalId": "36e7c5a6-8df6-4c0a-9efa-c5f66377b431",
        //       "title": "2025년 4분기 팀 매출 20% 성장 달성",
        //       "contents": "신규 고객 확보 및 기존 고객 유지 전략을 통해 4분기 팀 목표 매출액 1억 2천만원을 달성하는 것을 목표로 합니다.",
        //       "startDate": "2025-10-01",
        //       "endDate": "2025-12-31"
        //   }
        // ];
      } catch (error) {
        console.error('Error fetching team goals:', error);
      }
    },
    addTeamGoal() {
      this.$router.push('/performance/team-goal/create');
    },
    goToDetail(id) {
      this.$router.push(`/performance/team-goal/${id}`);
    },
    getStatusType(status) {
      if (status === '평가완료') return 'success';
      if (status === '진행중') return 'warning';
      if (status === '삭제') return 'info';
      if (status === '평가대기') return 'primary';
      return '';
    },
  },
  created() {
    this.fetchTeamGoals();
  },
};
</script>

<style scoped>
.team-goal-container {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
}

.goal-list {
  display: grid;
  gap: 16px;
}

.goal-card {
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.goal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.goal-content {
  display: flex;
  justify-content: space-between;
}

.goal-details {
  flex: 1;
}

.goal-title-line {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.goal-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.status-tag {
  margin-left: 12px;
}

.goal-description {
  font-size: 16px;
  color: #606266;
}

.goal-meta {
  width: 200px;
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goal-author {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 8px;
}

.user-name {
  font-weight: 600;
  margin-right: 4px;
}

.user-position {
  font-size: 12px;
  color: #909399;
}

.user-department {
  font-size: 12px;
  color: #909399;
}

.goal-period {
  font-size: 14px;
  color: #909399;
}
</style>