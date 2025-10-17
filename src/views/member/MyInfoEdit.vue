<template>
  <div class="my-info-edit-page">
    <div class="page-header">
      <h1>내 정보 수정</h1>
    </div>

    <el-form ref="form" :model="form" label-width="120px" label-position="top">

      <!-- 기본 정보 -->
      <el-card class="form-section">
        <template #header><span>기본 정보</span></template>
        <el-row :gutter="32">
          <!-- Left Column (Profile Picture) -->
          <el-col :xs="24" :sm="8" :md="6" class="profile-col">
            <el-form-item>
               <div class="profile-picture-container">
                <el-avatar :size="150" :src="form.profileUrl || defaultAvatarSvg" />
                <el-upload
                    class="profile-image-uploader"
                    action="#"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                >
                  <el-icon><Edit /></el-icon>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
          <!-- Right Column (Fields) -->
          <el-col :xs="24" :sm="16" :md="18">
            <el-form-item class="form-item-with-toggle">
              <template #label>
                <div class="label-with-toggle">
                  <span>연락처</span>
                  <el-switch v-model="form.isPhoneNumberPublic" active-text="공개" inactive-text="비공개" inline-prompt size="small" />
                </div>
              </template>
              <el-input v-model="form.phoneNumber" placeholder="- 없이 입력"></el-input>
            </el-form-item>
            <el-form-item label="비상연락처">
              <el-input v-model="form.emergencyContact"></el-input>
            </el-form-item>
            <el-form-item class="form-item-with-toggle">
              <template #label>
                <div class="label-with-toggle">
                  <span>주소</span>
                  <el-switch v-model="form.isAddressDisclosure" active-text="공개" inactive-text="비공개" inline-prompt size="small" />
                </div>
              </template>
              <el-input v-model="form.address"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 인사 정보 -->
      <el-card class="form-section">
        <template #header><span>인사 정보</span></template>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="은행명">
              <el-input v-model="form.bank"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="계좌번호">
              <el-input v-model="form.bankAccount"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="내선전화">
              <el-input v-model="form.extensionNumber"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="일반전화">
              <el-input v-model="form.telNumber"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 비밀번호 변경 -->
      <el-card class="form-section">
        <template #header><span>비밀번호 변경</span></template>
        <el-form-item label="현재 비밀번호">
          <el-input type="password" v-model="form.currentPassword" show-password></el-input>
        </el-form-item>
        <el-form-item label="새 비밀번호">
          <el-input type="password" v-model="form.newPassword" show-password></el-input>
        </el-form-item>
        <el-form-item label="새 비밀번호 확인">
          <el-input type="password" v-model="form.confirmPassword" show-password></el-input>
        </el-form-item>
      </el-card>

      <div class="form-actions">
        <el-button @click="onCancel">취소</el-button>
        <el-button type="primary" @click="onSubmit">저장</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import memberService from '../../api/memberService';
import { Edit } from '@element-plus/icons-vue';

import { defaultAvatarSvg } from '@/utils/defaultAvatar.js';

export default {
  name: 'MyInfoEdit',
  components: {
    Edit
  },
  data() {
    return {
      defaultAvatarSvg, // Expose to template
      form: {
        profileUrl: '',
        phoneNumber: '',
        isPhoneNumberPublic: false,
        emergencyContact: '',
        extensionNumber: '',
        telNumber: '',
        address: '',
        isAddressDisclosure: false,
        bank: '',
        bankAccount: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    };
  },
  methods: {
    async onSubmit() {
      try {
        if (this.form.newPassword && this.form.newPassword !== this.form.confirmPassword) {
          this.$message.error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
          return;
        }
        
        await memberService.updateMyInfo(this.form);
        this.$message.success('정보가 성공적으로 저장되었습니다.');
        this.$router.push('/my-info');
      } catch (error) {
        console.error('정보 저장에 실패했습니다:', error);
        const errorMessage = error.response?.data?.message || '정보 저장에 실패했습니다. 다시 시도해주세요.';
        this.$message.error(errorMessage);
      }
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
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.form.profileUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      return false; 
    },
    async fetchMyInfo() {
        try {
            const data = await memberService.getMyPage();
            this.form.profileUrl = data.profileUrl;
            this.form.phoneNumber = data.phoneNumber;
            this.form.isPhoneNumberPublic = data.phoneNumberPublic;
            this.form.emergencyContact = data.emergencyContact;
            this.form.extensionNumber = data.extensionNumber;
            this.form.telNumber = data.telNumber;
            this.form.address = data.address;
            this.form.isAddressDisclosure = data.addressDisclosure;
            this.form.bank = data.bank;
            this.form.bankAccount = data.bankAccount;
        } catch (error) {
            console.error("내 정보를 불러오는데 실패했습니다:", error);
            this.$message.error("정보를 불러오는데 실패했습니다.");
        }
    }
  },
  created() {
    this.fetchMyInfo();
  }
};
</script>

<style scoped>
.profile-col {
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-item-with-toggle :deep(.el-form-item__label) {
  width: 100%;
}

.label-with-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.profile-picture-container {
  position: relative;
  width: 150px;
  height: 150px;
}

.profile-image-uploader {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.profile-image-uploader:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.profile-image-uploader .el-icon {
  color: white;
  font-size: 20px;
}

.my-info-edit-page {
  padding: 24px;
  max-width: 900px;
  margin: auto;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.form-actions {
  text-align: right;
  margin-top: 24px;
}

.el-form-item {
    margin-bottom: 22px;
}

.el-form--label-top .el-form-item__label {
    padding-bottom: 8px;
    font-weight: 600;
}
</style>