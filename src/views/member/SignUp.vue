<template>
  <div class="signup-page-container">
    <div class="signup-form-wrapper">
      <div class="form-header">
        <router-link to="/landing">
          <img src="@/assets/H.ONE_horizontality.png" alt="H.ONE Logo" class="logo" />
        </router-link>
        <h2>대표계정 회원가입</h2>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" label-position="left">
        <el-form-item label="회사명" prop="companyName">
          <el-input v-model="form.companyName" placeholder="회사명을 입력해주세요."></el-input>
        </el-form-item>
        <el-form-item label="사업자 등록번호" prop="businessNumber">
          <el-input v-model="form.businessNumber" placeholder="- 없이 숫자만 입력">
            <template #append>
              <el-button @click="verifyBusinessNumber">확인</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="대표자명" prop="name">
          <el-input v-model="form.name" placeholder="대표자 이름을 입력해주세요."></el-input>
        </el-form-item>
        <el-form-item label="이메일" prop="email">
          <el-input v-model="form.email" placeholder="로그인에 사용할 이메일 주소" @input="onEmailInput">
            <template #append>
              <el-button @click="checkEmailDuplicate">중복확인</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="비밀번호" prop="password">
          <el-input type="password" v-model="form.password" show-password placeholder="8자 이상 입력해주세요."></el-input>
        </el-form-item>
        <el-form-item label="비밀번호 확인" prop="checkPw">
          <el-input type="password" v-model="form.checkPw" show-password placeholder="비밀번호를 다시 입력해주세요."></el-input>
        </el-form-item>

        <el-button type="primary" @click="handleSignUp" class="signup-button" :loading="loading" :disabled="!isEmailVerified">
          가입하기
        </el-button>
        <p v-if="!isEmailVerified" class="email-verification-prompt">이메일 중복확인을 진행해주세요.</p>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useSnackbar } from '@/composables/useSnackbar';

const router = useRouter();
const { success, error } = useSnackbar();

const formRef = ref(null);
const loading = ref(false);
const isEmailVerified = ref(false);

const form = reactive({
  companyName: '',
  businessNumber: '',
  name: '',
  email: '',
  password: '',
  checkPw: ''
});

const onEmailInput = () => {
  isEmailVerified.value = false;
};

const validatePassConfirm = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('비밀번호를 다시 한번 입력해주세요.'));
  } else if (value !== form.password) {
    callback(new Error('비밀번호가 일치하지 않습니다.'));
  } else {
    callback();
  }
};

const rules = reactive({
  companyName: [{ required: true, message: '회사명을 입력해주세요.', trigger: 'blur' }],
  businessNumber: [{ required: true, message: '사업자 등록번호를 입력해주세요.', trigger: 'blur' }],
  name: [{ required: true, message: '대표자명을 입력해주세요.', trigger: 'blur' }],
  email: [
    { required: true, message: '이메일을 입력해주세요.', trigger: 'blur' },
    { type: 'email', message: '올바른 이메일 형식이 아닙니다.', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '비밀번호를 입력해주세요.', trigger: 'blur' },
    { min: 8, message: '비밀번호는 8자 이상이어야 합니다.', trigger: 'blur' }
  ],
  checkPw: [{ required: true, validator: validatePassConfirm, trigger: 'blur' }]
});

const verifyBusinessNumber = () => {
  // 추후 국세청 API 연동
  if (form.businessNumber) {
    success('정상적인 사업자번호입니다.');
  } else {
    error('사업자 등록번호를 입력해주세요.');
  }
};

const checkEmailDuplicate = async () => {
  if (!form.email) {
    error('이메일을 먼저 입력해주세요.');
    return;
  }
  // 이메일 형식 유효성 검사
  const emailRule = rules.email.find(r => r.type === 'email');
  if (emailRule && !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(form.email)) {
      error(emailRule.message);
      return;
  }

  try {
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/check-email`, {
        params: { email: form.email }
      });
    // response.data.data에 boolean 값이 담겨 옴
    if (response.data.data) { // true이면 이미 존재
      error('이미 사용 중인 이메일입니다.');
      isEmailVerified.value = false;
    } else { // false이면 사용 가능
      success('사용 가능한 이메일입니다.');
      isEmailVerified.value = true;
    }
  } catch (err) {
    console.error(err);
    error('이메일 중복 확인 중 오류가 발생했습니다.');
    isEmailVerified.value = false;
  }
};

const handleSignUp = async () => {
  if (!formRef.value) return;

  if (!isEmailVerified.value) {
    error('이메일 중복확인을 먼저 진행해주세요.');
    return;
  }

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;

      const formData = new FormData();
      formData.append('companyName', form.companyName);
      formData.append('businessNumber', form.businessNumber);
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('checkPw', form.checkPw);

      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/create-admin`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data && response.data.success) {
          success('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
          router.push('/login');
        } else {
          error(response.data.message || '회원가입에 실패했습니다.');
        }
      } catch (err) {
        console.error(err);
        const errorMessage = err.response?.data?.message || '서버 오류가 발생했습니다.';
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
.signup-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px 0;
  background-color: #f5f7fa;
}

.signup-form-wrapper {
  width: 650px;
  max-width: 90%;
  padding: 50px 70px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header .logo {
  height: 60px;
  margin-bottom: 10px;
}

.form-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.el-form-item {
  margin-bottom: 22px;
}

.signup-button {
  width: 100%;
  height: 55px;
  font-size: 20px;
  font-weight: 500;
  margin-top: 20px;
}

.email-verification-prompt {
    text-align: center;
    color: #f56c6c;
    font-size: 12px;
    margin-top: 10px;
}
</style>