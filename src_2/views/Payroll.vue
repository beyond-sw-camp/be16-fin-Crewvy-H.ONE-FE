<template>
  <div class="payroll">
    <div class="page-header">
      <div class="header-content">
        <h1>급여 관리</h1>
        <p>직원 급여 계산과 관리 시스템입니다.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="calculatePayroll">
          <el-icon><Calculator /></el-icon>
          급여 계산
        </el-button>
        <el-button @click="exportPayroll">
          <el-icon><Download /></el-icon>
          급여 내보내기
        </el-button>
      </div>
    </div>

    <!-- 급여 현황 카드 -->
    <div class="payroll-cards">
      <div class="payroll-card">
        <div class="card-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">이번 달 총 급여</div>
          <div class="card-value">{{ totalPayroll.toLocaleString() }}원</div>
          <div class="card-subtitle">15명 기준</div>
        </div>
      </div>
      
      <div class="payroll-card">
        <div class="card-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">평균 급여</div>
          <div class="card-value">{{ averagePayroll.toLocaleString() }}원</div>
          <div class="card-subtitle">월 평균</div>
        </div>
      </div>
      
      <div class="payroll-card">
        <div class="card-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">급여 증가율</div>
          <div class="card-value">+3.2%</div>
          <div class="card-subtitle">전월 대비</div>
        </div>
      </div>
      
      <div class="payroll-card">
        <div class="card-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">급여 지급일</div>
          <div class="card-value">25일</div>
          <div class="card-subtitle">매월</div>
        </div>
      </div>
    </div>

    <!-- 급여 목록 -->
    <div class="payroll-section">
      <div class="section-header">
        <h3>급여 목록</h3>
        <div class="filter-options">
          <el-select v-model="selectedMonth" placeholder="월 선택" style="width: 150px">
            <el-option label="2024년 1월" value="2024-01" />
            <el-option label="2023년 12월" value="2023-12" />
            <el-option label="2023년 11월" value="2023-11" />
          </el-select>
          <el-select v-model="selectedDepartment" placeholder="부서 선택" style="width: 150px">
            <el-option label="전체" value="" />
            <el-option label="개발팀" value="개발팀" />
            <el-option label="디자인팀" value="디자인팀" />
            <el-option label="마케팅팀" value="마케팅팀" />
          </el-select>
        </div>
      </div>
      
      <div class="payroll-table">
        <el-table :data="filteredPayrolls" style="width: 100%">
          <el-table-column prop="employee" label="직원" width="100" align="center" />
          <el-table-column prop="department" label="부서" width="110" align="center" />
          <el-table-column prop="position" label="직책" width="110" align="center" />
          <el-table-column prop="basicSalary" label="기본급" width="130" align="center">
            <template #default="scope">
              {{ scope.row.basicSalary.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="allowance" label="수당" width="130" align="center">
            <template #default="scope">
              {{ scope.row.allowance.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="deduction" label="공제" width="130" align="center">
            <template #default="scope">
              {{ scope.row.deduction.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="netSalary" label="실수령액" width="130" align="center">
            <template #default="scope">
              <span class="net-salary">{{ scope.row.netSalary.toLocaleString() }}원</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="상태" width="110" align="center">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="상세" width="75" align="center">
            <template #default="scope">
              <el-button type="text" size="small" @click="viewPayrollDetail(scope.row)">
                <el-icon><View /></el-icon>
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="수정" width="75" align="center">
            <template #default="scope">
              <el-button type="text" size="small" @click="editPayroll(scope.row)">
                <el-icon><Edit /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 급여 상세 모달 -->
    <el-dialog
      v-model="showPayrollDetail"
      title="급여 상세"
      width="800px"
    >
      <div v-if="selectedPayroll" class="payroll-detail">
        <div class="detail-header">
          <el-avatar :src="selectedPayroll.avatar" :size="60" />
          <div class="detail-info">
            <h3>{{ selectedPayroll.employee }}</h3>
            <p>{{ selectedPayroll.position }} • {{ selectedPayroll.department }}</p>
            <el-tag :type="getStatusType(selectedPayroll.status)">
              {{ selectedPayroll.status }}
            </el-tag>
          </div>
        </div>
        
        <div class="payroll-breakdown">
          <div class="breakdown-section">
            <h4>급여 구성</h4>
            <div class="breakdown-item">
              <span class="label">기본급</span>
              <span class="value">{{ selectedPayroll.basicSalary.toLocaleString() }}원</span>
            </div>
            <div class="breakdown-item">
              <span class="label">수당</span>
              <span class="value">{{ selectedPayroll.allowance.toLocaleString() }}원</span>
            </div>
            <div class="breakdown-item">
              <span class="label">총 급여</span>
              <span class="value total">{{ (selectedPayroll.basicSalary + selectedPayroll.allowance).toLocaleString() }}원</span>
            </div>
          </div>
          
          <div class="breakdown-section">
            <h4>공제 내역</h4>
            <div class="breakdown-item">
              <span class="label">4대보험</span>
              <span class="value">{{ selectedPayroll.insurance.toLocaleString() }}원</span>
            </div>
            <div class="breakdown-item">
              <span class="label">소득세</span>
              <span class="value">{{ selectedPayroll.incomeTax.toLocaleString() }}원</span>
            </div>
            <div class="breakdown-item">
              <span class="label">지방소득세</span>
              <span class="value">{{ selectedPayroll.localTax.toLocaleString() }}원</span>
            </div>
            <div class="breakdown-item">
              <span class="label">총 공제</span>
              <span class="value total">{{ selectedPayroll.deduction.toLocaleString() }}원</span>
            </div>
          </div>
          
          <div class="breakdown-section">
            <h4>실수령액</h4>
            <div class="net-salary-section">
              <span class="net-label">실수령액</span>
              <span class="net-value">{{ selectedPayroll.netSalary.toLocaleString() }}원</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'PayrollPage',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      selectedMonth: '2024-01',
      selectedDepartment: '',
      showPayrollDetail: false,
      selectedPayroll: null,
      totalPayroll: 75000000,
      averagePayroll: 5000000,
      payrolls: [
        {
          id: 1,
          employee: '김철수',
          department: '개발팀',
          position: '팀장',
          avatar: 'https://via.placeholder.com/32',
          basicSalary: 5000000,
          allowance: 500000,
          deduction: 400000,
          netSalary: 5100000,
          insurance: 300000,
          incomeTax: 80000,
          localTax: 8000,
          status: '지급완료'
        },
        {
          id: 2,
          employee: '박민수',
          department: '개발팀',
          position: '주임',
          avatar: 'https://via.placeholder.com/32',
          basicSalary: 4000000,
          allowance: 300000,
          deduction: 320000,
          netSalary: 3980000,
          insurance: 240000,
          incomeTax: 60000,
          localTax: 6000,
          status: '지급완료'
        },
        {
          id: 3,
          employee: '이지은',
          department: '개발팀',
          position: '대리',
          avatar: 'https://via.placeholder.com/32',
          basicSalary: 3500000,
          allowance: 200000,
          deduction: 280000,
          netSalary: 3420000,
          insurance: 210000,
          incomeTax: 50000,
          localTax: 5000,
          status: '지급완료'
        },
        {
          id: 4,
          employee: '김영희',
          department: '디자인팀',
          position: '팀장',
          avatar: 'https://via.placeholder.com/32',
          basicSalary: 4500000,
          allowance: 400000,
          deduction: 360000,
          netSalary: 4540000,
          insurance: 270000,
          incomeTax: 70000,
          localTax: 7000,
          status: '지급완료'
        },
        {
          id: 5,
          employee: '정수진',
          department: '디자인팀',
          position: '주임',
          avatar: 'https://via.placeholder.com/32',
          basicSalary: 3800000,
          allowance: 250000,
          deduction: 304000,
          netSalary: 3746000,
          insurance: 228000,
          incomeTax: 57000,
          localTax: 5700,
          status: '지급완료'
        }
      ]
    }
  },
  computed: {
    filteredPayrolls() {
      let filtered = this.payrolls
      
      if (this.selectedDepartment) {
        filtered = filtered.filter(payroll => payroll.department === this.selectedDepartment)
      }
      
      return filtered
    }
  },
  methods: {
    getStatusType(status) {
      const statusMap = {
        '지급완료': 'success',
        '지급대기': 'warning',
        '지급실패': 'danger'
      }
      return statusMap[status] || 'info'
    },
    viewPayrollDetail(payroll) {
      this.selectedPayroll = payroll
      this.showPayrollDetail = true
    },
    editPayroll(payroll) {
      this.info(`${payroll.employee}님의 급여 정보를 수정합니다.`)
    },
    calculatePayroll() {
      this.success('급여 계산이 완료되었습니다.', {
        title: '계산 완료',
        duration: 3000
      })
    },
    exportPayroll() {
      this.success('급여 내보내기가 완료되었습니다.', {
        title: '내보내기 완료',
        duration: 3000
      })
    }
  }
}
</script>

<style scoped>
.payroll {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
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

.payroll-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.payroll-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.payroll-card:hover {
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  background: #4f46e5;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 12px;
  color: #909399;
}

.payroll-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.filter-options {
  display: flex;
  gap: 12px;
  align-items: center;
}

.payroll-table {
  padding: 0 24px 24px 24px;
}

.payroll-table :deep(.el-table th) {
  text-align: center;
  padding: 16px 6px;
}

.payroll-table :deep(.el-table td) {
  text-align: center;
  padding: 16px 6px;
}

.payroll-table :deep(.el-table th:last-child),
.payroll-table :deep(.el-table th:nth-last-child(2)) {
  padding: 12px 0px;
}

.payroll-table :deep(.el-table td:last-child),
.payroll-table :deep(.el-table td:nth-last-child(2)) {
  padding: 12px 0px;
}


.net-salary {
  font-weight: 600;
  color: #667eea;
}

.payroll-detail {
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

.payroll-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.breakdown-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.breakdown-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-item .label {
  color: #606266;
}

.breakdown-item .value {
  color: #2c3e50;
  font-weight: 500;
}

.breakdown-item .value.total {
  font-weight: 600;
  color: #667eea;
}

.net-salary-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #4f46e5;
  color: white;
  border-radius: 8px;
  margin-top: 16px;
}

.net-label {
  font-size: 18px;
  font-weight: 500;
}

.net-value {
  font-size: 24px;
  font-weight: 600;
}
</style>
