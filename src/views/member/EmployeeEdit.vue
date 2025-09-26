<template>
  <div class="employee-edit-page">
    <div class="page-header">
      <h1>직원 정보 수정</h1>
    </div>

    <el-form ref="form" :model="form" label-width="120px" label-position="top">
      <!-- 계정 설정 -->
      <el-card class="form-section">
        <template #header><span>계정 설정</span></template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="재직 상태">
              <el-select v-model="form.status" placeholder="상태 선택">
                <el-option label="재직" value="active"></el-option>
                <el-option label="휴직" value="inactive"></el-option>
                <el-option label="잠김" value="locked"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="비밀번호 초기화">
              <el-button type="danger" plain @click="resetPassword">비밀번호 초기화</el-button>
              <p class="reset-info">사용자의 이메일로 임시 비밀번호가 발송됩니다.</p>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 계정 정보 -->
      <el-card class="form-section">
        <template #header><span>계정 정보</span></template>
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
      </el-card>

      <!-- 개인 정보 -->
      <el-card class="form-section">
        <template #header><span>개인 정보</span></template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="연락처">
              <el-input v-model="form.phone"></el-input>
            </el-form-item>
          </el-col>
           <el-col :span="12">
            <el-form-item label="입사일">
              <el-date-picker
                v-model="form.joinDate"
                type="date"
                placeholder="입사일 선택"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 급여 정보 -->
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
              <el-input v-model="form.accountNumber"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 직무/역할 정보 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-title-container">
            <span>직무/역할 정보</span>
            <el-button @click="addPosition" type="primary" plain size="small"><el-icon><Plus /></el-icon> 직무 추가</el-button>
          </div>
        </template>
        <div class="positions-list">
          <div v-for="(position, index) in form.positions" :key="index" class="position-item">
            <div class="position-item-header">
              <h4>직무 {{ index + 1 }}</h4>
              <el-button @click="removePosition(index)" type="danger" text v-if="form.positions.length > 1">
                삭제
              </el-button>
            </div>
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
          </div>
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
  name: 'EmployeeEdit',
  data() {
    return {
      form: {
        id: null,
        name: '',
        email: '',
        phone: '',
        joinDate: '',
        status: '',
        bank: '',
        accountNumber: '',
        positions: []
      },
      employees: [
        { id: 1, name: '김철수', email: 'kim@company.com', phone: '010-1234-5678', joinDate: '2020-03-15', status: 'active', bank: '국민은행', accountNumber: '123-456-7890', positions: [{ department: '개발팀', title: '팀장', rank: '팀장', role: 'hr_manager' }] },
        { id: 2, name: '박민수', email: 'park@company.com', phone: '010-2345-6789', joinDate: '2021-07-01', status: 'active', bank: '신한은행', accountNumber: '234-567-8901', positions: [{ department: '개발팀', title: '주임', rank: '주임', role: 'user' }] },
        { id: 3, name: '이지은', email: 'lee@company.com', phone: '010-3456-7890', joinDate: '2022-01-10', status: 'active', bank: '우리은행', accountNumber: '345-678-9012', positions: [{ department: '개발팀', title: '대리', rank: '대리', role: 'user' }, { department: '디자인팀', title: '팀원', rank: '사원', role: 'user' }] },
      ]
    };
  },
  methods: {
    fetchEmployeeData(id) {
      const employee = this.employees.find(emp => emp.id === parseInt(id));
      if (employee) {
        this.form = JSON.parse(JSON.stringify(employee)); // Deep copy
        if (!this.form.positions || this.form.positions.length === 0) {
          this.form.positions = [{ department: '', title: '', rank: '', role: '' }];
        }
      } else {
        this.$message.error('직원 정보를 찾을 수 없습니다.');
        this.$router.push('/employee');
      }
    },
    onSubmit() {
      this.$message.success('직원 정보가 성공적으로 수정되었습니다.');
      this.$router.push('/employee');
    },
    onCancel() {
      this.$router.push('/employee');
    },
    resetPassword() {
      this.$confirm(`'${this.form.name}' 님의 비밀번호를 초기화하시겠습니까?`, '비밀번호 초기화', { confirmButtonText: '확인', cancelButtonText: '취소', type: 'warning' }).then(() => {
        this.$message.success('사용자의 이메일로 임시 비밀번호가 발송되었습니다.');
      });
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
  created() {
    const employeeId = this.$route.params.id;
    this.fetchEmployeeData(employeeId);
  }
};
</script>

<style scoped>
.employee-edit-page {
  max-width: 900px;
  margin: auto;
  padding: 24px;
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

.el-select {
    width: 100%;
}

.reset-info {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
}

.form-actions {
  text-align: right;
  margin-top: 24px;
}

.section-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.positions-list .position-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.positions-list .position-item:last-child {
  margin-bottom: 0;
}

.position-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.position-item-header h4 {
  margin: 0;
  font-size: 16px;
}

</style>