<template>
  <div class="login-page-container">
    <div class="login-form-wrapper">
      <div class="form-header">
        <router-link to="/landing">
          <img src="@/assets/H.ONE_horizontality.png" alt="H.ONE Logo" class="logo" />
        </router-link>
      </div>

      <el-form ref="form" :model="form" :rules="rules" @keyup.enter="handleLogin">
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

        <el-form-item>
          <el-checkbox v-model="rememberMe">로그인 상태 유지</el-checkbox>
        </el-form-item>

        <el-button type="primary" @click="handleLogin" class="login-button">
          로그인
        </el-button>
      </el-form>

      <div class="form-footer">
        <router-link to="/unlock-account">아이디 찾기</router-link>
        <span class="divider">|</span>
        <router-link to="/unlock-account">비밀번호 찾기</router-link>
        <span class="divider">|</span>
        <router-link to="/terms-of-service">회원가입</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      rules: {
        email: [{ required: true, message: ' ', trigger: 'blur' }],
        password: [{ required: true, message: ' ', trigger: 'blur' }]
      },
      rememberMe: false
    };
  },
  methods: {
    handleLogin() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.email === 'admin@h.one' && this.form.password === 'password') {
            this.$message.success('로그인 성공!');
            this.$router.push('/'); // Redirect to dashboard
          } else {
            this.$message.error('아이디 또는 비밀번호가 올바르지 않습니다.');
          }
        } else {
          return false;
        }
      });
    }
  }
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
