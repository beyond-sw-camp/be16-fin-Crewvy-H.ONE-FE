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
import SnackbarContainer from './components/SnackbarContainer.vue';

export default {
  name: 'App',
  components: {
    AppLayout,
    BlankLayout,
    SnackbarContainer
  },
  data() {
    return {
      isLoading: true, // Initially true, to prevent rendering until user data is loaded
    };
  },
  computed: {
    layout() {
      // Use a default layout if the route doesn't specify one
      return this.$route.meta.layout || 'AppLayout';
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
      
      await this.$store.dispatch('setUser', user); // Wait for the action to complete
    }
    this.isLoading = false; // Set to false after user data is loaded or not found
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