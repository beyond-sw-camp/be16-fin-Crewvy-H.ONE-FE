<template>
  <div class="performance-review">
    <div class="page-header">
      <div class="header-content">
        <h1>성과 평가</h1>
        <p>구성원의 성과를 공정하게 평가하고 피드백을 제공하세요.</p>
      </div>
      <div class="header-actions">
      </div>
    </div>

    <!-- 평가 현황 카드 -->
    <div class="review-cards">
      <div class="review-card">
        <div class="card-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">진행중인 평가</div>
          <div class="card-value">{{ inProgressReviews }}</div>
          <div class="card-subtitle">내가 할 평가</div>
        </div>
      </div>
      
      <div class="review-card">
        <div class="card-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">내 평가</div>
          <div class="card-value">{{ myReviewsCount }}</div>
          <div class="card-subtitle">피평가</div>
        </div>
      </div>
      
      <div class="review-card">
        <div class="card-icon">
          <el-icon><Check /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">완료된 평가</div>
          <div class="card-value">{{ completedReviews }}</div>
          <div class="card-subtitle">이번 분기</div>
        </div>
      </div>
      
      <div class="review-card">
        <div class="card-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">팀 평균</div>
          <div class="card-value">{{ teamAverageScore }}</div>
          <div class="card-subtitle"></div>
        </div>
      </div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="review-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="내 목표 평가" name="my-goal-reviews">
          <div class="my-reviews">
            <div class="section-header">
              <h3>내 목표 평가</h3>
            </div>
            <div class="review-list">
              <div class="review-item" v-for="review in myReviews" :key="review.goalId">
                <div class="review-info">
                  <div class="review-header">
                    <div class="review-title">{{ review.title }}</div>
                  </div>
                  <div class="review-details">
                    <span class="review-period"><strong>목표 진행 기간:</strong> {{ review.startDate }} ~ {{ review.endDate }}</span>
                  </div>
                </div>
                <div class="review-actions">
                  <el-button size="small" @click="viewReviewDetails(review)">
                    <el-icon><View /></el-icon>
                    상세
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="팀 목표 평가" name="team-goal-reviews">
          <div class="team-reviews">
            <div class="section-header">
              <h3>팀 목표 평가</h3>
            </div>
            <div class="review-list">
              <div class="review-item" v-for="review in teamReviews" :key="review.goalId">
                <div class="review-info">
                  <div class="review-header">
                    <div class="review-title">{{ review.title }}</div>
                  </div>
                  <div class="review-details">
                    <span class="reviewee"><strong>피평가자:</strong> {{ review.memberName }} ({{ review.memberPosition }})</span>
                    <span class="review-status"><strong>상태:</strong> {{ review.status }}</span>
                  </div>
                </div>
                <div class="review-actions">
                  <el-button size="small" @click="viewReviewDetails(review)">
                    <el-icon><View /></el-icon>
                    상세
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="완료된 개인 목표" name="completed-my-goals">
          <div class="completed-reviews">
            <div class="section-header">
              <h3>완료된 개인 목표</h3>
            </div>
            <div class="review-list">
              <div class="review-item" v-for="goal in completedMyGoals" :key="goal.goalId">
                <div class="review-info">
                  <div class="review-header">
                    <div class="review-title">{{ goal.title }}</div>
                  </div>
                  <div class="review-details">
                    <span class="review-period"><strong>기간:</strong> {{ goal.startDate }} ~ {{ goal.endDate }}</span>
                    <span class="review-status"><strong>상태:</strong> {{ goal.status }}</span>
                  </div>
                </div>
                <div class="review-actions">
                  <el-button size="small" @click="viewCompletedMyGoalDetails(goal)">
                    <el-icon><View /></el-icon>
                    상세
                  </el-button>
                </div>
              </div>
              <p v-if="completedMyGoals.length === 0">완료된 개인 목표 평가가 없습니다.</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="완료된 팀 목표" name="completed-team-goals">
          <div class="completed-reviews">
            <div class="section-header">
              <h3>완료된 팀 목표</h3>
            </div>
            <div class="review-list">
              <div class="review-item" v-for="goal in completedTeamGoals" :key="goal.goalId">
                <div class="review-info">
                  <div class="review-header">
                    <div class="review-title">{{ goal.title }}</div>
                  </div>
                  <div class="review-details">
                    <span class="reviewee"><strong>팀원:</strong> {{ goal.memberName }} ({{ goal.memberPosition }})</span>
                    <span class="review-period"><strong>기간:</strong> {{ goal.startDate }} ~ {{ goal.endDate }}</span>
                    <span class="review-status"><strong>상태:</strong> {{ goal.status }}</span>
                  </div>
                </div>
                <div class="review-actions">
                  <el-button size="small" @click="viewCompletedTeamGoalDetails(goal)">
                    <el-icon><View /></el-icon>
                    상세
                  </el-button>
                </div>
              </div>
              <p v-if="completedTeamGoals.length === 0">완료된 팀 목표 평가가 없습니다.</p>
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

    const myReviews = ref([]);
    const teamReviews = ref([]);
    const completedMyGoals = ref([]); // New ref
    const completedTeamGoals = ref([]); // New ref

    const fetchMyGoalReviews = async () => {
      try {
        const response = await apiClient.get('/workforce-service/performance/find-goal-evaluation');
        myReviews.value = response.data.data;
      } catch (error) {
        console.error('Error fetching my goal reviews:', error);
      }
    };

    const fetchTeamGoalReviews = async () => {
      try {
        const response = await apiClient.get('/workforce-service/performance/find-teamgoal-evaluation');
        teamReviews.value = response.data.data;
      } catch (error) {
        console.error('Error fetching team goal reviews:', error);
      }
    };

    const fetchCompletedMyGoals = async () => { // New function
      try {
        const response = await apiClient.get('/workforce-service/performance/find-complete-goal');
        completedMyGoals.value = response.data.data;
      } catch (error) {
        console.error('Error fetching completed my goals:', error);
      }
    };

    const fetchCompletedTeamGoals = async () => { // New function
      try {
        const response = await apiClient.get('/workforce-service/performance/find-complete-teamgoal');
        completedTeamGoals.value = response.data.data;
      } catch (error) {
        console.error('Error fetching completed team goals:', error);
      }
    };

    const handleTabChange = (tabName) => {
      activeTab.value = tabName;
      if (tabName === 'my-goal-reviews') {
        fetchMyGoalReviews();
      } else if (tabName === 'team-goal-reviews') {
        fetchTeamGoalReviews();
      } else if (tabName === 'completed-my-goals') {
        fetchCompletedMyGoals();
      } else if (tabName === 'completed-team-goals') {
        fetchCompletedTeamGoals();
      }
    };

    const viewCompletedMyGoalDetails = (goal) => {
      router.push(`/performance/my-goal/${goal.goalId}?from=review`);
    };

    const viewCompletedTeamGoalDetails = (goal) => {
      router.push(`/performance/team-goal-review/${goal.teamGoalId}?mode=review`);
    };

    const viewReviewDetails = (review) => {
      if (activeTab.value === 'my-goal-reviews') {
        router.push(`/performance/my-goal/${review.goalId}?from=review`);
      } else {
        router.push(`/performance/team-goal-review/${review.teamGoalId}`);
      }
    };

    onMounted(() => {
      fetchMyGoalReviews();
      fetchTeamGoalReviews();
      fetchCompletedMyGoals();
      fetchCompletedTeamGoals();
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
    };
  },
}
</script>

<style scoped>
.performance-review {
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

.review-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.review-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.review-card:hover {
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

.review-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.review-tabs :deep(.el-tabs__nav) {
  padding-left: 20px;
}

.my-reviews, .team-reviews, .completed-reviews {
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

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.review-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.review-info {
  flex: 1;
}

.review-header {
  margin-bottom: 8px;
}

.review-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.review-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #606266;
}

.review-actions {
  display: flex;
  gap: 8px;
}
</style>
