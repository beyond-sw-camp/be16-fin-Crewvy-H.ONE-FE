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
        <p>{{ teamGoal.contents }}</p>
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
                <el-input v-model="myGoalForm.contents" type="textarea" :rows="5" placeholder="목표에 대한 상세 내용을 입력하세요."></el-input>
            </el-form-item>
            <el-form-item label="목표 기간">
                <el-date-picker
                    v-model="myGoalForm.dateRange"
                    type="daterange"
                    range-separator="~"
                    start-placeholder="시작일"
                    end-placeholder="종료일"
                    value-format="YYYY-MM-DD"
                />
            </el-form-item>

            <el-form-item label="점수 체계">
                <div class="rubric-container">
                    <div v-for="item in scoringRubric" :key="item.grade" class="rubric-item">
                        <span class="rubric-grade">{{ item.grade }}</span>
                        <el-input
                            v-model="item.description"
                            type="textarea"
                            :rows="2"
                            :placeholder="item.grade + ' 등급에 대한 달성 기준을 입력하세요.'"
                        ></el-input>
                    </div>
                </div>
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
import axios from 'axios';

export default {
  name: 'RegisterMyGoal',
  data() {
    return {
      teamGoal: {}, // API로부터 팀 목표 정보를 받아올 객체
      myGoalForm: {
        title: '',
        contents: '',
        dateRange: []
      },
      scoringRubric: [
        { grade: 'A+', description: '' },
        { grade: 'A', description: '' },
        { grade: 'B+', description: '' },
        { grade: 'B', description: '' },
        { grade: 'F', description: '' }
      ]
    };
  },
  methods: {
    goBack() {
      this.$router.push('/performance/my-goal');
    },
    async registerGoal() {
      if (!this.myGoalForm.title || !this.myGoalForm.contents || !this.myGoalForm.dateRange || this.myGoalForm.dateRange.length === 0) {
        this.$message.warning('모든 필드를 입력해주세요.');
        return;
      }

      try {
        await this.$confirm('새로운 목표를 등록하시겠습니까?', '목표 등록', {
          confirmButtonText: '등록',
          cancelButtonText: '취소',
          type: 'info',
        });

        // 사용자가 확인을 눌렀을 때 API 요청 실행
        const payload = {
            teamGoalId: this.$route.params.teamGoalId,
            title: this.myGoalForm.title,
            contents: this.myGoalForm.contents,
            startDate: this.myGoalForm.dateRange[0],
            endDate: this.myGoalForm.dateRange[1]
        }
        
        await axios.post('http://localhost:8080/performance/create-my-goal', payload);
        
        this.$message.success('새로운 목표가 등록되었습니다.');
        this.goBack();

      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('등록이 취소되었습니다.');
        } else {
          console.error('Error registering new goal:', error);
          this.$message.error('목표 등록에 실패했습니다.');
        }
      }
    },
    async fetchTeamGoal() {
      const teamGoalId = this.$route.params.teamGoalId; // 이전 페이지에서 넘겨준 파라미터
      try {
        // In a real environment, use the actual API call:
        const response = await axios.get(`http://localhost:8080/performance/team-goal/${teamGoalId}`);
        this.teamGoal = response.data;

        // Using mock data for demonstration:
        // this.teamGoal = {
        //     "teamGoalId": teamGoalId,
        //     "title": "2025년 4분기 팀 매출 20% 성장 달성 (API)",
        //     "contents": "신규 고객 확보 및 기존 고객 유지 전략을 통해 4분기 팀 목표 매출액 1억 2천만원을 달성하는 것을 목표로 합니다."
        // };

      } catch (error) {
        console.error(`Error fetching team goal for ID: ${teamGoalId}`, error);
        this.$message.error('팀 목표 정보를 불러오는 데 실패했습니다.');
      }
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
.el-date-picker {
    width: 100%;
}

.rubric-container {
    width: 100%;
}

.rubric-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.rubric-item:last-child {
    margin-bottom: 0;
}

.rubric-grade {
  width: 50px;
  text-align: center;
  font-weight: 600;
  margin-right: 16px;
  flex-shrink: 0;
}
</style>