<template>
  <div class="my-goal-detail-container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <div class="title-row">
          <h1 class="main-goal-title">{{ goalDetail.title }}</h1>
          <el-tag :type="getStatusType(goalDetail.status)" effect="dark" class="status-tag">
            {{ getStatusLabel(goalDetail.status) }}
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

    <!-- Team Goal Info Card -->
    <el-card class="card-section" shadow="never">
        <template #header>
            <div class="card-header">
              <el-icon class="section-icon"><Link /></el-icon>
              <span class="section-title">팀 목표 정보</span>
            </div>
        </template>
        <h3 class="team-goal-title">{{ goalDetail.teamGoalTitle }}</h3>
        <p class="team-goal-contents">{{ goalDetail.teamGoalContents }}</p>
    </el-card>

    <!-- My Goal Info Card -->
    <el-card class="card-section" shadow="never">
        <template #header>
            <div class="card-header">
              <el-icon class="section-icon"><Document /></el-icon>
              <span class="section-title">내 목표 정보</span>
            </div>
        </template>
        <el-form :model="goalDetail" label-position="top" class="goal-form">
            <el-form-item label="목표 제목">
                <el-input v-model="goalDetail.title" placeholder="목표 제목을 입력하세요"></el-input>
            </el-form-item>
            <el-form-item label="목표 상세 내용">
                <el-input v-model="goalDetail.contents" type="textarea" :rows="5" placeholder="목표 상세 내용을 입력하세요"></el-input>
            </el-form-item>
            <el-form-item label="반려 사유" v-if="goalDetail.status === '반려' || goalDetail.status === 'REJECTED'">
                <div class="rejection-reason">
                  <el-icon class="warning-icon"><Warning /></el-icon>
                  <p>{{ goalDetail.comment }}</p>
                </div>
            </el-form-item>
        </el-form>
    </el-card>

    <!-- Scoring Rubric Card -->
    <el-card class="card-section" shadow="never">
        <template #header>
            <div class="card-header">
              <el-icon class="section-icon"><Medal /></el-icon>
              <span class="section-title">점수 체계</span>
            </div>
        </template>
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
    </el-card>

    <!-- Evidence Card -->
    <el-card class="card-section evidence-card" shadow="never" v-if="shouldShowEvidenceCard(goalDetail.status)">
        <template #header>
            <div class="card-header">
              <el-icon class="section-icon"><Folder /></el-icon>
              <span class="section-title">증적 자료</span>
            </div>
        </template>
        
        <!-- 기존 증적 목록 (제출된 증적이 있는 경우) -->
        <div v-if="evidenceList && evidenceList.length > 0" class="evidence-list-section">
          <h4 class="evidence-list-title">제출된 증적</h4>
          <div class="evidence-list">
            <div 
              v-for="evidence in evidenceList" 
              :key="evidence.evidenceId" 
              class="evidence-item"
              @click="handleEvidenceClick(evidence)"
            >
              <el-icon class="evidence-icon"><Document /></el-icon>
              <span class="evidence-name">{{ getEvidenceFileName(evidence.evidenceUrl) }}</span>
              <el-icon class="evidence-download-icon"><Link /></el-icon>
            </div>
          </div>
        </div>
        
        <el-upload
            ref="uploader"
            class="upload-demo"
            :disabled="isFromReviewPage" 
            action="https://jsonplaceholder.typicode.com/posts/" 
            multiple
            :file-list="fileList"
            :on-remove="handleFileRemove"
            :on-change="handleFileChange"
            :on-preview="handleFilePreview"
            :auto-upload="false"
        >
            <template v-if="!isFromReviewPage">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                클릭하거나 파일을 드래그하여 업로드하세요
                </div>
            </template>
        </el-upload>
    </el-card>

    <!-- Evaluation Result Section -->
    <div class="evaluation-result-section" v-if="isFromReviewPage && isFinalEvaluated(goalDetail.status)">
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

    <!-- Actions Container -->
    <div class="actions-container">
        <el-button @click="goBack" class="cancel-button">취소</el-button>
        <el-button v-if="!isFromReviewPage" type="primary" @click="saveChanges" :disabled="!canSave(goalDetail.status)" class="save-button">
          <el-icon><Select /></el-icon>
          <span>저장</span>
        </el-button>
        <el-button v-if="isFromReviewPage" type="success" @click="selfEvaluateDialogVisible = true" :disabled="!canEvaluate(goalDetail.status)" class="evaluate-button">
          <el-icon><Edit /></el-icon>
          <span>본인 평가</span>
        </el-button>
    </div>

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
  </div>
