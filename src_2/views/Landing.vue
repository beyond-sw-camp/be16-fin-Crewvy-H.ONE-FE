<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="landing-header">
      <div class="header-container">
        <div class="logo">
          <img src="@/assets/H.ONE.png" alt="H.ONE" class="logo-img" />
          <span class="logo-text">H.ONE</span>
        </div>
        <nav class="header-nav">
          <el-button type="text" class="nav-link">로그인</el-button>
          <el-button type="primary" class="signup-btn">무료 체험</el-button>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <!-- Background Elements -->
      <div class="hero-bg">
        <div class="geometric-shape shape-1"></div>
        <div class="geometric-shape shape-2"></div>
        <div class="geometric-shape shape-3"></div>
        <div class="floating-dots">
          <div class="dot dot-1"></div>
          <div class="dot dot-2"></div>
          <div class="dot dot-3"></div>
          <div class="dot dot-4"></div>
          <div class="dot dot-5"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge">
            <div class="badge-icon">✨</div>
            <span>500+ 기업이 선택한</span>
          </div>
          
          <h1 class="hero-title">
            <span class="title-line">대한민국 1위</span>
            <span class="title-line highlight">HR 플랫폼</span>
            <span class="title-line brand">H.ONE</span>
          </h1>
          
          <p class="hero-description">
            복잡한 인사 업무를 단순화하고, 데이터 기반의 의사결정으로<br>
            조직의 성장을 이끌어가는 통합 HR 플랫폼
          </p>
          
          <div class="hero-actions">
            <button class="primary-btn" @click="goToDashboard">
              <span>무료로 시작하기</span>
              <div class="btn-icon">→</div>
            </button>
            <button class="secondary-btn" @click="scrollToFeatures">
              <div class="play-icon">▶</div>
              <span>제품 데모</span>
            </button>
          </div>
        </div>

        <!-- Visual Elements -->
        <div class="hero-visual">
          <div class="stats-grid">
            <div class="stat-card" v-for="(stat, index) in heroStats" :key="index">
              <div class="stat-icon">{{ stat.icon }}</div>
              <div class="stat-content">
                <div class="stat-number" :data-target="stat.value" :ref="`hero-stat-${index}`">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
          
          <div class="feature-preview">
            <div class="preview-header">
              <div class="preview-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="preview-title">H.ONE 대시보드</div>
            </div>
            <div class="preview-content">
              <div class="chart-preview">
                <div class="chart-bar" v-for="i in 6" :key="i" :style="{ height: Math.random() * 60 + 20 + '%' }"></div>
              </div>
              <div class="preview-stats">
                <div class="preview-stat">
                  <span class="preview-value">1,247</span>
                  <span class="preview-label">총 직원</span>
                </div>
                <div class="preview-stat">
                  <span class="preview-value">₩2.4억</span>
                  <span class="preview-label">월 급여</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
      <div class="container">
        <div class="section-header">
          <h2>H.ONE의 핵심 기능</h2>
          <p>인사 업무의 모든 영역을 통합 관리하는 완전한 솔루션</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
            <div class="feature-icon">
              <el-icon :size="24">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
            <div class="feature-benefits">
              <div class="benefit" v-for="benefit in feature.benefits" :key="benefit">
                <el-icon><Check /></el-icon>
                <span>{{ benefit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item" v-for="(stat, index) in stats" :key="index">
            <div class="stat-number" :data-target="stat.value" :ref="`stat-${index}`">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-content">
          <h2>지금 바로 시작해보세요</h2>
          <p>무료로 체험해보고, 팀의 생산성을 높여보세요</p>
          <el-button type="primary" size="large" @click="goToDashboard" class="cta-button-large">
            <el-icon><ArrowRight /></el-icon>
            <span>무료로 시작하기</span>
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ArrowRight, VideoPlay, User, Calendar, CreditCard, Lock, PieChart, Setting, Trophy, Check } from '@element-plus/icons-vue'

export default {
  name: 'LandingPage',
  components: {
    ArrowRight,
    VideoPlay,
    User,
    Calendar,
    CreditCard,
    Lock,
    PieChart,
    Setting,
    Trophy,
    Check
  },
  data() {
    return {
      features: [
        {
          icon: 'User',
          title: '통합 인사관리',
          description: '조직도부터 개인정보까지 모든 인사 데이터를 체계적으로 관리',
          benefits: ['실시간 조직도 시각화', '직원 정보 통합 관리', '인사이동 자동화']
        },
        {
          icon: 'Calendar',
          title: '스마트 근태관리',
          description: 'AI 기반 출퇴근 관리와 근태 패턴 분석으로 업무 효율성 극대화',
          benefits: ['자동 출퇴근 인식', '근태 패턴 분석', '연차 관리 자동화']
        },
        {
          icon: 'CreditCard',
          title: '정확한 급여계산',
          description: '복잡한 급여 계산을 자동화하고 세법 변경사항을 실시간 반영',
          benefits: ['자동 급여 계산', '세법 변경 자동 반영', '급여 명세서 자동 생성']
        },
        {
          icon: 'Lock',
          title: '엔터프라이즈 보안',
          description: 'ISO 27001 인증 보안 시스템으로 개인정보와 기업 데이터를 안전하게 보호',
          benefits: ['ISO 27001 인증', '데이터 암호화', '접근 권한 관리']
        },
        {
          icon: 'PieChart',
          title: '데이터 기반 인사전략',
          description: '인사 데이터 분석을 통해 조직의 성과와 인력 현황을 정확히 파악',
          benefits: ['실시간 인사 대시보드', '성과 분석 리포트', '예측 분석']
        },
        {
          icon: 'Setting',
          title: '유연한 시스템 연동',
          description: '기존 시스템과의 완벽한 연동으로 마이그레이션 부담을 최소화',
          benefits: ['API 기반 연동', '기존 시스템 호환', '맞춤형 설정']
        }
      ],
      heroStats: [
        { icon: '🏢', value: 500, label: '기업 고객' },
        { icon: '👥', value: 500000, label: '활성 사용자' },
        { icon: '⚡', value: 99.9, label: '시스템 안정성' },
        { icon: '🕐', value: 24, label: '시간 지원' }
      ],
      stats: [
        { value: 500, label: '기업 고객' },
        { value: 500000, label: '활성 사용자' },
        { value: 99.9, label: '시스템 안정성' },
        { value: 24, label: '시간 지원' }
      ]
    }
  },
  mounted() {
    this.animateNumbers()
  },
  methods: {
    goToDashboard() {
      this.$router.push('/')
    },
    scrollToFeatures() {
      document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
    },
    animateNumbers() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target
            const finalValue = target.dataset.target
            
            // 문자열인 경우 (콤마가 포함된 경우) 그대로 표시
            if (isNaN(parseFloat(finalValue))) {
              target.textContent = finalValue
              observer.unobserve(target)
              return
            }
            
            const numericValue = parseFloat(finalValue)
            const increment = numericValue / 50
            let current = 0
            
            const timer = setInterval(() => {
              current += increment
              if (current >= numericValue) {
                current = numericValue
                clearInterval(timer)
              }
              
              // 숫자 포맷팅 - 1천 단위 이상일 때 콤마 표시
              if (numericValue % 1 !== 0) {
                target.textContent = current.toFixed(1)
              } else {
                const currentInt = Math.floor(current)
                // 1천 단위 이상일 때 콤마 표시
                if (currentInt >= 1000) {
                  target.textContent = currentInt.toLocaleString()
                } else {
                  target.textContent = currentInt.toString()
                }
              }
            }, 30)
            
            observer.unobserve(target)
          }
        })
      })
      
      // DOM이 완전히 렌더링된 후 실행
      this.$nextTick(() => {
        document.querySelectorAll('.stat-number').forEach(el => {
          observer.observe(el)
        })
      })
    }
  }
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  overflow-x: hidden;
}

