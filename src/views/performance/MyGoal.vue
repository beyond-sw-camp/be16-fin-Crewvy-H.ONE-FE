<template>
  <div class="my-goal-container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <h1 class="title">내 목표 관리</h1>
        <p class="subtitle">나의 개인 목표를 설정하고 진행 상황을 관리하세요</p>
      </div>
      <el-button type="primary" @click="addNewGoal" class="add-goal-button">
        <el-icon><Plus /></el-icon>
        <span>목표 추가</span>
      </el-button>
    </div>

    <!-- Statistics Section -->
    <div class="statistics-section">
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <el-icon class="stat-icon requested"><Clock /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.requested }}</div>
            <div class="stat-label">요청</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <el-icon class="stat-icon approved"><CircleCheck /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.approved }}</div>
            <div class="stat-label">승인</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <el-icon class="stat-icon rejected"><CircleClose /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.rejected }}</div>
            <div class="stat-label">반려</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <el-icon class="stat-icon evaluation"><Trophy /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.evaluation }}</div>
            <div class="stat-label">평가완료</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Goal List Section with Filter -->
    <el-card class="goals-container-card" shadow="never">
      <!-- Filter Section -->
      <div class="filter-section">
        <el-tabs v-model="activeStatus" @tab-change="handleStatusChange" class="status-tabs">
          <el-tab-pane label="승인" name="approved"></el-tab-pane>
          <el-tab-pane label="요청" name="requested"></el-tab-pane>
          <el-tab-pane label="반려" name="rejected"></el-tab-pane>
          <el-tab-pane label="평가완료" name="complete"></el-tab-pane>
        </el-tabs>
      </div>

      <div class="goal-list">
        <el-card 
          v-for="goal in filteredGoals" 
          :key="goal.goalId" 
          class="goal-card" 
          shadow="hover"
          @click="goToDetail(goal.goalId)"
        >
          <div class="goal-card-header">
            <div class="goal-header-left">
              <el-icon class="goal-icon"><Flag /></el-icon>
              <h3 class="goal-title">{{ goal.title }}</h3>
            </div>
            <el-tag :type="getStatusType(goal.status)" effect="dark" class="status-tag">
              {{ getStatusLabel(goal.status) }}
            </el-tag>
          </div>
          
          <div class="team-goal-info">
            <el-icon><Link /></el-icon>
            <span>팀 목표: {{ goal.teamGoalTitle }}</span>
          </div>

          <p class="goal-description">{{ goal.contents }}</p>

        <div class="goal-footer">
          <div class="goal-period">
            <el-icon><Calendar /></el-icon>
            <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
          </div>
          <div v-if="goal.grade" class="goal-grade">
            <el-icon><Medal /></el-icon>
            <span>{{ goal.grade }}</span>
          </div>
        </div>

        <template v-if="goal.status === 'REJECTED'">
          <el-divider></el-divider>
          <div class="card-actions">
            <el-button type="danger" plain size="small" @click.stop="viewRejectionReason(goal)">
              <el-icon><Warning /></el-icon>
              <span>반려 사유 보기</span>
            </el-button>
          </div>
        </template>
        </el-card>

        <div v-if="filteredGoals.length === 0" class="empty-state">
          <el-icon class="empty-icon"><FolderOpened /></el-icon>
          <p class="empty-text">목표가 없습니다.</p>
        </div>
      </div>

      <!-- Pagination Section -->
      <div v-if="totalMyGoalPages > 1" class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="totalMyGoalPages * 10"
          v-model:current-page="currentMyGoalPage"
          @current-change="handleMyGoalPageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="newGoalDialogVisible" title="팀 목표 선택" width="600px" class="team-goal-dialog">
        <div class="dialog-description">
          <el-icon><Flag /></el-icon>
          <span>연결할 팀 목표를 선택하세요</span>
        </div>
        <div class="team-goal-select-group">
            <div v-if="teamGoalsForSelection.length === 0" class="dialog-empty-state">
              <el-icon class="empty-icon"><FolderOpened /></el-icon>
              <p class="empty-text">조회된 팀 목표가 없습니다.</p>
              <p class="empty-description">팀 목표를 먼저 생성해주세요.</p>
            </div>
            <el-card 
                v-for="goal in teamGoalsForSelection" 
                :key="goal.teamGoalId" 
                class="dialog-team-goal-card" 
                shadow="hover"
                @click="selectedTeamGoal = goal.teamGoalId"
                :class="{ 'selected-card': selectedTeamGoal === goal.teamGoalId }"
            >
                <div class="goal-card-header">
                  <el-icon class="goal-icon"><Flag /></el-icon>
                  <h4 class="dialog-team-goal-title">{{ goal.title }}</h4>
                  <el-icon v-if="selectedTeamGoal === goal.teamGoalId" class="check-icon"><CircleCheck /></el-icon>
                </div>
                <p class="dialog-team-goal-description">{{ goal.contents }}</p>
            </el-card>
        </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="newGoalDialogVisible = false" class="cancel-button">취소</el-button>
          <el-button type="primary" @click="saveNewGoal" :disabled="!selectedTeamGoal" class="select-button">
            <el-icon><Select /></el-icon>
            <span>선택</span>
          </el-button>
        </span>
      </template>
    </el-dialog>

        <el-dialog v-model="rejectionReasonDialogVisible" title="반려 사유 확인" width="500px">
            <el-card class="box-card" style="margin-bottom: 16px;">
                <template #header>
                    <div class="card-header">
                        <span>반려된 목표</span>
                    </div>
                </template>
                <h3>{{ selectedRejectedGoal.title }}</h3>
                <p>{{ selectedRejectedGoal.description }}</p>
            </el-card>
            <el-card class="box-card">
                <template #header>
                    <div class="card-header">
                        <span>부서장 반려 사유</span>
                    </div>
                </template>
                <p class="rejection-reason-text">{{ selectedRejectedGoal.rejectionReason }}</p>
            </el-card>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="rejectionReasonDialogVisible = false">닫기</el-button>
                </span>
            </template>
        </el-dialog>

  </div>
