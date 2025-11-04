<template>
  <div class="approval">
    <div class="page-header">
      <div class="header-content">
        <h1>전자결재</h1>
        <p>사내 결재 워크플로우를 디지털로 관리하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openTemplateSelector">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">결재 신청</span>
        </el-button>
        <el-button @click="goToTemplateList">
          <el-icon><Document /></el-icon>
          <span style="margin-left: 8px;">템플릿 관리</span>
        </el-button>
      </div>
    </div>

    <!-- 결재 현황 카드 -->
    <div class="approval-cards">
      <div class="approval-card">
        <div class="card-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">결재 대기함</div>
          <div class="card-value">{{ pendingApprovals }}</div>
          <div class="card-subtitle">승인 대기</div>
        </div>
      </div>
      
      <div class="approval-card">
        <div class="card-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">내 기안(진행중)</div>
          <div class="card-value">{{ inProgressApprovals }}</div>
          <div class="card-subtitle">내 결재</div>
        </div>
      </div>
      
      <div class="approval-card">
        <div class="card-icon">
          <el-icon><Check /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">내 기안(완료)</div>
          <div class="card-value">{{ completedApprovals }}</div>
          <div class="card-subtitle">이번 달</div>
        </div>
      </div>
      
      <div class="approval-card">
        <div class="card-icon">
          <el-icon><Check /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">내 결재(완료)</div>
          <div class="card-value">{{ myApprovalsCompleted }}</div>
          <div class="card-subtitle"></div>
        </div>
      </div>
      
      <div class="approval-card">
        <div class="card-icon">
          <el-icon><Edit /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">임시저장</div>
          <div class="card-value">{{ draftApprovals }}</div>
          <div class="card-subtitle"></div>
        </div>
      </div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="approval-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="결재 대기함" name="pending">
          <div class="pending-approvals">
            <div class="section-header">
              <h3>대기 중인 결재</h3>

            </div>

            <div class="approval-list-header">
              <div class="approval-col title">제목</div>
              <div class="approval-col position">직책</div>
              <div class="approval-col name">이름</div>
              <div class="approval-col date">작성일</div>
              <div class="approval-col actions">상세</div>
            </div>
            
            <div class="approval-list">
              <div class="approval-item" v-for="approval in pendingApprovalsList" :key="approval.approvalId">
                <div class="approval-col title">{{ approval.title }}</div>
                <div class="approval-col position">{{ approval.requesterPosition }}</div>
                <div class="approval-col name">{{ approval.requesterName }}</div>
                <div class="approval-col date">{{ approval.createAt ? approval.createAt.substring(0, 10) : '' }}</div>
                <div class="approval-col actions">
                  <el-button size="small" @click="viewDetails(approval)">
                    <el-icon><View /></el-icon>
                    상세
                  </el-button>
                </div>
              </div>
              <div v-if="pendingApprovalsList.length === 0" class="empty-state">
                <p>결재 내역이 없습니다.</p>
              </div>
            </div>
            <div v-if="pendingTotalPages > 1" class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="pendingTotalPages * 10"
                v-model:current-page="pendingCurrentPage"
                @current-change="handlePendingPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="내 기안(진행중)" name="my-requests">
          <div class="my-requests">
            <div class="section-header">
              <h3>내 결재 신청</h3>
            </div>

            <div class="approval-list-header">
              <div class="approval-col title">제목</div>
              <div class="approval-col position">직책</div>
              <div class="approval-col name">이름</div>
              <div class="approval-col date">작성일</div>
              <div class="approval-col actions">상세</div>
            </div>
            
            <div v-if="showMyRequestsTable" class="request-list">
              <div class="request-item" v-for="request in myRequests" :key="request.approvalId">
                <div class="approval-col title">{{ request.title }}</div>
                <div class="approval-col position">{{ request.requesterPosition }}</div>
                <div class="approval-col name">{{ request.requesterName }}</div>
                <div class="approval-col date">{{ request.createAt ? request.createAt.substring(0, 10) : '' }}</div>
                <div class="approval-col actions">
                  <el-button size="small" @click="viewRequestDetails(request)">
                    <el-icon><View /></el-icon>
                    상세
                  </el-button>
                </div>
              </div>
              <div v-if="myRequests.length === 0" class="empty-state">
                <p>결재 내역이 없습니다.</p>
              </div>
            </div>
            <div v-if="myRequestsTotalPages > 1" class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="myRequestsTotalPages * 10"
                v-model:current-page="myRequestsCurrentPage"
                @current-change="handleMyRequestsPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="내 기안(완료)" name="completed">
          <div class="completed-approvals">
            <div class="section-header">
              <h3>완료된 결재</h3>
              <div class="filter-options">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="~"
                  start-placeholder="시작일"
                  end-placeholder="종료일"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
                <el-select v-model="selectedStatus" placeholder="상태 선택" style="width: 120px">
                  <el-option label="전체" value="" />
                  <el-option label="승인" value="approved" />
                  <el-option label="반려" value="rejected" />
                </el-select>
              </div>
            </div>

            <div class="approval-list-header">
              <div class="approval-col title">제목</div>
              <div class="approval-col position">직책</div>
              <div class="approval-col name">이름</div>
              <div class="approval-col date">작성일</div>
              <div class="approval-col actions">상세</div>
            </div>
            
            <div class="completed-list">
              <div class="completed-item" v-for="approval in completedList" :key="approval.approvalId">
                <div class="approval-col title">{{ approval.title }}</div>
                <div class="approval-col position">{{ approval.requesterPosition }}</div>
                <div class="approval-col name">{{ approval.requesterName }}</div>
                <div class="approval-col date">{{ approval.createAt ? approval.createAt.substring(0, 10) : '' }}</div>
                <div class="approval-col actions">
                  <el-button size="small" @click="viewCompletedDetails(approval)">
                    <el-icon><View /></el-icon>
                    상세
                  </el-button>
                </div>
              </div>
              <div v-if="completedList.length === 0" class="empty-state">
                <p>결재 내역이 없습니다.</p>
              </div>
            </div>
            <div v-if="completedTotalPages > 1" class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="completedTotalPages * 10"
                v-model:current-page="completedCurrentPage"
                @current-change="handleCompletedPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="내 결재(완료)" name="my-approvals-completed">
          <div class="completed-approvals">
            <div class="section-header">
              <h3>내 결재(완료)</h3>
            </div>
            <div class="approval-list-header">
              <div class="approval-col title">제목</div>
              <div class="approval-col position">직책</div>
              <div class="approval-col name">이름</div>
              <div class="approval-col date">작성일</div>
              <div class="approval-col actions">상세</div>
            </div>
            <div class="completed-list">
              <div class="completed-item" v-for="approval in myApprovalsCompletedList" :key="approval.approvalId">
                <div class="approval-col title">{{ approval.title }}</div>
                <div class="approval-col position">{{ approval.requesterPosition }}</div>
                <div class="approval-col name">{{ approval.requesterName }}</div>
                <div class="approval-col date">{{ approval.createAt ? approval.createAt.substring(0, 10) : '' }}</div>
                <div class="approval-col actions">
                  <el-button size="small" @click="viewCompletedDetails(approval)">
                    <el-icon><View /></el-icon>
                    상세
                  </el-button>
                </div>
              </div>
              <div v-if="myApprovalsCompletedList.length === 0" class="empty-state">
                <p>내 결재(완료) 내역이 없습니다.</p>
              </div>
            </div>
            <div v-if="myApprovalsCompletedTotalPages > 1" class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="myApprovalsCompletedTotalPages * 10"
                v-model:current-page="myApprovalsCompletedCurrentPage"
                @current-change="handleMyApprovalsCompletedPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="임시저장" name="temporary">
          <div class="temporary-saves">
            <div class="section-header">
              <h3>임시저장된 결재</h3>
            </div>
            <div v-if="temporarySaves && temporarySaves.length > 0" class="request-list">
              <div class="request-item" v-for="request in temporarySaves" :key="request.approvalId">
                <div class="request-info">
                  <div class="request-header">
                    <div class="request-title">{{ request.title }}</div>
                  </div>
                   <div class="request-details">
                    <span class="request-document-name"><strong>문서:</strong> {{ request.documentName }}</span>
                    <span class="request-status"><strong>상태:</strong> 임시저장</span>
                    <span class="request-date"><strong>저장일:</strong> {{ request.createAt ? request.createAt.substring(0, 16).replace('T', ' ') : '' }}</span>
                  </div>
                </div>
                <div class="request-actions" style="margin-left: 16px;">
                  <el-button size="small" @click="continueWriting(request)">
                    <el-icon><Edit /></el-icon>
                    이어쓰기
                  </el-button>
                   <el-button size="small" type="danger" @click="deleteTemporary(request)">
                    <el-icon><Delete /></el-icon>
                    삭제
                  </el-button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>임시저장된 결재가 없습니다.</p>
            </div>
          </div>
          <div v-if="temporarySavesTotalPages > 1" class="pagination-container">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="temporarySavesTotalPages * 10"
              v-model:current-page="temporarySavesCurrentPage"
              @current-change="handleTemporarySavesPageChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 결재 양식 선택 모달 -->
    <ApprovalTemplateSelectorModal
      :visible="showTemplateSelector"
      @update:visible="showTemplateSelector = $event"
      @select="handleTemplateSelect"
    />
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/http';
import { useSnackbar } from '@/composables/useSnackbar';
import ApprovalTemplateSelectorModal from '@/components/approval/ApprovalTemplateSelectorModal.vue';
import { Plus, Document, Clock, Check, View, Edit, Delete } from '@element-plus/icons-vue';

