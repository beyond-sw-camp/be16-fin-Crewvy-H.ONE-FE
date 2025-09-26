<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content show-on-scroll">
        <h1 class="hero-title">H.ONE으로 기업의 잠재력을 깨우세요</h1>
        <p class="hero-subtitle">통합 인사/그룹웨어 솔루션으로 업무 효율을 극대화하고 성장을 가속화하세요.</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" round>데모 요청</el-button>
          <el-button type="info" size="large" round plain>무료 체험 시작</el-button>
        </div>
      </div>
    </section>

    <!-- Value Proposition Section -->
    <section class="value-prop-section">
      <h2 class="section-title show-on-scroll">H.ONE이 제공하는 핵심 가치</h2>
      <el-row :gutter="20" justify="center">
        <el-col :span="6" class="value-prop-item show-on-scroll">
          <el-icon><TrendCharts /></el-icon>
          <h3>스마트한 근태 관리</h3>
          <p>복잡한 근태 기록을 자동화하고, 유연 근무 환경을 지원합니다.</p>
        </el-col>
        <el-col :span="6" class="value-prop-item show-on-scroll">
          <el-icon><DocumentChecked /></el-icon>
          <h3>간편한 전자결재</h3>
          <p>종이 없는 결재 시스템으로 업무 처리 속도를 혁신합니다.</p>
        </el-col>
        <el-col :span="6" class="value-prop-item show-on-scroll">
          <el-icon><ChatDotSquare /></el-icon>
          <h3>강력한 협업 도구</h3>
          <p>게시판, 채팅, 화상 회의로 팀원 간의 소통을 강화합니다.</p>
        </el-col>
        <el-col :span="6" class="value-prop-item show-on-scroll">
          <el-icon><Coin /></el-icon>
          <h3>정확한 급여 정산</h3>
          <p>복잡한 급여 계산을 자동화하고 투명하게 관리합니다.</p>
        </el-col>
      </el-row>
    </section>

    <!-- Feature Highlights Section -->
    <section class="feature-highlights-section">
      <h2 class="section-title show-on-scroll">주요 기능</h2>
      <el-row :gutter="20" justify="center" class="feature-row show-on-scroll">
        <el-col :span="12" class="feature-image-col">
          <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Feature 1" class="feature-image" />
        </el-col>
        <el-col :span="12" class="feature-text-col">
          <h3>통합 인사 관리</h3>
          <p>직원 정보, 조직도, 인사 발령 등 모든 인사 업무를 한 곳에서 관리하세요。</p>
        </el-col>
      </el-row>
      <el-row :gutter="20" justify="center" class="feature-row reverse show-on-scroll">
        <el-col :span="12" class="feature-image-col">
          <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Feature 2" class="feature-image" />
        </el-col>
        <el-col :span="12" class="feature-text-col">
          <h3>효율적인 자원 예약</h3>
          <p>회의실, 차량, 장비 등 회사 자원을 간편하게 예약하고 관리합니다。</p>
        </el-col>
      </el-row>
    </section>

    <!-- Call to Action Section -->
    <section class="cta-section show-on-scroll">
      <h2 class="section-title">지금 바로 H.ONE을 경험해보세요!</h2>
      <div class="cta-actions">
        <el-button type="primary" size="large" round>데모 요청</el-button>
        <el-button type="info" size="large" round plain>무료 체험 시작</el-button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="main-footer">
      <p>&copy; 2025 H.ONE. All rights reserved.</p>
      <div class="footer-links">
        <a href="#">개인정보처리방침</a>
        <a href="#">이용약관</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { TrendCharts, DocumentChecked, ChatDotSquare, Coin } from '@element-plus/icons-vue';

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        // Optionally remove the class if you want the animation to replay on scroll up
        // entry.target.classList.remove('is-visible');
      }
    });
  }, {
    threshold: 0.1 // Trigger when 10% of the item is visible
  });

  document.querySelectorAll('.show-on-scroll').forEach(element => {
    observer.observe(element);
  });
});
</script>

<style scoped>
.landing-page {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '\5FAE\软\雅\黑', Arial, sans-serif;
  color: #333;
  line-height: 1.6;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #409EFF, #66b1ff, #409EFF);
  background-size: 200% 200%;
  animation: gradientAnimation 15s ease infinite;
  color: white;
  text-align: center;
  padding: 100px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  position: relative;
  overflow: hidden;
}

@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-content {
  z-index: 1;
  max-width: 900px;
}

.hero-title {
  font-size: 3.5em;
  margin-bottom: 20px;
  font-weight: bold;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5em;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-actions .el-button {
  margin: 0 10px;
}

/* Scroll Animation Base */
.show-on-scroll {
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.show-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered animation for value prop items */
.value-prop-item.show-on-scroll {
  transition-delay: 0.1s; /* Base delay */
}
.value-prop-item.show-on-scroll:nth-child(2) {
  transition-delay: 0.2s;
}
.value-prop-item.show-on-scroll:nth-child(3) {
  transition-delay: 0.3s;
}
.value-prop-item.show-on-scroll:nth-child(4) {
  transition-delay: 0.4s;
}

/* Value Proposition Section */
.value-prop-section {
  padding: 80px 20px;
  background-color: #f9f9f9;
  text-align: center;
}

.value-prop-item {
  padding: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  margin: 20px 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.value-prop-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.value-prop-item .el-icon {
  font-size: 3em;
  color: #409EFF;
  margin-bottom: 20px;
}

.value-prop-item h3 {
  font-size: 1.5em;
  margin-bottom: 15px;
  color: #333;
}

.value-prop-item p {
  color: #666;
  font-size: 1.1em;
}

/* Feature Highlights Section */
.feature-highlights-section {
  padding: 80px 20px;
  background-color: white;
}

.section-title {
  font-size: 2.5em;
  text-align: center;
  margin-bottom: 60px;
  color: #333;
  font-weight: bold;
}

.feature-row {
  align-items: center;
  margin-bottom: 80px;
}

.feature-row.reverse {
  flex-direction: row-reverse;
}

.feature-image-col {
  text-align: center;
}

.feature-image {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.feature-text-col {
  padding: 0 40px;
}

.feature-text-col h3 {
  font-size: 2em;
  margin-bottom: 20px;
  color: #333;
}

.feature-text-col p {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 30px;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #66b1ff, #409EFF);
  color: white;
  text-align: center;
  padding: 80px 20px;
}

.cta-actions .el-button {
  margin: 0 10px;
}

/* Footer */
.main-footer {
  background-color: #333;
  color: #eee;
  padding: 40px 20px;
  text-align: center;
  font-size: 0.9em;
}

.footer-links a {
  color: #eee;
  text-decoration: none;
  margin: 0 10px;
}

.footer-links a:hover {
  text-decoration: underline;
}
</style>