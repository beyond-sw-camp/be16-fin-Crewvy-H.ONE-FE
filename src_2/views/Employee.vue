<template>
  <div class="employee">
    <div class="page-header">
      <div class="header-content">
        <h1>직원 관리</h1>
        <p>직원 정보를 관리하고 인사 기록을 확인하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddEmployee = true">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">직원 추가</span>
        </el-button>
        <el-button @click="exportEmployees">
          <el-icon><Download /></el-icon>
          <span style="margin-left: 8px;">내보내기</span>
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
          <el-option label="개발팀" value="개발팀" />
          <el-option label="디자인팀" value="디자인팀" />
          <el-option label="마케팅팀" value="마케팅팀" />
        </el-select>
        <el-select v-model="selectedStatus" placeholder="상태 선택" style="width: 120px">
          <el-option label="전체" value="" />
          <el-option label="재직" value="active" />
          <el-option label="휴직" value="inactive" />
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
            <el-avatar :src="employee.avatar" :size="60" />
            <div class="employee-basic">
              <h3>{{ employee.name }}</h3>
              <p>{{ employee.position }} • {{ employee.department }}</p>
              <el-tag :type="employee.status === 'active' ? 'success' : 'info'" size="small">
                {{ employee.status === 'active' ? '재직' : '휴직' }}
              </el-tag>
            </div>
            <div class="card-actions">
              <el-button type="text" @click.stop="editEmployee(employee)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="text" @click.stop="deleteEmployee(employee)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          
          <div class="card-content">
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
              <span>{{ employee.joinDate }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="attendance-info">
              <span class="label">근무일</span>
              <span class="value">{{ employee.workDays }}일</span>
            </div>
            <div class="attendance-info">
              <span class="label">휴가</span>
              <span class="value">{{ employee.vacationDays }}일</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 테이블 뷰 -->
      <div v-else class="employee-table">
        <el-table :data="filteredEmployees" style="width: 100%">
          <el-table-column prop="name" label="이름" width="120">
            <template #default="scope">
              <div class="table-employee">
                <el-avatar :src="scope.row.avatar" :size="32" />
                <span>{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="position" label="직책" width="100" />
          <el-table-column prop="department" label="부서" width="100" />
          <el-table-column prop="email" label="이메일" width="200" />
          <el-table-column prop="phone" label="전화번호" width="130" />
          <el-table-column prop="joinDate" label="입사일" width="100" />
          <el-table-column prop="status" label="상태" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="small">
                {{ scope.row.status === 'active' ? '재직' : '휴직' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="근태" width="120">
            <template #default="scope">
              <div class="attendance-summary">
                <span>{{ scope.row.workDays }}일</span>
                <span class="divider">|</span>
                <span>{{ scope.row.vacationDays }}일</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="액션" width="120">
            <template #default="scope">
              <el-button type="text" size="small" @click="editEmployee(scope.row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="text" size="small" @click="deleteEmployee(scope.row)">
                <el-icon><Delete /></el-icon>
              </el-button>
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
    >
      <div v-if="selectedEmployee" class="employee-detail">
        <div class="detail-header">
          <el-avatar :src="selectedEmployee.avatar" :size="80" />
          <div class="detail-info">
            <h3>{{ selectedEmployee.name }}</h3>
            <p>{{ selectedEmployee.position }} • {{ selectedEmployee.department }}</p>
            <el-tag :type="selectedEmployee.status === 'active' ? 'success' : 'info'">
              {{ selectedEmployee.status === 'active' ? '재직' : '휴직' }}
            </el-tag>
          </div>
        </div>
        
        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="기본 정보" name="basic">
            <div class="detail-content">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">이메일</span>
                  <span class="value">{{ selectedEmployee.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">전화번호</span>
                  <span class="value">{{ selectedEmployee.phone }}</span>
                </div>
                <div class="info-item">
                  <span class="label">입사일</span>
                  <span class="value">{{ selectedEmployee.joinDate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">근무지</span>
                  <span class="value">{{ selectedEmployee.location }}</span>
                </div>
                <div class="info-item">
                  <span class="label">급여</span>
                  <span class="value">{{ selectedEmployee.salary.toLocaleString() }}원</span>
                </div>
                <div class="info-item">
                  <span class="label">주민등록번호</span>
                  <span class="value">{{ selectedEmployee.ssn }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="근태 현황" name="attendance">
            <div class="attendance-stats">
              <div class="stat-card">
                <div class="stat-value">{{ selectedEmployee.workDays }}</div>
                <div class="stat-label">근무일</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ selectedEmployee.vacationDays }}</div>
                <div class="stat-label">사용 휴가</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ selectedEmployee.remainingDays }}</div>
                <div class="stat-label">잔여 휴가</div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="급여 정보" name="payroll">
            <div class="payroll-info">
              <div class="payroll-item">
                <span class="label">기본급</span>
                <span class="value">{{ selectedEmployee.salary.toLocaleString() }}원</span>
              </div>
              <div class="payroll-item">
                <span class="label">수당</span>
                <span class="value">{{ selectedEmployee.allowance.toLocaleString() }}원</span>
              </div>
              <div class="payroll-item">
                <span class="label">공제</span>
                <span class="value">{{ selectedEmployee.deduction.toLocaleString() }}원</span>
              </div>
              <div class="payroll-item total">
                <span class="label">실수령액</span>
                <span class="value">{{ (selectedEmployee.salary + selectedEmployee.allowance - selectedEmployee.deduction).toLocaleString() }}원</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'EmployeePage',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      searchQuery: '',
      selectedDepartment: '',
      selectedStatus: '',
      viewMode: 'card',
      showEmployeeDetail: false,
      showAddEmployee: false,
      selectedEmployee: null,
      activeTab: 'basic',
      employees: [
        {
          id: 1,
          name: '김철수',
          position: '팀장',
          department: '개발팀',
          email: 'kim@company.com',
          phone: '010-1234-5678',
          joinDate: '2020-03-15',
          location: '서울 본사',
          status: 'active',
          avatar: 'https://via.placeholder.com/60',
          workDays: 22,
          vacationDays: 5,
          remainingDays: 10,
          salary: 5000000,
          allowance: 500000,
          deduction: 400000,
          ssn: '900315-1234567'
        },
        {
          id: 2,
          name: '박민수',
          position: '주임',
          department: '개발팀',
          email: 'park@company.com',
          phone: '010-2345-6789',
          joinDate: '2021-07-01',
          location: '서울 본사',
          status: 'active',
          avatar: 'https://via.placeholder.com/60',
          workDays: 20,
          vacationDays: 3,
          remainingDays: 12,
          salary: 4000000,
          allowance: 300000,
          deduction: 320000,
          ssn: '950701-2345678'
        },
        {
          id: 3,
          name: '이지은',
          position: '대리',
          department: '개발팀',
          email: 'lee@company.com',
          phone: '010-3456-7890',
          joinDate: '2022-01-10',
          location: '서울 본사',
          status: 'active',
          avatar: 'https://via.placeholder.com/60',
          workDays: 18,
          vacationDays: 2,
          remainingDays: 13,
          salary: 3500000,
          allowance: 200000,
          deduction: 280000,
          ssn: '980110-3456789'
        },
        {
          id: 4,
          name: '김영희',
          position: '팀장',
          department: '디자인팀',
          email: 'kimy@company.com',
          phone: '010-4567-8901',
          joinDate: '2019-11-20',
          location: '서울 본사',
          status: 'active',
          avatar: 'https://via.placeholder.com/60',
          workDays: 21,
          vacationDays: 4,
          remainingDays: 11,
          salary: 4500000,
          allowance: 400000,
          deduction: 360000,
          ssn: '891120-4567890'
        },
        {
          id: 5,
          name: '정수진',
          position: '주임',
          department: '디자인팀',
          email: 'jung@company.com',
          phone: '010-5678-9012',
          joinDate: '2021-09-15',
          location: '서울 본사',
          status: 'active',
          avatar: 'https://via.placeholder.com/60',
          workDays: 19,
          vacationDays: 6,
          remainingDays: 9,
          salary: 3800000,
          allowance: 250000,
          deduction: 304000,
          ssn: '960915-5678901'
        },
        {
          id: 6,
          name: '최민호',
          position: '팀장',
          department: '마케팅팀',
          email: 'choi@company.com',
          phone: '010-6789-0123',
          joinDate: '2020-05-10',
          location: '서울 본사',
          status: 'inactive',
          avatar: 'https://via.placeholder.com/60',
          workDays: 17,
          vacationDays: 7,
          remainingDays: 8,
          salary: 4200000,
          allowance: 350000,
          deduction: 336000,
          ssn: '900510-6789012'
        }
      ]
    }
  },
  computed: {
    filteredEmployees() {
      return this.employees.filter(employee => {
        const matchesSearch = !this.searchQuery || 
          employee.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          employee.email.toLowerCase().includes(this.searchQuery.toLowerCase())
        
        const matchesDepartment = !this.selectedDepartment || 
          employee.department === this.selectedDepartment
        
        const matchesStatus = !this.selectedStatus || 
          employee.status === this.selectedStatus
        
        return matchesSearch && matchesDepartment && matchesStatus
      })
    },
    activeEmployees() {
      return this.employees.filter(emp => emp.status === 'active').length
    }
  },
  methods: {
    selectEmployee(employee) {
      this.selectedEmployee = employee
      this.showEmployeeDetail = true
    },
    editEmployee(emp) {
      this.info(`${emp.name}님의 정보를 수정합니다.`)
    },
    deleteEmployee() {
      this.$confirm('정말로 삭제하시겠습니까?', '확인', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        this.success('삭제되었습니다.')
      })
    },
    exportEmployees() {
      this.success('직원 목록을 내보냅니다.')
    },
    resetFilters() {
      this.searchQuery = ''
      this.selectedDepartment = ''
      this.selectedStatus = ''
    }
  }
}
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

.card-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.attendance-info {
  text-align: center;
}

.attendance-info .label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.attendance-info .value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.employee-table {
  padding: 0;
}

.table-employee {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attendance-summary {
  font-size: 12px;
  color: #606266;
}

.divider {
  margin: 0 4px;
  color: #dcdfe6;
}

.employee-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.detail-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
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

.attendance-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px 0;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #606266;
}

.payroll-info {
  padding: 20px 0;
}

.payroll-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.payroll-item:last-child {
  border-bottom: none;
}

.payroll-item.total {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 16px;
  font-weight: 600;
  font-size: 16px;
}

.payroll-item .label {
  font-weight: 500;
  color: #606266;
}

.payroll-item .value {
  color: #2c3e50;
  font-weight: 500;
}
</style>