/* Header */
.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  color: #606266 !important;
  font-weight: 500;
  padding: 8px 16px;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #667eea !important;
}

.signup-btn {
  background: #2c3e50;
  border: none;
  padding: 10px 24px;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.signup-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  overflow: hidden;
  padding-top: 70px;
  display: flex;
  align-items: center;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.geometric-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: -150px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: -100px;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 30%;
  right: 20%;
  animation-delay: 4s;
}

.floating-dots {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(99, 102, 241, 0.6);
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

.dot-1 { top: 20%; left: 10%; animation-delay: 0s; }
.dot-2 { top: 40%; left: 80%; animation-delay: 0.5s; }
.dot-3 { top: 70%; left: 20%; animation-delay: 1s; }
.dot-4 { top: 30%; left: 70%; animation-delay: 1.5s; }
.dot-5 { top: 80%; left: 60%; animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

/* Hero Container */
.hero-container {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

/* Hero Content */
.hero-content {
  color: #1f2937;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 32px;
  color: #374151;
}

.badge-icon {
  font-size: 16px;
}

.hero-title {
  margin-bottom: 24px;
}

.title-line {
  display: block;
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 8px;
}

.title-line.highlight {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-line.brand {
  font-size: 4rem;
  font-weight: 800;
  color: #1f2937;
}

.hero-description {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #6b7280;
  margin-bottom: 40px;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.primary-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 15px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.btn-icon, .play-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.primary-btn:hover .btn-icon {
  transform: translateX(4px);
}

/* Hero Visual */
.hero-visual {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 12px;
}

.stat-content {
  color: #1f2937;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #1f2937;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.feature-preview {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.preview-header {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-dots {
  display: flex;
  gap: 6px;
}

.preview-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
}

.preview-dots span:first-child {
  background: #ef4444;
}

.preview-dots span:nth-child(2) {
  background: #f59e0b;
}

.preview-dots span:last-child {
  background: #10b981;
}

.preview-title {
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.preview-content {
  padding: 24px;
}

.chart-preview {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 80px;
  margin-bottom: 20px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #6366f1, #8b5cf6);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  animation: growUp 1s ease-out;
}

.preview-stats {
  display: flex;
  gap: 20px;
}

.preview-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-value {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.preview-label {
  font-size: 12px;
  color: #6b7280;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes growUp {
  from { height: 0; }
  to { height: var(--height); }
}

/* Features Section */
.features {
  padding: 100px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
}

.section-header p {
  font-size: 1.2rem;
  color: #606266;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  text-align: left;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: #B8E6FF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #2c3e50;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 20px;
}

.feature-benefits {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}

.benefit .el-icon {
  color: #10b981;
  font-size: 16px;
}

/* Stats Section */
.stats {
  padding: 80px 0;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #1f2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
}

.stat-item {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #2c3e50;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.8;
}

/* CTA Section */
.cta {
  padding: 100px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #1f2937;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-button-large {
  background: #3b82f6;
  border: none;
  padding: 20px 40px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: white;
}

.cta-button-large:hover {
  background: #2563eb;
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  
  .title-line {
    font-size: 2.5rem;
  }
  
  .title-line.brand {
    font-size: 3rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .cta-content h2 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .title-line {
    font-size: 2rem;
  }
  
  .title-line.brand {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn,
  .secondary-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

