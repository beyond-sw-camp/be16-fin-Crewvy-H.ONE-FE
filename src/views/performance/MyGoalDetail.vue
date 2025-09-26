<template>
  <div class="my-goal-detail-container">
    <div class="header">
      <el-page-header @back="goBack" content="내 목표 상세"></el-page-header>
    </div>

    <el-card class="card-section">
        <template #header>
            <span>팀 목표 정보</span>
        </template>
        <h2>{{ teamGoal.title }}</h2>
        <p>{{ teamGoal.description }}</p>
    </el-card>

    <el-card class="card-section">
        <template #header>
            <span>내 목표 정보</span>
        </template>
        <el-form :model="myGoal" label-position="top">
            <el-form-item label="목표 제목">
                <el-input v-model="myGoal.title"></el-input>
            </el-form-item>
            <el-form-item label="목표 상세 내용">
                <el-input v-model="myGoal.description" type="textarea" :rows="5"></el-input>
            </el-form-item>
            <el-form-item label="상태">
                <el-tag :type="getStatusType(myGoal.status)" effect="dark">{{ myGoal.status }}</el-tag>
            </el-form-item>
        </el-form>
    </el-card>

    <el-card class="card-section">
        <template #header>
            <span>증적 자료</span>
        </template>
        <el-upload
            class="upload-demo"
            drag
            action="https://jsonplaceholder.typicode.com/posts/"
            multiple
            :file-list="fileList"
        >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
            클릭하거나 파일을 드래그하여 업로드하세요
            </div>
        </el-upload>
    </el-card>

    <div class="actions-container">
        <el-button @click="goBack">취소</el-button>
        <el-button type="primary" @click="saveChanges">저장</el-button>
    </div>
  </div>
</template>

<script>
import { UploadFilled } from '@element-plus/icons-vue';

export default {
  name: 'MyGoalDetail',
  components: {
      UploadFilled
  },
  data() {
    return {
      teamGoal: {},
      myGoal: {},
      fileList: []
    };
  },
  methods: {
    goBack() {
      this.$router.push('/performance/my-goal');
    },
    saveChanges() {
        // 저장 로직
        console.log('Saving changes:', this.myGoal);
        this.goBack();
    },
    fetchGoalDetails() {
      const goalId = this.$route.params.goalId;
      // Mock data fetching
      console.log('Fetching goal details for ID:', goalId);
      this.teamGoal = {
        title: '2024년 하반기 매출 20% 증대',
        description: '신규 고객 확보 및 기존 고객 대상 프로모션을 통해 매출 증대를 목표로 합니다.'
      };
      this.myGoal = {
        id: goalId,
        title: '1분기 개인 매출 1억 달성',
        description: '신규 고객 발굴 및 기존 고객 추가 계약을 통해 목표 달성',
        status: '승인',
        grade: 'A',
      };
      this.fileList = [
          {
            name: '2024년 1분기 실적 보고서.pdf',
            url: ''
          }
      ]
    },
    getStatusType(status) {
      if (status === '승인') return 'success';
      if (status === '반려') return 'danger';
      if (status === '요청') return 'warning';
      return '';
    },
  },
  created() {
    this.fetchGoalDetails();
  }
};
</script>

<style scoped>
.my-goal-detail-container {
  padding: 24px;
}
.header {
    margin-bottom: 24px;
}
.card-section {
    margin-bottom: 24px;
}
.actions-container {
    display: flex;
    justify-content: flex-end;
}
</style>
