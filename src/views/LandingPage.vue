<template>
  <div class="landing-page">
    <!-- Sticky Header -->
    <nav :class="{'sticky-header': true, 'is-sticky': isHeaderSticky}">
      <div class="header-content">
        <div class="logo">H.ONE</div>
        <div class="nav-links">
          <a href="#features">기능</a>
          <a href="#faq">FAQ</a>
          <a href="/login" class="login-btn">로그인</a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero-section">
      <video autoplay loop muted playsinline class="hero-background">
        <source src="https://videos.pexels.com/video-files/8255531/8255531-hd_1920_1080_25fps.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="main-headline">혁신적인 HR 솔루션, H.ONE</h1>
        <p class="sub-headline">인사 관리의 모든 것을 하나의 플랫폼에서 경험하세요.</p>
        <el-button type="primary" size="large" class="cta-button" @click="goToLogin">무료로 시작하기</el-button>
      </div>
    </header>

    <!-- Feature Sections -->
    <main class="feature-container" id="features">
      <section class="feature-section" v-scroll-animate>
        <div class="feature-text">
          <h2>간편한 근태 관리</h2>
          <p>출퇴근 기록, 휴가 신청 및 승인, 근무 시간 관리까지. H.ONE으로 복잡한 근태 관리를 한번에 해결하세요.</p>
          <ul class="sub-features">
            <li><el-icon><CircleCheck /></el-icon> 실시간 출퇴근 현황</li>
            <li><el-icon><CircleCheck /></el-icon> 유연한 근무 정책 설정</li>
            <li><el-icon><CircleCheck /></el-icon> 간편한 휴가 신청 및 승인</li>
          </ul>
        </div>
        <div class="feature-media">
          <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" alt="Easy Attendance">
        </div>
      </section>

      <section class="feature-section reverse" v-scroll-animate>
        <div class="feature-text">
          <h2>자동화된 급여 정산</h2>
          <p>더 이상 복잡한 엑셀 작업은 그만. 클릭 몇 번으로 급여 계산부터 이체, 명세서 발급까지 완벽하게 처리합니다.</p>
          <ul class="sub-features">
            <li><el-icon><CircleCheck /></el-icon> 자동 세금 및 4대 보험 계산</li>
            <li><el-icon><CircleCheck /></el-icon> 원클릭 급여 이체</li>
            <li><el-icon><CircleCheck /></el-icon> 개인별 급여 명세서 자동 발급</li>
          </ul>
        </div>
        <div class="feature-media">
          <img src="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop" alt="Automated Payroll">
        </div>
      </section>

      <section class="feature-section" v-scroll-animate>
        <div class="feature-text">
          <h2>스마트한 전자결재</h2>
          <p>모바일에서도 가능한 전자결재 시스템으로 언제 어디서든 신속하게 의사를 결정하고 업무를 처리할 수 있습니다.</p>
          <ul class="sub-features">
            <li><el-icon><CircleCheck /></el-icon> 커스텀 결재 양식 설정</li>
            <li><el-icon><CircleCheck /></el-icon> 실시간 결재 상태 알림</li>
            <li><el-icon><CircleCheck /></el-icon> 모바일 완벽 지원</li>
          </ul>
        </div>
        <div class="feature-media">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" alt="Smart Approval">
        </div>
      </section>
    </main>

    <!-- FAQ Section -->
    <section class="faq-section" id="faq" v-scroll-animate>
      <h2>자주 묻는 질문</h2>
      <el-collapse v-model="activeFaq" accordion class="faq-accordion">
        <el-collapse-item v-for="faq in faqs" :key="faq.name" :title="faq.title" :name="faq.name">
          <p>{{ faq.content }}</p>
        </el-collapse-item>
      </el-collapse>
    </section>

    <!-- Social Proof Section -->
    <section class="social-proof-section" v-scroll-animate>
      <h2>신뢰할 수 있는 기업들이 H.ONE과 함께합니다</h2>
      <div class="logo-cloud">
        <img src="https://via.placeholder.com/150x50?text=Company+A" alt="Company A Logo">
        <img src="https://via.placeholder.com/150x50?text=Company+B" alt="Company B Logo">
        <img src="https://via.placeholder.com/150x50?text=Company+C" alt="Company C Logo">
        <img src="https://via.placeholder.com/150x50?text=Company+D" alt="Company D Logo">
        <img src="https://via.placeholder.com/150x50?text=Company+E" alt="Company E Logo">
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section" v-scroll-animate>
      <h2>지금 바로 H.ONE을 시작하세요</h2>
      <p>복잡한 인사 관리, H.ONE으로 해결할 수 있습니다.</p>
      <el-button type="primary" size="large" class="cta-button" @click="goToLogin">무료로 시작하기</el-button>
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
  name: 'LandingPage3',
  directives: {
    scrollAnimate: {
      mounted(el) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              el.classList.add('is-visible');
            } else {
              el.classList.remove('is-visible');
            }
          });
        }, { threshold: 0.1 });
        observer.observe(el);
      }
    }
  },
  data() {
    return {
      isHeaderSticky: false,
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
    },
    handleScroll() {
      this.isHeaderSticky = window.scrollY > 50;
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<style scoped>
.landing-page-3 {
  background-color: #fff;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow-x: hidden;
}

/* Sticky Header */
.sticky-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem 2rem;
  background-color: transparent;
  z-index: 1000;
  transition: all 0.3s ease-in-out;
}

.sticky-header.is-sticky {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.sticky-header .header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sticky-header .logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
}

.nav-links a {
  margin-left: 2rem;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #4f46e5;
}

.nav-links .login-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #4f46e5;
  border-radius: 5px;
  color: #4f46e5;
}

