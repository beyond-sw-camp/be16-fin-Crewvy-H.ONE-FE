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

            <!-- Attachment Section -->
            <el-divider>첨부파일</el-divider>
            <div class="attachment-section">
              <el-upload
                v-model:file-list="fileList"
                class="upload-demo"
                drag
                action="#"
                :auto-upload="false"
                multiple
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  클릭하거나 파일을 드래그하여 업로드하세요
                </div>
              </el-upload>
            </div>
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
             <div v-for="approver in currentApprovalLine" :key="approver.id" class="approver-display-item">
              <div class="approver-name">{{ approver.name }}</div>
              <div class="approver-details">{{ approver.department }} / {{ approver.position }}</div>
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
      :initial-line="currentApprovalLine"
      @update:visible="showApprovalLineEditor = $event"
      @save="updateApprovalLine"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api/http';
import ApprovalLineEditorModal from '@/components/approval/ApprovalLineEditorModal.vue';
import { UploadFilled } from '@element-plus/icons-vue';

export default {
  name: 'ApprovalRequestForm',
  components: {
    ApprovalLineEditorModal,
    UploadFilled,
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
    const fileList = ref([]); // For <el-upload>
    const memberInfo = ref(null);

    const fetchMemberInfo = async () => {
      try {
        const memberPositionId = localStorage.getItem('memberPositionId');
        if (!memberPositionId) return;

        const response = await apiClient.post('/member-service/member/position-list', {
          uuidList: [memberPositionId]
        });

        if (response.data.data && response.data.data.length > 0) {
          memberInfo.value = response.data.data[0];
        }
      } catch (error) {
        console.error('Failed to fetch member info:', error);
      }
    };

    const initializeFormData = (schema, userInfo) => {
      const data = {};
      if (schema && schema.rows) {
        schema.rows.forEach(row => {
          row.forEach(field => {
            if (userInfo) {
              if (field.id === 'department') {
                data[field.id] = userInfo.organizationName;
              } else if (field.id === 'position') {
                data[field.id] = userInfo.titleName;
              } else if (field.id === 'name') {
                data[field.id] = userInfo.memberName;
              } else {
                data[field.id] = null;
              }
            } else {
              data[field.id] = null;
            }
          });
        });
      }
      formData.value = data;
    };

    const fetchFormSchema = async (id, userInfo) => {
      try {
        const response = await apiClient.get(`/workforce-service/approval/get-document/${id}`);
        const doc = response.data.data;
        formTitle.value = doc.documentName;
        if (doc.metadata) {
          formSchema.value = doc.metadata.schema;
          initializeFormData(doc.metadata.schema, userInfo);
        }
        if (doc.policy && doc.policy.length > 0) {
          const sortedPolicy = doc.policy.sort((a, b) => a.index - b.index);
          const approverIds = sortedPolicy.map(p => p.approverId);

          const positionResponse = await apiClient.post('/member-service/member/position-list', {
            uuidList: approverIds
          });

          if (positionResponse.data.data) {
            const positionDataMap = new Map(positionResponse.data.data.map(p => [p.memberId, p]));

            const policyApprovers = sortedPolicy.map(p => {
              const positionInfo = positionDataMap.get(p.approverId);
              return {
                id: p.approverId,
                name: p.approverName,
                department: p.approverOrganization,
                position: p.approverPosition,
                memberPositionId: positionInfo ? positionInfo.memberPositionId : null
              };
            });

            currentApprovalLine.value.push(...policyApprovers);
          }
        }
      } catch (error) {
        console.error('Failed to fetch form schema:', error);
      }
    };

    const fetchDraftData = async (id, userInfo) => {
      try {
        const response = await apiClient.get(`/workforce-service/approval/find-approval/${id}`);
        const draftData = response.data.data;

        approvalTitle.value = draftData.title;
        formData.value = draftData.contents;

        if (userInfo) {
          formData.value.department = userInfo.organizationName;
          formData.value.position = userInfo.titleName;
          formData.value.name = userInfo.memberName;
        }
        
        if (draftData.document) {
            documentId.value = draftData.document.documentId;
            formTitle.value = draftData.document.documentName;
            if (draftData.document.metadata) {
                formSchema.value = draftData.document.metadata.schema;
            }
        }
        
        if (draftData.attachmentList) {
          fileList.value = draftData.attachmentList.map(file => {
            const url = file.attachmentUrl;
            const firstUnderscoreIndex = url.indexOf('_');
            const displayName = firstUnderscoreIndex !== -1 
              ? url.substring(firstUnderscoreIndex + 1) 
              : url; // Fallback to full URL if no underscore

            return {
              name: displayName,
              id: file.attachmentId,
              status: 'success',
              url: url // Keep the original URL for potential downloads
            };
          });
        }

        if (draftData.lineList) {
            currentApprovalLine.value = draftData.lineList;
        }

      } catch (error) {
        console.error('Failed to fetch draft data:', error);
      }
    };

    onMounted(async () => {
      await fetchMemberInfo();

      if (memberInfo.value) {
        currentApprovalLine.value.push({
          id: memberInfo.value.memberId,
          name: memberInfo.value.memberName,
          department: memberInfo.value.organizationName,
          position: memberInfo.value.titleName,
          memberPositionId: memberInfo.value.memberPositionId,
        });
      }

      const approvalIdFromRoute = route.params.id;
      const documentIdFromRoute = route.params.documentId;

      if (approvalIdFromRoute) {
        draftApprovalId.value = approvalIdFromRoute;
        fetchDraftData(approvalIdFromRoute, memberInfo.value);
      } else if (documentIdFromRoute) {
        documentId.value = documentIdFromRoute;
        fetchFormSchema(documentIdFromRoute, memberInfo.value);
      }
    });

    const handleFileUpload = async (approvalId) => {
      if (fileList.value.length === 0) return; // No files to upload

      const formData = new FormData();
      const newFiles = [];
      const existingFileIds = [];

      fileList.value.forEach(file => {
        if (file.raw) { // New file selected by user
          newFiles.push(file.raw);
        } else if (file.status === 'success') { // Existing file
          existingFileIds.push(file.id);
        }
      });

      const attachmentInfoDto = {
        existingFileIds: existingFileIds,
      };

      formData.append('attachmentInfo', new Blob([JSON.stringify(attachmentInfoDto)], { type: 'application/json' }));
      
      if (newFiles.length > 0) {
        newFiles.forEach(file => {
          formData.append('newFiles', file);
        });
      }

      try {
        await apiClient.patch(`/workforce-service/approval/attachment/${approvalId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        console.error('File upload failed:', error);
        alert('파일 업로드에 실패했습니다.');
      }
    };

    const submitApproval = async () => {
      console.log('Submitting with documentId:', documentId.value);
      const lineDtoList = currentApprovalLine.value.map((approver, index) => ({
        memberPositionId: approver.memberPositionId,
        lineIndex: index + 1,
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
        const response = await apiClient.post('/workforce-service/approval/create-approval', approvalData);
        const newApprovalId = response.data.data.approvalId;
        if (newApprovalId) {
          await handleFileUpload(newApprovalId);
        }
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
        const response = await apiClient.post('/workforce-service/approval/draft-approval', approvalData);
        const newApprovalId = response.data.data;
        console.log(newApprovalId);
        if (newApprovalId) {
          await handleFileUpload(newApprovalId);
        }
        alert('결재가 임시저장되었습니다.');
        router.push('/approval');
      } catch (error) {
        console.error('임시저장 실패:', error);
        alert('임시저장에 실패했습니다.');
      }
    };

    const deleteDraft = async () => {
      if (!draftApprovalId.value) return;

      if (confirm('이 임시저장 문서를 삭제하시겠습니까?')) {
        try {
          await apiClient.delete(`/workforce-service/approval/discard-approval/${draftApprovalId.value}`);
          alert('문서가 삭제되었습니다.');
          router.push('/approval');
        } catch (error) {
          console.error('삭제 실패:', error);
          alert('삭제에 실패했습니다.');
        }
      }
    };

    const updateApprovalLine = (newLine) => {
      currentApprovalLine.value = newLine;
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
      fileList,
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

.attachment-section {
  padding: 0 20px 20px 20px;
}

.form-placeholder {
  min-height: 500px; /* Ensure a decent height */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.approval-line-display {
  padding: 0;
  flex-grow: 1;
}

.approver-display-item {
  background-color: #f9f9f9;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.approver-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}
.approver-details {
  font-size: 14px;
  color: #606266;
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