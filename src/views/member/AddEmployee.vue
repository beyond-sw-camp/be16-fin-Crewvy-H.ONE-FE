<template>
  <div class="add-employee-page">
    <div class="page-header">
      <h1>직원 추가</h1>
    </div>

    <el-card class="form-card">
      <el-form ref="employeeForm" :model="form" :rules="rules" label-position="top">
        <!-- 계정 정보 -->
        <h2 class="section-title">계정 정보</h2>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="이메일" prop="email">
              <el-input v-model="form.email" placeholder="이메일">
                <template #append>
                  <el-button @click="checkEmail">중복확인</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="비밀번호" prop="password">
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
            <el-form-item label="이름" prop="name">
              <el-input v-model="form.name" placeholder="이름"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="생년월일">
              <el-date-picker v-model="form.birthDate" type="date" placeholder="생년월일 선택" style="width: 100%;"
                value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="휴대폰 번호" prop="phone">
              <el-input v-model="form.phone" placeholder="휴대폰 번호" @input="formatPhoneNumber('phone')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="비상연락처" prop="emergencyContact">
              <el-input v-model="form.emergencyContact" placeholder="비상연락처"
                @input="formatPhoneNumber('emergencyContact')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="자택 주소">
              <el-input v-model="form.address" placeholder="자택 주소"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 인사 정보 -->
        <h2 class="section-title">인사 정보</h2>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="사번">
              <el-input v-model="form.sabun" placeholder="사번"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="직급" prop="gradeId">
              <el-select v-model="form.gradeId" placeholder="직급 선택" style="width: 100%;">
                <el-option v-for="grade in allGrades" :key="grade.id" :label="grade.name" :value="grade.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="고용형태" prop="employmentType">
              <el-select v-model="form.employmentType" placeholder="고용형태 선택" style="width: 100%;">
                <el-option label="정규직" value="ET001"></el-option>
                <el-option label="계약직" value="ET002"></el-option>
                <el-option label="인턴" value="ET003"></el-option>
                <el-option label="기타" value="ET004"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="입사일">
              <el-date-picker v-model="form.joinDate" type="date" placeholder="입사일 선택" style="width: 100%;"
                value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="내선 전화">
              <el-input v-model="form.extensionNumber" placeholder="내선 전화"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="일반 전화">
              <el-input v-model="form.telNumber" placeholder="일반 전화"></el-input>
            </el-form-item>
          </el-col>
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
        </div>

        <div class="positions-list">
          <el-card class="position-card">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="부서" prop="positions[0].organizationId">
                  <el-input v-model="form.positions[0].department" placeholder="부서명">
                    <template #append>
                      <el-button @click="openOrganizationModal(0)">조직도</el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="직책" prop="positions[0].titleId">
                  <el-select v-model="form.positions[0].titleId" placeholder="직책 선택" style="width: 100%;">
                    <el-option v-for="title in allTitles" :key="title.id" :label="title.name"
                      :value="title.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="역할" prop="positions[0].roleId">
                  <el-select v-model="form.positions[0].roleId" placeholder="역할 선택" style="width: 100%;">
                    <el-option v-for="role in allRoles" :key="role.id" :label="role.name" :value="role.id"></el-option>
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
    <OrganizationSelectionModal ref="orgModal" @organization-selected="handleOrganizationSelected" />
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';
import OrganizationSelectionModal from '@/components/member/OrganizationSelectionModal.vue';
import gradeService from '@/api/gradeService';
import titleService from '@/api/titleService';
import roleService from '@/api/roleService';
import { useSnackbar } from '@/composables/useSnackbar';

