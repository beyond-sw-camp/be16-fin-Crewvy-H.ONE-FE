<template>
  <div class="team-goal-container">
    <div class="header">
      <h1 class="title">팀 목표 관리</h1>
      <el-button type="primary" @click="addTeamGoal">팀 목표 추가</el-button>
    </div>

    <div class="goal-list">
      <el-card v-for="goal in teamGoals" :key="goal.id" class="goal-card" @click="goToDetail(goal.id)">
        <div class="goal-content">
          <div class="goal-details">
            <h3 class="goal-title">{{ goal.title }}</h3>
            <p class="goal-description">{{ goal.description }}</p>
          </div>
          <div class="goal-meta">
            <div class="user-info">
              <div>
                <span class="user-name">{{ goal.userName }}</span>
                <span class="user-position">{{ goal.user.position }}</span>
              </div>
              <div class="user-department">{{ goal.user.department }}</div>
            </div>
            <div class="goal-period">
              <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="dialogVisible" title="팀 목표 추가" width="500px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="팀 목표명">
          <el-input v-model="form.title" placeholder="예: 2024년 하반기 매출 20% 증대"></el-input>
        </el-form-item>
        <el-form-item label="목표에 대한 설명">
          <el-input v-model="form.description" type="textarea" :rows="6" placeholder="예: 신규 고객 확보 및 기존 고객 대상 프로모션을 통해 매출 증대를 목표로 합니다."></el-input>
        </el-form-item>
        <el-form-item label="목표 설정 기간">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="Start date"
            end-placeholder="End date"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">취소</el-button>
          <el-button type="primary" @click="saveGoal">저장</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TeamGoal',
  data() {
    return {
      dialogVisible: false,
      form: {
        title: '',
        description: '',
        dateRange: ''
      },
      teamGoals: [
        {
          id: 1,
          title: '2024년 하반기 매출 20% 증대',
          description: '신규 고객 확보 및 기존 고객 대상 프로모션을 통해 매출 증대를 목표로 합니다.',
          user: {
            name: '김팀장',
            position: '팀장',
            department: '영업 1팀',
          },
          startDate: '2024-07-01',
          endDate: '2024-12-31',
        },
        {
          id: 2,
          title: '신제품 개발 프로젝트 완료',
          description: "'A-Project'의 프로토타입을 10월까지 완료하고, 12월에 정식 출시하는 것을 목표로 합니다.",
          user: {
            name: '박개발',
            position: '선임 연구원',
            department: '개발팀',
          },
          startDate: '2024-08-01',
          endDate: '2024-12-31',
        },
        {
          id: 3,
          title: '고객 만족도 95점 달성',
          description: '고객 지원 응답 시간을 1시간 이내로 단축하고, 분기별 만족도 조사를 통해 피드백을 수렴합니다.',
          user: {
            name: '이서비스',
            position: '대리',
            department: '고객지원팀',
          },
          startDate: '2024-07-01',
          endDate: '2024-09-30',
        },
      ],
    };
  },
  methods: {
    addTeamGoal() {
      this.dialogVisible = true;
    },
    saveGoal() {
      // Add logic to save the goal
      this.dialogVisible = false;
    },
    goToDetail(id) {
      this.$router.push(`/performance/team-goal/${id}`);
    },
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

.goal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.goal-description {
  font-size: 14px;
  color: #606266;
}

.goal-meta {
  width: 200px;
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  font-size: 12px;
  color: #909399;
}
</style>