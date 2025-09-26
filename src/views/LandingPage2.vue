<template>
  <div class="landing-page-2">
    <!-- Hero Section -->
    <header class="hero-section">
      <div class="hero-background"></div>
      <div class="hero-content">
        <h1 class="main-headline">모든 HR을 하나의 플랫폼에서</h1>
        <p class="sub-headline">H.ONE으로 스마트하고 효율적인 인사관리를 경험하세요.</p>
        <el-button type="primary" size="large" class="cta-button" @click="goToLogin">시작하기</el-button>
      </div>
    </header>

    <!-- Feature Sections -->
    <main class="feature-container">
      <section class="feature-section">
        <div class="feature-text">
          <h2>자동화된 근태 관리</h2>
          <p>복잡한 근태 기록, 휴가 관리, 출퇴근 기록 등을 H.ONE이 자동으로 처리하여 업무 효율을 극대화합니다.</p>
        </div>
        <div class="feature-media">
          <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop" alt="Automated Attendance">
        </div>
      </section>

      <section class="feature-section reverse">
        <div class="feature-text">
          <h2>정확한 급여 정산</h2>
          <p>각종 수당, 공제, 세금 계산까지 완벽하게 자동화된 급여 시스템으로 정확하고 빠른 급여 정산을 보장합니다.</p>
        </div>
        <div class="feature-media">
          <img src="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop" alt="Accurate Payroll">
        </div>
      </section>

      <section class="feature-section">
        <div class="feature-text">
          <h2>효율적인 전자결재</h2>
          <p>언제 어디서든 가능한 전자결재 시스템으로 신속한 의사결정을 지원하고 모든 기록을 투명하게 관리합니다.</p>
        </div>
        <div class="feature-media">
          <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop" alt="Efficient Approval">
        </div>
      </section>
    </main>

    <!-- FAQ Section -->
    <section class="faq-section">
      <h2>자주 묻는 질문</h2>
      <el-collapse v-model="activeFaq" accordion class="faq-accordion">
        <el-collapse-item v-for="faq in faqs" :key="faq.name" :title="faq.title" :name="faq.name">
          <p>{{ faq.content }}</p>
        </el-collapse-item>
      </el-collapse>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-content">
        <p>&copy; 2025 H.ONE. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">이용약관</a>
          <a href="#">개인정보처리방침</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'LandingPage2',
  data() {
    return {
      activeFaq: '1',
      faqs: [
        { name: '1', title: 'H.ONE은 어떤 기업을 위한 서비스인가요?', content: 'H.ONE은 스타트업부터 중견, 중소기업까지 모든 규모의 기업에서 사용할 수 있는 유연한 HR 솔루션입니다.' },
        { name: '2', title: '기존에 사용하던 데이터는 어떻게 옮길 수 있나요?', content: '담당 매니저가 안전하고 신속하게 기존 데이터를 마이그레이션해 드립니다.' },
        { name: '3', title: '보안은 안전한가요?', content: 'H.ONE은 최신 보안 기술을 적용하여 고객의 소중한 정보를 안전하게 보호합니다.' },
        { name: '4', title: '요금은 어떻게 되나요?', content: '기업 규모와 필요 기능에 따라 맞춤형 요금제를 제공합니다. 자세한 내용은 문의해주세요.' },
      ]
    };
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.landing-page-2 {
  background-color: #000;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 20px;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.main-headline {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.sub-headline {
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 2rem;
  color: #e5e5e5;
}

.cta-button {
  font-size: 1.2rem;
  padding: 20px 40px;
  border-radius: 5px;
  background-color: #4f46e5;
  border-color: #4f46e5;
  transition: transform 0.2s ease;
}

.cta-button:hover {
  transform: scale(1.05);
  background-color: #667eea;
  border-color: #667eea;
}

/* Feature Sections */
.feature-container {
  padding: 6rem 0;
}

.feature-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 20px;
  border-bottom: 1px solid #222;
}

.feature-section:last-child {
  border-bottom: none;
}

.feature-section.reverse {
  grid-template-columns: 1fr 1fr;
}

.feature-section.reverse .feature-text {
  order: 2;
}

.feature-text h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.feature-text p {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #a0a0a0;
}

.feature-media img {
  width: 100%;
  border-radius: 10px;
}

/* FAQ Section */
.faq-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 6rem 20px;
  text-align: center;
}

.faq-section h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.faq-accordion {
  text-align: left;
}

::v-deep(.el-collapse-item__header) {
  background-color: #1a1a1a !important;
  color: #fff !important;
  font-size: 1.2rem;
  padding: 0 20px;
  border-bottom: 1px solid #000;
}

::v-deep(.el-collapse-item__wrap) {
  background-color: #1a1a1a !important;
}

::v-deep(.el-collapse-item__content) {
  color: #a0a0a0 !important;
  font-size: 1.1rem;
  padding: 20px;
  line-height: 1.6;
}

/* Footer */
.landing-footer {
  border-top: 1px solid #222;
  padding: 2rem 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a0a0;
}

.footer-links a {
  color: #a0a0a0;
  text-decoration: none;
  margin-left: 20px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #fff;
}

/* Responsive */
@media (max-width: 768px) {
  .main-headline {
    font-size: 2.5rem;
  }

  .sub-headline {
    font-size: 1.2rem;
  }

  .feature-section,
  .feature-section.reverse {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .feature-section.reverse .feature-text {
    order: 0;
  }

  .feature-text h2 {
    font-size: 2rem;
  }
}
</style>
