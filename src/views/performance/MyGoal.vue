<template>
  <div class="my-goal-container">
    <div class="header">
      <h1 class="title">내 목표 관리</h1>
      <el-button type="primary" @click="addNewGoal">목표 추가</el-button>
    </div>

    <div class="goal-list">
      <el-card v-for="goal in myGoals" :key="goal.goalId" class="goal-card" @click="goToDetail(goal.goalId)">
        <div class="goal-content">
          <div class="goal-details">
            <h3 class="goal-title">{{ goal.title }}</h3>
            <p class="goal-description">{{ goal.contents }}</p>
            <p class="goal-period">기간: {{ goal.startDate }} ~ {{ goal.endDate }}</p>
            <p v-if="goal.grade" class="goal-grade">평가 등급: {{ goal.grade }}</p>
          </div>
          <div class="goal-meta">
            <el-tag :type="getStatusType(goal.status)" class="goal-status" effect="dark">{{ goal.status }}</el-tag>
          </div>
        </div>
        <el-divider></el-divider>
        <div class="card-actions">
            <template v-if="goal.status === 'REJECTED'">
                <el-button type="danger" plain @click.stop="viewRejectionReason(goal)">반려 사유 보기</el-button>
            </template>
            <template v-else>
                <el-button type="primary" :disabled="goal.status === 'REQUESTED'" @click.stop="selfEvaluate(goal.goalId)">본인 평가</el-button>
            </template>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="newGoalDialogVisible" title="팀 목표 선택" width="500px">
        <div class="team-goal-select-group">
            <el-card 
                v-for="goal in teamGoalsForSelection" 
                :key="goal.teamGoalId" 
                class="dialog-team-goal-card" 
                @click="selectedTeamGoal = goal.teamGoalId"
                :class="{ 'selected-card': selectedTeamGoal === goal.teamGoalId }"
            >
                <h4 class="dialog-team-goal-title">{{ goal.title }}</h4>
                <p class="dialog-team-goal-description">{{ goal.contents }}</p>
            </el-card>
        </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="newGoalDialogVisible = false">취소</el-button>
          <el-button type="primary" @click="saveNewGoal">선택</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="selfEvaluateDialogVisible" title="본인 평가" width="500px">
      <el-form :model="selfEvaluateForm" label-position="top">
        <el-form-item label="등급">
          <el-select v-model="selfEvaluateForm.rating" placeholder="등급을 선택하세요">
            <el-option label="A+" value="A+"></el-option>
            <el-option label="A" value="A"></el-option>
            <el-option label="B+" value="B+"></el-option>
            <el-option label="B" value="B"></el-option>
            <el-option label="F" value="F"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="평가 코멘트">
          <el-input v-model="selfEvaluateForm.comment" type="textarea" :rows="4" placeholder="평가 코멘트를 입력해주세요."></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="selfEvaluateDialogVisible = false">취소</el-button>
          <el-button type="primary" @click="handleSelfEvaluate">평가완료</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectionReasonDialogVisible" title="반려 사유 확인" width="500px">
        <el-card class="box-card" style="margin-bottom: 16px;">
            <template #header>
                <div class="card-header">
                    <span>반려된 목표</span>
                </div>
            </template>
            <h3>{{ selectedRejectedGoal.title }}</h3>
            <p>{{ selectedRejectedGoal.description }}</p>
        </el-card>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>부서장 반려 사유</span>
                </div>
            </template>
            <p class="rejection-reason-text">{{ selectedRejectedGoal.rejectionReason }}</p>
        </el-card>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="rejectionReasonDialogVisible = false">닫기</el-button>
            </span>
        </template>
    </el-dialog>

  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MyGoal',
  data() {
    return {
      myGoals: [], // API로부터 데이터를 받아올 배열
      newGoalDialogVisible: false,
      selectedTeamGoal: null,
      teamGoalsForSelection: [], // 이 부분도 필요 시 API로 받아올 수 있습니다.
      selfEvaluateDialogVisible: false,
      selfEvaluateForm: {
        rating: '',
        comment: ''
      },
      rejectionReasonDialogVisible: false,
      selectedRejectedGoal: {}
    };
  },
  methods: {
    async fetchMyGoals() {
      try {
        // In a real environment, you would use the actual API call:
        const response = await axios.get('http://localhost:8080/performance/get-my-goal');
        this.myGoals = response.data;

        // Using mock data provided by the user for demonstration:
        // this.myGoals = [
        //     {
        //         "goalId": "89f9f7fb-e59b-4e31-b90d-2d6829cabe93",
        //         "title": "신규 클라이언트 5곳 발굴 및 계약 (API)",
        //         "contents": "4분기 내 잠재 고객 리스트를 기반으로 신규 클라이언트 5곳과 계약을 체결하여 팀 매출 목표 달성에 기여합니다.",
        //         "startDate": "2025-10-01",
        //         "endDate": "2025-12-31",
        //         "status": "REQUESTED",
        //         "grade": null,
        //         "rejectionReason": null
        //     },
        //     {
        //         "goalId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        //         "title": "Vue.js 전문 자격증 취득 (API)",
        //         "contents": "개발 역량 강화를 위해 Vue.js 관련 전문 자격증을 취득합니다.",
        //         "startDate": "2025-08-01",
        //         "endDate": "2025-12-31",
        //         "status": "APPROVED",
        //         "grade": null,
        //         "rejectionReason": null
        //     }
        // ];
      } catch (error) {
        console.error('Error fetching my goals:', error);
        this.$message.error('목표 목록을 불러오는 데 실패했습니다.');
      }
    },
    async addNewGoal() {
      // 데이터가 비어있을 때만 API 호출
      if (this.teamGoalsForSelection.length === 0) {
        try {
          // For demonstration, using mock data. In real environment, use axios call.
          const response = await axios.get('http://localhost:8080/performance/team-goal');
          this.teamGoalsForSelection = response.data;
          // this.teamGoalsForSelection = [
          //   {
          //       "teamGoalId": "36e7c5a6-8df6-4c0a-9efa-c5f66377b431",
          //       "title": "2025년 4분기 팀 매출 20% 성장 달성",
          //       "contents": "신규 고객 확보 및 기존 고객 유지 전략을 통해 4분기 팀 목표 매출액 1억 2천만원을 달성하는 것을 목표로 합니다.",
          //   }
          // ];
        } catch (error) {
          console.error('Error fetching team goals for selection:', error);
          this.$message.error('팀 목표 목록을 불러오는 데 실패했습니다.');
          return; // 에러 발생 시 다이얼로그를 열지 않음
        }
      }
      this.newGoalDialogVisible = true;
    },
    saveNewGoal() {
      if (this.selectedTeamGoal) {
        this.$router.push(`/performance/register-my-goal/${this.selectedTeamGoal}`);
      } else {
        this.$message.warning('팀 목표를 선택해주세요.');
      }
    },
    getStatusType(status) {
      if (status === 'APPROVED') return 'success';
      if (status === 'REJECTED') return 'danger';
      if (status === 'REQUESTED') return 'warning';
      if (status === 'CANCELED') return 'info';
      return '';
    },
    selfEvaluate(id) {
      this.selfEvaluateDialogVisible = true;
      console.log('Evaluating goal:', id);
    },
    handleSelfEvaluate() {
      console.log('Self Evaluation:', this.selfEvaluateForm);
      this.selfEvaluateDialogVisible = false;
    },
    viewRejectionReason(goal) {
      this.selectedRejectedGoal = goal;
      this.rejectionReasonDialogVisible = true;
    },
    goToDetail(id) {
      this.$router.push(`/performance/my-goal/${id}`);
    },
  },
  created() {
    this.fetchMyGoals();
  },
};
</script>

<style scoped>
.my-goal-container {
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

.goal-card :deep(.el-card__body) {
    padding: 16px;
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
  margin-bottom: 8px;
}

.goal-period {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.goal-grade {
    font-size: 14px;
    color: #409EFF;
    font-weight: 500;
}

.goal-meta {
  width: 80px;
  text-align: right;
}

.card-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
}

.rejection-reason-text {
    color: #F56C6C;
}

/* Dialog Styles */
.team-goal-select-group {
    width: 100%;
}

.dialog-team-goal-card {
    width: 100%;
    margin-bottom: 12px;
    box-sizing: border-box;
    cursor: pointer;
    border: 1px solid #DCDFE6;
    transition: all 0.2s ease-in-out;
}

.dialog-team-goal-card.selected-card {
    border-color: #409EFF;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.dialog-team-goal-card.selected-card .dialog-team-goal-title {
    color: #409EFF;
}

.dialog-team-goal-title {
    font-weight: 500;
    margin-bottom: 4px;
}
.dialog-team-goal-description {
    font-size: 12px;
    color: #909399;
}
</style>