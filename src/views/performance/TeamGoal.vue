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
            <p class="goal-description">{{ goal.contents }}</p>
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
          <el-input v-model="form.contents" type="textarea" :rows="6"
            placeholder="예: 신규 고객 확보 및 기존 고객 대상 프로모션을 통해 매출 증대를 목표로 합니다."></el-input>
        </el-form-item>
        <el-form-item label="목표 설정 기간">
          <el-date-picker v-model="form.dateRange" type="daterange" range-separator="-" start-placeholder="Start date"
            end-placeholder="End date">
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
import axios from 'axios';

export default {
  name: 'TeamGoal',
  data() {
    return {
      dialogVisible: false,
      form: {
        title: '',
        contents: '',
        dateRange: ''
      },
      teamGoals: [],
    };
  },
  methods: {
    async fetchTeamGoals() {
      try {
        // In a real environment, you would uncomment the following lines:
        const response = await axios.get('http://localhost:8080/workforce-service/performance/team-goal');
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
      this.dialogVisible = true;
    },
    async saveGoal() {
      if (!this.form.title || !this.form.contents || !this.form.dateRange) {
        this.$message.warning('모든 필드를 입력해주세요.');
        return;
      }

      const formatDate = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2)
          month = '0' + month;
        if (day.length < 2)
          day = '0' + day;

        return [year, month, day].join('-');
      }

      const payload = {
        title: this.form.title,
        contents: this.form.contents,
        startDate: formatDate(this.form.dateRange[0]),
        endDate: formatDate(this.form.dateRange[1]),
      };

      try {
        await axios.post('http://localhost:8080/workforce-service/performance/create-team-goal', payload);
        this.$message.success('팀 목표가 성공적으로 추가되었습니다.');
        this.dialogVisible = false;
        await this.fetchTeamGoals(); // Refresh the list
      } catch (error) {
        console.error('Error creating team goal:', error);
        this.$message.error('목표 추가에 실패했습니다.');
      }
    },
    goToDetail(id) {
      this.$router.push(`/performance/team-goal/${id}`);
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