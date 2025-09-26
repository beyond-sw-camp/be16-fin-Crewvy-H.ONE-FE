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
            <el-avatar :size="120" :src="userInfo.profile_url" />
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
              <span>{{ userInfo.phone_number }}</span>
            </div>
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <span>{{ userInfo.address }}</span>
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
              <el-descriptions-item label="역할">{{ userInfo.role }}</el-descriptions-item>
              <el-descriptions-item label="내선번호">{{ userInfo.extension_number }}</el-descriptions-item>
              <el-descriptions-item label="입사일">{{ userInfo.start_date }}</el-descriptions-item>
              <el-descriptions-item label="근속 기간">{{ daysWorked }}</el-descriptions-item>
              <el-descriptions-item label="고용형태">{{ userInfo.employment_type }}</el-descriptions-item>
              <el-descriptions-item label="비상연락처">{{ userInfo.emergency_contact }}</el-descriptions-item>
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
export default {
  name: 'MyInfo',
  data() {
    return {
      userInfo: {
        member_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        email: 'hong.gildong@h.one',
        name: '홍길동',
        phone_number: '010-1234-5678',
        is_phone_number_public: true,
        address: '서울시 강남구 테헤란로 123',
        is_address_disclosure: true,
        sabun: '20240001',
        bank: 'H.ONE 은행',
        bank_account: '123-456-789012',
        profile_url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', // Placeholder image
        member_status: '재직',
        company_id: 'f1e2d3c4-b5a6-7890-1234-567890abcdea',
        // From other tables
        department: '개발팀',
        title: '선임 연구원',
        grade: '대리',
        role: '개발자',
        start_date: '2023-01-15',
        extension_number: '1234',
        employment_type: '정규직',
        emergency_contact: '010-8765-4321'
      }
    };
  },
  computed: {
    statusTagType() {
      switch (this.userInfo.member_status) {
        case '재직': return 'success';
        case '휴직': return 'warning';
        case '파견': return 'info';
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
    }
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
</style>