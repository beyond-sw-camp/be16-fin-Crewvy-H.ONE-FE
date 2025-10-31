<template>
  <div class="register-my-goal-container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <h1 class="title">내 목표 등록</h1>
        <p class="subtitle">팀 목표를 기반으로 나의 개인 목표를 설정하세요</p>
      </div>
      <el-button @click="goBack" class="back-button" :icon="ArrowLeft">
        목록으로
      </el-button>
    </div>

    <!-- Team Goal Info Card -->
    <el-card class="team-goal-card" shadow="never">
        <template #header>
            <div class="card-header">
                <el-icon class="section-icon"><Link /></el-icon>
                <span class="section-title">연결된 팀 목표</span>
            </div>
        </template>
        <h3 class="team-goal-title">{{ teamGoal.title }}</h3>
        <p class="team-goal-contents">{{ teamGoal.contents }}</p>
        <div class="goal-period">
            <el-icon><Calendar /></el-icon>
            <span>{{ teamGoal.startDate }} ~ {{ teamGoal.endDate }}</span>
        </div>
    </el-card>

    <!-- My Goal Setting Card -->
    <el-card class="my-goal-card" shadow="never">
        <template #header>
            <div class="card-header">
                <el-icon class="section-icon"><Document /></el-icon>
                <span class="section-title">내 목표 설정</span>
            </div>
        </template>
        <el-form :model="myGoalForm" label-position="top" class="goal-form">
            <el-form-item label="목표 제목">
                <el-input v-model="myGoalForm.title" placeholder="팀 목표 달성을 위한 내 목표 제목을 입력하세요." size="large"></el-input>
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
                    :disabled-date="disabledDate"
                    size="large"
                    style="width: 100%"
                />
            </el-form-item>
        </el-form>
    </el-card>

    <!-- Scoring Rubric Card -->
    <el-card class="scoring-card" shadow="never">
        <template #header>
            <div class="card-header">
                <el-icon class="section-icon"><Medal /></el-icon>
                <span class="section-title">점수 체계</span>
            </div>
        </template>
        <div class="rubric-container">
            <div v-for="item in scoringRubric" :key="item.grade" class="rubric-item">
                <el-tag class="rubric-grade" effect="dark">{{ item.grade }}</el-tag>
                <el-input
                    v-model="item.description"
                    type="textarea"
                    :rows="2"
                    class="rubric-input"
                    :placeholder="item.grade + ' 등급에 대한 달성 기준을 입력하세요.'"
                ></el-input>
            </div>
        </div>
    </el-card>

    <!-- Actions Container -->
    <div class="actions-container">
        <el-button @click="goBack" class="cancel-button">취소</el-button>
        <el-button type="primary" @click="registerGoal" class="register-button">
            <el-icon><Select /></el-icon>
            <span>등록</span>
        </el-button>
    </div>
  </div>
</template>

<script>
import apiClient from '@/api/http';
import { 
  ArrowLeft, 
  Link, 
  Calendar, 
  Document, 
  Medal, 
  Select 
} from '@element-plus/icons-vue';

export default {
  name: 'RegisterMyGoal',
  components: {
    Link,
    Calendar,
    Document,
    Medal,
    Select
  },
  data() {
    return {
      ArrowLeft,
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
    disabledDate(time) {
      if (this.teamGoal.startDate && this.teamGoal.endDate) {
        const startDate = new Date(this.teamGoal.startDate);
        const endDate = new Date(this.teamGoal.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return time.getTime() < startDate.getTime() || time.getTime() > endDate.getTime();
      }
      return true; // Disable all dates if team goal dates are not available
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

        // gradingSystem을 DTO 형식(Map)에 맞게 변환
        const gradingSystemAsMap = this.scoringRubric.reduce((acc, item) => {
          acc[item.grade] = item.description;
          return acc;
        }, {});

        // 사용자가 확인을 눌렀을 때 API 요청 실행
        const payload = {
            teamGoalId: this.$route.params.teamGoalId,
            title: this.myGoalForm.title,
            contents: this.myGoalForm.contents,
            startDate: this.myGoalForm.dateRange[0],
            endDate: this.myGoalForm.dateRange[1],
            gradingSystem: gradingSystemAsMap
        }
        
        await apiClient.post('/workforce-service/performance/create-my-goal', payload);
        
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
        const response = await apiClient.get(`/workforce-service/performance/team-goal/${teamGoalId}`);
        this.teamGoal = response.data.data;

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
/* Container */
.register-my-goal-container {
  padding: 32px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* Header Section */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.back-button {
  border-radius: 8px;
  font-weight: 500;
}

.header-text {
  flex: 1;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #303133;
}

.subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
  font-weight: 400;
}

/* Cards */
.team-goal-card, 
.my-goal-card, 
.scoring-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
}

/* Card Headers */
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

.section-title {
  font-size: 18px;
  font-weight: 600;
}

/* Team Goal Info */
.team-goal-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.team-goal-contents {
  font-size: 15px;
  color: #606266;
  line-height: 1.8;
  margin: 0 0 16px 0;
  white-space: pre-wrap;
}

.goal-period {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 14px;
  color: #909399;
  font-weight: 500;
  width: fit-content;
}

.goal-period .el-icon {
  font-size: 16px;
  color: #667eea;
}

/* Form */
.goal-form {
  margin-top: 0;
}

/* Scoring Rubric */
.rubric-container {
  width: 100%;
}

.rubric-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.rubric-item:last-child {
  margin-bottom: 0;
}

.rubric-grade {
  min-width: 60px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.rubric-input {
  flex-grow: 1;
}

/* Actions Container */
.actions-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button,
.register-button {
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
}

.register-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.register-button:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .register-my-goal-container {
    padding: 16px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .actions-container {
    flex-direction: column;
  }

  .actions-container .el-button {
    width: 100%;
  }

  .rubric-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .rubric-grade {
    margin-bottom: 8px;
  }
}
</style>