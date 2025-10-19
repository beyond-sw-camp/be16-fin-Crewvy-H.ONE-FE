<template>
  <div class="my-info-page">
    <div class="page-header">
      <h1>내 정보</h1>
    </div>

    <el-row :gutter="24">
      <!-- Left Column: Profile & Basic Info -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card class="profile-summary-card">
          <div class="profile-main">
            <el-avatar :size="120" :src="userInfo.profile_url || defaultAvatarSvg" />
            <div class="profile-name-status">
              <h2>{{ userInfo.name }}</h2>
              <el-tag :type="statusTagType" effect="dark" size="small">{{ userInfo.member_status }}</el-tag>
            </div>
            <p>{{ userInfo.department }} / {{ userInfo.title }}</p>
          </div>
          <el-divider />
          <div class="basic-info-list">
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span>{{ userInfo.email }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <div class="info-item-content">
                <span>{{ userInfo.phone_number }}</span>
                <el-tag :type="userInfo.is_phone_number_public ? 'success' : 'info'" size="small" effect="plain">
                  {{ userInfo.is_phone_number_public ? '공개' : '비공개' }}
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <div class="info-item-content">
                <span>{{ userInfo.address }}</span>
                <el-tag :type="userInfo.is_address_disclosure ? 'success' : 'info'" size="small" effect="plain">
                  {{ userInfo.is_address_disclosure ? '공개' : '비공개' }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Right Column: Details -->
      <el-col :xs="24" :sm="24" :md="16">
        <el-card class="details-card">
            <template #header>
                <div class="card-header">
                    <span>상세 정보</span>
                    <el-button type="primary" plain @click="goToEdit">정보 수정</el-button>
                </div>
            </template>
          <div class="info-section">
            <el-descriptions title="인사 정보" :column="2" border class="info-table">
              <el-descriptions-item label="직급">{{ userInfo.grade }}</el-descriptions-item>
              <el-descriptions-item label="사번">{{ userInfo.sabun }}</el-descriptions-item>
              <el-descriptions-item label="입사일">{{ userInfo.start_date }}</el-descriptions-item>
              <el-descriptions-item label="근속 기간">{{ daysWorked }}</el-descriptions-item>
              <el-descriptions-item label="고용형태">
                <el-tag :type="employmentTypeTag" size="small">{{ userInfo.employment_type }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="대표직책">{{ userInfo.default_position }}</el-descriptions-item>
              <el-descriptions-item label="내선번호">{{ userInfo.extension_number }}</el-descriptions-item>
              <el-descriptions-item label="일반전화">{{ userInfo.telNumber }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-section">
            <el-descriptions title="급여 정보" :column="2" border class="info-table">
              <el-descriptions-item label="은행">{{ userInfo.bank }}</el-descriptions-item>
              <el-descriptions-item label="계좌번호">{{ userInfo.bank_account }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import memberService from '../../api/memberService';
import { defaultAvatarSvg } from '@/utils/defaultAvatar.js';

export default {
  name: 'MyInfo',
  data() {
    return {
      defaultAvatarSvg, // Expose to template
      userInfo: {
        email: '',
        name: '',
        phone_number: '',
        is_phone_number_public: false,
        address: '',
        is_address_disclosure: false,
        sabun: '',
        bank: '',
        bank_account: '',
        profile_url: '',
        member_status: '',
        department: '', // Will be mapped from organizationName
        title: '', // Will be mapped from titleName
        grade: '',
        role: '', // This is not in the API response
        start_date: '',
        extension_number: '',
        telNumber: '',
        employment_type: '', // Will be mapped from employmentTypeName
        emergency_contact: '',
        default_position: '' // New field
      }
    };
  },
  computed: {
    statusTagType() {
      switch (this.userInfo.member_status) {
        case '재직': return 'success';
        case '휴직': return 'warning';
        case '파견': return 'primary';
        default: return 'primary';
      }
    },
    employmentTypeTag() {
      switch (this.userInfo.employment_type) {
        case '정규직': return 'success';
        case '계약직': return 'warning';
        case '인턴': return 'primary';
        default: return 'info';
      }
    },
    daysWorked() {
      if (!this.userInfo.start_date) return 'N/A';
      const startDate = new Date(this.userInfo.start_date);
      const today = new Date();
      if (isNaN(startDate.getTime())) return 'N/A';
      const diffTime = Math.abs(today - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays}일`;
    }
  },
  methods: {
    goToEdit() {
      this.$router.push('/my-info/edit');
    },
    async fetchMyPageInfo() {
      try {
        const data = await memberService.getMyPage();
        this.userInfo = {
          email: data.email,
          name: data.memberName,
          phone_number: data.phoneNumber,
          is_phone_number_public: data.phoneNumberPublic,
          address: data.address,
          is_address_disclosure: data.addressDisclosure,
          sabun: data.sabun,
          bank: data.bank,
          bank_account: data.bankAccount,
          profile_url: data.profileUrl,
          member_status: data.memberStatusName,
          department: data.organizationName,
          title: data.titleName,
          grade: data.gradeName,
          role: '', // This is not in the API response
          start_date: data.joinDate,
          extension_number: data.extensionNumber,
          telNumber: data.telNumber,
          employment_type: data.employmentTypeName,
          emergency_contact: data.emergencyContact,
          default_position: data.defaultPosition
        };
      } catch (error) {
        console.error('마이페이지 정보를 가져오는데 실패했습니다.', error);
      }
    }
  },
  created() {
    this.fetchMyPageInfo();
  }
};
</script>

<style scoped>
.my-info-page {
  padding: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 24px;
}

.el-row {
    display: flex;
    flex-wrap: wrap;
}

.el-col {
    margin-bottom: 24px;
}

.el-card {
    height: 100%;
}

/* Left Card */
.profile-summary-card .profile-main {
  text-align: center;
  padding: 10px 0;
}

.profile-name-status {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 16px 0 8px;
}

.profile-summary-card h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.profile-summary-card p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

.basic-info-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 5px;
}

.basic-info-list .info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 15px;
  color: #303133;
}

.basic-info-list .el-icon {
    font-size: 18px;
    color: #606266;
}

/* Right Card */
.details-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-section {
  margin-bottom: 32px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.el-divider {
  margin: 24px 0;
}

.info-table ::v-deep .el-descriptions__table {
  table-layout: fixed !important;
}

.info-table ::v-deep .el-descriptions__label {
  width: 15%;
}

.info-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>