.nav-links .login-btn:hover {
  background-color: #4f46e5;
  color: #fff;
}

/* Scroll Animation */
.feature-section, .faq-section, .social-proof-section, .cta-section {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.feature-section.is-visible, .faq-section.is-visible, .social-proof-section.is-visible, .cta-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 20px;
  background-color: #f8f9fa;
}

.hero-background {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(248, 249, 250, 0.6);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.main-headline {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.sub-headline {
  font-size: 1.3rem;
  font-weight: 400;
  margin-bottom: 2.5rem;
  color: #606266;
}

.cta-button {
  font-size: 1.1rem;
  padding: 20px 40px;
  border-radius: 8px;
  background-color: #4f46e5;
  border-color: #4f46e5;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
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
}

.feature-section.reverse {
  grid-template-columns: 1fr 1fr;
}

.feature-section.reverse .feature-text {
  order: 2;
}

.feature-text h2 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feature-text p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #606266;
  margin-bottom: 2rem;
}

.sub-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sub-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #333;
}

.sub-features .el-icon {
  color: #4f46e5;
}

.feature-media img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* FAQ Section */
.faq-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 6rem 20px;
  background-color: #f8f9fa;
}

/* Social Proof Section */
.social-proof-section {
  padding: 6rem 20px;
  text-align: center;
}

.social-proof-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #606266;
  margin-bottom: 3rem;
}

.logo-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4rem;
}

.logo-cloud img {
  height: 40px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.logo-cloud img:hover {
  opacity: 1;
}

/* CTA Section */
.cta-section {
  padding: 6rem 20px;
  text-align: center;
  background-color: #4f46e5;
  color: #fff;
}

.cta-section h2 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-section p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-section .cta-button {
  background-color: #fff;
  color: #4f46e5;
  box-shadow: none;
}


.faq-section h2 {
  font-size: 2.2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #2c3e50;
}

.faq-accordion {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

::v-deep(.el-collapse-item__header) {
  background-color: #fff !important;
  color: #303133 !important;
  font-size: 1.1rem;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
}

::v-deep(.el-collapse-item__wrap) {
  background-color: #fff !important;
}

::v-deep(.el-collapse-item__content) {
  color: #606266 !important;
  font-size: 1rem;
  padding: 20px;
  line-height: 1.7;
}

/* Footer */
.landing-footer {
  background-color: #2c3e50;
  color: #fff;
  padding: 3rem 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
  margin-left: 20px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #a0aec0;
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