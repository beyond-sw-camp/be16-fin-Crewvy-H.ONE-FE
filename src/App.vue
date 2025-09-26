<template>
  <div id="app">
    <component :is="layout" />
    <SnackbarContainer />
  </div>
</template>

<script>
import AppLayout from './layouts/AppLayout.vue';
import BlankLayout from './layouts/BlankLayout.vue';
import SnackbarContainer from './components/SnackbarContainer.vue';

export default {
  name: 'App',
  components: {
    AppLayout,
    BlankLayout,
    SnackbarContainer
  },
  computed: {
    layout() {
      // Use a default layout if the route doesn't specify one
      return this.$route.meta.layout || 'AppLayout';
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