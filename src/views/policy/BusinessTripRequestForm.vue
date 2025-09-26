<template>
  <div class="form-container">
    <el-row :gutter="20">
      <!-- Left Column: Form -->
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <h2 class="form-title">출장 신청서</h2>
            </div>
          </template>

          <el-form label-position="top" :model="form">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="작성부서">
                  <el-input value="영업부" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="작성일자">
                  <el-date-picker v-model="form.requestDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="작성자">
                  <el-input value="김대리" disabled />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="출장 목적">
              <el-input v-model="form.purpose" placeholder="출장 목적을 입력하세요" />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="출장 시작일">
                  <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="출장 종료일">
                  <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="출장지">
              <el-input v-model="form.destination" placeholder="출장지를 입력하세요 (예: 서울, 부산)" />
            </el-form-item>

            <el-form-item label="상세 출장 내용">
              <el-input 
                v-model="form.details" 
                type="textarea" 
                :rows="4"
                placeholder="상세 출장 내용을 입력해주세요."
              />
            </el-form-item>

            <el-form-item label="예상 경비">
              <el-input-number v-model="form.estimatedCost" :min="0" :step="10000" style="width: 100%;" />
            </el-form-item>

            <!-- 첨부문서 Section -->
            <div class="section">
               <el-form-item label="첨부파일">
                <el-upload drag action="#" multiple :auto-upload="false" style="width: 100%">
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text">파일을 드래그하거나 <em>클릭하여 업로드</em></div>
                </el-upload>
              </el-form-item>
            </div>

          </el-form>
        </el-card>
      </el-col>

      <!-- Right Column: Approval Line -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>결재라인</span>
              <el-button type="primary" plain size="small" :icon="Edit" @click="showApprovalLineModal = true">편집</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item 
              v-for="(approver, index) in approvalLine" 
              :key="index" 
              :timestamp="`${approver.position} / ${approver.department || '영업부'}`" 
              placement="top"
            >
              <el-card>
                <h4>{{ approver.name }} ({{ index === 0 ? '기안' : '승인' }})</h4>
                <p>{{ approver.status || (index === 0 ? new Date().toLocaleString() : '대기중') }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- Bottom Buttons -->
    <el-row justify="center" class="form-footer">
        <el-button>임시저장</el-button>
        <el-button type="primary">결재요청</el-button>
        <el-button @click="$router.back()">취소</el-button>
    </el-row>

    <!-- Approval Line Editor Modal -->
    <approval-line-editor-modal 
      v-model:visible="showApprovalLineModal"
      :current-approvers="approvalLine"
      @update:approvers="updateApprovers"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { UploadFilled, Edit } from '@element-plus/icons-vue';
import ApprovalLineEditorModal from '@/components/approval/ApprovalLineEditorModal.vue';

const route = useRoute();

const form = ref({
  requestDate: new Date().toISOString().slice(0, 10),
  purpose: '',
  startDate: '',
  endDate: '',
  destination: '',
  details: '',
  estimatedCost: 0,
});

onMounted(() => {
  if (route.query.startDate) {
    form.value.startDate = route.query.startDate;
  }
  if (route.query.endDate) {
    form.value.endDate = route.query.endDate;
  }
  if (route.query.reason) {
    form.value.purpose = route.query.reason; // Map reason to purpose
  }
});

const showApprovalLineModal = ref(false);

const approvalLine = ref([
  { name: "김대리", position: "대리", department: "영업부", status: new Date().toLocaleString() },
  { name: "박과장", position: "과장", department: "영업부", status: "대기중" },
  { name: "최부장", position: "부장", department: "영업부", status: "대기중" },
]);

const updateApprovers = (newApprovers) => {
  approvalLine.value = newApprovers;
};

</script>

<style scoped>
.form-container {
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px;
}
.form-title {
  margin: 0;
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section {
  margin-top: 20px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
}
.form-footer {
  margin-top: 20px;
}
</style>