export default {
  name: 'ApprovalPage',
  components: {
    ApprovalTemplateSelectorModal,
    Plus, Document, Clock, Check, View, Edit, Delete
  },
  setup() {
    const { success, error, warning, info } = useSnackbar();
    const router = useRouter();

    const activeTab = ref('pending');
    const showTemplateSelector = ref(false);
    const showTemplate = ref(false);

    const selectedStatus = ref('');
    const dateRange = ref([]);
    const showMyRequestsTable = ref(true);

    // Summary card data
    const pendingApprovals = ref(0);
    const inProgressApprovals = ref(0);
    const completedApprovals = ref(0);
    const draftApprovals = ref(0);
    const myApprovalsCompleted = ref(0);

    // Hardcoded data for demonstration (can be replaced with API calls)
    const pendingApprovalsList = ref([
        {
          id: 1,
          title: '월간 보고서',
          type: '보고서',
          requester: '김영희',
          date: '2024-01-15',
          priority: 'high',
          amount: 0,
          description: '1월 월간 성과 보고서입니다.',
          steps: [
            { name: '신청자', status: 'completed', statusText: '완료' },
            { name: '팀장', status: 'current', statusText: '검토 중' },
            { name: '부장', status: 'pending', statusText: '대기' },
            { name: '임원', status: 'pending', statusText: '대기' }
          ]
        },
    ]);
    const myRequests = ref([]); // This will be filled by the API call
    const temporarySaves = ref([]);
    const completedList = ref([]);
    const myApprovalsCompletedList = ref([]);

    const pendingTotalPages = ref(0);
    const pendingCurrentPage = ref(1);
    const myRequestsTotalPages = ref(0);
    const myRequestsCurrentPage = ref(1);
    const completedTotalPages = ref(0);
    const completedCurrentPage = ref(1);
    const myApprovalsCompletedTotalPages = ref(0);
    const myApprovalsCompletedCurrentPage = ref(1);
    const temporarySavesTotalPages = ref(0);
    const temporarySavesCurrentPage = ref(1);

    const fetchApprovalStats = async () => {
      try {
        const response = await apiClient.get('/workforce-service/approval/stats');
        const stats = response.data.data;
        pendingApprovals.value = stats.pendingCount;
        inProgressApprovals.value = stats.requestCount;
        completedApprovals.value = stats.completeCount;
        draftApprovals.value = stats.draftCount;
        myApprovalsCompleted.value = stats.approveCompleteCount;
      } catch (err) {
        error('통계 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      }
    };

    const fetchPendingApprovals = async (page = 0) => {
      try {
        const response = await apiClient.get(`/workforce-service/approval/find-pending-list?page=${page}`);
        pendingApprovalsList.value = response.data.data.content;
        pendingTotalPages.value = response.data.data.totalPages;
        pendingCurrentPage.value = response.data.data.number + 1;
      } catch (err) {
        error('대기 중인 결재 내역을 불러오는 데 실패했습니다.');
        console.error(err);
      }
    };

    const fetchMyRequests = async (page = 0) => {
      try {
        const response = await apiClient.get(`/workforce-service/approval/find-approval-list?page=${page}`);
        myRequests.value = response.data.data.content;
        myRequestsTotalPages.value = response.data.data.totalPages;
        myRequestsCurrentPage.value = response.data.data.number + 1;
      } catch (err) {
        error('결재 내역을 불러오는 데 실패했습니다.');
        console.error(err);
      }
    };

    const fetchTemporarySaves = async (page = 0) => {
      try {
        const response = await apiClient.get(`/workforce-service/approval/find-draft-list?page=${page}`);
        temporarySaves.value = response.data.data.content;
        temporarySavesTotalPages.value = response.data.data.totalPages;
        temporarySavesCurrentPage.value = response.data.data.number + 1;
      } catch (err) {
        error('임시저장 내역을 불러오는 데 실패했습니다.');
        console.error(err);
      }
    };

    const fetchCompletedApprovals = async (page = 0) => {
      try {
        const response = await apiClient.get(`/workforce-service/approval/find-complete-list?page=${page}`);
        completedList.value = response.data.data.content;
        completedTotalPages.value = response.data.data.totalPages;
        completedCurrentPage.value = response.data.data.number + 1;
      } catch (err) {
        error('완료된 결재 내역을 불러오는 데 실패했습니다.');
        console.error(err);
      }
    };

    const fetchMyApprovalsCompleted = async (page = 0) => {
      try {
        const response = await apiClient.get(`/workforce-service/approval/find-approve-complete-list?page=${page}`);
        myApprovalsCompletedList.value = response.data.data.content;
        myApprovalsCompletedTotalPages.value = response.data.data.totalPages;
        myApprovalsCompletedCurrentPage.value = response.data.data.number + 1;
      } catch (err) {
        error('내 결재(완료) 내역을 불러오는 데 실패했습니다.');
        console.error(err);
      }
    };

    const handlePendingPageChange = (page) => {
      fetchPendingApprovals(page - 1);
    };

    const handleMyRequestsPageChange = (page) => {
      fetchMyRequests(page - 1);
    };

    const handleCompletedPageChange = (page) => {
      fetchCompletedApprovals(page - 1);
    };

    const handleMyApprovalsCompletedPageChange = (page) => {
      fetchMyApprovalsCompleted(page - 1);
    };

    const handleTemporarySavesPageChange = (page) => {
      fetchTemporarySaves(page - 1);
    };

    const handleTabChange = (tabName) => {
      activeTab.value = tabName;
      if (tabName === 'pending') {
        fetchPendingApprovals(0);
      } else if (tabName === 'my-requests') {
        showMyRequestsTable.value = false;
        fetchMyRequests(0);
        nextTick(() => {
          showMyRequestsTable.value = true;
        });
      } else if (tabName === 'temporary') {
        fetchTemporarySaves(0);
      } else if (tabName === 'completed') {
        fetchCompletedApprovals(0);
      } else if (tabName === 'my-approvals-completed') {
        fetchMyApprovalsCompleted(0);
      }
    };

    onMounted(() => {
      // Fetch initial data for the default tab
      fetchPendingApprovals(0);
      fetchApprovalStats();
    });

    const openTemplateSelector = () => {
      showTemplateSelector.value = true;
    };

    const handleTemplateSelect = (templateId) => {
      showTemplateSelector.value = false;
      const path = `/approval/form/${templateId}`;
      router.push(path).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          error('해당 양식을 찾을 수 없습니다.');
          console.error(err);
        }
      });
    };

    const getPriorityType = (priority) => (priority === 'high' ? 'danger' : 'warning');

    const getKoreanStatus = (status) => {
      const statusMap = {
        'PENDING': '진행중',
        'DRAFT': '임시저장',
        'APPROVED': '승인',
        'REJECTED': '반려',
      };
      return statusMap[status] || status;
    };

    const getStatusType = (status) => {
      const statusMap = {
        'APPROVED': 'success',
        'REJECTED': 'danger',
        'PENDING': 'warning',
      };
      return statusMap[status] || 'info';
    };

    const approveItem = (item) => {
        // TODO: Implement approve API call
        info(`승인 처리: ${item.title}`);
    };

    const rejectItem = (item) => {
        // TODO: Implement reject API call
        info(`반려 처리: ${item.title}`);
    };

    const viewDetails = (item) => {
        router.push(`/approval/detail/${item.approvalId}`);
    };

    const viewRequestDetails = (request) => {
        router.push(`/approval/detail/${request.approvalId}`);
    };

    const cancelRequest = (request) => {
        info(`취소 처리: ${request.title}`);
    };

    const viewCompletedDetails = (approval) => {
        router.push(`/approval/detail/${approval.approvalId}`);
    };

    const downloadApproval = (approval) => {
        success(`${approval.title} 다운로드`);
    };

    const continueWriting = (request) => {
      router.push(`/approval/form/draft/${request.approvalId}`);
    };

    const deleteTemporary = async (request) => {
      if (confirm(`'${request.title}' 문서를 삭제하시겠습니까?`)) {
        try {
          await apiClient.delete(`/workforce-service/approval/discard-approval/${request.approvalId}`);
          success('임시저장된 문서가 삭제되었습니다.');
          // Refresh the list
          fetchTemporarySaves();
        } catch (err) {
          error('삭제에 실패했습니다.');
          console.error(err);
        }
      }
    };

    const goToTemplateList = () => {
      router.push('/approval/templates/list');
    };



    return {
      success, error, warning, info, router,
      activeTab,
      showTemplateSelector,
      showTemplate,
      selectedStatus,
      dateRange,
      pendingApprovals,
      inProgressApprovals,
      completedApprovals,
      draftApprovals,
      myApprovalsCompleted,
      pendingApprovalsList,
      myRequests,
      completedList,
      myApprovalsCompletedList,
      handleTabChange,
      fetchMyApprovalsCompleted,
      openTemplateSelector,
      handleTemplateSelect,
      getPriorityType,
      getStatusType,
      getKoreanStatus,
      approveItem,
      rejectItem,
      viewDetails,
      viewRequestDetails,
      cancelRequest,
      viewCompletedDetails,
      downloadApproval,
      showMyRequestsTable,
      temporarySaves,
      continueWriting,
      deleteTemporary,
      goToTemplateList,

      pendingTotalPages,
      pendingCurrentPage,
      myRequestsTotalPages,
      myRequestsCurrentPage,
      completedTotalPages,
      completedCurrentPage,
      myApprovalsCompletedTotalPages,
      myApprovalsCompletedCurrentPage,
      temporarySavesTotalPages,
      temporarySavesCurrentPage,

      handlePendingPageChange,
      handleMyRequestsPageChange,
      handleCompletedPageChange,
      handleMyApprovalsCompletedPageChange,
      handleTemporarySavesPageChange,
    };
  },
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.approval {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.header-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.header-actions {
  display: flex;
}

.approval-cards {
  display: flex;
  flex-wrap: nowrap; /* Prevent wrapping */
  overflow-x: auto; /* Enable horizontal scrolling if cards exceed screen width */
  gap: 20px;
  margin-bottom: 24px;
}

.approval-card {
  flex: 1; /* Make cards grow and shrink to fill space */
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.approval-card:hover {
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  background: #4f46e5;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 12px;
  color: #909399;
}

.approval-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.approval-tabs :deep(.el-tabs__nav) {
  padding-left: 20px;
}

.pending-approvals, .my-requests, .completed-approvals, .temporary-saves{
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.filter-options {
  display: flex;
  gap: 12px;
  align-items: center;
}

.approval-list, .request-list, .completed-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.approval-list-header {
  display: flex;
  padding: 0 20px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
}

.approval-item, .request-item, .completed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  text-align: center;
}

.approval-col {
  padding: 0 10px;
}

.approval-col.title { flex: 5; text-align: left; }
.approval-col.position { flex: 2; }
.approval-col.name { flex: 2; }
.approval-col.date { flex: 3; }
.approval-col.actions { flex: 1; }

.approval-item:hover, .request-item:hover, .completed-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.approval-info, .request-info, .completed-info {
  flex: 1;
}

.request-meta-actions, .completed-meta-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 200px;
}

.request-meta-actions-row, .completed-meta-actions-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-top: 12px;
}

