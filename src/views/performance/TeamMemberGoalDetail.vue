<template>
  <div class="member-goal-detail-container">
    <div class="header">
      <el-page-header @back="goBack"></el-page-header>
      <h1 class="main-goal-title">{{ goal.title }}</h1>
    </div>

    <div class="goal-details">
      <el-card>
        <div class="detail-item description-item">
          <label>목표 설명</label>
          <p>{{ goal.description }}</p>
        </div>
        <div class="detail-item">
          <label>담당자</label>
          <p>{{ goal.user.name }} ({{ goal.user.position }})</p>
        </div>
        <div class="detail-item">
          <label>기간</label>
          <p>{{ goal.startDate }} ~ {{ goal.endDate }}</p>
        </div>
        <div class="detail-item">
          <label>상태</label>
          <p><el-tag :type="getStatusType(goal.status)" effect="dark">{{ goal.status }}</el-tag></p>
        </div>
      </el-card>
    </div>

    <el-divider></el-divider>

    <div class="evidence-section">
        <el-card>
            <h3>증적 자료</h3>
            <el-upload
                class="upload-demo"
                drag
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                multiple
                :limit="3"
                :on-exceed="handleExceed"
                :file-list="fileList"
            >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                클릭하거나 파일을 드래그하여 업로드하세요
                </div>
                <template #tip>
                <div class="el-upload__tip">
                    파일 용량 500kb 이하
                </div>
                </template>
            </el-upload>
        </el-card>
    </div>

    <div class="actions-container">
        <el-button type="success">승인</el-button>
        <el-button type="danger" @click="rejectDialogVisible = true">반려</el-button>
        <el-button type="primary" @click="evaluateDialogVisible = true">평가</el-button>
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
            <el-option label="S" value="S"></el-option>
            <el-option label="A" value="A"></el-option>
            <el-option label="B" value="B"></el-option>
            <el-option label="C" value="C"></el-option>
            <el-option label="D" value="D"></el-option>
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
import { UploadFilled } from '@element-plus/icons-vue'

export default {
  name: 'TeamMemberGoalDetail',
  components: {
    UploadFilled,
  },
  data() {
    return {
      goal: {},
      fileList: [
        {
            name: '2024년 8월 실적 보고서.pdf',
            url: ''
        },
        {
            name: '신규 고객 계약서 스캔본.jpg',
            url: ''
        }
      ],
      rejectDialogVisible: false,
      rejectForm: {
          reason: ''
      },
      evaluateDialogVisible: false,
      evaluateForm: {
          rating: '',
          comment: ''
      }
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    fetchMemberGoalDetails() {
      const { memberGoalId } = this.$route.params;
      // Mock data fetching
      this.goal = {
        id: memberGoalId,
        title: '신규 고객 50개사 확보',
        description: '콜드콜, 박람회 참여 등을 통해 신규 고객 확보',
        user: {
          name: '박영업',
          position: '사원',
        },
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        status: '승인 완료',
      };
    },
    getStatusType(status) {
      if (status === '승인 완료') return 'success';
      if (status === '반려') return 'danger';
      if (status === '승인 대기') return 'warning';
      return '';
    },
    handleReject() {
        // Add rejection logic here
        console.log('Rejection reason:', this.rejectForm.reason);
        this.rejectDialogVisible = false;
    },
    handleEvaluate() {
        // Add evaluation logic here
        console.log('Evaluation:', this.evaluateForm);
        this.evaluateDialogVisible = false;
    },
    // Placeholder methods for el-upload
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`The limit is 3, you selected ${files.length} files this time, add up to ${files.length + fileList.length} totally`);
    },
    beforeRemove(file) {
      return this.$confirm(`Cancel the transfert of ${ file.name } ?`);
    }
  },
  created() {
    this.fetchMemberGoalDetails();
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

.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload-list__item-name) {
    font-size: 16px;
}

.actions-container {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
}
</style>
