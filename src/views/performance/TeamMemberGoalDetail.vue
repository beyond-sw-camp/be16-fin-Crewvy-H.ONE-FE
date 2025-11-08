<template>
  <div class="member-goal-detail-container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <div class="title-row">
          <h1 class="main-goal-title">{{ goalDetail.title }}</h1>
          <el-tag :type="getStatusType(goalDetail.status)" effect="dark" class="status-tag">
            {{ goalDetail.status }}
          </el-tag>
        </div>
        <p class="goal-meta">
          <el-icon><Calendar /></el-icon>
          <span>{{ goalDetail.startDate }} ~ {{ goalDetail.endDate }}</span>
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack" class="back-button" :icon="ArrowLeft">
          목록으로
        </el-button>
      </div>
    </div>

    <!-- Goal Details Card -->
    <el-card class="details-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon class="section-icon"><Document /></el-icon>
          <span class="section-title">목표 정보</span>
        </div>
      </template>
      <div class="detail-item description-item">
        <label><el-icon><Edit /></el-icon> 목표 설명</label>
        <p>{{ goalDetail.contents }}</p>
      </div>
      <div class="detail-item" v-if="goalDetail.memberName">
        <label><el-icon><User /></el-icon> 담당자</label>
        <p>{{ goalDetail.memberName }} ({{ goalDetail.memberOrganization }} / {{ goalDetail.memberPostion }})</p>
      </div>
      <div class="detail-item">
        <label><el-icon><Calendar /></el-icon> 기간</label>
        <p>{{ goalDetail.startDate }} ~ {{ goalDetail.endDate }}</p>
      </div>
    </el-card>

    <!-- Scoring Rubric Card -->
    <el-card class="card-section" shadow="never" v-if="goalDetail.gradingSystem && Object.keys(goalDetail.gradingSystem).length">
        <template #header>
          <div class="card-header">
            <el-icon class="section-icon"><Medal /></el-icon>
            <span class="section-title">점수 체계</span>
          </div>
        </template>
        <div v-for="item in scoringRubric" :key="item.grade" class="rubric-item">
            <el-tag class="rubric-grade" effect="dark">{{ item.grade }}</el-tag>
            <p class="rubric-description">{{ item.description }}</p>
        </div>
    </el-card>

    <!-- Evidence Section -->
    <el-card class="evidence-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon class="section-icon"><Folder /></el-icon>
          <span class="section-title">증적 자료</span>
        </div>
      </template>
      <el-upload
          class="upload-demo"
          :file-list="fileList"
          :on-preview="handleFilePreview"
          disabled
      >
      </el-upload>
      <div v-if="!fileList || fileList.length === 0" class="empty-evidence">
        <el-icon class="empty-icon"><FolderOpened /></el-icon>
        <p>업로드된 증적 자료가 없습니다.</p>
      </div>
    </el-card>

    <!-- Evaluation Result Section -->
    <div class="evaluation-result-section" v-if="isReviewMode">
      <div class="section-header">
        <el-icon class="section-icon"><Checked /></el-icon>
        <h2 class="section-title">평가 결과</h2>
      </div>
      
      <div class="evaluation-cards-grid">
        <el-card class="evaluation-card" shadow="never">
          <template #header>
            <div class="eval-card-header">
              <el-icon class="eval-icon self"><User /></el-icon>
              <span class="eval-title">본인 평가</span>
            </div>
          </template>
          <div class="detail-item">
            <label>평가 등급</label>
            <p class="grade-text">{{ goalDetail.selfEvaluation.grade || 'N/A' }}</p>
          </div>
          <div class="detail-item">
            <label>평가 코멘트</label>
            <p>{{ goalDetail.selfEvaluation.comment || 'N/A' }}</p>
          </div>
        </el-card>

        <el-card class="evaluation-card" shadow="never">
          <template #header>
            <div class="eval-card-header">
              <el-icon class="eval-icon manager"><UserFilled /></el-icon>
              <span class="eval-title">관리자 평가</span>
            </div>
          </template>
          <div class="detail-item">
            <label>평가 등급</label>
            <p class="grade-text">{{ goalDetail.managerEvaluation.grade || 'N/A' }}</p>
          </div>
          <div class="detail-item">
            <label>평가 코멘트</label>
            <p>{{ goalDetail.managerEvaluation.comment || 'N/A' }}</p>
          </div>
        </el-card>
      </div>
    </div>

    <div class="actions-container" v-if="isReviewMode || (isManagerForGoal && goalDetail.status === '요청')">
      <template v-if="isReviewMode">
        <el-button type="primary" @click="openEvaluateDialog" :disabled="goalDetail.status !== '본인 평가 완료' || goalDetail.managerEvaluation.grade !== ''">관리자 평가</el-button>
      </template>
      <template v-else>
        <el-button type="success" @click="handleApprove">승인</el-button>
        <el-button type="danger" @click="rejectDialogVisible = true">반려</el-button>
      </template>
    </div>

    <el-dialog v-model="rejectDialogVisible" title="목표 반려" width="500px">
      <el-form :model="rejectForm" label-position="top">
        <el-form-item label="반려 사유">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="반려 사유를 입력해주세요."></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">취소</el-button>
          <el-button type="danger" @click="handleReject">반려하기</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="evaluateDialogVisible" title="목표 평가" width="500px">
      <el-form :model="evaluateForm" label-position="top">
        <el-form-item label="등급">
          <el-select v-model="evaluateForm.rating" placeholder="등급을 선택하세요">
            <el-option label="A+" value="A+"></el-option>
            <el-option label="A" value="A"></el-option>
            <el-option label="B+" value="B+"></el-option>
            <el-option label="B" value="B"></el-option>
            <el-option label="F" value="F"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="평가 코멘트">
          <el-input v-model="evaluateForm.comment" type="textarea" :rows="4" placeholder="평가 코멘트를 입력해주세요."></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="evaluateDialogVisible = false">취소</el-button>
          <el-button type="primary" @click="handleEvaluate">평가완료</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import apiClient from '@/api/http';
