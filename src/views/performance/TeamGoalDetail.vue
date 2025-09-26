<template>
  <div class="team-goal-detail-container">
    <div class="header">
      <el-page-header @back="goBack"></el-page-header>
      <h1 class="main-goal-title">{{ goal.title }}</h1>
    </div>

    <div class="goal-summary">
      <p>{{ goal.description }}</p>
      <div class="meta">
        <span>{{ goal.user.name }} {{ goal.user.position }} ({{ goal.user.department }})</span>
        <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
      </div>
    </div>

    <el-divider></el-divider>

    <div class="sub-goal-section">
      <h2>팀원 목표 목록</h2>
      <div class="sub-goal-list">
        <el-card v-for="subGoal in subGoals" :key="subGoal.id" class="sub-goal-card" @click="goToMemberGoalDetail(subGoal.id)">
          <div class="sub-goal-content">
            <div class="sub-goal-details">
              <h4 class="sub-goal-title">{{ subGoal.title }}</h4>
              <p class="sub-goal-description">{{ subGoal.description }}</p>
              <p class="sub-goal-period">기간: {{ subGoal.startDate }} ~ {{ subGoal.endDate }}</p>
              <p class="sub-goal-user">담당자: {{ subGoal.user.name }}</p>
            </div>
            <div class="sub-goal-meta">
              <el-tag :type="getStatusType(subGoal.status)" class="sub-goal-status" effect="dark">{{ subGoal.status }}</el-tag>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeamGoalDetail',
  data() {
    return {
      goal: {},
      subGoals: [],
    };
  },
  methods: {
    goBack() {
      this.$router.push('/performance/team-goal');
    },
    fetchGoalDetails() {
      const goalId = this.$route.params.id;
      // Mock data fetching
      this.goal = {
        id: goalId,
        title: '2024년 하반기 매출 20% 증대',
        description: '신규 고객 확보 및 기존 고객 대상 프로모션을 통해 매출 증대를 목표로 합니다.',
        user: {
          name: '김팀장',
          position: '팀장',
          department: '영업 1팀',
        },
        startDate: '2024-07-01',
        endDate: '2024-12-31',
      };
      this.subGoals = [
        {
          id: 1,
          title: '신규 고객 50개사 확보',
          description: '콜드콜, 박람회 참여 등을 통해 신규 고객 확보',
          user: {
            name: '박영업',
            position: '사원',
          },
          startDate: '2024-07-01',
          endDate: '2024-09-30',
          status: '승인 완료',
        },
        {
          id: 2,
          title: '기존 고객 대상 프로모션 기획 및 실행',
          description: '분기별 프로모션 2회 이상 실행',
          user: {
            name: '최기획',
            position: '대리',
          },
          startDate: '2024-07-01',
          endDate: '2024-08-31',
          status: '반려',
        },
        {
          id: 3,
          title: '고객 만족도 조사 실시',
          description: '9월 중 고객 만족도 조사 실시 및 결과 분석',
          user: {
            name: '이분석',
            position: '과장',
          },
          startDate: '2024-09-01',
          endDate: '2024-09-30',
          status: '승인 대기',
        },
      ];
    },
    getStatusType(status) {
      if (status === '승인 완료') return 'success';
      if (status === '반려') return 'danger';
      if (status === '승인 대기') return 'warning';
      return '';
    },
    goToMemberGoalDetail(memberGoalId) {
      this.$router.push(`/performance/team-goal/${this.goal.id}/member-goal/${memberGoalId}`);
    },
  },
  created() {
    this.fetchGoalDetails();
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
