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

    <!-- 사원별 입력 -->
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

    <!-- 항목별 입력 -->
    <div class="content-section" v-if="inputMode === '항목별'">
      <el-card>
        <div class="table-wrap">
          <el-table :data="itemRows" border height="540" stripe :show-summary="true" :summary-method="getItemSummaries" class="pay-grid auto-width-table">
            <el-table-column prop="itemName" label="급여항목" min-width="120" align="center" fixed="left" />
            <el-table-column prop="itemType" label="구분" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.itemType === '지급' ? 'success' : 'danger'" size="small">
                  {{ row.itemType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="employeeCount" label="대상인원" width="100" align="center">
              <template #default="{ row }">{{ row.employeeCount }}명</template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="총액" min-width="120" align="right">
              <template #default="{ row }">{{ format(row.totalAmount) }}</template>
            </el-table-column>
            <el-table-column prop="averageAmount" label="평균금액" min-width="120" align="right">
              <template #default="{ row }">{{ format(row.averageAmount) }}</template>
            </el-table-column>
            <el-table-column prop="maxAmount" label="최대금액" min-width="120" align="right">
              <template #default="{ row }">{{ format(row.maxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="minAmount" label="최소금액" min-width="120" align="right">
              <template #default="{ row }">{{ format(row.minAmount) }}</template>
            </el-table-column>
            <el-table-column prop="description" label="비고" min-width="150" align="center">
              <template #default="{ row }">{{ row.description }}</template>
            </el-table-column>
          </el-table>
        </div>
        <div class="footnotes">
          <ul>
            <li>항목별 입력에서는 각 급여 항목의 총합과 통계 정보를 확인할 수 있습니다.</li>
            <li>지급 항목은 급여 지급액, 공제 항목은 급여 공제액을 나타냅니다.</li>
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
      rows: [],
      itemRows: []
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
    },
    getItemSummaries({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) { sums[index] = '합계'; return }
        if (['구분', '비고'].includes(column.label)) { sums[index] = ''; return }
        if (column.label === '대상인원') {
          const total = data.reduce((acc, cur) => acc + cur.employeeCount, 0)
          sums[index] = `${total}명`
          return
        }
        const values = data.map(item => Number(item[column.property]))
        const total = values.reduce((acc, cur) => acc + (isNaN(cur) ? 0 : cur), 0)
        sums[index] = this.format(total)
      })
      return sums
    },
    generateItemRows() {
      const items = [
        { name: '기본급', type: '지급', description: '정규직원 기본 급여' },
        { name: '직책수당', type: '지급', description: '직책에 따른 추가 수당' },
        { name: '야간수당', type: '지급', description: '야간 근무 시 지급되는 수당' },
        { name: '연장수당', type: '지급', description: '정규 근무시간 초과 시 수당' },
        { name: '식비지원', type: '지급', description: '직원 식비 지원금' },
        { name: '교통비', type: '지급', description: '출퇴근 교통비 지원' },
        { name: '복리후생비', type: '지급', description: '복리후생 관련 지원금' },
        { name: '성과급', type: '지급', description: '업무 성과에 따른 보상' },
        { name: '특별수당', type: '지급', description: '특별한 업무 수행 시 수당' },
        { name: '국민연금', type: '공제', description: '국민연금 보험료 공제' },
        { name: '건강보험', type: '공제', description: '건강보험료 공제' },
        { name: '고용보험', type: '공제', description: '고용보험료 공제' },
        { name: '소득세', type: '공제', description: '소득세 공제' },
        { name: '지방소득세', type: '공제', description: '지방소득세 공제' }
      ]

      const itemRows = items.map(item => {
        const amounts = this.rows.map(row => {
          switch(item.name) {
            case '기본급': return row.baseSalary
            case '직책수당': return row.otComm
            case '야간수당': return row.nightPay
            case '연장수당': return row.otCenter
            case '식비지원': return row.mealNontax
            case '교통비': return row.bizExpense
            case '복리후생비': return row.otEtc
            case '성과급': return row.annualPay
            case '특별수당': return row.holidayPay
            case '국민연금': return Math.round(row.payTotal * 0.045)
            case '건강보험': return Math.round(row.payTotal * 0.03545)
            case '고용보험': return Math.round(row.payTotal * 0.008)
            case '소득세': return Math.round(row.payTotal * 0.02)
            case '지방소득세': return Math.round(row.payTotal * 0.002)
            default: return 0
          }
        })

        const nonZeroAmounts = amounts.filter(amount => amount > 0)
        const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0)
        const averageAmount = nonZeroAmounts.length > 0 ? totalAmount / nonZeroAmounts.length : 0
        const maxAmount = Math.max(...amounts)
        const minAmount = Math.min(...nonZeroAmounts.length > 0 ? nonZeroAmounts : [0])

        return {
          itemName: item.name,
          itemType: item.type,
          totalAmount: totalAmount,
          employeeCount: nonZeroAmounts.length,
          averageAmount: Math.round(averageAmount),
          maxAmount: maxAmount,
          minAmount: minAmount,
          description: item.description
        }
      })

      return itemRows
    }
  },
  created() {
    const base = [
      { empNo: '221101', name: '김철수', dept: '인사팀', position: '팀장', baseSalary: 4842950, nightPay: 0, otCenter: 0, mealNontax: 100000, bizExpense: 300000, otComm: 0, otEtc: 0, annualPay: 0, holidayPay: 0 },
      { empNo: '220503', name: '박민수', dept: '회계팀', position: '과장', baseSalary: 2970630, nightPay: 0, otCenter: 0, mealNontax: 100000, bizExpense: 0, otComm: 0, otEtc: 0, annualPay: 0, holidayPay: 0 },
      { empNo: '220903', name: '이지은', dept: '영업팀', position: '부장', baseSalary: 3196020, nightPay: 0, otCenter: 608880, mealNontax: 100000, bizExpense: 0, otComm: 0, otEtc: 0, annualPay: 0, holidayPay: 0 },
      { empNo: '221128', name: '최영희', dept: '마케팅팀', position: '대리', baseSalary: 2444070, nightPay: 0, otCenter: 0, mealNontax: 100000, bizExpense: 0, otComm: 0, otEtc: 0, annualPay: 0, holidayPay: 0 }
    ]
    const list = []
    const names = ['정민호','김수진','박지훈','이하늘','최동현','윤서연','강태우','임소영','한지우','오민수','신예린','조현우','송지민','배준호','류하늘','문지훈','권서연','황민수','안지우','노현우','홍예린']
    const departments = ['인사팀', '회계팀', '영업팀', '마케팅팀', '개발팀', '디자인팀', '고객지원팀', '구매팀', '생산팀', '품질관리팀']
    const positions = ['사원', '주임', '대리', '과장', '차장', '부장', '이사', '상무', '전무', '사장']
    
    for (let i = 0; i < 25; i++) {
      const src = base[i % base.length]
      const extra = i % names.length
      const row = {
        empNo: String(221101 + i),
        name: i < base.length ? src.name : names[extra],
        dept: departments[i % departments.length],
        position: positions[i % positions.length],
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
    this.itemRows = this.generateItemRows()
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

/* 자동 너비 조정 테이블 */
.auto-width-table {
  width: 100% !important;
  table-layout: auto !important;
}

.auto-width-table :deep(.el-table__body-wrapper) {
  width: 100% !important;
}

.auto-width-table :deep(.el-table__header-wrapper) {
  width: 100% !important;
}

.auto-width-table :deep(.el-table__body) {
  width: 100% !important;
}

.auto-width-table :deep(.el-table__header) {
  width: 100% !important;
}

/* 테이블이 카드 너비에 맞도록 조정 */
.content-section .el-card__body {
  padding: 20px;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}
</style>