</template>
    
    <script>
    import apiClient from '@/api/http';
    import { 
      Plus,
      Clock,
      CircleCheck,
      CircleClose,
      Trophy,
      Flag,
      Link,
      Calendar,
      Medal,
      Warning,
      FolderOpened,
      Select
    } from '@element-plus/icons-vue';
    
    export default {
      name: 'MyGoal',
      components: {
        Plus,
        Clock,
        CircleCheck,
        CircleClose,
        Trophy,
        Flag,
        Link,
        Calendar,
        Medal,
        Warning,
        FolderOpened,
        Select
      },
      data() {
        return {
          myGoals: [], // API로부터 데이터를 받아올 배열
          totalMyGoalPages: 0,
          currentMyGoalPage: 1,
          newGoalDialogVisible: false,
          selectedTeamGoal: null,
          teamGoalsForSelection: [], // 이 부분도 필요 시 API로 받아올 수 있습니다.
          rejectionReasonDialogVisible: false,
          selectedRejectedGoal: {},
          activeStatus: 'approved',
          approvedCount: 0,
          requestedCount: 0,
          rejectedCount: 0,
          completeCount: 0,
        };
      },
      computed: {
        // 통계 계산 - 서버에서 받아온 전체 카운트를 표시
        statistics() {
          return {
            requested: this.requestedCount,
            approved: this.approvedCount,
            rejected: this.rejectedCount,
            evaluation: this.completeCount,
          };
        },
        // 필터링은 서버에서 처리하므로 myGoals를 그대로 반환
        filteredGoals() {
          return this.myGoals;
        }
      },
      methods: {
        async fetchMyGoals(page = 0, type = null) {
          try {
            // type이 없으면 현재 activeStatus 사용
            const statusType = type || this.getTypeFromStatus(this.activeStatus);
            const response = await apiClient.get(`/workforce-service/performance/get-my-goal?page=${page}&type=${statusType}`);
            this.myGoals = response.data.data.content;
            this.totalMyGoalPages = response.data.data.totalPages;
            this.currentMyGoalPage = response.data.data.number + 1;
            
            // 현재 탭의 전체 카운트 업데이트 (totalElements 사용)
            const totalCount = response.data.data.totalElements || this.myGoals.length;
            if (statusType === 'approve') {
              this.approvedCount = totalCount;
            } else if (statusType === 'request') {
              this.requestedCount = totalCount;
            } else if (statusType === 'reject') {
              this.rejectedCount = totalCount;
            } else if (statusType === 'complete') {
              this.completeCount = totalCount;
            }
          } catch (error) {
            console.error('Error fetching my goals:', error);
            this.$message.error('목표 목록을 불러오는 데 실패했습니다.');
          }
        },
        getTypeFromStatus(status) {
          const typeMap = {
            'approved': 'approve',
            'requested': 'request',
            'rejected': 'reject',
            'complete': 'complete'
          };
          return typeMap[status] || 'approve';
        },
        async addNewGoal() {
          // 데이터가 비어있을 때만 API 호출
          if (this.teamGoalsForSelection.length === 0) {
            try {
              // For demonstration, using mock data. In real environment, use axios call.
              const response = await apiClient.get('/workforce-service/performance/team-goal-processing');
              this.teamGoalsForSelection = response.data.data;
              // this.teamGoalsForSelection = [
              //   {
              //       "teamGoalId": "36e7c5a6-8df6-4c0a-9efa-c5f66377b431",
              //       "title": "2025년 4분기 팀 매출 20% 성장 달성",
              //       "contents": "신규 고객 확보 및 기존 고객 유지 전략을 통해 4분기 팀 목표 매출액 1억 2천만원을 달성하는 것을 목표로 합니다.",
              //   }
              // ];
            } catch (error) {
              console.error('Error fetching team goals for selection:', error);
              this.$message.error('팀 목표 목록을 불러오는 데 실패했습니다.');
              return; // 에러 발생 시 다이얼로그를 열지 않음
            }
          }
          this.newGoalDialogVisible = true;
        },
        saveNewGoal() {
          if (this.selectedTeamGoal) {
            this.$router.push(`/performance/register-my-goal/${this.selectedTeamGoal}`);
          } else {
            this.$message.warning('팀 목표를 선택해주세요.');
          }
        },
        getStatusType(status) {
          // 개인 목표 상태 (영어)
          if (status === 'REQUESTED') return 'warning';     // 🟡 요청 - 주황색
          if (status === 'APPROVED') return 'primary';      // 🔵 승인 - 파란색
          if (status === 'REJECTED') return 'danger';       // 🔴 반려 - 빨간색
          if (status === 'CANCELED') return 'info';         // ⚪ 취소 - 회색
          
          // 개인 목표 상태 (한국어)
          if (status === '요청') return 'warning';            // 🟡 요청 - 주황색
          if (status === '승인') return 'primary';            // 🔵 승인 - 파란색
          if (status === '반려') return 'danger';             // 🔴 반려 - 빨간색
          if (status === '취소') return 'info';               // ⚪ 취소 - 회색
          if (status === '평가 대기') return 'warning';       // 🟡 평가 대기 - 주황색
          if (status === '본인 평가 완료') return 'success';  // 🟢 본인 평가 완료 - 초록색
          if (status === '최종 평가 완료') return 'success';  // 🟢 최종 평가 완료 - 초록색
          
          return '';
        },
        getStatusLabel(status) {
          const labels = {
            'REQUESTED': '요청',
            'APPROVED': '승인',
            'REJECTED': '반려',
            'CANCELED': '취소'
          };
          return labels[status] || status;
        },
        handleStatusChange(status) {
          this.activeStatus = status;
          // 탭 변경 시 첫 페이지부터 새로운 데이터 로드
          const type = this.getTypeFromStatus(status);
          this.fetchMyGoals(0, type);
        },
        // 각 탭의 카운트 가져오기 (통계용)
        async fetchRequestedCount() {
          try {
            const response = await apiClient.get('/workforce-service/performance/get-my-goal?page=0&type=request');
            this.requestedCount = response.data.data.totalElements || response.data.data.content.length;
          } catch (error) {
            console.error('Error fetching requested count:', error);
          }
        },
        async fetchRejectedCount() {
          try {
            const response = await apiClient.get('/workforce-service/performance/get-my-goal?page=0&type=reject');
            this.rejectedCount = response.data.data.totalElements || response.data.data.content.length;
          } catch (error) {
            console.error('Error fetching rejected count:', error);
          }
        },
        async fetchCompleteCount() {
          try {
            const response = await apiClient.get('/workforce-service/performance/get-my-goal?page=0&type=complete');
            this.completeCount = response.data.data.totalElements || response.data.data.content.length;
          } catch (error) {
            console.error('Error fetching complete count:', error);
          }
        },
        viewRejectionReason(goal) {
          this.selectedRejectedGoal = goal;
          this.rejectionReasonDialogVisible = true;
        },
        goToDetail(id) {
          this.$router.push(`/performance/my-goal/${id}`);
        },
        handleMyGoalPageChange(page) {
          this.fetchMyGoals(page - 1);
        },
      },
      async created() {
        // 초기 로드 시 승인된 목표 가져오기 (기본 탭)
        await this.fetchMyGoals(0, 'approve');
        // 다른 탭들의 카운트도 가져오기 (통계 표시용)
        await this.fetchRequestedCount();
        await this.fetchRejectedCount();
        await this.fetchCompleteCount();
      },
}; 
</script>
<style scoped>
/* Container */
.my-goal-container {
  padding: 32px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* Header Section */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-text {
  flex: 1;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #303133;
}

.subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
  font-weight: 400;
}

