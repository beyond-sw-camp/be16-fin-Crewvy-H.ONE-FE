<template>
  <div class="payroll-item-inquiry">
    <div class="page-header">
      <h1>급여 항목별 조회</h1>
      <p>급여 항목별 상세 내역을 조회합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 항목별 조회</span>
            <div class="header-actions">
              <el-button @click="downloadCSV">CSV 다운로드</el-button>
              <el-button @click="downloadExcel">Excel 다운로드</el-button>
              <el-button type="primary" @click="refreshData">새로고침</el-button>
            </div>
          </div>
        </template>
        
        <div class="inquiry-filters">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="조회 기간">
                <el-date-picker
                  v-model="inquiryPeriod"
                  type="month"
                  placeholder="조회 기간 선택"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="직원명">
                <el-input v-model="employeeName" placeholder="직원명 검색" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="급여 항목">
                <el-select v-model="selectedItem" placeholder="항목 선택">
                  <el-option label="전체" value="" />
                  <el-option label="기본급" value="basic" />
                  <el-option label="수당" value="allowance" />
                  <el-option label="야근수당" value="overtime" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
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
        
        <el-table :data="itemData" style="width: 100%" class="item-table">
          <el-table-column prop="employeeName" label="직원명" min-width="120" align="center" />
          <el-table-column prop="department" label="부서" min-width="100" align="center" />
          <el-table-column prop="itemName" label="항목명" min-width="120" align="center" />
          <el-table-column prop="itemType" label="항목구분" min-width="100" align="center" />
          <el-table-column prop="amount" label="금액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.amount.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="calculation" label="계산식" min-width="150" align="center" />
          <el-table-column prop="period" label="적용기간" min-width="120" align="center" />
          <el-table-column prop="status" label="상태" min-width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '적용' ? 'success' : 'warning'">
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
  name: 'PayrollItemInquiry',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 목업 데이터 늘리기 (총 50행)
    const base = [...this.itemData]
    const targetCount = 50
    const mockNames = ['김민준','이서연','박도윤','최지우','정하준','한유진','조준서','윤예린','장수아','임시우','오태윤','서연우','신아윤','권승현','황재민','문서윤','홍지안','강유나','배민서','류하린']
    let i = 0
    while (this.itemData.length < targetCount) {
      const src = base[i % base.length]
      const idx = this.itemData.length + 1
      const varied = {
        employeeName: mockNames[idx % mockNames.length],
        department: src.department,
        itemName: src.itemName,
        itemType: src.itemType,
        amount: src.amount + (idx % 9) * 10000,
        calculation: src.calculation,
        period: src.period,
        status: src.status
      }
      this.itemData.push(varied)
      i++
    }
  },
  data() {
    return {
      inquiryPeriod: new Date(),
      employeeName: '',
      selectedItem: '',
      selectedDepartment: '',
      itemData: [
        {
          employeeName: '김철수',
          department: '개발팀',
          itemName: '기본급',
          itemType: '지급',
          amount: 3000000,
          calculation: '월급 × 1',
          period: '2024-09',
          status: '적용'
        },
        {
          employeeName: '김철수',
          department: '개발팀',
          itemName: '야근수당',
          itemType: '지급',
          amount: 150000,
          calculation: '시간 × 1.5',
          period: '2024-09',
          status: '적용'
        },
        {
          employeeName: '이영희',
          department: '영업팀',
          itemName: '기본급',
          itemType: '지급',
          amount: 2800000,
          calculation: '월급 × 1',
          period: '2024-09',
          status: '적용'
        },
        {
          employeeName: '이영희',
          department: '영업팀',
          itemName: '영업수당',
          itemType: '지급',
          amount: 300000,
          calculation: '고정금액',
          period: '2024-09',
          status: '적용'
        },
        {
          employeeName: '박민수',
          department: '인사팀',
          itemName: '기본급',
          itemType: '지급',
          amount: 2500000,
          calculation: '월급 × 1',
          period: '2024-09',
          status: '적용'
        }
      ]
    }
  },
  methods: {
    exportData() {
      this.success('데이터 내보내기가 완료되었습니다.')
    },
    refreshData() {
      this.success('데이터가 새로고침되었습니다.')
    },
    // CSV 파일 다운로드
    downloadCSV() {
      const headers = ['직원명', '부서', '항목명', '항목구분', '금액', '계산식', '적용기간', '상태']
      const csvContent = [
        headers.join(','),
        ...this.itemData.map(item => [
          item.employeeName,
          item.department,
          item.itemName,
          item.itemType,
          item.amount,
          item.calculation,
          item.period,
          item.status
        ].join(','))
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `급여항목별조회_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.success('CSV 파일이 다운로드되었습니다.')
    },
    // Excel 파일 다운로드
    async downloadExcel() {
      try {
        // XLSX 라이브러리 동적 로드
        const XLSX = await import('xlsx')
        
        // 데이터 준비
        const worksheetData = [
          ['급여 항목별 조회'],
          [`생성일: ${new Date().toLocaleDateString()}`],
          [''],
          ['직원명', '부서', '항목명', '항목구분', '금액', '계산식', '적용기간', '상태']
        ]
        
        // 데이터 행 추가
        this.itemData.forEach(item => {
          worksheetData.push([
            item.employeeName,
            item.department,
            item.itemName,
            item.itemType,
            item.amount,
            item.calculation,
            item.period,
            item.status
          ])
        })
        
        // 워크시트 생성
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
        
        // 워크북 생성
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, '급여항목별조회')
        
        // Excel 파일 생성 및 다운로드
        XLSX.writeFile(workbook, `급여항목별조회_${new Date().toISOString().slice(0, 10)}.xlsx`)
        
        this.success('Excel 파일이 다운로드되었습니다.')
        
      } catch (error) {
        console.error('Excel 생성 오류:', error)
        this.error('Excel 생성 중 오류가 발생했습니다.')
      }
    }
  }
}
</script>

<style scoped>
.payroll-item-inquiry {
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

.inquiry-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.item-table {
  margin-top: 20px;
}
</style>
