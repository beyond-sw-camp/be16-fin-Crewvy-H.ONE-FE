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
        <el-button type="primary" @click="saveChanges" :disabled="!['REQUESTED', 'APPROVED'].includes(goalDetail.status)">저장</el-button>
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
    async saveChanges() {
      try {
        await this.$confirm('변경 사항을 저장하시겠습니까?', '저장 확인', {
          confirmButtonText: '저장',
          cancelButtonText: '취소',
          type: 'info',
        });

        // 1. gradingSystem을 DTO 형식(Map)에 맞게 변환
        const gradingSystemAsMap = this.scoringRubric.reduce((acc, item) => {
          acc[item.grade] = item.description;
          return acc;
        }, {});

        // 2. DTO 형식에 맞는 payload 생성
        const payload = {
          goalId: this.goalDetail.goalId,
          title: this.goalDetail.title,
          contents: this.goalDetail.contents,
          startDate: this.goalDetail.startDate,
          endDate: this.goalDetail.endDate,
          gradingSystem: gradingSystemAsMap
        };
        
        await axios.patch(`http://localhost:8080/performance/update-my-goal`, payload);

        this.$message.success('변경 사항이 저장되었습니다.');
        this.goBack();

      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('저장이 취소되었습니다.');
        } else {
          console.error('Error saving changes:', error);
          this.$message.error('변경 사항 저장에 실패했습니다.');
        }
      }
    },
    async fetchGoalDetail() {
      const goalId = this.$route.params.goalId;
      try {
        const response = await axios.get(`http://localhost:8080/performance/get-goal-detail/${goalId}`);
        this.goalDetail = response.data;

        // gradingSystem 데이터가 있으면, 화면에 표시될 scoringRubric 배열을 업데이트합니다.
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