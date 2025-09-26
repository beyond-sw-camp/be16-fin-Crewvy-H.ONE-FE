<template>
  <div class="my-info-edit-page">
    <div class="page-header">
      <h1>내 정보 수정</h1>
    </div>

    <el-form ref="form" :model="form" label-width="120px" label-position="top">
      <el-card class="form-section">
        <template #header><span>기본 정보</span></template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="이름">
              <el-input v-model="form.name" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="이메일">
              <el-input v-model="form.email" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="고용형태">
              <el-input v-model="form.employment_type" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="연락처">
              <el-input v-model="form.phone_number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="비상연락처">
              <el-input v-model="form.emergency_contact"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="내선번호">
              <el-input v-model="form.extension_number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="주소">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="공개 설정">
          <el-checkbox v-model="form.is_phone_number_public">연락처 공개</el-checkbox>
          <el-checkbox v-model="form.is_address_disclosure">주소 공개</el-checkbox>
        </el-form-item>
      </el-card>

      <el-card class="form-section">
        <template #header><span>급여 정보</span></template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="은행">
              <el-input v-model="form.bank"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="계좌번호">
              <el-input v-model="form.bank_account"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="form-section">
        <template #header><span>비밀번호 변경</span></template>
        <el-form-item label="현재 비밀번호">
          <el-input type="password" v-model="passwordChange.current"></el-input>
        </el-form-item>
        <el-form-item label="새 비밀번호">
          <el-input type="password" v-model="passwordChange.new"></el-input>
        </el-form-item>
        <el-form-item label="새 비밀번호 확인">
          <el-input type="password" v-model="passwordChange.confirm"></el-input>
        </el-form-item>
      </el-card>

      <el-card class="form-section">
        <template #header><span>프로필 사진</span></template>
        <div class="profile-picture-section">
            <el-avatar :size="100" :src="form.profile_url" />
            <el-upload
                class="avatar-uploader"
                action="#" 
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
            >
                <el-button type="primary">사진 변경</el-button>
            </el-upload>
        </div>
      </el-card>

      <div class="form-actions">
        <el-button @click="onCancel">취소</el-button>
        <el-button type="primary" @click="onSubmit">저장</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'MyInfoEdit',
  data() {
    return {
      form: {
        name: '홍길동',
        email: 'hong.gildong@h.one',
        phone_number: '010-1234-5678',
        is_phone_number_public: true,
        address: '서울시 강남구 테헤란로 123',
        is_address_disclosure: true,
        bank: 'H.ONE 은행',
        bank_account: '123-456-789012',
        profile_url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', // Placeholder
        extension_number: '1234',
        employment_type: '정규직',
        emergency_contact: '010-8765-4321'
      },
      passwordChange: {
        current: '',
        new: '',
        confirm: ''
      }
    };
  },
  methods: {
    onSubmit() {
      // Add validation logic here
      console.log('Form submitted:', this.form);
      console.log('Password change:', this.passwordChange);
      this.$message.success('정보가 성공적으로 저장되었습니다.');
      this.$router.push('/my-info');
    },
    onCancel() {
      this.$router.push('/my-info');
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG && !isPNG) {
        this.$message.error('JPG 또는 PNG 형식의 이미지만 업로드할 수 있습니다.');
        return false;
      }
      if (!isLt2M) {
        this.$message.error('이미지 크기는 2MB를 초과할 수 없습니다.');
        return false;
      }
      
      // Read the file and set it as the avatar source
      const reader = new FileReader();
      reader.onload = (e) => {
        this.form.profile_url = e.target.result;
      };
      reader.readAsDataURL(file);

      return false; // Prevent auto-upload
    }
  }
};
</script>

<style scoped>
.my-info-edit-page {
  padding: 24px;
  max-width: 800px;
  margin: auto;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.profile-picture-section {
    display: flex;
    align-items: center;
    gap: 20px;
}

.form-actions {
  text-align: right;
  margin-top: 24px;
}

.el-form-item {
    margin-bottom: 20px;
}

.el-form-item[label-position="top"] .el-form-item__label {
    padding-bottom: 4px;
    font-weight: 600;
}
</style>
