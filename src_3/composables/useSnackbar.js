import { ref, reactive } from 'vue'

const snackbars = ref([])
let idCounter = 0

export function useSnackbar() {
  const showSnackbar = (options) => {
    const id = ++idCounter
    const snackbar = reactive({
      id,
      visible: true,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || 4000,
      position: options.position || 'top-center'
    })

    snackbars.value.push(snackbar)

    // 자동으로 제거
    if (snackbar.duration > 0) {
      setTimeout(() => {
        removeSnackbar(id)
      }, snackbar.duration)
    }

    return id
  }

  const removeSnackbar = (id) => {
    const index = snackbars.value.findIndex(s => s.id === id)
    if (index > -1) {
      snackbars.value.splice(index, 1)
    }
  }

  const success = (message, options = {}) => {
    return showSnackbar({
      type: 'success',
      message,
      ...options
    })
  }

  const error = (message, options = {}) => {
    return showSnackbar({
      type: 'error',
      message,
      ...options
    })
  }

  const warning = (message, options = {}) => {
    return showSnackbar({
      type: 'warning',
      message,
      ...options
    })
  }

  const info = (message, options = {}) => {
    return showSnackbar({
      type: 'info',
      message,
      ...options
    })
  }

  const clearAll = () => {
    snackbars.value = []
  }

  return {
    snackbars,
    showSnackbar,
    removeSnackbar,
    success,
    error,
    warning,
    info,
    clearAll
  }
}