import {
  ArrowLeft,
  Document,
  Edit,
  User,
  Calendar,
  Medal,
  Folder,
  FolderOpened,
  Checked,
  UserFilled
} from '@element-plus/icons-vue';

export default {
  name: 'TeamMemberGoalDetail',
  components: {
    Document,
    Edit,
    User,
    Calendar,
    Medal,
    Folder,
    FolderOpened,
    Checked,
    UserFilled
  },
  data() {
    return {
      ArrowLeft,
      goalDetail: { 
        title: '',
        contents: '',
        startDate: '',
        endDate: '',
        status: '',
        teamGoalMemberPositionId: null, // Added this
        selfEvaluation: { grade: '', comment: '' }, // Initialize here
        managerEvaluation: { grade: '', comment: '' } // Initialize here
      },
      fileList: [],
      rejectDialogVisible: false,
      rejectForm: {
          reason: ''
      },
      evaluateDialogVisible: false,
      evaluateForm: {
          rating: '',
          comment: ''
      },
      scoringRubric: [
        { grade: 'A+', description: '' },
        { grade: 'A', description: '' },
        { grade: 'B+', description: '' },
        { grade: 'B', description: '' },
        { grade: 'F', description: '' }
      ],
      myMemberPositionId: null,
      isReviewMode: false, // New property
    };
  },
  computed: {
    isManagerForGoal() {
      return this.myMemberPositionId === this.goalDetail.teamGoalMemberPositionId;
    },
  },
  methods: {
    goBack() {
      const teamGoalId = this.$route.params.goalId;
      this.$router.push(`/performance/team-goal/${teamGoalId}`);
    },
    async fetchGoalDetail() {
      const memberGoalId = this.$route.params.memberGoalId;
      try {
        const response = await apiClient.get(`/workforce-service/performance/get-goal-detail/${memberGoalId}`);
        this.goalDetail = response.data.data || {}; // Ensure it's an object

        // Initialize selfEvaluation and managerEvaluation if they don't exist in the fetched data
        if (!this.goalDetail.selfEvaluation) {
          this.goalDetail.selfEvaluation = { grade: '', comment: '' };
        }
        if (!this.goalDetail.managerEvaluation) {
          this.goalDetail.managerEvaluation = { grade: '', comment: '' };
        }

        // Fetch evaluation results if in review mode
        if (this.isReviewMode) {
          try {
            const evaluationResponse = await apiClient.get(`/workforce-service/performance/find-evaluation/${memberGoalId}`);
            if (evaluationResponse.data && evaluationResponse.data.data) {
              evaluationResponse.data.data.forEach(evaluation => {
                if (evaluation.type === 'SELF') {
                  this.goalDetail.selfEvaluation.grade = evaluation.grade;
                  this.goalDetail.selfEvaluation.comment = evaluation.comment;
                } else if (evaluation.type === 'SUPERVISOR') {
                  this.goalDetail.managerEvaluation.grade = evaluation.grade;
                  this.goalDetail.managerEvaluation.comment = evaluation.comment;
                }
              });
            }
          } catch (evalError) {
            console.error('Error fetching evaluation results:', evalError);
            // Optionally, display a message to the user
          }
        }

        if (response.data.data.evidenceList && response.data.data.evidenceList.length > 0) {
          this.fileList = response.data.data.evidenceList.map(evidence => {
            const url = evidence.evidenceUrl;
            const firstUnderscoreIndex = url.indexOf('_');
            const name = firstUnderscoreIndex !== -1 ? url.substring(firstUnderscoreIndex + 1) : url;

            return {
              name: name,
              url: url,
              uid: evidence.evidenceId
            }
          });
        }

        if (this.goalDetail.gradingSystem) {
          const gradingMap = this.goalDetail.gradingSystem;
          this.scoringRubric.forEach(item => {
            if (Object.prototype.hasOwnProperty.call(gradingMap, item.grade)) {
              item.description = gradingMap[item.grade];
            }
          });
        }

      } catch (error) {
        console.error('Error fetching goal detail:', error);
        this.$message.error('목표 상세 정보를 불러오는 데 실패했습니다.');
      }
    },
    getStatusType(status) {
      // 개인 목표 상태 (한국어)
      if (status === '요청') return 'warning';            // 🟡 요청 - 주황색
      if (status === '승인') return 'primary';            // 🔵 승인 - 파란색
      if (status === '반려') return 'danger';             // 🔴 반려 - 빨간색
      if (status === '취소') return 'info';               // ⚪ 취소 - 회색
      if (status === '평가 대기') return 'warning';       // 🟡 평가 대기 - 주황색 (요청과 동일)
      if (status === '본인 평가 완료') return 'success';  // 🟢 본인 평가 완료 - 초록색
      if (status === '최종 평가 완료') return 'success';  // 🟢 최종 평가 완료 - 초록색 (본인 평가와 동일)
      return '';
    },
    handleFilePreview(file) {
      const link = document.createElement('a');
      link.href = file.url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    async handleApprove() {
      try {
        await this.$confirm('해당 목표를 승인하시겠습니까?', '목표 승인', {
          confirmButtonText: '확인',
          cancelButtonText: '취소',
          type: 'warning',
        });

        const payload = {
          goalId: this.goalDetail.goalId,
          status: 'APPROVED'
        };
        await apiClient.patch('/workforce-service/performance/update-status', null, { params: payload });

        this.goalDetail.status = '승인';
        this.$message({
          type: 'success',
          message: '승인되었습니다.',
        });

      } catch (error) {
        if (error === 'cancel') {
          this.$message({
            type: 'info',
            message: '승인이 취소되었습니다.',
          });
        } else {
          console.error('Error approving goal:', error);
          this.$message.error('승인 처리에 실패했습니다.');
        }
      }
    },
    async handleReject() {
      if (!this.rejectForm.reason) {
        this.$message.warning('반려 사유를 입력해주세요.');
        return;
      }
      try {
        const payload = {
          goalId: this.goalDetail.goalId,
          status: 'REJECTED',
          comment: this.rejectForm.reason
        };
        await apiClient.patch('/workforce-service/performance/update-status', null, { params: payload });

        this.goalDetail.status = '반려';
        this.rejectDialogVisible = false;
        this.rejectForm.reason = '';
        this.$message.success('반려 처리되었습니다.');

      } catch (error) {
        console.error('Error rejecting goal:', error);
        this.$message.error('반려 처리에 실패했습니다.');
      }
    },
    async openEvaluateDialog() {
      this.evaluateForm.rating = '';
      this.evaluateForm.comment = '';

      try {
        const params = {
          goalId: this.$route.params.memberGoalId,
          type: 'SUPERVISOR'
        };
        const response = await apiClient.get('/workforce-service/performance/find-evaluation', { params });

        if (response.data && response.data.data) {
          const supervisorEvaluation = response.data.data.find(evalItem => evalItem.type === 'SUPERVISOR');
          if (supervisorEvaluation) {
            this.evaluateForm.rating = supervisorEvaluation.grade;
            this.evaluateForm.comment = supervisorEvaluation.comment;
          }
        }

      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.error('Error fetching evaluation:', error);
        }
      }
      this.evaluateDialogVisible = true;
    },

    async handleEvaluate() {
      if (!this.evaluateForm.rating) {
        this.$message.warning('등급을 선택해주세요.');
        return;
      }

      try {
        const payload = {
          goalId: this.$route.params.memberGoalId,
          grade: this.evaluateForm.rating,
          type: 'SUPERVISOR',
          comment: this.evaluateForm.comment
        };

        await apiClient.post('/workforce-service/performance/create-evaluation', payload);

        this.evaluateDialogVisible = false;
        this.$message.success('평가가 저장되었습니다.');
        await this.fetchGoalDetail();

      } catch (error) {
        console.error('Error saving evaluation:', error);
        this.$message.error('평가 저장에 실패했습니다.');
      }
    },
  },
  created() {
    this.myMemberPositionId = localStorage.getItem('memberPositionId'); // Added this
    this.isReviewMode = this.$route.query.mode === 'review' || this.$route.query.mode === 'complete'; // Set based on query param
    this.fetchGoalDetail();
  },
};
</script>

