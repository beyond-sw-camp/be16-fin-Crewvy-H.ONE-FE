<template>
  <div class="team-goal-container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <h1 class="title">팀 목표 관리</h1>
        <p class="subtitle">팀의 목표를 공유하고 진행 상황을 관리하세요</p>
      </div>
      <el-button type="primary" @click="addTeamGoal" class="add-goal-button">
        <el-icon><Plus /></el-icon>
        <span>팀 목표 추가</span>
      </el-button>
    </div>

    <!-- Statistics Section -->
    <div class="statistics-section">
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <el-icon class="stat-icon active"><Loading /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.active }}</div>
            <div class="stat-label">활성 목표</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <el-icon class="stat-icon completed"><CircleCheck /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.completed }}</div>
            <div class="stat-label">완료된 목표</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Goal List Section -->
    <div class="goals-tabs">
      <el-tabs v-model="activeStatus" @tab-change="handleStatusChange" class="status-tabs">
        <el-tab-pane label="활성 목표" name="active">
          <div class="tab-pane-content" v-if="activeStatus === 'active'">
            <div class="goal-list">
              <el-card 
                v-for="goal in teamGoals" 
                :key="goal.teamGoalId" 
                class="goal-card" 
                shadow="hover"
                @click="goToDetail(goal.teamGoalId)"
              >
                <div class="goal-card-header">
                  <div class="goal-header-left">
                    <el-icon class="goal-icon"><Flag /></el-icon>
                    <h3 class="goal-title">{{ goal.title }}</h3>
                  </div>
                  <el-tag :type="getStatusType(goal.status)" effect="dark" class="status-tag">
                    {{ goal.status }}
                  </el-tag>
                </div>
                
                <p class="goal-description">{{ goal.contents }}</p>

                <div class="goal-footer">
                  <div class="goal-author">
                    <el-icon><User /></el-icon>
                    <span>{{ goal.memberName }} ({{ goal.memberPosition }})</span>
                  </div>
                  <div class="goal-period">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
                  </div>
                </div>
              </el-card>

              <div v-if="teamGoals.length === 0" class="empty-state">
                <el-icon class="empty-icon"><FolderOpened /></el-icon>
                <p class="empty-text">목표가 없습니다.</p>
              </div>
            </div>

            <div v-if="totalTeamGoalPages > 1" class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next, jumper"
                :total="totalTeamGoalPages * 10"
                v-model:current-page="currentTeamGoalPage"
                @current-change="handleTeamGoalPageChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="완료된 목표" name="completed">
          <div class="tab-pane-content" v-if="activeStatus === 'completed'">
            <div class="goal-list">
              <el-card 
                v-for="goal in teamGoals" 
                :key="goal.teamGoalId" 
                class="goal-card" 
                shadow="hover"
                @click="goToDetail(goal.teamGoalId)"
              >
                <div class="goal-card-header">
                  <div class="goal-header-left">
                    <el-icon class="goal-icon"><Flag /></el-icon>
                    <h3 class="goal-title">{{ goal.title }}</h3>
                  </div>
                  <el-tag :type="getStatusType(goal.status)" effect="dark" class="status-tag">
                    {{ goal.status }}
                  </el-tag>
                </div>
                
                <p class="goal-description">{{ goal.contents }}</p>

                <div class="goal-footer">
                  <div class="goal-author">
                    <el-icon><User /></el-icon>
                    <span>{{ goal.memberName }} ({{ goal.memberPosition }})</span>
                  </div>
                  <div class="goal-period">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
                  </div>
                </div>
              </el-card>

              <div v-if="teamGoals.length === 0" class="empty-state">
                <el-icon class="empty-icon"><FolderOpened /></el-icon>
                <p class="empty-text">목표가 없습니다.</p>
              </div>
            </div>

            <div v-if="totalTeamGoalPages > 1" class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next, jumper"
                :total="totalTeamGoalPages * 10"
                v-model:current-page="currentTeamGoalPage"
                @current-change="handleTeamGoalPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import apiClient from '@/api/http';
import { 
  Plus,
  Loading,
  CircleCheck,
  Flag,
  User,
  Calendar,
  FolderOpened
} from '@element-plus/icons-vue';

