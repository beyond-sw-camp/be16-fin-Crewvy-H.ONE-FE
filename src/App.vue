<template>
  <div id="app">
    <template v-if="!isLoading">
      <component :is="layout" />
    </template>
    <SnackbarContainer />
  </div>
</template>

<script>
import AppLayout from './layouts/AppLayout.vue';
import BlankLayout from './layouts/BlankLayout.vue';
import MobileLayout from './layouts/MobileLayout.vue';
import SnackbarContainer from './components/SnackbarContainer.vue';

export default {
  name: 'App',
  components: {
    AppLayout,
    BlankLayout,
    MobileLayout,
    SnackbarContainer
  },
  data() {
    return {
      isLoading: true,
    };
  },
  computed: {
    layout() {
      // 모바일 디바이스 감지
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());

      // 라우트에 명시적으로 레이아웃이 지정된 경우 (예: 로그인 페이지)
      if (this.$route.meta.layout) {
        return this.$route.meta.layout;
      }

      // 모바일이면 MobileLayout, PC면 AppLayout
      return isMobile ? 'MobileLayout' : 'AppLayout';
    }
  },
  async created() {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const userName = localStorage.getItem('userName');
      const memberId = localStorage.getItem('memberId');
      const memberPositionId = localStorage.getItem('memberPositionId');
      
      const user = {
        userName,
        memberId,
        memberPositionId
      };
      
      await this.$store.dispatch('setUser', user);
    }
    this.isLoading = false;
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --surface-radius: 8px;
  --surface-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --surface-padding: 20px;
  --surface-bg: #ffffff;
  --heading-color: #2c3e50;
  --heading-size: 32px;
  --heading-weight: 600;
  --subtext-color: #606266;
  --subtext-size: 16px;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-container {
  width: 100%;
  max-width: 1220px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.page-container > * {
  width: 100%;
  padding: 0 !important;
  margin: 0;
  box-sizing: border-box;
}

.page-container :deep(div[class*="card"]),
.page-container :deep(section[class*="card"]),
.page-container :deep(div[class*="Card"]),
.page-container :deep(section[class*="Card"]),
.page-container :deep(div[class*="section"]),
.page-container :deep(section[class*="section"]),
.page-container :deep(div[class*="container"]),
.page-container :deep(section[class*="container"]),
.page-container :deep(div[class*="panel"]),
.page-container :deep(section[class*="panel"]) {
  border-radius: var(--surface-radius);
}

.page-container :deep(.page-header h1),
.page-container :deep(.header-content h1),
.page-container :deep(.header-text h1) {
  font-size: var(--heading-size);
  font-weight: var(--heading-weight);
  color: var(--heading-color);
  margin-bottom: 8px;
}

.page-container :deep(.page-header p),
.page-container :deep(.header-content p),
.page-container :deep(.header-text p) {
  font-size: var(--subtext-size);
  color: var(--subtext-color);
}

.page-container :deep(.surface-card),
.page-container :deep(.search-section),
.page-container :deep(.filter-section),
.page-container :deep(.table-section),
.page-container :deep(.resource-section),
.page-container :deep(.statistics-section),
.page-container :deep(.goals-container-card),
.page-container :deep(.meeting-cards),
.page-container :deep(.resource-cards),
.page-container :deep(.employee-list),
.page-container :deep(.employee-cards),
.page-container :deep(.detail-card),
.page-container :deep(.summary-card),
.page-container :deep(.cards-wrapper) {
  background: var(--surface-bg);
  border-radius: var(--surface-radius);
  box-shadow: var(--surface-shadow);
  padding: var(--surface-padding);
}

.page-container :deep(.employee-card),
.page-container :deep(.meeting-card),
.page-container :deep(.resource-card),
.page-container :deep(.goal-card),
.page-container :deep(.stat-card),
.page-container :deep(.resource-item),
.page-container :deep(.dashboard-card),
.page-container :deep(.attendance-card) {
  border-radius: var(--surface-radius);
  box-shadow: var(--surface-shadow);
  background: var(--surface-bg);
}

.page-container :deep(.employee-card:hover),
.page-container :deep(.meeting-card:hover),
.page-container :deep(.resource-card:hover),
.page-container :deep(.goal-card:hover),
.page-container :deep(.resource-item:hover) {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.page-container :deep([class*="card"]),
.page-container :deep([class*="Card"]),
.page-container :deep([class*="section"]),
.page-container :deep([class*="Section"]),
.page-container :deep([class*="container"]),
.page-container :deep([class*="Container"]),
.page-container :deep([class*="panel"]),
.page-container :deep([class*="Panel"]),
.page-container :deep([class*="box"]),
.page-container :deep([class*="Box"]) {
  border-radius: var(--surface-radius) !important;
}

.page-container :deep(.el-card) {
  border-radius: var(--surface-radius) !important;
  box-shadow: var(--surface-shadow) !important;
}

.page-container :deep(.el-card__body) {
  padding: var(--surface-padding) !important;
}

.el-dialog {
  width: 800px !important;
  max-width: 800px !important;
  min-height: 500px !important;
}

.el-dialog__body {
  min-height: calc(500px - 120px);
  overflow-y: auto;
}

body {
  margin: 0;
  padding: 0;
}
</style>
