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
                <el-input v-model="approvalTitle" placeholder="결재 제목을 입력하세요." readonly />
              </el-form-item>

              <el-row v-for="(row, rowIndex) in formSchema.rows" :key="rowIndex" :gutter="20">
                <el-col v-for="field in row" :key="field.id" :span="24 / row.length">
                  <el-form-item :label="field.label" :required="field.required">
                    <el-input v-if="field.type === 'text'" v-model="formData[field.id]" :placeholder="field.placeholder" readonly />
                    <el-input v-if="field.type === 'textarea'" type="textarea" v-model="formData[field.id]" :placeholder="field.placeholder" :rows="4" readonly />
                    <el-date-picker v-if="field.type === 'date'" v-model="formData[field.id]" type="date" :placeholder="field.placeholder" style="width: 100%;" readonly />
                    <el-input-number v-if="field.type === 'number'" v-model="formData[field.id]" :placeholder="field.placeholder" style="width: 100%;" readonly />
                    <el-input v-if="field.type === 'tel'" v-model="formData[field.id]" type="tel" :placeholder="field.placeholder" readonly />
                    <el-select v-if="field.type === 'select'" v-model="formData[field.id]" :placeholder="field.label" style="width: 100%;" disabled>
                      <el-option v-for="option in field.options" :key="option" :label="option" :value="option" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
          <div v-else class="form-placeholder">
            <p>결재 정보를 불러오는 중입니다...</p>
          </div>
        </el-card>
      </div>

      <!-- Right Side: Approval Line -->
      <div class="approval-line-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>결재 라인</span>
            </div>
          </template>
          <div class="approval-line-display">
             <div v-for="(approver, index) in currentApprovalLine" :key="approver.id" class="approver-display-item">
              <span>{{ index + 1 }}. {{ approver.name }} ({{ approver.department }}) - {{ approver.status }}</span>
            </div>
            <div v-if="currentApprovalLine.length === 0" class="empty-state">
              <p>결재라인 정보가 없습니다.</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Attachment Display Section -->
    <el-card class="box-card attachment-display-section">
      <template #header>
        <div class="card-header">
          <span>첨부파일</span>
        </div>
      </template>
      <div v-if="attachments.length > 0" class="attachment-list">
        <div v-for="file in attachments" :key="file.id" class="attachment-item">
          <a :href="file.url" target="_blank" rel="noopener noreferrer">{{ file.name }}</a>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>첨부파일이 없습니다.</p>
      </div>
    </el-card>

    <!-- Comment Section -->
    <el-card class="box-card comment-section">
      <template #header>
        <div class="card-header">
          <span>댓글</span>
        </div>
      </template>
      <div class="comment-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-author-date">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-date">{{ comment.date }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
        <div v-if="!comments || comments.length === 0" class="empty-state">
          <p>댓글이 없습니다.</p>
        </div>
      </div>
      <div class="comment-form">
        <el-input
          v-model="newComment"
          type="textarea"
          placeholder="댓글을 입력하세요..."
          :rows="3"
        />
        <div class="comment-form-actions">
          <el-button type="primary" @click="addComment">댓글 작성</el-button>
        </div>
      </div>
    </el-card>

    <div class="form-actions">
        <el-button type="success">승인</el-button>
        <el-button type="danger">반려</el-button>
        <el-button @click="goBack">목록으로</el-button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'ApprovalDetailView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const approvalId = ref(null);
    
    const formSchema = ref(null);
    const formData = ref({});
    const formTitle = ref('');
    const approvalTitle = ref('');
    const currentApprovalLine = ref([]);
    const comments = ref([]);
    const newComment = ref('');
    const attachments = ref([]); // For attachment list

    const fetchApprovalDetails = async (id) => {
      try {
        const response = await axios.get(`http://localhost:8080/workforce-service/approval/find-approval/${id}`);
        const details = response.data.data;

        approvalTitle.value = details.title;
        formData.value = details.contents;
        
        if (details.document) {
            formTitle.value = details.document.documentName;
            if (details.document.metadata) {
                formSchema.value = details.document.metadata.schema;
            }
        }

        if (details.attachmentList) {
          attachments.value = details.attachmentList.map(file => {
            const url = file.attachmentUrl;
            const firstUnderscoreIndex = url.indexOf('_');
            const displayName = firstUnderscoreIndex !== -1 
              ? url.substring(firstUnderscoreIndex + 1) 
              : url;
            return {
              name: displayName,
              url: url,
              id: file.attachmentId
            };
          });
        }
        
        // approvalLine is not in this response, so it will be empty for now.
        currentApprovalLine.value = [];

      } catch (error) {
        console.error('Failed to fetch approval details:', error);
      }
    };

    const fetchComments = async (id) => {
      try {
        const response = await axios.get(`http://localhost:8080/workforce-service/approval/find-reply/${id}`);
        comments.value = response.data.data.map(comment => ({
          id: comment.memberId + comment.contents, // Simple key
          author: comment.memberId || 'Unknown User',
          content: comment.contents,
          date: '' // Date is not provided in the response
        }));
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        comments.value = [];
      }
    };
    
    onMounted(() => {
      approvalId.value = route.params.id;
      if (approvalId.value) {
        fetchApprovalDetails(approvalId.value);
        fetchComments(approvalId.value);
      }
    });

    const addComment = async () => {
      if (!newComment.value.trim()) return;

      const replyRequestDto = {
        contents: newComment.value,
      };

      try {
        await axios.post(`http://localhost:8080/workforce-service/approval/create-reply/${approvalId.value}`, replyRequestDto);
        newComment.value = '';
        // Re-fetch comments to get the updated list
        await fetchComments(approvalId.value); 
      } catch (error) {
        console.error('Failed to add comment:', error);
        // alert('댓글 작성에 실패했습니다.');
      }
    };

    const goBack = () => {
      router.push('/approval');
    };

    return {
      approvalId,
      formSchema,
      formData,
      formTitle,
      approvalTitle,
      currentApprovalLine,
      comments,
      newComment,
      addComment,
      goBack,
      attachments,
    };
  },
};
</script>

