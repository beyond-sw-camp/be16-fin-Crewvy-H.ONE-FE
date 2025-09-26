<template>
  <div class="my-goal-container">
    <div class="header">
      <h1 class="title">내 목표 관리</h1>
      <el-button type="primary" @click="addNewGoal">목표 추가</el-button>
    </div>

    <div class="goal-list">
      <el-card v-for="goal in myGoals" :key="goal.id" class="goal-card" @click="goToDetail(goal.id)">
        <div class="goal-content">
          <div class="goal-details">
            <h3 class="goal-title">{{ goal.title }}</h3>
            <p class="goal-description">{{ goal.description }}</p>
            <p v-if="goal.grade" class="goal-grade">평가 등급: {{ goal.grade }}</p>
          </div>
          <div class="goal-meta">
            <el-tag :type="getStatusType(goal.status)" class="goal-status" effect="dark">{{ goal.status }}</el-tag>
          </div>
        </div>
        <el-divider></el-divider>
        <div class="card-actions">
            <template v-if="goal.status === '반려'">
                <el-button type="danger" plain @click.stop="viewRejectionReason(goal.id)">반려 사유 보기</el-button>
            </template>
            <template v-else>
                <el-button type="primary" :disabled="goal.status === '요청'" @click.stop="selfEvaluate(goal.id)">본인 평가</el-button>
            </template>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="newGoalDialogVisible" title="팀 목표 선택" width="500px">
        <div class="team-goal-select-group">
            <el-card 
                v-for="goal in teamGoalsForSelection" 
                :key="goal.id" 
                class="dialog-team-goal-card" 
                @click="selectedTeamGoal = goal.id"
                :class="{ 'selected-card': selectedTeamGoal === goal.id }"
            >
                <h4 class="dialog-team-goal-title">{{ goal.title }}</h4>
                <p class="dialog-team-goal-description">{{ goal.description }}</p>
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
            <el-option label="S" value="S"></el-option>
            <el-option label="A" value="A"></el-option>
            <el-option label="B" value="B"></el-option>
            <el-option label="C" value="C"></el-option>
            <el-option label="D" value="D"></el-option>
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
export default {
  name: 'MyGoal',
  data() {
    return {
      myGoals: [
        {
          id: 1,
          title: '1분기 개인 매출 1억 달성',
          description: '신규 고객 발굴 및 기존 고객 추가 계약을 통해 목표 달성',
          status: '승인',
          grade: 'A',
        },
        {
          id: 2,
          title: '신규 기능 A 개발 완료',
          description: '요구사항 분석, 설계, 개발, 테스트 포함',
          status: '반려',
          grade: null,
          rejectionReason: '목표 설정이 너무 광범위합니다. 구체적인 개발 범위와 일정을 포함하여 재작성해주세요.'
        },
        {
          id: 3,
          title: '고객 만족도 설문 분석 및 보고',
          description: '설문 결과를 바탕으로 개선 방안 도출 및 보고서 작성',
          status: '요청',
          grade: null,
        },
        {
          id: 4,
          title: '자격증 취득',
          description: 'Vue.js 관련 전문 자격증 취득하여 개발 역량 강화',
          status: '승인',
          grade: null,
        },
      ],
      newGoalDialogVisible: false,
      selectedTeamGoal: null,
      teamGoalsForSelection: [
        {
            id: 101,
            title: '2024년 하반기 매출 20% 증대',
            description: '신규 고객 확보 및 기존 고객 대상 프로모션을 통해 매출 증대를 목표로 합니다.'
        },
        {
            id: 102,
            title: '신제품 개발 프로젝트 완료',
            description: 'A-Project의 프로토타입을 10월까지 완료하고, 12월에 정식 출시하는 것을 목표로 합니다.'
        }
      ],
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
    addNewGoal() {
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
      if (status === '승인') return 'success';
      if (status === '반려') return 'danger';
      if (status === '요청') return 'warning';
      return '';
    },
    selfEvaluate(id) {
      this.selfEvaluateDialogVisible = true;
      // You might want to pass the goal id to the dialog as well
      console.log('Evaluating goal:', id);
    },
    handleSelfEvaluate() {
      // Add evaluation save logic here
      console.log('Self Evaluation:', this.selfEvaluateForm);
      this.selfEvaluateDialogVisible = false;
    },
    viewRejectionReason(id) {
      const goal = this.myGoals.find(g => g.id === id);
      if (goal) {
        this.selectedRejectedGoal = goal;
        this.rejectionReasonDialogVisible = true;
      }
    },
    goToDetail(id) {
      this.$router.push(`/performance/my-goal/${id}`);
    },
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