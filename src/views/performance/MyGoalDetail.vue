<template>
  <div class="my-goal-detail-container">
    <div class="header">
      <el-page-header @back="goBack" content="내 목표 상세"></el-page-header>
    </div>

    <el-card class="card-section">
        <template #header>
            <span>팀 목표 정보</span>
        </template>
        <h2>{{ goalDetail.teamGoalTitle }}</h2>
        <p>{{ goalDetail.teamGoalContents }}</p>
    </el-card>

    <el-card class="card-section">
        <template #header>
            <span>내 목표 정보</span>
        </template>
        <el-form :model="goalDetail" label-position="top">
            <el-form-item label="목표 제목">
                <el-input v-model="goalDetail.title"></el-input>
            </el-form-item>
            <el-form-item label="목표 상세 내용">
                <el-input v-model="goalDetail.contents" type="textarea" :rows="5"></el-input>
            </el-form-item>
            <el-form-item label="목표 기간">
                <span>{{ goalDetail.startDate }} ~ {{ goalDetail.endDate }}</span>
            </el-form-item>
            <el-form-item label="상태">
                <el-tag :type="getStatusType(goalDetail.status)" effect="dark">{{ goalDetail.status }}</el-tag>
            </el-form-item>
        </el-form>
    </el-card>

    <el-card class="card-section">
        <template #header>
            <span>점수 체계</span>
        </template>
        <div v-for="item in scoringRubric" :key="item.grade" class="rubric-item">
            <span class="rubric-grade">{{ item.grade }}</span>
            <el-input
                v-model="item.description"
                type="textarea"
                :rows="2"
                :placeholder="item.grade + ' 등급에 대한 달성 기준을 입력하세요.'"
            ></el-input>
        </div>
    </el-card>

    <el-card class="card-section" v-if="goalDetail.status === 'APPROVED'">
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
import axios from 'axios';
import { UploadFilled } from '@element-plus/icons-vue';

export default {
  name: 'MyGoalDetail',
  components: {
      UploadFilled
  },
  data() {
    return {
      goalDetail: {}, // API 응답 데이터를 담을 단일 객체
      fileList: [],
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
    saveChanges() {
        // 저장 로직
        console.log('Saving changes:', this.goalDetail);
        this.goBack();
    },
    async fetchGoalDetail() {
      const goalId = this.$route.params.goalId;
      try {
        // In a real environment, use the actual API call:
        const response = await axios.get(`http://localhost:8080/performance/get-goal-detail/${goalId}`);
        this.goalDetail = response.data;

        // Using mock data for demonstration:
        // this.goalDetail = {
        //     "goalId": goalId,
        //     "title": "신규 클라이언트 5곳 발굴 및 계약",
        //     "contents": "4분기 내 잠재 고객 리스트를 기반으로 신규 클라이언트 5곳과 계약을 체결하여 팀 매출 목표 달성에 기여합니다.",
        //     "startDate": "2025-10-01",
        //     "endDate": "2025-12-31",
        //     "status": "REQUESTED",
        //     "teamGoalTitle": "2025년 4분기 팀 매출 20% 성장 달성",
        //     "teamGoalContents": "신규 고객 확보 및 기존 고객 유지 전략을 통해 4분기 팀 목표 매출액 1억 2천만원을 달성하는 것을 목표로 합니다."
        // };
        // this.fileList = []; // 증적 자료도 API를 통해 받아와야 합니다.

      } catch (error) {
        console.error(`Error fetching goal detail for ID: ${goalId}`, error);
        this.$message.error('목표 정보를 불러오는 데 실패했습니다.');
      }
    },
    getStatusType(status) {
      if (status === 'APPROVED') return 'success';
      if (status === 'REJECTED') return 'danger';
      if (status === 'REQUESTED') return 'warning';
      if (status === 'CANCELED') return 'info';
      return '';
    },
  },
  created() {
    this.fetchGoalDetail();
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