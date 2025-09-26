<template>
  <div class="payroll-insurance-deduction">
    <div class="page-header">
      <h1>월별 보험료 공제 현황</h1>
      <p>직원별 4대보험료 공제 현황을 조회합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>보험료 공제 현황</span>
            <div class="header-actions">
              <el-button @click="exportReport">보고서 내보내기</el-button>
              <el-button type="primary" @click="refreshData">새로고침</el-button>
            </div>
          </div>
        </template>
        
        <div class="insurance-filters">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="조회 기간">
                <el-date-picker
                  v-model="inquiryPeriod"
                  type="month"
                  placeholder="조회 기간 선택"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="직원명">
                <el-input v-model="employeeName" placeholder="직원명 검색" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="부서">
                <el-select v-model="selectedDepartment" placeholder="부서 선택">
                  <el-option label="전체" value="" />
                  <el-option label="개발팀" value="dev" />
                  <el-option label="영업팀" value="sales" />
                  <el-option label="인사팀" value="hr" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <el-table :data="insuranceData" style="width: 100%" class="insurance-table">
          <el-table-column prop="employeeName" label="직원명" min-width="120" align="center" />
          <el-table-column prop="department" label="부서" min-width="100" align="center" />
          <el-table-column prop="nationalPension" label="국민연금" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.nationalPension.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="healthInsurance" label="건강보험" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.healthInsurance.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="employmentInsurance" label="고용보험" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.employmentInsurance.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="industrialAccident" label="산재보험" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.industrialAccident.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="totalInsurance" label="총 보험료" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.totalInsurance.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="period" label="적용기간" min-width="120" align="center" />
          <el-table-column prop="status" label="상태" min-width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '완료' ? 'success' : 'warning'">
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
  name: 'PayrollInsuranceDeduction',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 목업 데이터 늘리기 (총 40행)
    const base = [...this.insuranceData]
    const targetCount = 40
    const mockNames = ['김민준','이서연','박도윤','최지우','정하준','한유진','조준서','윤예린','장수아','임시우','오태윤','서연우','신아윤','권승현','황재민','문서윤','홍지안','강유나','배민서','류하린']
    let i = 0
    while (this.insuranceData.length < targetCount) {
      const src = base[i % base.length]
      const idx = this.insuranceData.length + 1
      const varied = {
        employeeName: mockNames[idx % mockNames.length],
        department: src.department,
        nationalPension: src.nationalPension + (idx % 7) * 1000,
        healthInsurance: src.healthInsurance + (idx % 5) * 800,
        employmentInsurance: src.employmentInsurance + (idx % 4) * 500,
        industrialAccident: src.industrialAccident + (idx % 3) * 400,
        totalInsurance: src.totalInsurance + (idx % 6) * 1500,
        period: src.period,
        status: src.status
      }
      this.insuranceData.push(varied)
      i++
    }
  },
  data() {
    return {
      inquiryPeriod: new Date(),
      employeeName: '',
      selectedDepartment: '',
      insuranceData: [
        {
          employeeName: '김철수',
          department: '개발팀',
          nationalPension: 135000,
          healthInsurance: 108000,
          employmentInsurance: 15000,
          industrialAccident: 10000,
          totalInsurance: 268000,
          period: '2024-09',
          status: '완료'
        },
        {
          employeeName: '이영희',
          department: '영업팀',
          nationalPension: 126000,
          healthInsurance: 100800,
          employmentInsurance: 14000,
          industrialAccident: 9000,
          totalInsurance: 249800,
          period: '2024-09',
          status: '완료'
        },
        {
          employeeName: '박민수',
          department: '인사팀',
          nationalPension: 112500,
          healthInsurance: 90000,
          employmentInsurance: 12500,
          industrialAccident: 8000,
          totalInsurance: 223000,
          period: '2024-09',
          status: '완료'
        }
      ]
    }
  },
  methods: {
    exportReport() {
      this.success('보험료 공제 보고서가 내보내기되었습니다.')
    },
    refreshData() {
      this.success('데이터가 새로고침되었습니다.')
    }
  }
}
</script>

<style scoped>
.payroll-insurance-deduction {
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

.insurance-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.insurance-table {
  margin-top: 20px;
}
</style>
