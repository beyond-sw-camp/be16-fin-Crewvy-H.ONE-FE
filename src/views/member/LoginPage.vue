<template>
  <div class="login-page-container">
    <div class="login-form-wrapper">
      <div class="form-header">
        <router-link to="/landing">
          <img src="@/assets/H.ONE_horizontality.png" alt="H.ONE Logo" class="logo" />
        </router-link>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="이메일 주소">
            <template #prepend>ID</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="form.password" placeholder="비밀번호" show-password>
            <template #prepend>PW</template>
          </el-input>
        </el-form-item>



        <el-button type="primary" @click="handleLogin" class="login-button" :loading="loading">
          로그인
        </el-button>
      </el-form>

      <div class="form-footer">
        <a href="#" @click.prevent="openPasswordResetModal">비밀번호 재설정</a>
        <span class="divider">|</span>
        <router-link to="/terms-of-service">회원가입</router-link>
      </div>
    </div>
    <PasswordResetModal ref="passwordResetModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';
import { useSnackbar } from '@/composables/useSnackbar';
import PasswordResetModal from '@/components/member/PasswordResetModal.vue';

const router = useRouter();
const store = useStore();
const { success, error } = useSnackbar();

const formRef = ref(null);
const passwordResetModal = ref(null); // Add ref for the modal
const form = ref({
  email: '',
  password: ''
});
const rules = ref({
  email: [{ required: true, message: '이메일을 입력해주세요.', trigger: 'blur' }],
  password: [{ required: true, message: '비밀번호를 입력해주세요.', trigger: 'blur' }]
});

const loading = ref(false);

const openPasswordResetModal = () => {
  passwordResetModal.value.open();
};

const handleLogin = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/login`, {
          email: form.value.email,
          password: form.value.password
        });

        if (response.data && response.data.success) {
          const { accessToken, refreshToken, userName, memberId, memberPositionId } = response.data.data;

          // 로컬 스토리지에 사용자 정보 저장
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("userName", userName);
          localStorage.setItem("memberId", memberId);
          localStorage.setItem("memberPositionId", memberPositionId);

          // Vuex 스토어에 사용자 정보 저장
          const user = { userName, memberId, memberPositionId };
          store.dispatch('setUser', user);

          success('로그인 성공!');
          router.push('/'); // 대시보드로 리디렉션
        } else {
          error(response.data.message || '로그인에 실패했습니다.');
        }
      } catch (err) {
        console.error(err);
        const errorMessage = err.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
        error(errorMessage);
      } finally {
        loading.value = false;
      }
    } else {
      return false;
    }
  });
};
</script>

<style scoped>
.login-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-form-wrapper {
  width: 600px;
  max-width: 90%;
  padding: 50px 70px;
  background: #fff;
  border-radius: 8px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header .logo {
  height: 80px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input {
  height: 55px;
  font-size: 16px;
}

.login-button {
  width: 100%;
  height: 65px;
  border-radius: 10px;
  font-size: 24px;
  font-weight: 500;
  margin-top: 10px;
}

.form-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 16px;
  color: #767676;
}

.form-footer a {
  color: #767676;
  text-decoration: none;
  margin: 0 10px;
}

.form-footer a:hover {
  text-decoration: underline;
}

.form-footer .divider {
  color: #dcdfe6;
}
</style>

<style>
/* Using a global style tag to override element-plus component styles */
.login-form-wrapper .el-input-group__prepend {
  background-color: white !important;
  border: none;
  border-right: 1px solid #dcdfe6;
  width: 60px;
  font-weight: 700;
  font-size: 20px;
  color: #767676;
}

.login-form-wrapper .el-input__inner {
  border-left: none;
}

.login-form-wrapper .el-input-group {
  border: 2px solid #E4EFF8;
  border-radius: 4px;
}

.login-form-wrapper .el-input-group .el-input__inner:focus {
  box-shadow: none;
}

.login-form-wrapper .el-form-item.is-error .el-input-group {
  border-color: #f56c6c;
}
</style>