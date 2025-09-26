<template>
  <div class="organization">
    <div class="page-header">
      <div class="header-content">
        <h1>조직도</h1>
        <p>회사의 조직 구조를 한눈에 확인하고 관리하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDepartment = true">
          <el-icon><Plus /></el-icon>
          부서 추가
        </el-button>
        <el-button @click="showAddEmployee = true">
          <el-icon><User /></el-icon>
          직원 추가
        </el-button>
      </div>
    </div>

    <!-- 조직도 차트 -->
    <div class="org-chart-container">
      <div class="org-chart">
        <div class="org-node ceo">
          <div class="node-avatar">
            <el-avatar :src="ceo.avatar" :size="60" />
          </div>
          <div class="node-info">
            <div class="node-name">{{ ceo.name }}</div>
            <div class="node-position">{{ ceo.position }}</div>
            <div class="node-department">{{ ceo.department }}</div>
          </div>
        </div>

        <!-- 부서별 조직도 -->
        <div class="departments">
          <div class="department" v-for="dept in departments" :key="dept.id">
            <div class="dept-header">
              <h3>{{ dept.name }}</h3>
              <span class="dept-count">{{ dept.employees.length }}명</span>
            </div>
            <div class="dept-employees">
              <div 
                class="employee-card" 
                v-for="employee in dept.employees" 
                :key="employee.id"
                @click="selectEmployee(employee)"
              >
                <el-avatar :src="employee.avatar" :size="40" />
                <div class="employee-info">
                  <div class="employee-name">{{ employee.name }}</div>
                  <div class="employee-position">{{ employee.position }}</div>
                </div>
                <div class="employee-status" :class="employee.status">
                  {{ employee.status === 'online' ? '온라인' : '오프라인' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 직원 상세 정보 모달 -->
    <el-dialog
      v-model="showEmployeeDetail"
      title="직원 정보"
      width="600px"
    >
      <div v-if="selectedEmployee" class="employee-detail">
        <div class="detail-header">
          <el-avatar :src="selectedEmployee.avatar" :size="80" />
          <div class="detail-info">
            <h3>{{ selectedEmployee.name }}</h3>
            <p>{{ selectedEmployee.position }} • {{ selectedEmployee.department }}</p>
            <el-tag :type="selectedEmployee.status === 'online' ? 'success' : 'info'">
              {{ selectedEmployee.status === 'online' ? '온라인' : '오프라인' }}
            </el-tag>
          </div>
        </div>
        
        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="기본 정보" name="basic">
            <div class="detail-content">
              <div class="info-row">
                <span class="label">이메일</span>
                <span class="value">{{ selectedEmployee.email }}</span>
              </div>
              <div class="info-row">
                <span class="label">전화번호</span>
                <span class="value">{{ selectedEmployee.phone }}</span>
              </div>
              <div class="info-row">
                <span class="label">입사일</span>
                <span class="value">{{ selectedEmployee.joinDate }}</span>
              </div>
              <div class="info-row">
                <span class="label">근무지</span>
                <span class="value">{{ selectedEmployee.location }}</span>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="근태 현황" name="attendance">
            <div class="attendance-stats">
              <div class="stat-item">
                <div class="stat-value">{{ selectedEmployee.attendance.workDays }}</div>
                <div class="stat-label">근무일</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ selectedEmployee.attendance.vacationDays }}</div>
                <div class="stat-label">사용 휴가</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ selectedEmployee.attendance.remainingDays }}</div>
                <div class="stat-label">잔여 휴가</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 부서 추가 모달 -->
    <el-dialog
      v-model="showAddDepartment"
      title="부서 추가"
      width="500px"
    >
      <el-form :model="newDepartment" label-width="80px">
        <el-form-item label="부서명">
          <el-input v-model="newDepartment.name" placeholder="부서명을 입력하세요" />
        </el-form-item>
        <el-form-item label="부서장">
          <el-select v-model="newDepartment.manager" placeholder="부서장을 선택하세요">
            <el-option
              v-for="employee in allEmployees"
              :key="employee.id"
              :label="employee.name"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="설명">
          <el-input
            v-model="newDepartment.description"
            type="textarea"
            placeholder="부서 설명을 입력하세요"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDepartment = false">취소</el-button>
        <el-button type="primary" @click="addDepartment">추가</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'OrganizationPage',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      showEmployeeDetail: false,
      showAddDepartment: false,
      showAddEmployee: false,
      selectedEmployee: null,
      activeTab: 'basic',
      newDepartment: {
        name: '',
        manager: '',
        description: ''
      },
      ceo: {
        name: '김대표',
        position: '대표이사',
        department: '경영진',
        avatar: 'https://via.placeholder.com/60'
      },
      departments: [
        {
          id: 1,
          name: '개발팀',
          employees: [
            {
              id: 1,
              name: '김철수',
              position: '팀장',
              email: 'kim@company.com',
              phone: '010-1234-5678',
              joinDate: '2020-03-15',
              location: '서울 본사',
              status: 'online',
              avatar: 'https://via.placeholder.com/40',
              attendance: {
                workDays: 22,
                vacationDays: 5,
                remainingDays: 10
              }
            },
            {
              id: 2,
              name: '박민수',
              position: '주임',
              email: 'park@company.com',
              phone: '010-2345-6789',
              joinDate: '2021-07-01',
              location: '서울 본사',
              status: 'online',
              avatar: 'https://via.placeholder.com/40',
              attendance: {
                workDays: 20,
                vacationDays: 3,
                remainingDays: 12
              }
            },
            {
              id: 3,
              name: '이지은',
              position: '대리',
              email: 'lee@company.com',
              phone: '010-3456-7890',
              joinDate: '2022-01-10',
              location: '서울 본사',
              status: 'offline',
              avatar: 'https://via.placeholder.com/40',
              attendance: {
                workDays: 18,
                vacationDays: 2,
                remainingDays: 13
              }
            }
          ]
        },
        {
          id: 2,
          name: '디자인팀',
          employees: [
            {
              id: 4,
              name: '김영희',
              position: '팀장',
              email: 'kimy@company.com',
              phone: '010-4567-8901',
              joinDate: '2019-11-20',
              location: '서울 본사',
              status: 'online',
              avatar: 'https://via.placeholder.com/40',
              attendance: {
                workDays: 21,
                vacationDays: 4,
                remainingDays: 11
              }
            },
            {
              id: 5,
              name: '정수진',
              position: '주임',
              email: 'jung@company.com',
              phone: '010-5678-9012',
              joinDate: '2021-09-15',
              location: '서울 본사',
              status: 'online',
              avatar: 'https://via.placeholder.com/40',
              attendance: {
                workDays: 19,
                vacationDays: 6,
                remainingDays: 9
              }
            }
          ]
        },
        {
          id: 3,
          name: '마케팅팀',
          employees: [
            {
              id: 6,
              name: '최민호',
              position: '팀장',
              email: 'choi@company.com',
              phone: '010-6789-0123',
              joinDate: '2020-05-10',
              location: '서울 본사',
              status: 'offline',
              avatar: 'https://via.placeholder.com/40',
              attendance: {
                workDays: 17,
                vacationDays: 7,
                remainingDays: 8
              }
            }
          ]
        }
      ]
    }
  },
  computed: {
    allEmployees() {
      const employees = []
      this.departments.forEach(dept => {
        employees.push(...dept.employees)
      })
      return employees
    }
  },
  methods: {
    selectEmployee(employee) {
      this.selectedEmployee = employee
      this.showEmployeeDetail = true
    },
    addDepartment() {
      // 부서 추가 로직
      this.success('부서가 추가되었습니다.')
      this.showAddDepartment = false
      this.newDepartment = { name: '', manager: '', description: '' }
    }
  }
}
</script>

<style scoped>
.organization {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
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

.org-chart-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-bottom: 24px;
}

.org-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.org-node.ceo {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  background: #4f46e5;
  color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.node-avatar {
  margin-bottom: 16px;
}

.node-info {
  text-align: center;
}

.node-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.node-position {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.node-department {
  font-size: 14px;
  opacity: 0.8;
}

.departments {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
}

.department {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #e9ecef;
}

.dept-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #dee2e6;
}

.dept-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.dept-count {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.dept-employees {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.employee-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.employee-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.employee-info {
  flex: 1;
}

.employee-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
}

.employee-position {
  font-size: 12px;
  color: #606266;
}

.employee-status {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.employee-status.online {
  background: #f0f9ff;
  color: #0369a1;
}

.employee-status.offline {
  background: #f3f4f6;
  color: #6b7280;
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

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.info-row .value {
  color: #2c3e50;
}

.attendance-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px 0;
}

.stat-item {
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
</style>
