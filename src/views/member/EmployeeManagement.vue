<template>
  <div class="employee">
    <div class="page-header">
      <div class="header-content">
        <h1>직원 관리</h1>
        <p>직원 정보를 관리하고 인사 기록을 확인하세요.</p>
      </div>
      <div class="header-actions">
        <el-button v-if="canCreate" type="primary" @click="goToAddEmployee">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">직원 추가</span>
        </el-button>
        <el-button @click="exportEmployees">
          <el-icon><Download /></el-icon>
          <span style="margin-left: 8px;">Excel 다운로드</span>
        </el-button>
      </div>
    </div>

    <!-- 필터 및 검색 -->
    <div class="filter-section">
      <div class="filter-left">
        <el-input
          v-model="searchQuery"
          placeholder="직원명, 이메일로 검색..."
          prefix-icon="Search"
          style="width: 300px"
        />
        <el-select v-model="selectedDepartment" placeholder="부서 선택" style="width: 150px">
          <el-option label="전체" value="" />
          <el-option v-for="dep in departmentList" :key="dep" :label="dep" :value="dep" />
        </el-select>
        <el-select v-model="selectedStatus" placeholder="상태 선택" style="width: 120px">
          <el-option label="전체" value="" />
          <el-option label="재직" value="WORKING" />
          <el-option label="휴직" value="LEAVE" />
          <el-option v-if="canDelete" label="삭제" value="DELETED" />
        </el-select>
      </div>
      <div class="filter-right">
        <el-button @click="resetFilters">초기화</el-button>
      </div>
    </div>

    <!-- 직원 목록 -->
    <div class="employee-list">
      <div class="list-header">
        <div class="list-info">
          <span>총 {{ filteredEmployees.length }}명</span>
          <el-divider direction="vertical" />
          <span>재직 {{ activeEmployees }}명</span>
        </div>
        <div class="view-options">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="card">카드</el-radio-button>
            <el-radio-button label="table">테이블</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 카드 뷰 -->
      <div v-if="viewMode === 'card'" class="employee-cards">
        <div 
          class="employee-card" 
          v-for="employee in filteredEmployees" 
          :key="employee.id"
          @click="selectEmployee(employee)"
        >
          <div class="card-header">
            <el-avatar :src="employee.avatar || defaultAvatarSvg" :size="60" />
            <div class="employee-basic">
              <h3>{{ employee.name }}</h3>
              <p>{{ employee.position }} • {{ employee.department }}</p>
              <el-tag 
                :type="employee.status === 'WORKING' ? 'success' : (employee.status === 'LEAVE' ? 'warning' : (employee.status === 'DELETED' ? 'danger' : 'primary'))"
                size="small"
              >
                {{ formatMemberStatus(employee.status) }}
              </el-tag>
            </div>
            <div class="card-actions">
                <el-button v-if="canUpdate" type="text" @click.stop="editEmployee(employee)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button v-if="canDelete && employee.status !== 'DELETED'" type="text" @click.stop="deleteEmployee(employee)">
                  <el-icon><Delete /></el-icon>
                </el-button>
                <el-button v-if="canDelete && employee.status === 'DELETED'" type="text" @click.stop="restoreEmployee(employee)">
                  <el-icon><Refresh /></el-icon>
                </el-button>
            </div>
          </div>
          
          <div class="card-content">
            <div class="info-row">
              <el-icon><Postcard /></el-icon>
              <span>사번: {{ employee.sabun }}</span>
            </div>
            <div class="info-row">
              <el-icon><Message /></el-icon>
              <span>{{ employee.email }}</span>
            </div>
            <div class="info-row">
              <el-icon><Phone /></el-icon>
              <span>{{ employee.phone }}</span>
            </div>
            <div class="info-row">
              <el-icon><Calendar /></el-icon>
              <span>입사일: {{ employee.joinDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 테이블 뷰 -->
      <div v-else class="employee-table">
        <el-table :data="filteredEmployees" style="width: 100%" @row-click="selectEmployee">
          <el-table-column prop="name" label="이름" width="180" show-overflow-tooltip>
            <template #default="scope">
              <div class="table-employee">
                <el-avatar :src="scope.row.avatar || defaultAvatarSvg" :size="32" />
                <span>{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sabun" label="사번" width="100" />
          <el-table-column prop="position" label="직책" width="120" show-overflow-tooltip />
          <el-table-column prop="department" label="부서" width="120" show-overflow-tooltip />
          <el-table-column prop="email" label="이메일" width="220" show-overflow-tooltip />
          <el-table-column prop="phone" label="전화번호" width="150" />
          <el-table-column prop="joinDate" label="입사일" width="120" />
          <el-table-column prop="status" label="상태" width="100">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === 'WORKING' ? 'success' : (scope.row.status === 'LEAVE' ? 'warning' : (scope.row.status === 'DELETED' ? 'danger' : 'primary'))"
                size="small"
              >
                {{ formatMemberStatus(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="액션" width="120">
            <template #default="scope">
              <div>
                <el-button v-if="canUpdate" type="text" size="small" @click="editEmployee(scope.row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button v-if="canDelete && scope.row.status !== 'DELETED'" type="text" size="small" @click="deleteEmployee(scope.row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
                <el-button v-if="canDelete && scope.row.status === 'DELETED'" type="text" size="small" @click="restoreEmployee(scope.row)">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 직원 상세 모달 -->
    <el-dialog
      v-model="showEmployeeDetail"
      title="직원 정보"
      width="800px"
      custom-class="custom-employee-detail-dialog"
    >
      <div v-if="selectedEmployee" class="employee-detail">
        <div class="detail-header">
          <el-avatar :src="selectedEmployee.avatar || defaultAvatarSvg" :size="60" />
          <div class="detail-info">
            <div class="name-and-status">
              <h3>{{ selectedEmployee.name }}</h3>
              <el-tag :type="selectedEmployee.memberStatusName === '재직' ? 'success' : (selectedEmployee.memberStatusName === '휴직' ? 'warning' : 'primary')" size="small">
                {{ selectedEmployee.memberStatusName }}
              </el-tag>
            </div>
            <p>{{ selectedEmployee.memberPositionResList[0]?.title?.name || '-' }} • {{ selectedEmployee.memberPositionResList[0]?.organization?.name || '-' }}</p>
          </div>
          <div class="detail-header-actions">
            <el-button v-if="selectedEmployee && selectedEmployee.memberId" @click="goToEmployeeDetailPage(selectedEmployee.memberId)" type="primary" size="small">상세조회</el-button>
            <el-button @click="showEmployeeDetail = false" size="small">닫기</el-button>
          </div>
        </div>
        
        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="기본 정보" name="basic">
            <div class="detail-content">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">사번</span>
                  <span class="value">{{ selectedEmployee.sabun }}</span>
                </div>
                <div class="info-item">
                  <span class="label">이메일</span>
                  <span class="value">{{ selectedEmployee.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">연락처</span>
                  <span class="value">{{ selectedEmployee.phoneNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="label">비상연락처</span>
                  <span class="value">{{ selectedEmployee.emergencyContact || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">내선 전화</span>
                  <span class="value">{{ selectedEmployee.extensionNumber || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">일반 전화</span>
                  <span class="value">{{ selectedEmployee.telNumber || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">은행명</span>
                  <span class="value">{{ selectedEmployee.bank || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">계좌번호</span>
                  <span class="value">{{ selectedEmployee.bankAccount || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">입사일</span>
                  <span class="value">{{ selectedEmployee.joinDate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">근속기간</span>
                  <span class="value">{{ selectedEmployee.lengthOfService }}</span>
                </div>
                <div class="info-item">
                  <span class="label">재직 상태</span>
                  <span class="value">{{ selectedEmployee.memberStatusName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">고용형태</span>
                  <span class="value">{{ selectedEmployee.employmentTypeName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">주소</span>
                  <span class="value">
                    <div>{{ selectedEmployee.address || '-' }}</div>
                    <div v-if="selectedEmployee.detailAddress">{{ selectedEmployee.detailAddress }}</div>
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">계정 상태</span>
                  <span class="value">{{ formatAccountStatus(selectedEmployee.accountStatus) }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="인사 정보" name="hr">
            <div class="detail-content">
              <el-table v-if="selectedEmployee.gradeHistoryList && selectedEmployee.gradeHistoryList.length > 0" :data="selectedEmployee.gradeHistoryList" style="width: 100%">
                <el-table-column prop="gradeName" label="직급명"></el-table-column>
                <el-table-column prop="promotionDate" label="진급일"></el-table-column>
              </el-table>
              <p v-else class="no-data">진급 이력이 없습니다.</p>
            </div>
          </el-tab-pane>

          <el-tab-pane label="직무 정보" name="job">
            <div class="detail-content">
              <div v-if="selectedEmployee.memberPositionResList && selectedEmployee.memberPositionResList.length > 0">
                <div v-for="(position, index) in selectedEmployee.memberPositionResList" :key="index" class="position-detail-item" style="border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div class="info-item">
                        <span class="label">부서</span>
                        <span class="value">{{ position.organization?.name || '-' }}</span>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="info-item">
                        <span class="label">직책</span>
                        <span class="value">{{ position.title?.name || '-' }}</span>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div class="info-item">
                        <span class="label">역할</span>
                        <span class="value">{{ position.role?.name || '-' }}</span>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="info-item">
                        <span class="label">근무기간</span>
                        <span class="value">{{ position.lengthOfService || '-' }}</span>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div class="info-item">
                        <span class="label">시작일</span>
                        <span class="value">{{ formatDate(position.startDate) }}</span>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="info-item">
                        <span class="label">종료일</span>
                        <span class="value">{{ formatDate(position.endDate) || '-' }}</span>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
              <p v-else class="no-data">직무 정보가 없습니다.</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { useRouter } from 'vue-router';
import { useSnackbar } from '@/composables/useSnackbar';
import { usePermissions } from '@/composables/usePermissions';
import { ElMessageBox } from 'element-plus';
import axios from 'axios';
import { defaultAvatarSvg } from '@/utils/defaultAvatar.js';
import employeeService from '@/api/employeeService'; // Import employeeService

const router = useRouter();
const { success, error, info } = useSnackbar();
const { checkPermission } = usePermissions();

// State
const searchQuery = ref('');
const selectedDepartment = ref('');
const selectedStatus = ref('');
const viewMode = ref('card');
const showEmployeeDetail = ref(false);
const selectedEmployee = ref(null);
const activeTab = ref('basic');
const employees = ref([]);

// Permissions State
const canCreate = ref(false);
const canRead = ref(false);
const canUpdate = ref(false);
const canDelete = ref(false);

const memberStatusEnumMapping = {
  '재직': 'WORKING',
  '휴직': 'LEAVE',
  '파견': 'DETACHMENT',
  '삭제': 'DELETED',
};

// API 호출
const fetchEmployees = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/list`, { headers });

    if (response.data && response.data.success) {
      employees.value = response.data.data.map(emp => ({
        id: emp.id,
        name: emp.name,
        position: emp.titleName,
        department: emp.organizationName,
        email: emp.email,
        phone: emp.phoneNumber,
        status: memberStatusEnumMapping[emp.memberStatusName] || emp.memberStatusName,
        sabun: emp.sabun,
        joinDate: emp.joinDate,
        avatar: null,
        employmentType: emp.employmentTypeName,
      }));
    } else {
      error(response.data.message || '직원 목록을 불러오는 데 실패했습니다.');
    }
  } catch (err) {
    console.error(err);
    const errorMessage = err.response?.data?.message || '서버 오류가 발생했습니다.';
    error(errorMessage);
  }
};

// Lifecycle Hook
onMounted(async () => {
  await fetchEmployees();
  // 권한 확인
  canCreate.value = await checkPermission('member', 'CREATE');
  canRead.value = await checkPermission('member', 'READ');
  canUpdate.value = await checkPermission('member', 'UPDATE');
  canDelete.value = await checkPermission('member', 'DELETE');
});

// Computed Properties
const departmentList = computed(() => {
  const deps = employees.value.map(emp => emp.department);
  return [...new Set(deps)];
});

const filteredEmployees = computed(() => {
  return employees.value.filter(employee => {
    const matchesSearch = !searchQuery.value || 
      employee.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesDepartment = !selectedDepartment.value || 
      employee.department === selectedDepartment.value;
    
    let matchesStatus;
    if (selectedStatus.value) {
      matchesStatus = employee.status === selectedStatus.value;
    } else {
      matchesStatus = employee.status !== 'DELETED';
    }
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
});

const activeEmployees = computed(() => {
  return employees.value.filter(emp => emp.status === 'WORKING').length;
});

// Methods
const goToAddEmployee = () => {
  router.push('/employee/add');
};

const selectEmployee = async (employee) => {
  if (!employee || !employee.id) {
    error('직원 ID가 유효하지 않습니다.');
    return;
  }
  try {
    const response = await employeeService.getEmployeeDetails(employee.id); // Use getEmployeeDetails
    selectedEmployee.value = response.data.data; // Extract memberDetail from MemberEditRes
    showEmployeeDetail.value = true;
  } catch (err) {
    console.error('직원 상세 정보를 불러오는 데 실패했습니다:', err);
    error(err.response?.data?.message || '직원 상세 정보를 불러오는 데 실패했습니다.');
  }
};

const editEmployee = (emp) => {
  router.push(`/employee/edit/${emp.id}`);
};

const deleteEmployee = (employee) => {
  ElMessageBox.confirm('정말로 삭제하시겠습니까?', '확인', {
    confirmButtonText: '삭제',
    cancelButtonText: '취소', 
    type: 'warning'
  }).then(async () => {
    try {
      await employeeService.deleteEmployee(employee.id);
      success('삭제되었습니다.');
      await fetchEmployees(); // Refresh the list
    } catch (err) {
      error(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  }).catch(() => {
    info('삭제가 취소되었습니다.');
  });
};

const restoreEmployee = (employee) => {
  ElMessageBox.confirm('정말로 복원하시겠습니까?', '확인', {
    confirmButtonText: '복원',
    cancelButtonText: '취소',
    type: 'info'
  }).then(async () => {
    try {
      await employeeService.restoreEmployee(employee.id);
      success('복원되었습니다.');
      await fetchEmployees(); // Refresh the list
    } catch (err) {
      error(err.response?.data?.message || '복원에 실패했습니다.');
    }
  }).catch(() => {
    info('복원이 취소되었습니다.');
  });
};

const exportEmployees = () => {
  if (filteredEmployees.value.length === 0) {
    error('내보낼 데이터가 없습니다.');
    return;
  }

  const dataToExport = filteredEmployees.value.map(emp => ({
    '이름': emp.name,
    '사번': emp.sabun,
    '직책': emp.position,
    '부서': emp.department,
    '이메일': emp.email,
    '전화번호': emp.phone,
    '입사일': emp.joinDate,
    '상태': formatMemberStatus(emp.status)
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '직원 목록');
  XLSX.writeFile(workbook, '직원_목록.xlsx');
  success('엑셀 파일이 다운로드되었습니다.');
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedDepartment.value = '';
  selectedStatus.value = '';
};

// Helper functions for formatting
const formatMemberStatus = (status) => {
  switch (status) {
    case 'WORKING': return '재직';
    case 'LEAVE': return '휴직';
    case 'DETACHMENT': return '파견';
    case 'DELETED': return '삭제';
    default: return status;
  }
};


const formatAccountStatus = (status) => {
  switch (status) {
    case 'ACTIVE': return '정상';
    case 'INACTIVE': return '비활성';
    case 'LOCK': return '잠금';
    default: return status;
  }
};

const goToEmployeeDetailPage = (employeeId) => {
  console.log('goToEmployeeDetailPage 호출, employeeId:', employeeId); // Add this log
  router.push(`/employee/detail/${employeeId}`);
  showEmployeeDetail.value = false; // Close the modal
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

</script>

<style scoped>
.employee {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.header-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.header-actions {
  display: flex;
}

.filter-section {
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.employee-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
  font-size: 14px;
}

.employee-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 24px;
}

.employee-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.employee-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.employee-basic {
  flex: 1;
}

.employee-basic h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.employee-basic p {
  color: #606266;
  margin-bottom: 8px;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.card-content {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.info-row:last-child {
  margin-bottom: 0;
}

.employee-table {
  padding: 0;
}

.table-employee {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  align-items: flex-start; /* Align items to the top */
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
  justify-content: space-between; /* Push buttons to the right */
}

.detail-header-actions {
  display: flex;
  gap: 8px;
  margin-left: auto; /* Push actions to the far right */
}

.name-and-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px; /* To maintain spacing with the paragraph below */
}

.detail-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0; /* Remove margin-bottom as it's handled by parent .name-and-status */
}

.detail-info p {
  color: #606266;
  margin-bottom: 12px;
}

.detail-tabs {
  margin-top: 20px;
}

.detail-content {
  padding: 20px 0;
  max-height: calc(100vh - 450px); /* Even further adjusted for a smaller height */
  overflow-y: auto;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 500;
  color: #606266;
  min-width: 100px;
}

.info-item .value {
  color: #2c3e50;
}

/* Custom styles for employee detail dialog scrolling */
.custom-employee-detail-dialog {
  max-height: calc(100vh - 50px); /* Ensure the entire dialog doesn't exceed viewport height */
  overflow-y: auto;
}

.custom-employee-detail-dialog .el-dialog__body {
  padding: 0 24px 24px;
  max-height: calc(100vh - 200px); /* Adjust based on actual header/footer height */
  overflow-y: auto;
}
</style>