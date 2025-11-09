<template>
  <div class="performance-review">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <h1 class="title">평과 관리</h1>
        <p class="subtitle">구성원의 성과를 공정하게 평가하고 피드백을 제공하세요</p>
      </div>
    </div>

    <!-- Statistics Section -->
    <div class="statistics-section">
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <el-icon class="stat-icon my-goal"><Clock /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ inProgressReviews }}</div>
            <div class="stat-label">내 목표 평가</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <el-icon class="stat-icon team-goal"><Document /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ myReviewsCount }}</div>
            <div class="stat-label">팀 목표 평가</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <el-icon class="stat-icon completed-my"><Check /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ completedReviews }}</div>
            <div class="stat-label">완료된 개인 목표</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <el-icon class="stat-icon completed-team"><User /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ teamAverageScore }}</div>
            <div class="stat-label">완료된 팀 목표</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 탭 메뉴 -->
    <div class="review-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="내 목표 평가" name="my-goal-reviews">
          <div class="my-reviews">
            <div class="review-list">
              <el-card class="review-item" v-for="review in myReviews" :key="review.goalId" shadow="hover">
                <div class="review-info">
                  <div class="review-header">
                    <h4 class="review-title">{{ review.title }}</h4>
                  </div>
                  <div class="review-details">
                    <span class="review-period">
                      <el-icon><Clock /></el-icon>
                      {{ review.startDate }} ~ {{ review.endDate }}
                    </span>
                  </div>
                </div>
                <div class="review-actions">
                  <el-button type="primary" @click="viewReviewDetails(review)">
                    <el-icon><View /></el-icon>
                    <span>상세보기</span>
                  </el-button>
                </div>
              </el-card>
              <div v-if="myReviews.length === 0" class="empty-state">
                <el-icon class="empty-icon"><Document /></el-icon>
                <p class="empty-text">평가 대상이 없습니다</p>
              </div>
            </div>
            <div v-if="myReviewsTotalPages > 1" class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="myReviewsTotalPages * 10"
                v-model:current-page="myReviewsCurrentPage"
                @current-change="handleMyReviewsPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="팀 목표 평가" name="team-goal-reviews">
          <div class="team-reviews">
            <div class="review-list">
              <el-card class="review-item" v-for="review in teamReviews" :key="review.goalId" shadow="hover">
                <div class="review-info">
                  <div class="review-header">
                    <h4 class="review-title">{{ review.title }}</h4>
                  </div>
                  <div class="review-details">
                    <span class="reviewee">
                      <el-icon><User /></el-icon>
                      {{ review.memberName }} ({{ review.memberPosition }})
                    </span>
                  </div>
                </div>
                <div class="review-actions">
                  <el-button type="primary" @click="viewReviewDetails(review)">
                    <el-icon><View /></el-icon>
                    <span>상세보기</span>
                  </el-button>
                </div>
              </el-card>
              <div v-if="teamReviews.length === 0" class="empty-state">
                <el-icon class="empty-icon"><Document /></el-icon>
                <p class="empty-text">평가 대상이 없습니다</p>
              </div>
            </div>
            <div v-if="teamReviewsTotalPages > 1" class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="teamReviewsTotalPages * 10"
                v-model:current-page="teamReviewsCurrentPage"
                @current-change="handleTeamReviewsPageChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="완료된 개인 목표" name="completed-my-goals">
          <div class="completed-reviews">
            <div class="review-list">
              <el-card class="review-item" v-for="goal in completedMyGoals" :key="goal.goalId" shadow="hover">
                <div class="review-info">
                  <div class="review-header">
                    <h4 class="review-title">{{ goal.title }}</h4>
                  </div>
                  <div class="review-details">
                    <span class="review-period">
                      <el-icon><Clock /></el-icon>
                      {{ goal.startDate }} ~ {{ goal.endDate }}
                    </span>
                  </div>
                </div>
                <div class="review-actions">
                  <el-button type="primary" @click="viewCompletedMyGoalDetails(goal)">
                    <el-icon><View /></el-icon>
                    <span>상세보기</span>
                  </el-button>
                </div>
              </el-card>
              <div v-if="completedMyGoals.length === 0" class="empty-state">
                <el-icon class="empty-icon"><Check /></el-icon>
                <p class="empty-text">완료된 개인 목표 평가가 없습니다</p>
              </div>
            </div>
            <div v-if="completedMyGoalsTotalPages > 1" class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="completedMyGoalsTotalPages * 10"
                v-model:current-page="completedMyGoalsCurrentPage"
                @current-change="handleCompletedMyGoalsPageChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="완료된 팀 목표" name="completed-team-goals">
          <div class="completed-reviews">
            <div class="review-list">
              <el-card class="review-item" v-for="goal in completedTeamGoals" :key="goal.goalId" shadow="hover">
                <div class="review-info">
                  <div class="review-header">
                    <h4 class="review-title">{{ goal.title }}</h4>
                  </div>
                  <div class="review-details">
                    <span class="reviewee">
                      <el-icon><User /></el-icon>
                      {{ goal.memberName }} ({{ goal.memberPosition }})
                    </span>
                    <span class="review-period">
                      <el-icon><Clock /></el-icon>
                      {{ goal.startDate }} ~ {{ goal.endDate }}
                    </span>
                  </div>
                </div>
                <div class="review-actions">
                  <el-button type="primary" @click="viewCompletedTeamGoalDetails(goal)">
                    <el-icon><View /></el-icon>
                    <span>상세보기</span>
                  </el-button>
                </div>
              </el-card>
              <div v-if="completedTeamGoals.length === 0" class="empty-state">
                <el-icon class="empty-icon"><Check /></el-icon>
                <p class="empty-text">완료된 팀 목표 평가가 없습니다</p>
              </div>
            </div>
            <div v-if="completedTeamGoalsTotalPages > 1" class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="completedTeamGoalsTotalPages * 10"
                v-model:current-page="completedTeamGoalsCurrentPage"
                @current-change="handleCompletedTeamGoalsPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Document, Clock, Check, View, User } from '@element-plus/icons-vue';
