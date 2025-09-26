<template>
  <div class="payroll-elderly-incentive">
    <div class="page-header">
      <h1>고령자장려금신고서</h1>
      <p>고령자장려금신고서를 생성하고 제출합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>고령자장려금신고서</span>
            <div class="header-actions">
              <el-button @click="generateReport">신고서 생성</el-button>
              <el-button type="primary" @click="submitReport">제출</el-button>
            </div>
          </div>
        </template>
        
        <div class="incentive-filters">
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
        
        <el-table :data="elderlyData" style="width: 100%" class="elderly-table">
          <el-table-column prop="employeeName" label="직원명" min-width="120" align="center" />
          <el-table-column prop="age" label="나이" min-width="80" align="center" />
          <el-table-column prop="employmentPeriod" label="근무기간" min-width="120" align="center" />
          <el-table-column prop="basicSalary" label="기본급" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.basicSalary.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="incentiveAmount" label="장려금액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.incentiveAmount.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="총 지급액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.totalAmount.toLocaleString() }}원
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
  name: 'PayrollElderlyIncentive',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 목업 데이터 늘리기 (총 30행)
    const base = [...this.elderlyData]
    const targetCount = 30
    const mockNames = ['김민준','이서연','박도윤','최지우','정하준','한유진','조준서','윤예린','장수아','임시우','오태윤','서연우','신아윤','권승현','황재민','문서윤','홍지안','강유나','배민서','류하린']
    let i = 0
    while (this.elderlyData.length < targetCount) {
      const src = base[i % base.length]
      const idx = this.elderlyData.length + 1
      const varied = {
        employeeName: mockNames[idx % mockNames.length],
        age: src.age + (idx % 3),
        employmentPeriod: src.employmentPeriod,
        basicSalary: src.basicSalary + (idx % 5) * 10000,
        incentiveAmount: src.incentiveAmount + (idx % 4) * 10000,
        totalAmount: src.totalAmount + (idx % 6) * 10000,
        reportDate: `2024-09-${String((10 + (idx % 20))).padStart(2, '0')}`,
        status: src.status
      }
      this.elderlyData.push(varied)
      i++
    }
  },
  data() {
    return {
      reportPeriod: new Date(),
      reportType: 'monthly',
      submitStatus: '',
      elderlyData: [
        {
          employeeName: '김영수',
          age: 65,
          employmentPeriod: '3년 6개월',
          basicSalary: 2500000,
          incentiveAmount: 200000,
          totalAmount: 2700000,
          reportDate: '2024-09-25',
          status: '제출완료'
        },
        {
          employeeName: '이순자',
          age: 68,
          employmentPeriod: '5년 2개월',
          basicSalary: 2200000,
          incentiveAmount: 300000,
          totalAmount: 2500000,
          reportDate: '2024-09-25',
          status: '제출완료'
        },
        {
          employeeName: '박할머니',
          age: 70,
          employmentPeriod: '2년 8개월',
          basicSalary: 2000000,
          incentiveAmount: 400000,
          totalAmount: 2400000,
          reportDate: '2024-09-25',
          status: '제출완료'
        }
      ]
    }
  },
  methods: {
    generateReport() {
      this.success('고령자장려금신고서가 생성되었습니다.')
    },
    submitReport() {
      this.success('고령자장려금신고서가 제출되었습니다.')
    }
  }
}
</script>

<style scoped>
.payroll-elderly-incentive {
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

.incentive-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.elderly-table {
  margin-top: 20px;
}
</style>
