<template>
  <el-dialog
    v-model="visible"
    title="토큰 만료"
    width="350px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    center
    destroy-on-close
  >
    <div class="modal-body-content">
      <el-icon :size="48" color="#E6A23C">
        <WarningFilled />
      </el-icon>
      <h3>토큰이 만료되었습니다.</h3>
      <p>
        안전한 서비스 이용을 위해<br />
        다시 로그인해주세요.
      </p>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button 
          type="primary" 
          @click="handleConfirm" 
          style="width: 100%;"
        >
          로그인 페이지로 이동
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
// ✨ <script setup> 대신 일반 <script>를 사용합니다.
import { WarningFilled } from '@element-plus/icons-vue';

export default {
  name: 'SessionExpiredModal',
  // 아이콘 컴포넌트를 등록합니다.
  components: {
    WarningFilled,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:modelValue', 'confirm'],
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
  },
};
</script>

<style scoped>
/* 스타일은 동일합니다 */
.modal-body-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px 0;
}
.modal-body-content .el-icon {
  margin-bottom: 20px;
}
.modal-body-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}
.modal-body-content p {
  font-size: 0.9rem;
  color: #606266;
  margin: 0;
  line-height: 1.5;
}
</style>