<style scoped>
/* Container */
.member-goal-detail-container {
  padding: 32px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* Header Section */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-text {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.main-goal-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #303133;
}

.goal-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #909399;
  margin: 0;
  font-weight: 400;
}

.goal-meta .el-icon {
  font-size: 18px;
  color: #667eea;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  border-radius: 8px;
  font-weight: 500;
}

.status-tag {
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
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

/* Details Card */
.details-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.description-item p {
  min-height: 60px;
}

.detail-item label {
  font-weight: 600;
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.detail-item label .el-icon {
  font-size: 16px;
}

.detail-item p {
  margin: 0;
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
}

/* Scoring Rubric */
.card-section {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
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
}

.rubric-description {
  flex-grow: 1;
  margin: 0;
  padding: 12px 16px;
  border: 2px solid #e4e7ed;
  border-radius: 10px;
  background-color: #f8f9fc;
  min-height: 48px;
  display: flex;
  align-items: center;
  word-break: break-word;
  font-size: 15px;
  color: #606266;
}

/* Evidence Card */
.evidence-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
}

.empty-evidence {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 12px;
}

.empty-evidence p {
  margin: 0;
  font-size: 15px;
}

/* Evaluation Section */
.evaluation-result-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-header .section-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.evaluation-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.evaluation-card {
  border-radius: 16px;
  border: none;
}

.eval-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.eval-icon {
  font-size: 28px;
  padding: 8px;
  border-radius: 10px;
}

.eval-icon.self {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.eval-icon.manager {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

.eval-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.grade-text {
  font-size: 24px !important;
  font-weight: 700 !important;
  color: #667eea !important;
}

/* Actions Container */
.actions-container {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.actions-container .el-button {
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .member-goal-detail-container {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .evaluation-cards-grid {
    grid-template-columns: 1fr;
  }

  .actions-container {
    flex-direction: column;
  }

  .actions-container .el-button {
    width: 100%;
  }
}
</style>