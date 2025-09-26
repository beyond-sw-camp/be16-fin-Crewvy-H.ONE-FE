<template>
  <div class="approval">
    <div class="page-header">
      <div class="header-content">
        <h1>전자결재</h1>
        <p>사내 결재 워크플로우를 디지털로 관리하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="createApproval">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">결재 신청</span>
        </el-button>
        <el-button @click="showTemplate = true">
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
          <div class="card-title">대기 중인 결재</div>
          <div class="card-value">{{ pendingApprovals }}</div>
          <div class="card-subtitle">승인 대기</div>
        </div>
      </div>
      
      <div class="approval-card">
        <div class="card-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">진행 중인 결재</div>
          <div class="card-value">{{ inProgressApprovals }}</div>
          <div class="card-subtitle">내 결재</div>
        </div>
      </div>
      
      <div class="approval-card">
        <div class="card-icon">
          <el-icon><Check /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">완료된 결재</div>
          <div class="card-value">{{ completedApprovals }}</div>
          <div class="card-subtitle">이번 달</div>
        </div>
      </div>
      
      <div class="approval-card">
        <div class="card-icon">
          <el-icon><Timer /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">평균 처리 시간</div>
          <div class="card-value">{{ averageProcessTime }}</div>
          <div class="card-subtitle">시간</div>
        </div>
      </div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="approval-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="승인 대기" name="pending">
          <div class="pending-approvals">
            <div class="section-header">
              <h3>대기 중인 결재</h3>
              <div class="filter-options">
                <el-select v-model="selectedType" placeholder="결재 유형" style="width: 150px">
                  <el-option label="전체" value="" />
                  <el-option label="휴가 신청" value="vacation" />
                  <el-option label="비용 정산" value="expense" />
                  <el-option label="보고서" value="report" />
                </el-select>
                <el-select v-model="selectedPriority" placeholder="우선순위" style="width: 120px">
                  <el-option label="전체" value="" />
                  <el-option label="긴급" value="high" />
                  <el-option label="일반" value="normal" />
                </el-select>
              </div>
            </div>
            
            <div class="approval-list">
              <div class="approval-item" v-for="approval in filteredPendingApprovals" :key="approval.id">
                <div class="approval-info">
                  <div class="approval-header">
                    <div class="approval-title">{{ approval.title }}</div>
                  </div>
                  <div class="approval-details">
                    <span class="approval-requester">{{ approval.requester }}</span>
                    <span class="approval-type">{{ approval.type }}</span>
                    <span class="approval-amount" v-if="approval.amount">{{ approval.amount.toLocaleString() }}원</span>
                  </div>
                  <div class="approval-description">{{ approval.description }}</div>
                  <div class="approval-progress">
                    <div class="progress-steps">
                      <div 
                        class="progress-step" 
                        v-for="(step, index) in approval.steps" 
                        :key="index"
                        :class="{ 
                          'completed': step.status === 'completed',
                          'current': step.status === 'current',
                          'pending': step.status === 'pending'
                        }"
                      >
                        <div class="step-icon">
                          <el-icon v-if="step.status === 'completed'"><Check /></el-icon>
                          <el-icon v-else-if="step.status === 'current'"><Clock /></el-icon>
                          <el-icon v-else><Minus /></el-icon>
                        </div>
                        <div class="step-info">
                          <div class="step-name">{{ step.name }}</div>
                          <div class="step-status">{{ step.statusText }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="approval-right-section">
                  <div class="approval-top-row">
                    <el-tag :type="getPriorityType(approval.priority)" size="small">
                      {{ approval.priority === 'high' ? '긴급' : '일반' }}
                    </el-tag>
                    <div class="approval-date">{{ approval.date }}</div>
                  </div>
                  <div class="approval-actions">
                    <el-button type="success" size="small" @click="approveItem(approval)">
                      <el-icon><Check /></el-icon>
                      승인
                    </el-button>
                    <el-button type="danger" size="small" @click="rejectItem(approval)">
                      <el-icon><Close /></el-icon>
                      반려
                    </el-button>
                    <el-button size="small" @click="viewDetails(approval)">
                      <el-icon><View /></el-icon>
                      상세
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="결재 내역" name="my-requests">
          <div class="my-requests">
            <div class="section-header">
              <h3>내 결재 신청</h3>
              <el-button type="primary" @click="createApproval">
                <el-icon><Plus /></el-icon>
                새 결재 신청
              </el-button>
            </div>
            
            <div class="request-list">
              <div class="request-item" v-for="request in myRequests" :key="request.id">
                <div class="request-info">
                  <div class="request-header">
                    <div class="request-title">{{ request.title }}</div>
                  </div>
                  <div class="request-details">
                    <span class="request-type">{{ request.type }}</span>
                    <span class="request-amount" v-if="request.amount">{{ request.amount.toLocaleString() }}원</span>
                  </div>
                  <div class="request-description">{{ request.description }}</div>
                  <div class="request-progress">
                    <div class="progress-steps">
                      <div 
                        class="progress-step" 
                        v-for="(step, index) in request.steps" 
                        :key="index"
                        :class="{ 
                          'completed': step.status === 'completed',
                          'current': step.status === 'current',
                          'pending': step.status === 'pending'
                        }"
                      >
                        <div class="step-icon">
                          <el-icon v-if="step.status === 'completed'"><Check /></el-icon>
                          <el-icon v-else-if="step.status === 'current'"><Clock /></el-icon>
                          <el-icon v-else><Minus /></el-icon>
                        </div>
                        <div class="step-info">
                          <div class="step-name">{{ step.name }}</div>
                          <div class="step-status">{{ step.statusText }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="request-meta-actions">
                  <div class="request-meta-actions-row">
                    <div class="request-meta">
                      <el-tag :type="getStatusType(request.status)" size="small">
                        {{ request.status }}
                      </el-tag>
                      <span class="request-date">{{ request.date }}</span>
                    </div>
                    <div class="request-actions">
                      <el-button size="small" @click="viewRequestDetails(request)">
                        <el-icon><View /></el-icon>
                        상세
                      </el-button>
                      <el-button v-if="request.status === '진행중'" size="small" @click="cancelRequest(request)">
                        <el-icon><Close /></el-icon>
                        취소
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="결재 완료" name="completed">
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
            
            <div class="completed-list">
              <div class="completed-item" v-for="approval in completedList" :key="approval.id">
                <div class="completed-info">
                  <div class="completed-header">
                    <div class="completed-title">{{ approval.title }}</div>
                  </div>
                  <div class="completed-details">
                    <span class="completed-requester">{{ approval.requester }}</span>
                    <span class="completed-type">{{ approval.type }}</span>
                    <span class="completed-amount" v-if="approval.amount">{{ approval.amount.toLocaleString() }}원</span>
                  </div>
                  <div class="completed-description">{{ approval.description }}</div>
                </div>
                <div class="completed-meta-actions">
                  <div class="completed-meta-actions-row">
                    <div class="completed-meta">
                      <el-tag :type="getStatusType(approval.status)" size="small">
                        {{ approval.status }}
                      </el-tag>
                      <span class="completed-date">{{ approval.completedDate }}</span>
                    </div>
                    <div class="completed-actions">
                      <el-button size="small" @click="viewCompletedDetails(approval)">
                        <el-icon><View /></el-icon>
                        상세
                      </el-button>
                      <el-button size="small" @click="downloadApproval(approval)">
                        <el-icon><Download /></el-icon>
                        다운로드
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 결재 신청 모달 -->
    <el-dialog
      v-model="showCreateApproval"
      title="결재 신청"
      width="700px"
    >
      <el-form :model="approvalForm" label-width="100px">
        <el-form-item label="결재 유형">
          <el-select v-model="approvalForm.type" placeholder="결재 유형을 선택하세요">
            <el-option label="휴가 신청" value="vacation" />
            <el-option label="비용 정산" value="expense" />
            <el-option label="보고서" value="report" />
            <el-option label="자원 예약" value="resource_booking" />
            <el-option label="기타" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="제목">
          <el-input v-model="approvalForm.title" placeholder="결재 제목을 입력하세요" />
        </el-form-item>
        <el-form-item label="금액" v-if="approvalForm.type === 'expense'">
          <el-input-number v-model="approvalForm.amount" placeholder="금액을 입력하세요" style="width: 100%" />
        </el-form-item>
        <el-form-item label="승인자">
          <el-select
            v-model="approvalForm.approvers"
            multiple
            placeholder="승인자를 선택하세요"
            style="width: 100%"
          >
            <el-option
              v-for="employee in employees"
              :key="employee.id"
              :label="employee.name"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="설명">
          <el-input
            v-model="approvalForm.description"
            type="textarea"
            placeholder="결재 사유를 입력하세요"
            :rows="4"
          />
        </el-form-item>
        <el-form-item label="첨부파일">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            multiple
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              파일을 드래그하거나 <em>클릭하여 업로드</em>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateApproval = false">취소</el-button>
        <el-button type="primary" @click="submitApproval">신청</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'ApprovalPage',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      activeTab: 'pending',
      showCreateApproval: false,
      showTemplate: false,
      selectedType: '',
      selectedPriority: '',
      selectedStatus: '',
      dateRange: [],
      approvalForm: {
        type: '',
        title: '',
        amount: 0,
        approvers: [],
        description: ''
      },
      pendingApprovals: 5,
      inProgressApprovals: 3,
      completedApprovals: 12,
      averageProcessTime: 2.5,
      pendingApprovalsList: [
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
        {
          id: 2,
          title: '휴가 신청',
          type: '휴가 신청',
          requester: '박민수',
          date: '2024-01-14',
          priority: 'normal',
          amount: 0,
          description: '개인 사정으로 인한 휴가 신청입니다.',
          steps: [
            { name: '신청자', status: 'completed', statusText: '완료' },
            { name: '팀장', status: 'current', statusText: '검토 중' },
            { name: '부장', status: 'pending', statusText: '대기' }
          ]
        },
        {
          id: 3,
          title: '비용 정산',
          type: '비용 정산',
          requester: '이지은',
          date: '2024-01-13',
          priority: 'normal',
          amount: 150000,
          description: '출장비 정산 신청입니다.',
          steps: [
            { name: '신청자', status: 'completed', statusText: '완료' },
            { name: '팀장', status: 'current', statusText: '검토 중' },
            { name: '부장', status: 'pending', statusText: '대기' },
            { name: '임원', status: 'pending', statusText: '대기' }
          ]
        }
      ],
      myRequests: [
        {
          id: 1,
          title: '프로젝트 비용 신청',
          type: '비용 정산',
          date: '2024-01-10',
          status: '진행중',
          amount: 500000,
          description: '신규 프로젝트 관련 비용 신청입니다.',
          steps: [
            { name: '신청자', status: 'completed', statusText: '완료' },
            { name: '팀장', status: 'completed', statusText: '승인' },
            { name: '부장', status: 'current', statusText: '검토 중' },
            { name: '임원', status: 'pending', statusText: '대기' }
          ]
        },
        {
          id: 2,
          title: '연차 휴가 신청',
          type: '휴가 신청',
          date: '2024-01-08',
          status: '승인',
          amount: 0,
          description: '연차 휴가 신청입니다.',
          steps: [
            { name: '신청자', status: 'completed', statusText: '완료' },
            { name: '팀장', status: 'completed', statusText: '승인' },
            { name: '부장', status: 'completed', statusText: '승인' }
          ]
        }
      ],
      completedList: [
        {
          id: 1,
          title: '회의실 예약 신청',
          type: '기타',
          requester: '김철수',
          completedDate: '2024-01-12',
          status: '승인',
          amount: 0,
          description: '대회의실 예약 신청입니다.'
        },
        {
          id: 2,
          title: '교육비 신청',
          type: '비용 정산',
          requester: '박민수',
          completedDate: '2024-01-10',
          status: '승인',
          amount: 300000,
          description: '외부 교육 참가비 신청입니다.'
        }
      ],
      employees: [
        { id: 1, name: '김철수' },
        { id: 2, name: '박민수' },
        { id: 3, name: '이지은' },
        { id: 4, name: '김영희' },
        { id: 5, name: '정수진' }
      ]
    }
  },
  computed: {
    filteredPendingApprovals() {
      let filtered = this.pendingApprovalsList
      
      if (this.selectedType) {
        filtered = filtered.filter(approval => approval.type === this.selectedType)
      }
      
      if (this.selectedPriority) {
        filtered = filtered.filter(approval => approval.priority === this.selectedPriority)
      }
      
      return filtered
    }
  },
  methods: {
    handleTabChange(tab) {
      this.activeTab = tab
    },
    createApproval() {
      this.showCreateApproval = true
    },
    getPriorityType(priority) {
      return priority === 'high' ? 'danger' : 'warning'
    },
    getStatusType(status) {
      const statusMap = {
        '승인': 'success',
        '반려': 'danger',
        '진행중': 'warning',
        '대기': 'info'
      }
      return statusMap[status] || 'info'
    },
    approveItem() {
      this.$confirm('정말로 승인하시겠습니까?', '확인', {
        confirmButtonText: '승인',
        cancelButtonText: '취소',
        type: 'success'
      }).then(() => {
        this.success('승인되었습니다.')
      })
    },
    rejectItem() {
      this.$confirm('정말로 반려하시겠습니까?', '확인', {
        confirmButtonText: '반려',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        this.info('반려되었습니다.')
      })
    },
    viewDetails() {
      this.info('상세보기')
    },
    viewRequestDetails() {
      this.info('상세보기')
    },
    cancelRequest() {
      this.$confirm('정말로 취소하시겠습니까?', '확인', {
        confirmButtonText: '취소',
        cancelButtonText: '돌아가기',
        type: 'warning'
      }).then(() => {
        this.success('취소되었습니다.')
      })
    },
    viewCompletedDetails(approval) {
      this.info(`${approval.title} 상세보기`)
    },
    downloadApproval(approval) {
      this.success(`${approval.title} 다운로드`)
    },
    submitApproval() {
      this.success('결재 신청이 완료되었습니다.')
      this.showCreateApproval = false
      this.approvalForm = {
        type: '',
        title: '',
        amount: 0,
        approvers: [],
        description: ''
      }
    }
  }
}
</script>

<style scoped>
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.approval-card {
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

.pending-approvals, .my-requests, .completed-approvals {
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

.approval-item, .request-item, .completed-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

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
  color: #909399;
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
