<template>
  <el-dialog
    v-model="dialogVisible"
    title="비밀번호 재설정"
    width="40%"
    :before-close="handleClose"
    center
  >
    <div class="dialog-description">
      <p>가입 시 사용한 이메일 주소를 입력해주세요.</p>
      <p>해당 이메일로 임시 비밀번호가 발송됩니다.</p>
    </div>
    <el-form :model="form" :rules="rules" ref="formRef" @keyup.enter="handleSubmit">
      <el-form-item prop="email">
        <el-input v-model="form.email" placeholder="이메일 주소">
          <template #prefix>
            <el-icon><Message /></el-icon>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">취소</el-button>
        <el-button type="primary" @click="handleSubmit">재설정</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
/* global defineExpose */
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import employeeService from '@/api/employeeService';
import { Message } from '@element-plus/icons-vue';

const dialogVisible = ref(false);
const formRef = ref(null);
const form = reactive({
  email: '',
});

const rules = reactive({
  email: [
    { required: true, message: '이메일 주소를 입력해주세요.', trigger: 'blur' },
    { type: 'email', message: '올바른 이메일 형식이 아닙니다.', trigger: ['blur', 'change'] },
  ],
});

const open = () => {
  dialogVisible.value = true;
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const handleClose = () => {
  dialogVisible.value = false;
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await employeeService.resetPassword(form.email);
        ElMessage.success('비밀번호 재설정 메일이 발송되었습니다. 이메일을 확인해주세요.');
        handleClose();
      } catch (error) {
        console.error('비밀번호 재설정 실패:', error);
        ElMessage.error(error.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
      }
    }
  });
};

defineExpose({ open });
</script>

<style scoped>
.dialog-description {
  margin-bottom: 20px;
  text-align: center;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.dialog-description p {
  margin: 0;
}

.el-input {
  height: 40px;
}

.el-input__prefix {
  display: flex;
  align-items: center;
  left: 10px;
}

.el-input__icon {
  font-size: 18px;
  color: #909399;
}
</style>