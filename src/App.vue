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

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
  min-height: 100vh;
}

body {
  margin: 0;
  padding: 0;
}
</style>
