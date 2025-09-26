<template>
  <div class="signup-page-container">
    <div class="signup-form-wrapper">
      <div class="form-header">
        <router-link to="/landing">
          <img src="@/assets/H.ONE_horizontality.png" alt="H.ONE Logo" class="logo" />
        </router-link>
      </div>

      <el-form ref="form" :model="form" :rules="rules" label-width="140px" label-position="left">
        <el-form-item label="회사명" prop="companyName">
          <el-input v-model="form.companyName"></el-input>
        </el-form-item>
        <el-form-item label="사업자 등록번호" prop="businessNumber">
          <el-input v-model="form.businessNumber" placeholder="- 없이 숫자만 입력"></el-input>
        </el-form-item>
        <el-form-item label="대표자명" prop="representativeName">
          <el-input v-model="form.representativeName"></el-input>
        </el-form-item>
        <el-form-item label="회사 이메일" prop="email">
          <el-input v-model="form.email">
            <template #append>
              <el-button @click="checkEmailDuplicate">중복확인</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="비밀번호" prop="password">
          <el-input type="password" v-model="form.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="비밀번호 확인" prop="passwordConfirm">
          <el-input type="password" v-model="form.passwordConfirm" show-password></el-input>
        </el-form-item>

        <el-button type="primary" @click="handleSignUp" class="signup-button">
          가입하기
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignUpPage',
  data() {
    const validatePassConfirm = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('비밀번호를 다시 한번 입력해주세요.'));
      } else if (value !== this.form.password) {
        callback(new Error('비밀번호가 일치하지 않습니다.'));
      } else {
        callback();
      }
    };
    return {
      form: {
        companyName: '',
        businessNumber: '',
        representativeName: '',
        email: '',
        password: '',
        passwordConfirm: ''
      },
      rules: {
        companyName: [{ required: true, message: '회사명을 입력해주세요.', trigger: 'blur' }],
        businessNumber: [{ required: true, message: '사업자 등록번호를 입력해주세요.', trigger: 'blur' }],
        representativeName: [{ required: true, message: '대표자명을 입력해주세요.', trigger: 'blur' }],
        email: [
          { required: true, message: '이메일을 입력해주세요.', trigger: 'blur' },
          { type: 'email', message: '올바른 이메일 형식이 아닙니다.', trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: '비밀번호를 입력해주세요.', trigger: 'blur' },
          { min: 8, message: '비밀번호는 8자 이상이어야 합니다.', trigger: 'blur' }
        ],
        passwordConfirm: [{ required: true, validator: validatePassConfirm, trigger: 'blur' }]
      }
    };
  },
  methods: {
    checkEmailDuplicate() {
      if (this.form.email) {
        this.$message.success('사용 가능한 이메일입니다.');
      }
    },
    handleSignUp() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$message.success('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
          this.$router.push('/login');
        } else {
          return false;
        }
      });
    }
  }
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
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header .logo {
  height: 60px;
  margin-bottom: 10px;
}

.signup-form-wrapper h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 30px;
  text-align: center;
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

.form-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.form-footer a {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
