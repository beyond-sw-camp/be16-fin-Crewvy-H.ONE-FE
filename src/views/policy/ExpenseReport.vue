<template>
  <div class="form-container">
    <el-row :gutter="20">
      <!-- Left Column: Form -->
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <h2 class="form-title">지출결의서</h2>
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
                  <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="작성자">
                  <el-input value="김대리" disabled />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="지출 목적">
              <el-input v-model="form.purpose" placeholder="지출 목적을 입력하세요" />
            </el-form-item>
            
            <el-form-item label="합계 금액">
               <el-input :value="totalAmountFormatted" disabled >
                 <template #prepend>₩</template>
               </el-input>
            </el-form-item>

            <!-- 지출 항목 Section -->
            <div class="section">
              <div class="section-header">
                <span>지출 항목</span>
                <el-button @click="addItem" size="small" :icon="Plus">항목 추가</el-button>
              </div>
              <el-table :data="form.items" style="width: 100%" border>
                <el-table-column label="사용일" width="180">
                  <template #default="{ row }">
                    <el-date-picker v-model="row.date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
                  </template>
                </el-table-column>
                <el-table-column label="항목">
                  <template #default="{ row }">
                    <el-input v-model="row.item" placeholder="예: 식대, 교통비" />
                  </template>
                </el-table-column>
                <el-table-column label="결제수단" width="160">
                  <template #default="{ row }">
                    <el-select v-model="row.paymentMethod" placeholder="선택">
                      <el-option label="법인카드" value="corporate_card" />
                      <el-option label="개인카드" value="personal_card" />
                      <el-option label="현금" value="cash" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="금액" width="180">
                  <template #default="{ row }">
                    <el-input-number v-model="row.amount" :precision="0" :step="1000" :min="0" style="width: 100%;" />
                  </template>
                </el-table-column>
                <el-table-column label="삭제" width="70" align="center">
                  <template #default="{ $index }">
                    <el-button @click="removeItem($index)" type="danger" :icon="Delete" circle plain />
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 첨부문서 Section -->
            <div class="section">
               <el-form-item label="증빙자료 첨부 (영수증 등)">
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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Plus, Delete, UploadFilled, Edit } from '@element-plus/icons-vue';
import ApprovalLineEditorModal from '@/components/approval/ApprovalLineEditorModal.vue';

const route = useRoute();

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  purpose: '',
  items: [
    { date: '', item: '', paymentMethod: 'corporate_card', amount: 0 },
  ],
});

onMounted(() => {
  if (route.query.reason) {
    form.value.purpose = route.query.reason;
  }
  if (route.query.startDate) {
    // For expense report, we might want to add a default item with the date
    if (form.value.items.length === 1 && !form.value.items[0].date) {
      form.value.items[0].date = route.query.startDate;
    }
  }
});

const totalAmount = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.amount || 0), 0);
});

const totalAmountFormatted = computed(() => {
  return totalAmount.value.toLocaleString();
});

const addItem = () => {
  form.value.items.push({ date: '', item: '', paymentMethod: 'corporate_card', amount: 0 });
};

const removeItem = (index) => {
  form.value.items.splice(index, 1);
};

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
