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
                <span><el-tag :type="getStatusType(goalDetail.status)" effect="dark">{{ goalDetail.status }}</el-tag></span>
            </el-form-item>
            <el-form-item label="반려 사유" v-if="goalDetail.status === '반려'">
                <p>{{ goalDetail.comment }}</p>
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
            ref="uploader"
            class="upload-demo"
            drag
            action="https://jsonplaceholder.typicode.com/posts/" 
            multiple
            :file-list="fileList"
            :on-remove="handleFileRemove"
            :on-change="handleFileChange"
            :on-preview="handleFilePreview"
            :auto-upload="false"
        >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
            클릭하거나 파일을 드래그하여 업로드하세요
            </div>
        </el-upload>
    </el-card>

    <div class="actions-container">
        <el-button @click="goBack">취소</el-button>
        <el-button v-if="!isFromReviewPage" type="primary" @click="saveChanges" :disabled="!['요청', '승인'].includes(goalDetail.status)">저장</el-button>
        <el-button v-if="isFromReviewPage" type="primary" @click="selfEvaluateDialogVisible = true">본인 평가</el-button>
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
import { UploadFilled } from '@element-plus/icons-vue';

export default {
  name: 'MyGoalDetail',
  components: {
      UploadFilled
  },
  data() {
    return {
      goalDetail: {
        title: '',
        contents: '',
        startDate: '',
        endDate: '',
        status: '',
        comment: '', // Initialize comment here
      },
      fileList: [],
      filesToDelete: [],
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
    goBack() {
      this.$router.go(-1);
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

        if (response.data.data.evidenceList && response.data.data.evidenceList.length > 0) {
          this.fileList = response.data.data.evidenceList.map(evidence => {
            const url = evidence.evidenceUrl;
            const firstUnderscoreIndex = url.indexOf('_');
            const name = firstUnderscoreIndex !== -1 ? url.substring(firstUnderscoreIndex + 1) : url;

            return {
              name: name,
              url: url,
              fileId: evidence.evidenceId,
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
        console.error(`Error fetching goal detail for ID: ${goalId}`, error);
        this.$message.error('목표 정보를 불러오는 데 실패했습니다.');
      }
    },
    getStatusType(status) {
      if (status === '승인') return 'success';
      if (status === '반려') return 'danger';
      if (status === '요청') return 'warning';
      if (status === '취소') return 'info';
      if (status === '평가 대기') return 'info';
      if (status === '본인 평가 완료') return 'success';
      if (status === '최종 평가 완료') return 'success';
      return '';
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
