<template>
  <div class="add-employee-page">
    <div class="page-header">
      <h1>직원 추가</h1>
    </div>

    <el-card class="form-card">
      <el-form ref="employeeForm" :model="form" label-position="top">
        <!-- 계정 정보 -->
        <h2 class="section-title">계정 정보</h2>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="이메일">
              <el-input v-model="form.email" placeholder="이메일">
                <template #append>
                  <el-button>중복확인</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="비밀번호">
              <el-input v-model="form.password" placeholder="비밀번호">
                <template #append>
                  <el-button>자동생성</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 개인 정보 -->
        <h2 class="section-title">개인 정보</h2>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="이름">
              <el-input v-model="form.name" placeholder="이름"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="생년월일">
              <el-date-picker v-model="form.birthDate" type="date" placeholder="생년월일 선택" style="width: 100%;"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="휴대폰 번호">
              <el-input v-model="form.phone" placeholder="휴대폰 번호"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="비상연락처">
              <el-input v-model="form.emergencyContact" placeholder="비상연락처"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="자택 주소">
              <el-input v-model="form.address" placeholder="자택 주소"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 급여 정보 -->
        <h2 class="section-title">급여 정보</h2>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="은행">
              <el-input v-model="form.bank"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="계좌번호">
              <el-input v-model="form.accountNumber"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 직무 정보 -->
        <div class="section-title-container">
          <h2 class="section-title">직무/역할 정보</h2>
          <el-button @click="addPosition" type="primary" plain size="small"><el-icon><Plus /></el-icon> 직무 추가</el-button>
        </div>
        
        <div class="positions-list">
          <el-card v-for="(position, index) in form.positions" :key="index" class="position-card">
            <template #header>
              <div class="position-card-header">
                <span>직무 {{ index + 1 }}</span>
                <el-button @click="removePosition(index)" type="danger" text v-if="form.positions.length > 1">
                  삭제
                </el-button>
              </div>
            </template>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="부서">
                  <el-input v-model="position.department" placeholder="부서명">
                    <template #append>
                      <el-button>조직도에서 선택</el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="직책">
                  <el-select v-model="position.title" placeholder="직책 선택" style="width: 100%;">
                    <el-option label="팀원" value="팀원"></el-option>
                    <el-option label="팀장" value="팀장"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="직급">
                  <el-select v-model="position.rank" placeholder="직급 선택" style="width: 100%;">
                    <el-option label="사원" value="사원"></el-option>
                    <el-option label="주임" value="주임"></el-option>
                    <el-option label="대리" value="대리"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="역할">
                  <el-select v-model="position.role" placeholder="역할 선택" style="width: 100%;">
                    <el-option label="일반 사용자" value="user"></el-option>
                    <el-option label="인사 관리자" value="hr_manager"></el-option>
                    <el-option label="시스템 관리자" value="admin"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>
        </div>

      </el-form>
    </el-card>

    <div class="form-actions">
      <el-button @click="handleCancel">취소</el-button>
      <el-button type="primary" @click="handleSubmit">직원 추가</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddEmployee',
  data() {
    return {
      form: {
        email: '',
        password: '',
        name: '',
        employeeId: '',
        phone: '',
        emergencyContact: '',
        birthDate: '',
        address: '',
        bank: '',
        accountNumber: '',
        positions: [
          { department: '', title: '', rank: '', role: '' }
        ]
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$message.success('새로운 직원이 추가되었습니다.');
      console.log('Form Submitted', this.form);
      this.$router.push('/employee');
    },
    handleCancel() {
      this.$router.push('/employee');
    },
    addPosition() {
      this.form.positions.push({ department: '', title: '', rank: '', role: '' });
    },
    removePosition(index) {
      if (this.form.positions.length > 1) {
        this.form.positions.splice(index, 1);
      }
    }
  },
};
</script>

<style scoped>
.add-employee-page {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 24px;
}

.form-card {
  padding: 12px 24px 24px;
  border-radius: 8px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.section-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.section-title-container .section-title {
    border-bottom: none;
    margin-bottom: 0;
}

.positions-list .position-card {
  margin-bottom: 20px;
}

.positions-list .position-card:last-child {
  margin-bottom: 0;
}

.position-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.position-card-header span {
  font-weight: 600;
}

.el-form-item {
  margin-bottom: 20px;
}

::v-deep(.el-form-item__label) {
  font-weight: 500 !important;
  color: #606266 !important;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
  gap: 10px;
}
</style>