<template>
  <div id="app">
    <MainLayout v-if="!isLandingPage" />
    <router-view v-if="isLandingPage" />
    <SnackbarContainer />
  </div>
</template>

<script>
import MainLayout from './components/MainLayout.vue'
import SnackbarContainer from './components/SnackbarContainer.vue'

export default {
  name: 'App',
  components: {
    MainLayout,
    SnackbarContainer
  },
  computed: {
    isLandingPage() {
      return this.$route.path === '/landing'
    }
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