<style scoped>
/* Using styles from ApprovalRequestForm and adding new ones */
.approval-form-container { max-width: 1600px; margin: 0 auto; padding: 10px; }
.form-layout { display: flex; gap: 24px; }
.form-content-section { flex: 3; }
.approval-line-section { flex: 1; }
.box-card { height: 100%; display: flex; flex-direction: column; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 24px; }
.dynamic-form { padding: 20px; }
.form-placeholder { min-height: 500px; display: flex; align-items: center; justify-content: center; color: #909399; }
.approval-line-display { padding: 10px; flex-grow: 1; }
.approver-display-item { padding: 8px; border-bottom: 1px solid #f0f0f0; }
.empty-state { text-align: center; color: #909399; padding-top: 20px; padding-bottom: 20px;}
.form-actions { display: flex; justify-content: flex-end; margin-top: 24px; gap: 10px; }

/* Attachment Display Section Styles */
.attachment-display-section { margin-top: 24px; }
.attachment-list { padding: 10px; }
.attachment-item {
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}
.attachment-item a {
  text-decoration: none;
  color: #409EFF;
}
.attachment-item:hover {
  background-color: #f5f7fa;
}

/* Comment Section Styles */
.comment-section { margin-top: 24px; }
.comment-list { display: flex; flex-direction: column; gap: 16px; padding: 10px; }
.comment-item { border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; }
.comment-author-date { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.comment-author { font-weight: bold; }
.comment-date { font-size: 12px; color: #909399; }
.comment-content { font-size: 14px; }
.comment-form { margin-top: 20px; }
.comment-form-actions { display: flex; justify-content: flex-end; margin-top: 10px; }
</style>