/* Add Goal Button */
.add-goal-button {
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.add-goal-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.add-goal-button:active {
  transform: translateY(0);
}

.add-goal-button .el-icon {
  font-size: 18px;
  margin-right: 6px;
}

/* Statistics Section */
.statistics-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  font-size: 56px;
  padding: 16px;
  border-radius: 12px;
}

.stat-icon.requested {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

.stat-icon.approved {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}

.stat-icon.rejected {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.stat-icon.evaluation {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

/* Goals Container Card */
.goals-container-card {
  border-radius: 16px;
  border: none;
  margin-bottom: 24px;
  background: #ffffff;
}

.goals-container-card :deep(.el-card__body) {
  padding: 24px;
}

/* Filter Section */
.filter-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
}

.status-tabs {
  flex: 1;
}

.status-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.status-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 0;
}

.status-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.status-tabs :deep(.el-tabs__item.is-active) {
  color: #667eea;
  font-weight: 600;
}

.status-tabs :deep(.el-tabs__active-bar) {
  background-color: #667eea;
}

/* Goal List */
.goal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goal-card {
  border-radius: 10px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  background: #fafbfc;
}

.goal-card :deep(.el-card__body) {
  padding: 16px;
}

.goal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.goal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.goal-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.goal-icon {
  font-size: 28px;
  color: #667eea;
  padding: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.goal-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  color: #303133;
  line-height: 1.3;
}

.status-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.team-goal-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
  padding: 6px 10px;
  background: #f5f7fa;
  border-radius: 6px;
}