import apiClient from '@/api/http';

export default {
  name: 'PerformanceReview',
  components: {
    Document, Clock, Check, View, User
  },
  setup() {
    const router = useRouter();
    const activeTab = ref('my-goal-reviews');

    // Mock data
    const inProgressReviews = ref(0);
    const myReviewsCount = ref(0);
    const completedReviews = ref(0);
    const teamAverageScore = ref('-');

    const fetchEvaluationStats = async () => {
      try {
        const response = await apiClient.get('/workforce-service/performance/get-stat');
        const stats = response.data.data;
        inProgressReviews.value = stats.myGoalCount; // Assuming myGoalCount is for '내 목표 평가'
        myReviewsCount.value = stats.teamGoalCount; // Assuming teamGoalCount is for '팀 목표 평가'
        completedReviews.value = stats.myGoalCompleteCount; // Assuming myGoalCompleteCount is for '완료된 개인 목표'
        teamAverageScore.value = stats.teamGoalCompleteCount; // Assuming teamGoalCompleteCount is for '완료된 팀 목표'
      } catch (error) {
        console.error('Error fetching evaluation stats:', error);
      }
    };

    const myReviews = ref([]);
    const teamReviews = ref([]);
    const completedMyGoals = ref([]); // New ref
    const completedTeamGoals = ref([]); // New ref

    const myReviewsTotalPages = ref(0);
    const myReviewsCurrentPage = ref(1);
    const teamReviewsTotalPages = ref(0);
    const teamReviewsCurrentPage = ref(1);
    const completedMyGoalsTotalPages = ref(0);
    const completedMyGoalsCurrentPage = ref(1);
    const completedTeamGoalsTotalPages = ref(0);
    const completedTeamGoalsCurrentPage = ref(1);

    const fetchMyGoalReviews = async (page = 0) => {
      try {
        const response = await apiClient.get(`/workforce-service/performance/find-goal-evaluation?page=${page}`);
        myReviews.value = response.data.data.content;
        myReviewsTotalPages.value = response.data.data.totalPages;
        myReviewsCurrentPage.value = response.data.data.number + 1;
      } catch (error) {
        console.error('Error fetching my goal reviews:', error);
      }
    };

    const fetchTeamGoalReviews = async (page = 0) => {
      try {
        const response = await apiClient.get(`/workforce-service/performance/find-teamgoal-evaluation?page=${page}`);
        teamReviews.value = response.data.data.content;
        teamReviewsTotalPages.value = response.data.data.totalPages;
        teamReviewsCurrentPage.value = response.data.data.number + 1;
      } catch (error) {
        console.error('Error fetching team goal reviews:', error);
      }
    };

    const fetchCompletedMyGoals = async (page = 0) => { // New function
      try {
        const response = await apiClient.get(`/workforce-service/performance/find-complete-goal?page=${page}`);
        completedMyGoals.value = response.data.data.content;
        completedMyGoalsTotalPages.value = response.data.data.totalPages;
        completedMyGoalsCurrentPage.value = response.data.data.number + 1;
      } catch (error) {
        console.error('Error fetching completed my goals:', error);
      }
    };

    const fetchCompletedTeamGoals = async (page = 0) => { // New function
      try {
        const response = await apiClient.get(`/workforce-service/performance/find-complete-teamgoal?page=${page}`);
        completedTeamGoals.value = response.data.data.content;
        completedTeamGoalsTotalPages.value = response.data.data.totalPages;
        completedTeamGoalsCurrentPage.value = response.data.data.number + 1;
      } catch (error) {
        console.error('Error fetching completed team goals:', error);
      }
    };

    const handleTabChange = (tabName) => {
      activeTab.value = tabName;
      if (tabName === 'my-goal-reviews') {
        fetchMyGoalReviews(0);
      } else if (tabName === 'team-goal-reviews') {
        fetchTeamGoalReviews(0);
      } else if (tabName === 'completed-my-goals') {
        fetchCompletedMyGoals(0);
      } else if (tabName === 'completed-team-goals') {
        fetchCompletedTeamGoals(0);
      }
    };

    const handleMyReviewsPageChange = (page) => {
      fetchMyGoalReviews(page - 1);
    };

    const handleTeamReviewsPageChange = (page) => {
      fetchTeamGoalReviews(page - 1);
    };

    const handleCompletedMyGoalsPageChange = (page) => {
      fetchCompletedMyGoals(page - 1);
    };

    const handleCompletedTeamGoalsPageChange = (page) => {
      fetchCompletedTeamGoals(page - 1);
    };

    const viewCompletedMyGoalDetails = (goal) => {
      router.push(`/performance/my-goal/${goal.goalId}?from=review`);
    };

    const viewCompletedTeamGoalDetails = (goal) => {
      router.push(`/performance/team-goal-review/${goal.teamGoalId}?mode=complete`);
    };

    const viewReviewDetails = (review) => {
      if (activeTab.value === 'my-goal-reviews') {
        router.push(`/performance/my-goal/${review.goalId}?from=review`);
      } else { // This 'else' block is for 'team-goal-reviews'
        router.push(`/performance/team-goal-review/${review.teamGoalId}?mode=review`);
      }
    };

    onMounted(() => {
      fetchMyGoalReviews(0);
      fetchTeamGoalReviews(0);
      fetchCompletedMyGoals(0);
      fetchCompletedTeamGoals(0);
      fetchEvaluationStats(); // Call the new stats function
    });

    return {
      activeTab,
      inProgressReviews,
      myReviewsCount,
      completedReviews,
      teamAverageScore,
      myReviews,
      teamReviews,
      completedMyGoals, // New ref
      completedTeamGoals, // New ref
      handleTabChange,
      viewReviewDetails,
      viewCompletedMyGoalDetails, // New method
      viewCompletedTeamGoalDetails, // New method
      handleMyReviewsPageChange,
      handleTeamReviewsPageChange,
      handleCompletedMyGoalsPageChange,
      handleCompletedTeamGoalsPageChange,
    };
  },
}
</script>

