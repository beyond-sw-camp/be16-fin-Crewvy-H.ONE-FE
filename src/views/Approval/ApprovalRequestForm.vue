<template>
  <div class="approval-form-container">

    <div class="form-layout">
      <!-- Left Side: Form Content -->
      <div class="form-content-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>{{ formTitle }}</span>
            </div>
          </template>
          <div v-if="formSchema" class="dynamic-form">
            <el-form :model="formData" label-position="top">
              <el-form-item label="결재 제목" required>
                <el-input v-model="approvalTitle" placeholder="결재 제목을 입력하세요." />
              </el-form-item>

              <el-row v-for="(row, rowIndex) in formSchema.rows" :key="rowIndex" :gutter="20">
                <el-col v-for="field in row" :key="field.id" :span="24 / row.length">
                  <el-form-item :label="field.label" :required="field.required">
                    <!-- Text Input -->
                    <el-input
                      v-if="field.type === 'text'"
                      v-model="formData[field.id]"
                      :placeholder="field.placeholder"
                      :readonly="field.readonly"
                    />
                    <!-- Textarea -->
                    <el-input
                      v-if="field.type === 'textarea'"
                      type="textarea"
                      v-model="formData[field.id]"
                      :placeholder="field.placeholder"
                      :rows="4"
                    />
                    <!-- Date Picker -->
                    <el-date-picker
                      v-if="field.type === 'date'"
                      v-model="formData[field.id]"
                      type="date"
                      :placeholder="field.placeholder"
                      style="width: 100%;"
                    />
                    <!-- Number Input -->
                    <el-input-number
                      v-if="field.type === 'number'"
                      v-model="formData[field.id]"
                      :placeholder="field.placeholder"
                      style="width: 100%;"
                    />
                    <!-- Tel Input -->
                    <el-input
                      v-if="field.type === 'tel'"
                      v-model="formData[field.id]"
                      type="tel"
                      :placeholder="field.placeholder"
                    />
                    <!-- Select Input -->
                    <el-select
                      v-if="field.type === 'select'"
                      v-model="formData[field.id]"
                      :placeholder="field.label"
                      style="width: 100%;"
                    >
                      <el-option
                        v-for="option in field.options"
                        :key="option"
                        :label="option"
                        :value="option"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
          <div v-else class="form-placeholder">
            <p>선택된 결재 양식을 불러오는 중입니다...</p>
          </div>
        </el-card>
      </div>

      <!-- Right Side: Approval Line -->
      <div class="approval-line-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>결재 라인</span>
              <el-button type="primary" plain size="small" @click="showApprovalLineEditor = true">결재라인 편집</el-button>
            </div>
          </template>
          <div class="approval-line-display">
             <div v-for="(approver, index) in currentApprovalLine" :key="approver.id" class="approver-display-item">
              <span>{{ index + 1 }}. {{ approver.name }} ({{ approver.department }})</span>
            </div>
            <div v-if="currentApprovalLine.length === 0" class="empty-state">
              <p>결재라인을 추가해 주세요.</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    <div class="form-actions">
        <el-button type="danger" v-if="draftApprovalId" @click="deleteDraft">삭제</el-button>
        <el-button @click="draftApproval">임시저장</el-button>
        <el-button type="primary" @click="submitApproval">결재요청</el-button>
      </div>

    <!-- Approval Line Editor Modal -->
    <ApprovalLineEditorModal 
      :visible="showApprovalLineEditor" 
      @update:visible="showApprovalLineEditor = $event"
      @save="updateApprovalLine"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import ApprovalLineEditorModal from '@/components/approval/ApprovalLineEditorModal.vue';

