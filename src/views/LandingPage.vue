<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="landing-header">
      <div class="container">
        <div class="header-left">
          <div class="logo">
            <img src="@/assets/H.ONE.png" alt="H.ONE Logo" />
          </div>
          <nav class="main-nav">
            <a href="#features">주요 기능</a>
            <a href="#pricing">가격 정책</a>
            <a href="#about">회사 소개</a>
          </nav>
        </div>
        <div class="auth-buttons">
          <el-button plain @click="goToLogin">로그인</el-button>
          <el-button type="primary" @click="goToSignUp">회원가입</el-button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <h1>All-in-One 스마트 HR 플랫폼, H.ONE</h1>
        <p>인사 관리의 모든 것을 하나의 플랫폼에서 해결하세요. H.ONE은 귀사의 성장을 지원합니다.</p>
        <el-button type="primary" size="large" @click="goToSignUp">지금 시작하기</el-button>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header">
          <h2>주요 기능</h2>
          <p>H.ONE이 제공하는 강력하고 직관적인 기능들을 만나보세요.</p>
        </div>
        <el-row :gutter="30" class="features-row">
          <el-col :xs="24" :sm="12" :md="8" v-for="feature in features" :key="feature.title" class="feature-col">
            <el-card class="feature-card stretch-card">
              <div class="feature-icon">
                <el-icon :size="30"><component :is="feature.icon" /></el-icon>
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="container">
        <p>&copy; 2024 H.ONE Corp. All Rights Reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { User, Clock, Money, Document, VideoCamera, Trophy } from '@element-plus/icons-vue';

export default {
  name: 'LandingPage',
  components: { User, Clock, Money, Document, VideoCamera, Trophy },
  data() {
    return {
      features: [
        {
          icon: 'User',
          title: '직원 관리',
          description: '체계적인 직원 정보 관리 및 조직도 기능을 제공합니다.'
        },
        {
          icon: 'Clock',
          title: '근태 관리',
          description: '간편한 출퇴근 기록 및 유연한 근무 정책을 지원합니다.'
        },
        {
          icon: 'Trophy',
          title: '성과 관리',
          description: '체계적인 목표 설정과 공정한 평가를 통해 동기를 부여하고 성장을 지원합니다.'
        },
        {
          icon: 'Money',
          title: '급여 관리',
          description: '복잡한 급여 계산부터 이체, 명세서 발급까지 자동화합니다.'
        },
        {
          icon: 'Document',
          title: '전자결재',
          description: '페이퍼리스 워크플로우를 통해 신속한 의사결정을 돕습니다.'
        },
        {
          icon: 'VideoCamera',
          title: '화상회의',
          description: '언제 어디서든 원활한 비대면 협업이 가능합니다.'
        }
      ]
    };
  },
  methods: {
    goToLogin() {
      this.$router.push('/login'); // Assuming you have a /login route
    },
    goToSignUp() {
      this.$router.push('/terms-of-service'); // Go to Terms of Service first
    }
  }
};
</script>

<style scoped>
.landing-page {
  font-family: 'Elice UI', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.landing-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.landing-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo img {
  height: 40px;
}

.main-nav a {
  margin: 0 15px;
  text-decoration: none;
  color: #303133;
  font-weight: 500;
  transition: color 0.3s;
}

.main-nav a:hover {
  color: #4f46e5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.feature-col {
  margin-bottom: 30px;
}

/* Hero Section */
.hero-section {
  background: #f5f7fa;
  text-align: center;
  padding: 100px 0;
}

.hero-section h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
}

.hero-section p {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
}

/* Features Section */
.features-section {
  padding: 80px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
}

.section-header p {
  font-size: 16px;
  color: #606266;
}

.feature-card {
  text-align: center;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  background: #f0f9ff;
  color: #4f46e5;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
}

.feature-card p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.features-row {
  display: flex;
  flex-wrap: wrap;
}

.stretch-card {
  height: 100%;
}

/* Footer */
.landing-footer {
  background: #303133;
  color: #fff;
  text-align: center;
  padding: 30px 0;
}
</style>
