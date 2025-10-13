<template>
  <div class="member-goal-detail-container">
    <div class="header">
      <el-page-header @back="goBack"></el-page-header>
      <h1 class="main-goal-title">{{ goalDetail.title }}</h1>
    </div>

    <div class="goal-details">
      <el-card>
        <div class="detail-item description-item">
          <label>목표 설명</label>
          <p>{{ goalDetail.contents }}</p>
        </div>
        <div class="detail-item">
          <label>기간</label>
          <p>{{ goalDetail.startDate }} ~ {{ goalDetail.endDate }}</p>
        </div>
        <div class="detail-item">
          <label>상태</label>
          <p><el-tag :type="getStatusType(goalDetail.status)" effect="dark">{{ goalDetail.status }}</el-tag></p>
        </div>
      </el-card>
    </div>

    <el-card class="card-section" v-if="goalDetail.gradingSystem && Object.keys(goalDetail.gradingSystem).length">
        <template #header>
            <span>점수 체계</span>
        </template>
        <div v-for="item in scoringRubric" :key="item.grade" class="rubric-item">
            <span class="rubric-grade">{{ item.grade }}</span>
            <p class="rubric-description">{{ item.description }}</p>
        </div>
    </el-card>

    <el-divider></el-divider>

    <div class="evidence-section">
        <el-card>
            <h3>증적 자료</h3>
            <el-upload
                class="upload-demo"
                :file-list="fileList"
                :on-preview="handleFilePreview"
                disabled
            >
            </el-upload>
            <div v-if="!fileList || fileList.length === 0">
              <p>업로드된 증적 자료가 없습니다.</p>
            </div>
        </el-card>
    </div>

    <div class="actions-container">
        <el-button type="success" @click="handleApprove" :disabled="goalDetail.status !== 'REQUESTED'">승인</el-button>
        <el-button type="danger" @click="rejectDialogVisible = true" :disabled="goalDetail.status !== 'REQUESTED'">반려</el-button>
        <el-button type="primary" @click="openEvaluateDialog" :disabled="goalDetail.status !== 'APPROVED'">평가</el-button>
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
import axios from 'axios';


export default {
  name: 'TeamMemberGoalDetail',
  components: {
  },
  data() {
    return {
      goalDetail: { 
        title: '',
        contents: '',
        startDate: '',
        endDate: '',
        status: ''
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
      ]
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchGoalDetail() {
      const goalId = this.$route.params.memberGoalId;
      try {
        const response = await axios.get(`http://localhost:8080/performance/get-goal-detail/${goalId}`);
        this.goalDetail = response.data.data;

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
      if (status === 'APPROVED') return 'success';
      if (status === 'REJECTED') return 'danger';
      if (status === 'REQUESTED') return 'warning';
      if (status === 'CANCELED') return 'info';
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
        await axios.patch('http://localhost:8080/performance/update-status', null, { params: payload });

        this.goalDetail.status = 'APPROVED';
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
        await axios.patch('http://localhost:8080/performance/update-status', null, { params: payload });

        this.goalDetail.status = 'REJECTED';
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
          goalId: this.goalDetail.goalId,
          type: 'SUPERVISOR'
        };
        const response = await axios.get('http://localhost:8080/performance/find-evaluation', { params });

        if (response.data.data) {
          this.evaluateForm.rating = response.data.data.grade;
          this.evaluateForm.comment = response.data.data.comment;
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
          goalId: this.goalDetail.goalId,
          grade: this.evaluateForm.rating,
          type: 'SUPERVISOR',
          comment: this.evaluateForm.comment
        };

        await axios.post('http://localhost:8080/performance/create-evaluation', null, { params: payload });

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
    this.fetchGoalDetail();
  },
};
</script>

<style scoped>
.member-goal-detail-container {
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

.goal-details .el-card,
.evidence-section .el-card {
  border-radius: 8px;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.description-item p {
    min-height: 100px;
}

.detail-item label {
  font-weight: 600;
  color: #606266;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.detail-item p {
  margin: 0;
  font-size: 16px;
}

.evidence-section {
  margin-top: 24px;
}

.evidence-section h3 {
  margin-bottom: 16px;
}

.actions-container {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
}

.card-section {
    margin-bottom: 24px;
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

.rubric-description {
  flex-grow: 1;
  margin: 0;
  padding: 8px 12px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  background-color: #F5F7FA;
  min-height: 40px;
  display: flex;
  align-items: center;
  word-break: break-word;
}
</style>