.approval-header, .request-header, .completed-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.request-meta, .completed-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
}

.request-actions, .completed-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.approval-title, .request-title, .completed-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.approval-meta, .request-meta, .completed-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.approval-date, .request-date, .completed-date {
  font-size: 12px;
}

.approval-details, .request-details, .completed-details {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.approval-amount, .request-amount, .completed-amount {
  color: #667eea;
  font-weight: 500;
}

.approval-description, .request-description, .completed-description {
  font-size: 14px;
  color: #909399;
  margin-bottom: 16px;
}

.approval-progress, .request-progress {
  margin-top: 16px;
}

.progress-steps {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.progress-step.completed {
  background: #f0f9ff;
  color: #0369a1;
}

.progress-step.current {
  background: #fef3c7;
  color: #d97706;
}

.progress-step.pending {
  background: #f3f4f6;
  color: #6b7280;
}

.step-icon {
  font-size: 16px;
}

.step-info {
  flex: 1;
}

.step-name {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
}

.step-status {
  font-size: 11px;
  opacity: 0.8;
}

.approval-right-section {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  margin-left: 16px;
}

.approval-top-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-top: 1px;
}

.approval-date {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  text-align: center;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  min-width: 80px;
  white-space: nowrap;
}

.approval-actions, .request-actions, .completed-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.approval-actions .el-button, .request-actions .el-button, .completed-actions .el-button {
  min-width: 80px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0 12px;
}

.approval-actions .el-button .el-icon, .request-actions .el-button .el-icon, .completed-actions .el-button .el-icon {
  margin-right: 4px;
}

.upload-demo {
  width: 100%;
}
</style>