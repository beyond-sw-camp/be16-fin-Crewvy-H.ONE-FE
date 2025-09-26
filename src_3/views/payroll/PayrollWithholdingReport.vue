<template>
  <div class="payroll-withholding-report">
    <div class="page-header">
      <h1>원천징수이행신고서</h1>
      <p>원천징수이행신고서를 생성하고 제출합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>원천징수이행신고서</span>
            <div class="header-actions">
              <el-button @click="generateReport">신고서 생성</el-button>
              <el-button type="primary" @click="submitReport">제출</el-button>
            </div>
          </div>
        </template>
        
        <div class="report-filters">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="신고 기간">
                <el-date-picker
                  v-model="reportPeriod"
                  type="month"
                  placeholder="신고 기간 선택"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="신고 유형">
                <el-select v-model="reportType" placeholder="신고 유형 선택">
                  <el-option label="월별 신고" value="monthly" />
                  <el-option label="분기별 신고" value="quarterly" />
                  <el-option label="연말정산" value="yearly" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="제출 상태">
                <el-select v-model="submitStatus" placeholder="제출 상태 선택">
                  <el-option label="전체" value="" />
                  <el-option label="미제출" value="not_submitted" />
                  <el-option label="제출완료" value="submitted" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <el-table :data="withholdingData" style="width: 100%" class="withholding-table">
          <el-table-column prop="employeeName" label="직원명" min-width="120" align="center" />
          <el-table-column prop="residentNumber" label="주민등록번호" min-width="150" align="center" />
          <el-table-column prop="totalIncome" label="총 지급액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.totalIncome.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="withholdingTax" label="원천징수세" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.withholdingTax.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="localTax" label="지방소득세" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.localTax.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="totalTax" label="총 세액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.totalTax.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="reportDate" label="신고일" min-width="120" align="center" />
          <el-table-column prop="status" label="상태" min-width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '제출완료' ? 'success' : 'warning'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'PayrollWithholdingReport',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 목업 데이터 늘리기 (총 45행)
    const base = [...this.withholdingData]
    const targetCount = 45
    let i = 0
    while (this.withholdingData.length < targetCount) {
      const src = base[i % base.length]
      const idx = this.withholdingData.length + 1
      const varied = {
        employeeName: src.employeeName + idx,
        residentNumber: src.residentNumber,
        totalIncome: src.totalIncome + (idx % 11) * 10000,
        withholdingTax: src.withholdingTax + (idx % 8) * 3000,
        localTax: src.localTax + (idx % 6) * 1000,
        totalTax: src.totalTax + (idx % 9) * 4000,
        reportDate: src.reportDate,
        status: src.status
      }
      this.withholdingData.push(varied)
      i++
    }
  },
  data() {
    return {
      reportPeriod: new Date(),
      reportType: 'monthly',
      submitStatus: '',
      withholdingData: [
        {
          employeeName: '김철수',
          residentNumber: '123456-1234567',
          totalIncome: 3350000,
          withholdingTax: 335000,
          localTax: 33500,
          totalTax: 368500,
          reportDate: '2024-09-25',
          status: '제출완료'
        },
        {
          employeeName: '이영희',
          residentNumber: '234567-2345678',
          totalIncome: 3200000,
          withholdingTax: 320000,
          localTax: 32000,
          totalTax: 352000,
          reportDate: '2024-09-25',
          status: '제출완료'
        },
        {
          employeeName: '박민수',
          residentNumber: '345678-3456789',
          totalIncome: 2700000,
          withholdingTax: 270000,
          localTax: 27000,
          totalTax: 297000,
          reportDate: '2024-09-25',
          status: '제출완료'
        }
      ]
    }
  },
  methods: {
    generateReport() {
      this.success('원천징수이행신고서가 생성되었습니다.')
    },
    submitReport() {
      this.success('원천징수이행신고서가 제출되었습니다.')
    }
  }
}
</script>

<style scoped>
.payroll-withholding-report {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.page-header p {
  color: #606266;
  font-size: 14px;
}

.content-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.report-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.withholding-table {
  margin-top: 20px;
}
</style>
