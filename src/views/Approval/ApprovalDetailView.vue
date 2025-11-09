\ㅛ<template>
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
            <div v-for="approver in currentApprovalLine" :key="approver.approverId" class="approver-display-item">
              <div class="approver-name">{{ approver.approverName }}</div>
              <div class="approver-details">{{ approver.approverOrganization }} / {{ approver.approverPosition }}</div>
              <div class="approver-status">
                <span :class="`status-${approver.status.toLowerCase()}`">{{ getKoreanStatus(approver.status) }}</span>
                <span v-if="approver.approveAt" class="approver-date">{{ formatApprovalDate(approver.approveAt) }}</span>
              </div>
              <div v-if="approver.status === 'REJECTED' && approver.comment" class="rejection-reason">
                <strong>반려 사유:</strong> {{ approver.comment }}
              </div>
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
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalCommentPages * 10"
          v-model:current-page="currentCommentPage"
          @current-change="handleCommentPageChange"
        />
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
        <el-button type="success" :disabled="!isCurrentUserTurn" @click="approve">승인</el-button>
        <el-button type="danger" :disabled="!isCurrentUserTurn" @click="reject">반려</el-button>
        <el-button @click="goBack">목록으로</el-button>
    </div>

    <!-- Rejection Modal -->
    <el-dialog v-model="showRejectModal" title="반려 사유">
      <el-input
        v-model="rejectionReason"
        type="textarea"
        placeholder="반려 사유를 입력하세요..."
        :rows="4"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRejectModal = false">취소</el-button>
          <el-button type="primary" @click="handleReject">반려</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api/http';
import { ElMessageBox, ElMessage } from 'element-plus';

export default {
  name: 'ApprovalDetailView',
  setup() {
    const router = useRouter();
    const route = useRoute();
        const approvalId = ref(null);
    const totalCommentPages = ref(0);
    const currentCommentPage = ref(1);
        const formSchema = ref(null);
        const formData = ref({});
        const formTitle = ref('');
        const approvalTitle = ref('');
        const currentApprovalLine = ref([]);
        const comments = ref([]);
        const newComment = ref('');
        const attachments = ref([]); // For attachment list
        const isCurrentUserTurn = ref(false);
        const showRejectModal = ref(false);
        const rejectionReason = ref('');

    const getKoreanStatus = (status) => {
      const statusMap = {
        'PENDING': '진행중',
        'DRAFT': '임시저장',
        'APPROVED': '승인',
        'REJECTED': '반려',
        'WAITING': '대기',
      };
      return statusMap[status] || status;
    };

    const fetchApprovalDetails = async (id) => {
      try {
        const response = await apiClient.get(`/workforce-service/approval/find-approval/${id}`);
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
        
        if (details.lineList) {
          currentApprovalLine.value = details.lineList;

          const pendingApprover = details.lineList.find(approver => approver.status === 'PENDING');
          if (pendingApprover) {
            const currentUserMemberPositionId = localStorage.getItem('memberPositionId');
            if (pendingApprover.approverId === currentUserMemberPositionId) {
              isCurrentUserTurn.value = true;
            }
          }
        }

      } catch (error) {
        console.error('Failed to fetch approval details:', error);
      }
    };

    const fetchComments = async (id, page = 0) => {
      try {
        const response = await apiClient.get(`/workforce-service/approval/find-reply/${id}?page=${page}`);
        comments.value = response.data.data.content.map(comment => {
          const formattedDate = comment.createdAt ? comment.createdAt.substring(0, 16).replace('T', ' ') : '';
          return {
            id: comment.memberPositionId + comment.createdAt,
            author: `${comment.memberName} (${comment.memberOrganization} / ${comment.memberPosition})`,
            content: comment.contents,
            date: formattedDate
          };
        });
        totalCommentPages.value = response.data.data.totalPages;
        currentCommentPage.value = response.data.data.number + 1;
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        comments.value = [];
      }
    };

    const handleCommentPageChange = (page) => {
      fetchComments(approvalId.value, page - 1);
    };


    const formatApprovalDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
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
        await apiClient.post(`/workforce-service/approval/create-reply/${approvalId.value}`, replyRequestDto);
        newComment.value = '';
        // Re-fetch comments to get the updated list
        await fetchComments(approvalId.value, currentCommentPage.value - 1); 
      } catch (error) {
        console.error('Failed to add comment:', error);
        // alert('댓글 작성에 실패했습니다.');
      }
    };

    const goBack = () => {
      router.push('/approval');
    };

    const approve = () => {
      ElMessageBox.confirm('승인 하시겠습니까?', '승인 확인', {
        confirmButtonText: '승인',
        cancelButtonText: '취소',
        type: 'warning',
      }).then(async () => {
        try {
          await apiClient.patch(`/workforce-service/approval/approve/${approvalId.value}`);
          ElMessage({ type: 'success', message: '결재가 승인되었습니다.' });
          router.push('/approval');
        } catch (error) {
          console.error('Failed to approve:', error);
          ElMessage({ type: 'error', message: '결재 승인에 실패했습니다.' });
        }
      }).catch(() => {
        // Action cancelled
      });
    };

    const reject = () => {
      rejectionReason.value = '';
      showRejectModal.value = true;
    };

    const handleReject = async () => {
      if (!rejectionReason.value.trim()) {
        ElMessage({ type: 'warning', message: '반려 사유를 입력해주세요.' });
        return;
      }
      try {
        await apiClient.patch(`/workforce-service/approval/reject/${approvalId.value}`, { comment: rejectionReason.value });
        ElMessage({ type: 'success', message: '결재가 반려되었습니다.' });
        showRejectModal.value = false;
        router.push('/approval');
      } catch (error) {
        console.error('Failed to reject:', error);
        ElMessage({ type: 'error', message: '결재 반려에 실패했습니다.' });
      }
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
      getKoreanStatus,
      formatApprovalDate,
      isCurrentUserTurn,
      approve,
      reject,
      showRejectModal,
      rejectionReason,
      handleReject,
      totalCommentPages,
      currentCommentPage,
      handleCommentPageChange,
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
.approval-line-display { padding: 0; flex-grow: 1; }
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
  margin-bottom: 8px;
}
.approver-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
.approver-date {
  font-size: 12px;
  color: #909399;
}
.rejection-reason {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  font-style: italic;
}
.status-pending, .status-waiting {
  color: #f56c6c;
  font-weight: bold;
}
.status-approved {
  color: #67c23a;
  font-weight: bold;
}
.status-rejected {
  color: #f56c6c;
  font-weight: bold;
}
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
.pagination-container { margin-top: 20px; display: flex; justify-content: center; }
</style>