export default {
  name: 'AddEmployee',
  components: {
    OrganizationSelectionModal
  },
  setup() {
    const { error } = useSnackbar();
    return { showError: error };
  },
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
        sabun: '',
        joinDate: '',
        extensionNumber: '',
        telNumber: '',
        employmentType: '',
        gradeId: null,
        positions: [
          { department: '', organizationId: null, titleId: null, roleId: null }
        ]
      },
      rules: {
        email: [
          { required: true, message: '이메일을 입력해주세요.', trigger: 'blur' },
          { type: 'email', message: '올바른 이메일 형식이 아닙니다.', trigger: ['blur', 'change'] }
        ],
        password: [{ required: true, message: '비밀번호를 입력해주세요.', trigger: 'blur' }],
        name: [{ required: true, message: '이름을 입력해주세요.', trigger: 'blur' }],
        phone: [
          { pattern: /^\d{3}-\d{3,4}-\d{4}$/, message: '올바른 휴대폰 번호 형식이 아닙니다.', trigger: 'blur' }
        ],
        emergencyContact: [
          { pattern: /^\d{3}-\d{3,4}-\d{4}$/, message: '올바른 휴대폰 번호 형식이 아닙니다.', trigger: 'blur' }
        ],
        employmentType: [{ required: true, message: '고용형태를 선택해주세요.', trigger: 'change' }],
        gradeId: [{ required: true, message: '직급을 선택해주세요.', trigger: 'change' }],
        'positions[0].organizationId': [{ required: true, message: '부서를 선택해주세요.', trigger: 'change' }],
        'positions[0].titleId': [{ required: true, message: '직책을 선택해주세요.', trigger: 'change' }],
        'positions[0].roleId': [{ required: true, message: '역할을 선택해주세요.', trigger: 'change' }]
      },
      editingPositionIndex: null,
      isEmailChecked: false,
      allGrades: [],
      allTitles: [],
      allRoles: [],
    };
  },
  watch: {
    'form.email': function () {
      this.isEmailChecked = false;
    }
  },
  methods: {
    async fetchInitialData() {
      try {
        this.allGrades = await gradeService.getGrade();
        this.allTitles = await titleService.getTitle();
        const roleResponse = await roleService.getRole(localStorage.getItem('memberPositionId'));
        this.allRoles = roleResponse.data.data;
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        ElMessage.error('직책, 직급, 역할 목록을 불러오는 데 실패했습니다.');
      }
    },
    openOrganizationModal(index) {
      this.editingPositionIndex = index;
      this.$refs.orgModal.open();
    },
    handleOrganizationSelected(organization) {
      if (this.editingPositionIndex !== null) {
        this.form.positions[this.editingPositionIndex].department = organization.label;
        this.form.positions[this.editingPositionIndex].organizationId = organization.id;
      }
    },
    formatPhoneNumber(field) {
      let value = this.form[field].replace(/\D/g, '');
      if (value.length > 3 && value.length <= 7) {
        value = `${value.slice(0, 3)}-${value.slice(3)}`;
      } else if (value.length > 7) {
        value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
      }
      this.form[field] = value;
    },
    async checkEmail() {
      if (!this.form.email) {
        ElMessage.error('이메일을 입력해주세요.');
        return;
      }
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/check-email`, {
          params: { email: this.form.email }
        });
        if (response.data.data) {
          ElMessage.error('이미 사용 중인 이메일입니다.');
          this.isEmailChecked = false;
        } else {
          ElMessage.success('사용 가능한 이메일입니다.');
          this.isEmailChecked = true;
        }
      } catch (error) {
        console.error('이메일 중복 확인 오류:', error);
        ElMessage.error('이메일 중복 확인 중 오류가 발생했습니다.');
        this.isEmailChecked = false;
      }
    },
    async handleSubmit() {
      if (!this.isEmailChecked) {
        this.showError('이메일 중복 확인을 진행해주세요.');
        return;
      }

      this.$refs.employeeForm.validate(async (valid) => {
        if (valid) {
          const token = localStorage.getItem('accessToken');
          const userUuid = localStorage.getItem('memberId');
          const memberPositionId = localStorage.getItem('memberPositionId');

          if (!token || !userUuid || !memberPositionId) {
            ElMessage.error('인증 정보가 없습니다. 다시 로그인해주세요.');
            this.$router.push('/login');
            return;
          }

          const formData = new FormData();
          formData.append('email', this.form.email);
          formData.append('password', this.form.password);
          formData.append('name', this.form.name);
          formData.append('localDate', this.form.birthDate);
          formData.append('phoneNumber', this.form.phone);
          formData.append('emergencyContact', this.form.emergencyContact);
          formData.append('address', this.form.address);
          formData.append('bank', this.form.bank);
          formData.append('bankAccount', this.form.accountNumber);
          formData.append('sabun', this.form.sabun);
          formData.append('joinDate', this.form.joinDate);
          formData.append('extensionNumber', this.form.extensionNumber);
          formData.append('telNumber', this.form.telNumber);
          formData.append('employmentType', this.form.employmentType);

          if (this.form.positions.length > 0) {
            const firstPosition = this.form.positions[0];
            formData.append('organizationId', firstPosition.organizationId);
            formData.append('titleId', firstPosition.titleId);
            formData.append('roleId', firstPosition.roleId);
            formData.append('gradeId', this.form.gradeId);
          }

          try {
            const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/create`, formData, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'X-User-UUID': userUuid,
                'X-User-MemberPositionId': memberPositionId,
                'Content-Type': 'multipart/form-data'
              }
            });

            if (response.data && response.data.success) {
              ElMessage.success('새로운 직원이 추가되었습니다.');
              this.$router.push('/employee');
            } else {
              ElMessage.error(response.data.message || '직원 추가에 실패했습니다.');
            }
          } catch (error) {
            console.error('직원 추가 오류:', error);
            ElMessage.error(error.response?.data?.message || '직원 추가 중 오류가 발생했습니다.');
          }
        }
      });
    },
    handleCancel() {
      this.$router.push('/employee');
    }
  },
  created() {
    this.fetchInitialData();
  }
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