</template>

<script>
import apiClient from '@/api/http';
import { 
  UploadFilled,
  ArrowLeft,
  Calendar,
  Link,
  Document,
  Warning,
  Medal,
  Folder,
  Checked,
  User,
  UserFilled,
  Select,
  Edit
} from '@element-plus/icons-vue';

export default {
  name: 'MyGoalDetail',
  components: {
      UploadFilled,
      Calendar,
      Link,
      Document,
      Warning,
      Medal,
      Folder,
      Checked,
      User,
      UserFilled,
      Select,
      Edit
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
        comment: '', // Initialize comment here
        selfEvaluation: { grade: '', comment: '' },
        managerEvaluation: { grade: '', comment: '' }
      },
      fileList: [],
      filesToDelete: [],
      evidenceList: [],
      scoringRubric: [
        { grade: 'A+', description: '' },
        { grade: 'A', description: '' },
        { grade: 'B+', description: '' },
        { grade: 'B', description: '' },
        { grade: 'F', description: '' }
      ],
      isFromReviewPage: false,
      selfEvaluateDialogVisible: false,
      selfEvaluateForm: {
        rating: '',
        comment: ''
      },
      evaluatingGoalId: null
    };
  },
  methods: {
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },
    handleFileRemove(file, fileList) {
      if (file.fileId) {
        this.filesToDelete.push(file.fileId);
      }
      this.fileList = fileList;
    },
    handleFilePreview(file) {
      // 파일 클릭 시 다운로드하는 로직
      const link = document.createElement('a');
      link.href = file.url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    handleEvidenceClick(evidence) {
      // 증적 클릭 시 새 탭에서 열기 또는 다운로드
      if (evidence.evidenceUrl) {
        window.open(evidence.evidenceUrl, '_blank');
      }
    },
    getEvidenceFileName(url) {
      // URL에서 파일명 추출
      if (!url) return '알 수 없는 파일';
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // 첫 번째 _ 뒤의 부분을 파일명으로 사용
      const underscoreIndex = fileName.indexOf('_');
      if (underscoreIndex !== -1 && underscoreIndex < fileName.length - 1) {
        const actualFileName = fileName.substring(underscoreIndex + 1);
        // URL 디코딩 (한글 파일명 처리)
        try {
          return decodeURIComponent(actualFileName);
        } catch (e) {
          return actualFileName;
        }
      }
      
      // _ 가 없으면 전체 파일명 사용
      try {
        return decodeURIComponent(fileName);
      } catch (e) {
        return fileName;
      }
    },
    goBack() {
      // 평가 쪽에서 들어온 경우(from=review) 평가 목록으로, 그렇지 않으면 내 목표 관리로
      if (this.$route.query.from === 'review') {
        this.$router.push('/performance/review');
      } else {
        this.$router.push('/performance/my-goal');
      }
    },
    async saveChanges() {
      try {
        await this.$confirm('변경 사항을 저장하시겠습니까?', '저장 확인', {
          confirmButtonText: '저장',
          cancelButtonText: '취소',
          type: 'info',
        });

        const goalId = this.goalDetail.goalId;

        // --- 1. API 1 호출: 텍스트 정보 수정 ---
        const textUpdateDto = {
          goalId: goalId,
          title: this.goalDetail.title,
          contents: this.goalDetail.contents,
          startDate: this.goalDetail.startDate,
          endDate: this.goalDetail.endDate,
          gradingSystem: this.scoringRubric.reduce((acc, item) => {
            acc[item.grade] = item.description;
            return acc;
          }, {}),
        };

        await apiClient.patch(`/workforce-service/performance/update-my-goal`, textUpdateDto);
        this.$message.success('목표 정보가 성공적으로 수정되었습니다.');

        // --- 2. API 2 호출: 파일 정보 동기화 (조건부 실행) ---
        const newFiles = this.fileList.filter(f => !f.fileId).map(f => f.raw);

        if (newFiles.length > 0 || this.filesToDelete.length > 0) {
          const existingFileIds = this.fileList
            .filter(f => f.fileId)
            .map(f => f.fileId);

          const formData = new FormData();
          const syncDto = { existingFileIds: existingFileIds };

          formData.append('evidenceInfo', new Blob([JSON.stringify(syncDto)], { type: 'application/json' }));
          newFiles.forEach(file => {
            formData.append('newFiles', file);
          });

          await apiClient.patch(`/workforce-service/performance/evidence/${goalId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          this.$message.success('증적 자료가 성공적으로 업데이트되었습니다.');

          this.filesToDelete = [];
        } else {
          console.log('파일 변경사항이 없어 파일 동기화를 건너뜁니다.');
        }

        // --- 3. 모든 작업 성공 시, 이전 페이지로 이동 ---
        this.goBack();

      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('저장이 취소되었습니다.');
        } else {
          console.error('저장 중 오류 발생:', error);
          this.$message.error('저장 중 문제가 발생했습니다. 다시 시도해주세요.');
        }
      }
    },
    async fetchGoalDetail() {
      const goalId = this.$route.params.goalId;
      this.evaluatingGoalId = goalId;
      try {
        const response = await apiClient.get(`/workforce-service/performance/get-goal-detail/${goalId}`);
        this.goalDetail = response.data.data;

        // 증적 목록 저장
        if (response.data.data.evidenceList && Array.isArray(response.data.data.evidenceList)) {
          this.evidenceList = response.data.data.evidenceList;
        } else {
          this.evidenceList = [];
        }

        // Initialize selfEvaluation and managerEvaluation if they don't exist in the fetched data
        if (!this.goalDetail.selfEvaluation) {
          this.goalDetail.selfEvaluation = { grade: '', comment: '' };
        }
        if (!this.goalDetail.managerEvaluation) {
          this.goalDetail.managerEvaluation = { grade: '', comment: '' };
        }

        // Fetch evaluation results if status is '최종 평가 완료' or '본인 평가 완료'
        const finalOrSelfEvaluated = ['최종 평가 완료', '본인 평가 완료', 'FINAL_EVALUATED', 'SELF_EVALUATED'];
        if (finalOrSelfEvaluated.includes(this.goalDetail.status)) {
          try {
            const evaluationResponse = await apiClient.get(`/workforce-service/performance/find-evaluation/${goalId}`);
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
          }
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
        console.error(`Error fetching goal detail for ID: ${goalId}`, error);
        this.$message.error('목표 정보를 불러오는 데 실패했습니다.');
      }
    },
    getStatusType(status) {
      // 개인 목표 상태 (영어)
      if (status === 'REQUESTED') return 'warning';     // 🟡 요청 - 주황색
      if (status === 'APPROVED') return 'primary';      // 🔵 승인 - 파란색
      if (status === 'REJECTED') return 'danger';       // 🔴 반려 - 빨간색
      if (status === 'CANCELED') return 'info';         // ⚪ 취소 - 회색
      if (status === 'PENDING_EVALUATION') return 'warning';       // 🟡 평가 대기 - 주황색
      if (status === 'SELF_EVALUATED') return 'success';  // 🟢 본인 평가 완료 - 초록색
      if (status === 'FINAL_EVALUATED') return 'success';  // 🟢 최종 평가 완료 - 초록색
      
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
    getStatusLabel(status) {
      // 영어 상태를 한국어로 변환
      const labels = {
        'REQUESTED': '요청',
        'APPROVED': '승인',
        'REJECTED': '반려',
        'CANCELED': '취소',
        'PENDING_EVALUATION': '평가 대기',
        'SELF_EVALUATED': '본인 평가 완료',
        'FINAL_EVALUATED': '최종 평가 완료'
      };
      // 한국어 상태는 그대로 반환, 영어 상태는 변환
      return labels[status] || status;
    },
    shouldShowEvidenceCard(status) {
      // 반려 또는 취소 상태가 아닌 경우에만 증적 카드 표시
      const hiddenStatuses = ['반려', '취소', 'REJECTED', 'CANCELED'];
      return !hiddenStatuses.includes(status);
    },
    canSave(status) {
      // 저장 가능한 상태: 요청, 승인, 평가 대기
      const saveableStatuses = ['요청', '승인', '평가 대기', 'REQUESTED', 'APPROVED', 'PENDING_EVALUATION'];
      return saveableStatuses.includes(status);
    },
    canEvaluate(status) {
      // 평가 가능한 상태: 평가 대기
      const evaluableStatuses = ['평가 대기', 'PENDING_EVALUATION'];
      return evaluableStatuses.includes(status);
    },
    isFinalEvaluated(status) {
      // 최종 평가 완료 상태
      const finalEvaluatedStatuses = ['최종 평가 완료', 'FINAL_EVALUATED'];
      return finalEvaluatedStatuses.includes(status);
    },
    async handleSelfEvaluate() {
      if (!this.selfEvaluateForm.rating) {
        this.$message.warning('등급을 선택해주세요.');
        return;
      }

      try {
        const payload = {
          goalId: this.$route.params.goalId, 
          grade: this.selfEvaluateForm.rating,
          type: 'SELF',
          comment: this.selfEvaluateForm.comment
        };

        await apiClient.post('/workforce-service/performance/create-evaluation', payload);

        this.$message.success('본인 평가가 저장되었습니다.');
        this.selfEvaluateDialogVisible = false;
        await this.fetchGoalDetail();

      } catch (error) {
        console.error('Error saving self evaluation:', error);
        this.$message.error('평가 저장에 실패했습니다.');
      }
    },
  },
  created() {
    console.log('MyGoalDetail created. Route params:', this.$route.params);
    this.fetchGoalDetail();
    if (this.$route.query.from === 'review') {
      this.isFromReviewPage = true;
    }
  }
};
</script>

<style scoped>
/* Container */
.my-goal-detail-container {
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

.status-tag {
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
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

/* Card Sections */
.card-section {
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
  margin: 0;
  white-space: pre-wrap;
}

/* Goal Form */
.goal-form {
  margin-top: 0;
}

/* Rejection Reason */
.rejection-reason {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(245, 108, 108, 0.1);
  border-left: 4px solid #f56c6c;
  border-radius: 8px;
}

.warning-icon {
  font-size: 24px;
  color: #f56c6c;
  flex-shrink: 0;
}

.rejection-reason p {
  margin: 0;
  color: #f56c6c;
  font-size: 15px;
  line-height: 1.6;
}

/* Scoring Rubric */
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

/* Evidence Card */
.evidence-card {
  margin-bottom: 24px;
}

/* Evidence List Section */
.evidence-list-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.evidence-list-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evidence-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.evidence-item:hover {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  transform: translateX(4px);
}

.evidence-icon {
  font-size: 20px;
  color: #409eff;
  flex-shrink: 0;
}

.evidence-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
  word-break: break-all;
}

.evidence-download-icon {
  font-size: 18px;
  color: #909399;
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.evidence-item:hover .evidence-download-icon {
  color: #409eff;
}

.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload) {
  width: 100%;
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 280px;
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.upload-demo :deep(.el-upload-dragger:hover) {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.05);
}

.upload-demo :deep(.el-icon--upload) {
  font-size: 72px;
  color: #c0c4cc;
  margin-bottom: 8px;
}

.upload-demo :deep(.el-upload__text) {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.upload-demo :deep(.el-upload-list) {
  margin-top: 20px;
}

.upload-demo :deep(.el-upload-list__item) {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.upload-demo :deep(.el-upload-list__item:hover) {
  background-color: #f5f7fa;
}

/* Evaluation Result Section */
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

.detail-item {
  margin-bottom: 20px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item label {
  font-weight: 600;
  color: #909399;
  font-size: 14px;
  display: block;
  margin-bottom: 8px;
}

.detail-item p {
  margin: 0;
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
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

.cancel-button,
.save-button,
.evaluate-button {
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
}

.save-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.save-button:active:not(:disabled) {
  transform: translateY(0);
}

.evaluate-button {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: none;
  box-shadow: 0 3px 12px rgba(103, 194, 58, 0.3);
  transition: all 0.3s ease;
}

.evaluate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(103, 194, 58, 0.5);
  background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%);
}

.evaluate-button:active:not(:disabled) {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .my-goal-detail-container {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    gap: 16px;
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

  .rubric-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .rubric-grade {
    margin-bottom: 8px;
  }
}
</style>