<style scoped>
.performance-review {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* Header Section */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Statistics Section */
.statistics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
  flex-shrink: 0;
}

.stat-icon.my-goal {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.stat-icon.team-goal {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

.stat-icon.completed-my {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}

.stat-icon.completed-team {
  color: #909399;
  background: rgba(144, 147, 153, 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* Tabs Section */
.review-tabs {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.review-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 24px;
  background: white;
}

.review-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e4e7ed;
}

.review-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 56px;
  line-height: 56px;
}

.review-tabs :deep(.el-tabs__item.is-active) {
  color: #667eea;
  font-weight: 600;
}

.review-tabs :deep(.el-tabs__active-bar) {
  background-color: #667eea;
  height: 3px;
}

.my-reviews, .team-reviews, .completed-reviews {
  padding: 32px;
}

/* Review List */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  cursor: pointer;
}

.review-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.review-item :deep(.el-card__body) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.review-info {
  flex: 1;
}

.review-header {
  margin-bottom: 12px;
}

.review-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.review-details {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #606266;
  align-items: center;
}

.review-details span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.review-details .el-icon {
  font-size: 16px;
  color: #909399;
}

.review-actions {
  display: flex;
  gap: 8px;
  margin-left: 24px;
}

.review-actions .el-button {
  padding: 10px 20px;
  font-weight: 500;
  border-radius: 8px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.pagination-container :deep(.el-pagination) {
  font-weight: 500;
}</style>
