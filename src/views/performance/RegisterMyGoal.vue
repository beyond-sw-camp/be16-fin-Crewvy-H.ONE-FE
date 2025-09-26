<template>
  <div class="register-my-goal-container">
    <div class="header">
      <el-page-header @back="goBack" content="내 목표 등록"></el-page-header>
    </div>

    <el-card class="team-goal-card">
        <template #header>
            <div class="card-header">
                <span>팀 목표 정보</span>
            </div>
        </template>
        <h2>{{ teamGoal.title }}</h2>
        <p>{{ teamGoal.description }}</p>
    </el-card>

    <el-card class="my-goal-card">
        <template #header>
            <div class="card-header">
                <span>내 목표 설정</span>
            </div>
        </template>
        <el-form :model="myGoalForm" label-position="top">
            <el-form-item label="목표 제목">
                <el-input v-model="myGoalForm.title" placeholder="팀 목표 달성을 위한 내 목표 제목을 입력하세요."></el-input>
            </el-form-item>
            <el-form-item label="목표 상세 내용">
                <el-input v-model="myGoalForm.description" type="textarea" :rows="5" placeholder="목표에 대한 상세 내용을 입력하세요."></el-input>
            </el-form-item>
        </el-form>
    </el-card>

    <div class="actions-container">
        <el-button @click="goBack">취소</el-button>
        <el-button type="primary" @click="registerGoal">등록</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterMyGoal',
  data() {
    return {
      teamGoal: {},
      myGoalForm: {
        title: '',
        description: ''
      }
    };
  },
  methods: {
    goBack() {
      this.$router.push('/performance/my-goal');
    },
    registerGoal() {
        // 등록 로직
        console.log('Registering new goal:', this.myGoalForm);
        this.goBack();
    },
    fetchTeamGoal() {
      const teamGoalId = this.$route.params.teamGoalId;
      // Mock data fetching based on ID
      console.log('Fetching team goal with ID:', teamGoalId);
      this.teamGoal = {
        id: teamGoalId,
        title: '2024년 하반기 매출 20% 증대',
        description: '신규 고객 확보 및 기존 고객 대상 프로모션을 통해 매출 증대를 목표로 합니다.'
      };
    }
  },
  created() {
    this.fetchTeamGoal();
  }
};
</script>

<style scoped>
.register-my-goal-container {
  padding: 24px;
}
.header {
    margin-bottom: 24px;
}
.team-goal-card, .my-goal-card {
    margin-bottom: 24px;
}
.actions-container {
    display: flex;
    justify-content: flex-end;
}
</style>