export default {
  name: 'TeamGoal',
  components: {
    Plus,
    Loading,
    CircleCheck,
    Flag,
    User,
    Calendar,
    FolderOpened
  },
  data() {
    return {
      teamGoals: [],
      totalTeamGoalPages: 0,
      currentTeamGoalPage: 1,
      activeStatus: 'active',
      activeCount: 0,
      completedCount: 0,
    };
  },
  computed: {
    // 통계 계산 - 서버에서 받아온 전체 카운트를 표시
    statistics() {
      return {
        active: this.activeCount,
        completed: this.completedCount,
      };
    }
  },
  methods: {
    async fetchTeamGoals(page = 0, type = null) {
      try {
        // type이 없으면 현재 activeStatus 사용
        const statusType = type || (this.activeStatus === 'active' ? 'processing' : 'complete');
        const response = await apiClient.get(`/workforce-service/performance/team-goal?page=${page}&type=${statusType}`);
        this.teamGoals = response.data.data.content;
        this.totalTeamGoalPages = response.data.data.totalPages;
        this.currentTeamGoalPage = response.data.data.number + 1;
        
        // 현재 탭의 전체 카운트 업데이트 (totalElements 사용)
        const totalCount = response.data.data.totalElements || this.teamGoals.length;
        if (statusType === 'processing') {
          this.activeCount = totalCount;
        } else if (statusType === 'complete') {
          this.completedCount = totalCount;
        }
      } catch (error) {
        console.error('Error fetching team goals:', error);
      }
    },
    addTeamGoal() {
      this.$router.push('/performance/team-goal/create');
    },
    goToDetail(id) {
      this.$router.push(`/performance/team-goal/${id}`);
    },
    getStatusType(status) {
      // 팀 목표 상태 (한국어)
      if (status === '진행중') return 'primary';      // 🔵 파란색
      if (status === '평가대기') return 'warning';    // 🟡 주황색
      if (status === '평가완료') return 'success';    // 🟢 초록색
      if (status === '삭제') return 'info';           // ⚪ 회색
      
      // 개인 목표 상태 (영어 - 일관성을 위해)
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
    handleTeamGoalPageChange(page) {
      this.fetchTeamGoals(page - 1);
    },
    handleStatusChange(status) {
      this.activeStatus = status;
      // 탭 변경 시 첫 페이지부터 새로운 데이터 로드
      const type = status === 'active' ? 'processing' : 'complete';
      this.fetchTeamGoals(0, type);
    },
    // 완료된 목표 카운트 가져오기 (통계용)
    async fetchCompletedCount() {
      try {
        const response = await apiClient.get('/workforce-service/performance/team-goal?page=0&type=complete');
        this.completedCount = response.data.data.totalElements || response.data.data.content.length;
      } catch (error) {
        console.error('Error fetching completed count:', error);
      }
    },
  },
  async created() {
    // 초기 로드 시 활성 목표 가져오기
    await this.fetchTeamGoals(0, 'processing');
    // 완료된 목표 카운트도 가져오기 (통계 표시용)
    await this.fetchCompletedCount();
  },
};
</script>

<style scoped>
/* Container */
.team-goal-container {
  padding: 24px;
  box-sizing: border-box;
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
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  transition: all 0.3s ease;
}

.add-goal-button .el-icon {
  font-size: 18px;
  margin-right: 6px;
}

/* Statistics Section */
.statistics-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  width: 100%;
}

.stat-card {
  background: var(--surface-bg);
  border-radius: var(--surface-radius);
  box-shadow: var(--surface-shadow);
  transition: all 0.3s ease;
}

.stat-card :deep(.el-card__body) {
  padding: var(--surface-padding);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
}

.stat-icon {
  font-size: 56px;
  padding: 16px;
  border-radius: 12px;
  flex-shrink: 0;
  color: white;
  background: #4f46e5;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

/* Goals Tabs */
.goals-tabs {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 24px;
}

.status-tabs {
  width: 100%;
}

.status-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 24px;
  background: #ffffff;
}

.status-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e4e7ed;
}

.status-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 56px;
  line-height: 56px;
}

.status-tabs :deep(.el-tabs__item.is-active) {
  color: #667eea;
  font-weight: 600;
}

.status-tabs :deep(.el-tabs__active-bar) {
  background-color: #667eea;
  height: 3px;
}

.status-tabs :deep(.el-tabs__content) {
  padding: 0;
}

.tab-pane-content {
  padding: 24px;
}

/* Goal List */
.goal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goal-card {
  border-radius: var(--surface-radius);
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  background: var(--surface-bg);
  box-shadow: var(--surface-shadow);
}

.goal-card :deep(.el-card__body) {
  padding: var(--surface-padding);
}

.goal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
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

.goal-author,
.goal-period {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  font-weight: 400;
}

.goal-author .el-icon,
.goal-period .el-icon {
  font-size: 16px;
  color: #c0c4cc;
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
  margin: 0 0 24px 0;
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

/* Responsive Design */
@media (max-width: 768px) {
  .team-goal-container {
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