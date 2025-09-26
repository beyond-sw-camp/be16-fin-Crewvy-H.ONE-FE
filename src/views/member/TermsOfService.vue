<template>
  <div class="terms-page-container">
    <div class="terms-form-wrapper">
      <div class="form-header">
        <router-link to="/landing">
          <img src="@/assets/H.ONE_horizontality.png" alt="H.ONE Logo" class="logo" />
        </router-link>
        <h2>대표계정 회원가입</h2>
        <p>H.ONE 서비스 이용을 위해 대표계정 가입 약관에 동의해주세요.</p>
      </div>

      <div class="terms-content">
        <el-checkbox v-model="agreeAll" @change="handleAgreeAll">전체 동의</el-checkbox>
        <el-divider></el-divider>
        <div class="term-item" v-for="term in terms" :key="term.id">
          <el-checkbox v-model="term.agreed">{{ term.title }}</el-checkbox>
          <a href="#" @click.prevent="viewTerm(term)">내용 보기</a>
        </div>
      </div>

      <el-button type="primary" @click="goToNextStep" :disabled="!isNextButtonEnabled"
        style="width: 100%; margin-top: 20px;">
        다음
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TermsOfService',
  data() {
    return {
      agreeAll: false,
      terms: [
        { id: 1, title: '[필수] 이용약관', required: true, agreed: false, content: '이용약관 내용입니다...' },
        { id: 2, title: '[필수] 개인정보 수집 및 이용 동의', required: true, agreed: false, content: '개인정보 수집 및 이용 동의 내용입니다...' },
        { id: 3, title: '[선택] 마케팅 정보 수신 동의', required: false, agreed: false, content: '마케팅 정보 수신 동의 내용입니다...' }
      ]
    };
  },
  computed: {
    isNextButtonEnabled() {
      return this.terms.filter(t => t.required).every(t => t.agreed);
    }
  },
  watch: {
    terms: {
      handler() {
        if (this.terms.every(t => t.agreed)) {
          this.agreeAll = true;
        } else if (this.terms.some(t => !t.agreed)) {
          this.agreeAll = false;
        }
      },
      deep: true
    }
  },
  methods: {
    handleAgreeAll(value) {
      this.terms.forEach(term => term.agreed = value);
    },
    viewTerm(term) {
      this.$alert(term.content, term.title, {
        confirmButtonText: '확인'
      });
    },
    goToNextStep() {
      if (this.isNextButtonEnabled) {
        this.$router.push('/signup');
      }
    }
  }
};
</script>

<style scoped>
.terms-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.terms-form-wrapper {
  width: 500px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header .logo {
  height: 40px;
  margin-bottom: 20px;
}

.form-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-header p {
  color: #606266;
}

.terms-content {
  border: 1px solid #dcdfe6;
  padding: 20px;
  border-radius: 4px;
}

.term-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
}

.term-item a {
  font-size: 14px;
  color: #909399;
  text-decoration: none;
}

.term-item a:hover {
  text-decoration: underline;
}
</style>