export default {
  name: 'ApprovalRequestForm',
  components: {
    ApprovalLineEditorModal,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const documentId = ref(null); // For the template
    const draftApprovalId = ref(null); // For the specific draft instance being edited
    const formSchema = ref(null);
    const formData = ref({});
    const formTitle = ref('');
    const approvalTitle = ref('');
    const showApprovalLineEditor = ref(false);
    const currentApprovalLine = ref([]);

    const initializeFormData = (schema) => {
      const data = {};
      if (schema && schema.rows) {
        schema.rows.forEach(row => {
          row.forEach(field => {
            data[field.id] = null;
          });
        });
      }
      formData.value = data;
    };

    const fetchFormSchema = async (id) => {
      try {
        const response = await axios.get(`http://localhost:8080/approval/get-document/${id}`);
        const doc = response.data;
        formTitle.value = doc.documentName;
        if (doc.metadata) {
          formSchema.value = doc.metadata.schema;
          initializeFormData(doc.metadata.schema);
        }
      } catch (error) {
        console.error('Failed to fetch form schema:', error);
      }
    };

    const fetchDraftData = async (id) => {
      try {
        const response = await axios.get(`http://localhost:8080/approval/find-approval/${id}`);
        const draftData = response.data;

        approvalTitle.value = draftData.title;
        formData.value = draftData.contents;
        
        if (draftData.document) {
            documentId.value = draftData.document.documentId;
            formTitle.value = draftData.document.documentName;
            if (draftData.document.metadata) {
                formSchema.value = draftData.document.metadata.schema;
            }
        }
        // Assuming approval line is also part of this response for drafts
        if (draftData.approvalLine) {
            currentApprovalLine.value = draftData.approvalLine;
        }
      } catch (error) {
        console.error('Failed to fetch draft data:', error);
      }
    };

    onMounted(() => {
      const approvalIdFromRoute = route.params.id;
      const documentIdFromRoute = route.params.documentId;

      if (approvalIdFromRoute) {
        // Editing a draft
        draftApprovalId.value = approvalIdFromRoute;
        fetchDraftData(approvalIdFromRoute);
      } else if (documentIdFromRoute) {
        // Creating a new form
        documentId.value = documentIdFromRoute;
        fetchFormSchema(documentIdFromRoute);
      }
    });

    const submitApproval = async () => {
      const lineDtoList = currentApprovalLine.value.map((approver, index) => ({
        memberId: approver.id,
        lineIndex: index,
      }));

      const approvalData = {
        documentId: documentId.value,
        title: approvalTitle.value,
        contents: formData.value,
        lineDtoList: lineDtoList,
      };

      if (draftApprovalId.value) {
        approvalData.approvalId = draftApprovalId.value;
      }

      try {
        await axios.post('http://localhost:8080/approval/create-approval', approvalData);
        alert('결재 요청이 성공적으로 전송되었습니다.');
        router.push('/approval');
      } catch (error) {
        console.error('결재 요청 실패:', error);
        alert('결재 요청에 실패했습니다.');
      }
    };

    const draftApproval = async () => {
      const lineDtoList = currentApprovalLine.value.map((approver, index) => ({
        memberId: approver.id,
        lineIndex: index,
      }));

      const approvalData = {
        documentId: documentId.value,
        title: approvalTitle.value,
        contents: formData.value,
        lineDtoList: lineDtoList,
      };

      if (draftApprovalId.value) {
        approvalData.approvalId = draftApprovalId.value;
      }

      try {
        await axios.post('http://localhost:8080/approval/draft-approval', approvalData);
        alert('결재가 임시저장되었습니다.');
        router.push('/approval');
      } catch (error) {
        console.error('임시저장 실패:', error);
        alert('임시저장에 실패했습니다.');
      }
    };

    const updateApprovalLine = (newLine) => {
      currentApprovalLine.value = newLine;
    };

    const deleteDraft = async () => {
      if (!draftApprovalId.value) return;

      if (confirm('이 임시저장 문서를 삭제하시겠습니까?')) {
        try {
          await axios.delete(`http://localhost:8080/approval/discard-approval/${draftApprovalId.value}`);
          alert('문서가 삭제되었습니다.');
          router.push('/approval');
        } catch (error) {
          console.error('삭제 실패:', error);
          alert('삭제에 실패했습니다.');
        }
      }
    };

    return {
      documentId,
      draftApprovalId,
      formSchema,
      formData,
      formTitle,
      approvalTitle,
      submitApproval,
      draftApproval,
      deleteDraft,
      showApprovalLineEditor,
      currentApprovalLine,
      updateApprovalLine,
    };
  },
};
</script>

<style scoped>
.approval-form-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 10px;
}

.form-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px; /* Adjusted margin */
}

.form-layout {
  display: flex;
  gap: 24px;
}

.form-content-section {
  flex: 3; /* 3:1 ratio */
}

.approval-line-section {
  flex: 1;
}

.box-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 24px; /* Increased font size */
}

.dynamic-form {
  padding: 20px;
}

.form-placeholder {
  min-height: 500px; /* Ensure a decent height */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.approval-line-display {
  padding: 10px;
  flex-grow: 1;
}

.approver-display-item {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.empty-state {
  text-align: center;
  color: #909399;
  padding-top: 40px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
