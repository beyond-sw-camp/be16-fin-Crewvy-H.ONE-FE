<template>
  <div v-if="visible" class="snackbar" :class="[`snackbar--${type}`, `snackbar--${position}`, { 'snackbar--visible': visible, 'snackbar--pushing': pushing }]">
    <div class="snackbar__content">
      <div class="snackbar__icon">
        <el-icon v-if="type === 'success'"><Check /></el-icon>
        <el-icon v-else-if="type === 'error'"><Close /></el-icon>
        <el-icon v-else-if="type === 'warning'"><Warning /></el-icon>
        <el-icon v-else-if="type === 'info'"><InfoFilled /></el-icon>
      </div>
      <div class="snackbar__message">
        <div class="snackbar__title" v-if="title">{{ title }}</div>
        <div class="snackbar__text">{{ message }}</div>
      </div>
      <button class="snackbar__close" @click="close">
        <el-icon><Close /></el-icon>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SnackbarComponent',
  emits: ['close'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 4000
    },
    position: {
      type: String,
      default: 'top-center',
      validator: (value) => ['top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right'].includes(value)
    },
    pushing: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.startTimer()
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    startTimer() {
      if (this.duration > 0) {
        setTimeout(() => {
          this.close()
        }, this.duration)
      }
    }
  }
}
</script>

<style scoped>
.snackbar {
  position: fixed;
  z-index: 9999;
  min-width: 300px;
  max-width: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease;
}

.snackbar--top-center {
  transform: translateX(-50%) translateY(-100%);
}

.snackbar--visible {
  transform: translateX(0);
  opacity: 1;
}

.snackbar--top-center.snackbar--visible {
  transform: translateX(-50%) translateY(0);
}

/* 위로 밀어내는 애니메이션 */
.snackbar--pushing {
  transform: translateX(0) translateY(-50%);
  opacity: 0;
}

.snackbar--top-center.snackbar--pushing {
  transform: translateX(-50%) translateY(-50%);
}

.snackbar--top-left {
  top: 20px;
  left: 20px;
}

.snackbar--top-right {
  top: 20px;
  right: 20px;
}

.snackbar--top-center {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.snackbar--bottom-left {
  bottom: 20px;
  left: 20px;
}

.snackbar--bottom-right {
  bottom: 20px;
  right: 20px;
}

.snackbar__content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
  text-align: center;
}

.snackbar__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
}

.snackbar__message {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.snackbar__title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.snackbar__text {
  font-size: 14px;
  line-height: 1.4;
}

.snackbar__close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.snackbar__close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Success */
.snackbar--success {
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
}

.snackbar--success .snackbar__icon {
  background-color: #0ea5e9;
  color: white;
}

.snackbar--success .snackbar__title {
  color: #0c4a6e;
}

.snackbar--success .snackbar__text {
  color: #075985;
}

/* Error */
.snackbar--error {
  background-color: #fef2f2;
  border: 1px solid #ef4444;
}

.snackbar--error .snackbar__icon {
  background-color: #ef4444;
  color: white;
}

.snackbar--error .snackbar__title {
  color: #991b1b;
}

.snackbar--error .snackbar__text {
  color: #dc2626;
}

/* Warning */
.snackbar--warning {
  background-color: #fffbeb;
  border: 1px solid #f59e0b;
}

.snackbar--warning .snackbar__icon {
  background-color: #f59e0b;
  color: white;
}

.snackbar--warning .snackbar__title {
  color: #92400e;
}

.snackbar--warning .snackbar__text {
  color: #d97706;
}

/* Info */
.snackbar--info {
  background-color: #f0f9ff;
  border: 1px solid #3b82f6;
}

.snackbar--info .snackbar__icon {
  background-color: #3b82f6;
  color: white;
}

.snackbar--info .snackbar__title {
  color: #1e40af;
}

.snackbar--info .snackbar__text {
  color: #2563eb;
}
</style>
