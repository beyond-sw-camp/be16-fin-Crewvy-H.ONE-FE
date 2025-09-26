<template>
  <div class="unlock-page-container">
    <div class="unlock-form-wrapper">
      <div class="form-header">
        <h2>계정 잠금 해제</h2>
        <p>정보를 입력하여 계정 잠금을 해제하세요.</p>
      </div>

      <el-form ref="form" :model="form" :rules="rules" label-position="top">
        <el-form-item label="이름" prop="name">
          <el-input v-model="form.name" placeholder="가입 시 등록한 이름"></el-input>
        </el-form-item>
        <el-form-item label="이메일" prop="email">
          <el-input v-model="form.email" placeholder="가입 시 등록한 이메일"></el-input>
        </el-form-item>

        <el-button type="primary" @click="sendCode" :disabled="codeSent" style="width: 100%; margin-bottom: 20px;">
          {{ codeSent ? `${timer}초 후 재전송` : '인증번호 발송' }}
        </el-button>

        <el-form-item v-if="codeSent" label="인증번호" prop="code">
          <el-input v-model="form.code" placeholder="이메일로 발송된 인증번호 6자리"></el-input>
        </el-form-item>

        <el-button type="success" @click="unlockAccount" :disabled="!form.code" style="width: 100%;">
          계정 잠금 해제
        </el-button>
      </el-form>

      <div class="form-footer">
        <router-link to="/login">로그인으로 돌아가기</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountUnlock',
  data() {
    return {
      form: {
        name: '',
        email: '',
        code: ''
      },
      rules: {
        name: [{ required: true, message: '이름을 입력해주세요.', trigger: 'blur' }],
        email: [
          { required: true, message: '이메일을 입력해주세요.', trigger: 'blur' },
          { type: 'email', message: '올바른 이메일 형식이 아닙니다.', trigger: ['blur', 'change'] }
        ],
        code: [{ required: true, message: '인증번호를 입력해주세요.', trigger: 'blur' }]
      },
      codeSent: false,
      timer: 60,
      interval: null,
      mockVerificationCode: '123456' // In a real app, this would be generated and sent by the server
    };
  },
  methods: {
    sendCode() {
      this.$refs.form.validateField('name');
      this.$refs.form.validateField('email', (isValid) => {
        if (isValid) {
          this.$message.success(`'${this.form.email}'로 인증번호가 발송되었습니다.`);
          this.codeSent = true;
          this.startTimer();
        }
      });
    },
    startTimer() {
      this.interval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          clearInterval(this.interval);
          this.codeSent = false;
          this.timer = 60;
        }
      }, 1000);
    },
    unlockAccount() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.code === this.mockVerificationCode) {
            this.$alert('계정 잠금이 해제되었습니다. 이제 로그인할 수 있습니다.', '성공', {
              confirmButtonText: '로그인으로 이동',
              type: 'success',
              callback: () => {
                this.$router.push('/login');
              }
            });
          } else {
            this.$message.error('인증번호가 올바르지 않습니다.');
          }
        }
      });
    }
  },
  beforeUnmount() {
    clearInterval(this.interval);
  }
};
</script>

<style scoped>
.unlock-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.unlock-form-wrapper {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-header p {
  color: #606266;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.form-footer a {
  color: #409eff;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
