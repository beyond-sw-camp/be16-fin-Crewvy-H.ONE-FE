<template>
  <div class="payroll-basic-info">
    <div class="page-header">
      <h1>급여 기본 정보</h1>
      <p>사원별 급여 항목과 합계를 확인하고 입력 방법을 전환할 수 있습니다.</p>
    </div>

    <div class="switch-bar">
      <span class="label">입력방법</span>
      <el-radio-group v-model="inputMode" size="small">
        <el-radio-button label="사원별" />
        <el-radio-button label="항목별" />
      </el-radio-group>
    </div>

    <div class="content-section" v-if="inputMode === '사원별'">
      <el-card>
        <div class="table-wrap">
          <el-table :data="rows" border height="540" stripe :show-summary="true" :summary-method="getSummaries" class="pay-grid">
            <el-table-column prop="empNo" label="사번" width="100" align="center" fixed="left" />
            <el-table-column prop="name" label="성명" width="120" align="center" fixed="left" />
            <el-table-column prop="dept" label="부서" width="120" align="center" />
            <el-table-column prop="position" label="직급" width="120" align="center" />
            <el-table-column prop="payTotal" label="지급합계" width="140" align="right">
              <template #default="{ row }">{{ format(row.payTotal) }}</template>
            </el-table-column>
            <el-table-column prop="deductTotal" label="공제합계" width="140" align="right">
              <template #default="{ row }">{{ format(row.deductTotal) }}</template>
            </el-table-column>
            <el-table-column prop="baseSalary" label="기본급여" width="140" align="right">
              <template #default="{ row }">{{ format(row.baseSalary) }}</template>
            </el-table-column>
            <el-table-column prop="otComm" label="연장수당(커뮤)" width="160" align="right">
              <template #default="{ row }">{{ format(row.otComm) }}</template>
            </el-table-column>
            <el-table-column prop="nightPay" label="야간수당" width="130" align="right">
              <template #default="{ row }">{{ format(row.nightPay) }}</template>
            </el-table-column>
            <el-table-column prop="otCenter" label="연장수당(센터)" width="160" align="right">
              <template #default="{ row }">{{ format(row.otCenter) }}</template>
            </el-table-column>
            <el-table-column prop="mealNontax" label="비과세식대" width="130" align="right">
              <template #default="{ row }">{{ format(row.mealNontax) }}</template>
            </el-table-column>
            <el-table-column prop="bizExpense" label="업무추진비" width="130" align="right">
              <template #default="{ row }">{{ format(row.bizExpense) }}</template>
            </el-table-column>
            <el-table-column prop="otEtc" label="연장수당(기타)" width="150" align="right">
              <template #default="{ row }">{{ format(row.otEtc) }}</template>
            </el-table-column>
            <el-table-column prop="annualPay" label="연차수당" width="130" align="right">
              <template #default="{ row }">{{ format(row.annualPay) }}</template>
            </el-table-column>
            <el-table-column prop="holidayPay" label="휴일보로수당" width="150" align="right">
              <template #default="{ row }">{{ format(row.holidayPay) }}</template>
            </el-table-column>
          </el-table>
        </div>
        <div class="footnotes">
          <ul>
            <li>표준 보수월액으로 국민연금 계산시 표준보수월액에서 천원미만을 절사한 금액으로 계산됩니다.</li>
            <li>2025년도 건강보험요율(3.545%) 조정, 장기요양보험요율(12.81% → 12.95%) 변경되었습니다.</li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'PayrollBasicInfo',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      inputMode: '사원별',
      rows: []
    }
  },
  methods: {
    format(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('ko-KR').format(val)
    },
    getSummaries({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) { sums[index] = ''; return }
        if (['성명','부서','직급'].includes(column.label)) { sums[index] = ''; return }
        const values = data.map(item => Number(item[column.property]))
        const total = values.reduce((acc, cur) => acc + (isNaN(cur) ? 0 : cur), 0)
        sums[index] = this.format(total)
      })
      return sums
    }
  },
  created() {
    const base = [
      { empNo: '221101', name: '임기형', dept: '관리팀', position: '센터장', baseSalary: 4842950, nightPay: 0, otCenter: 0, mealNontax: 100000, bizExpense: 300000, otComm: 0, otEtc: 0, annualPay: 0, holidayPay: 0 },
      { empNo: '220503', name: '김정원', dept: '관리팀', position: '경리과장', baseSalary: 2970630, nightPay: 0, otCenter: 0, mealNontax: 100000, bizExpense: 0, otComm: 0, otEtc: 0, annualPay: 0, holidayPay: 0 },
      { empNo: '220903', name: '조일원', dept: '관리팀', position: '관리실장', baseSalary: 3196020, nightPay: 0, otCenter: 608880, mealNontax: 100000, bizExpense: 0, otComm: 0, otEtc: 0, annualPay: 0, holidayPay: 0 },
      { empNo: '221128', name: '김라연', dept: '관리팀', position: '서무대리', baseSalary: 2444070, nightPay: 0, otCenter: 0, mealNontax: 100000, bizExpense: 0, otComm: 0, otEtc: 0, annualPay: 0, holidayPay: 0 }
    ]
    const list = []
    const names = ['이병선','유기남','허윤','문승규','이정호','정태석','여해경','조둘겸','이명희','이정민','박지현','김수현','최민재','정우성','한지민','윤하늘','오지훈','서예린','신도윤','권하준','황지우']
    for (let i = 0; i < 25; i++) {
      const src = base[i % base.length]
      const extra = i % names.length
      const row = {
        empNo: String(221101 + i),
        name: i < base.length ? src.name : names[extra],
        dept: src.dept,
        position: src.position,
        baseSalary: src.baseSalary - (i % 5) * 12000,
        nightPay: src.nightPay,
        otCenter: src.otCenter && i % 4 === 0 ? src.otCenter : 0,
        mealNontax: 100000,
        bizExpense: i % 6 === 0 ? 300000 : 0,
        otComm: i % 7 === 0 ? 573540 : 0,
        otEtc: i % 8 === 0 ? 21760 : 0,
        annualPay: i % 10 === 0 ? 45540 : 0,
        holidayPay: 0
      }
      row.payTotal = row.baseSalary + row.nightPay + row.otCenter + row.mealNontax + row.bizExpense + row.otComm + row.otEtc + row.annualPay + row.holidayPay
      row.deductTotal = Math.round(row.payTotal * 0.08)
      list.push(row)
    }
    this.rows = list
  }
}
</script>

<style scoped>
.payroll-basic-info {
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

.switch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.switch-bar .label {
  color: #606266;
  font-size: 13px;
}

.content-section {
  margin-bottom: 20px;
}

.table-wrap {
  overflow-x: auto;
}

.pay-grid .el-table__footer-wrapper .cell {
  font-weight: 600;
}

.footnotes {
  margin-top: 12px;
  background: #f6f8fa;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px 12px;
}

.footnotes ul {
  margin: 0;
  padding-left: 18px;
  color: #606266;
  font-size: 12px;
}
</style>
