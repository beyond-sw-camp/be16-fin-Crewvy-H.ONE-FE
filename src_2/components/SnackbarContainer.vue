<template>
  <div class="snackbar-container">
    <SnackbarComponent
      v-for="snackbar in snackbars"
      :key="snackbar.id"
      :visible="snackbar.visible"
      :type="snackbar.type"
      :title="snackbar.title"
      :message="snackbar.message"
      :duration="snackbar.duration"
      :position="snackbar.position"
      :pushing="snackbar.pushing"
      @close="removeSnackbar(snackbar.id)"
    />
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import Snackbar from './Snackbar.vue'

export default {
  name: 'SnackbarContainer',
  components: {
    SnackbarComponent: Snackbar
  },
  setup() {
    const { snackbars, removeSnackbar } = useSnackbar()
    
    return {
      snackbars,
      removeSnackbar
    }
  }
}
</script>

<style scoped>
.snackbar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.snackbar-container > * {
  pointer-events: auto;
}
</style>