.team-goal-info .el-icon {
  font-size: 16px;
  color: #667eea;
}

.goal-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Goal Footer */
.goal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.goal-period,
.goal-grade {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  font-weight: 400;
}

.goal-period .el-icon,
.goal-grade .el-icon {
  font-size: 16px;
  color: #c0c4cc;
}

.goal-grade {
  color: #667eea;
  font-weight: 600;
}

.goal-grade .el-icon {
  color: #667eea;
  font-size: 16px;
}

/* Card Actions */
.card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.rejection-reason-text {
  color: #F56C6C;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  color: #dcdfe6;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 18px;
  color: #909399;
  margin: 0;
  font-weight: 500;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.pagination-container :deep(.el-pagination) {
  font-weight: 500;
}

/* Dialog Styles */
.team-goal-dialog :deep(.el-dialog__header) {
  padding: 24px 24px 16px;
  border-bottom: 2px solid #f0f2f5;
}

.team-goal-dialog :deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.team-goal-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 500px;
  overflow-y: auto;
}

.dialog-description {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
}

.dialog-description .el-icon {
  font-size: 18px;
}

.team-goal-select-group {
  width: 100%;
}

/* Dialog Empty State */
.dialog-empty-state {
  text-align: center;
  padding: 60px 20px;
}

.dialog-empty-state .empty-icon {
  font-size: 72px;
  color: #dcdfe6;
  margin-bottom: 16px;
}

.dialog-empty-state .empty-text {
  font-size: 16px;
  color: #606266;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.dialog-empty-state .empty-description {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* Goal Card in Dialog */
.dialog-team-goal-card {
  width: 100%;
  margin-bottom: 12px;
  box-sizing: border-box;
  cursor: pointer;
  border: 2px solid #e4e7ed;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.dialog-team-goal-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.dialog-team-goal-card.selected-card {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  background: rgba(102, 126, 234, 0.08);
}

.goal-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.goal-icon {
  font-size: 36px;
  color: #667eea;
  padding: 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.dialog-team-goal-title {
  flex: 1;
  font-weight: 600;
  margin: 0;
  font-size: 17px;
  color: #303133;
}

.dialog-team-goal-card.selected-card .dialog-team-goal-title {
  color: #667eea;
}

.check-icon {
  font-size: 24px;
  color: #67c23a;
}

.dialog-team-goal-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Dialog Footer Buttons */
.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button {
  padding: 10px 24px;
  font-weight: 500;
}

.select-button {
  padding: 10px 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.select-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.select-button:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .statistics-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .my-goal-container {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    gap: 16px;
  }

  .add-goal-button {
    width: 100%;
  }

  .statistics-section {
    grid-template-columns: 1fr;
  }

  .goal-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>