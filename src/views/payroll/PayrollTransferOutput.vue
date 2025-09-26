<template>
  <div class="payroll-transfer-output">
    <div class="page-header">
      <h1>급여 이체 출력</h1>
      <p>급여 이체를 위한 파일을 생성하고 출력합니다.</p>
    </div>
    
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 이체 파일 생성</span>
            <div class="header-actions">
              <el-button @click="generateCSVFile">CSV 파일</el-button>
              <el-button @click="generateTXTFile">TXT 파일</el-button>
              <el-button type="primary" @click="downloadFile">다운로드</el-button>
            </div>
          </div>
        </template>
        
        <div class="transfer-filters">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="이체 기간">
                <el-date-picker
                  v-model="transferPeriod"
                  type="month"
                  placeholder="이체 기간 선택"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="은행">
                <el-select v-model="selectedBank" placeholder="은행 선택">
                  <el-option label="전체" value="" />
                  <el-option label="국민은행" value="kb" />
                  <el-option label="신한은행" value="shinhan" />
                  <el-option label="우리은행" value="woori" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="파일 형식">
                <el-select v-model="fileFormat" placeholder="파일 형식 선택">
                  <el-option label="CSV" value="csv" />
                  <el-option label="Excel" value="excel" />
                  <el-option label="TXT" value="txt" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <el-table :data="transferData" style="width: 100%" class="transfer-table">
          <el-table-column prop="employeeName" label="직원명" min-width="120" align="center" />
          <el-table-column prop="accountNumber" label="계좌번호" min-width="150" align="center" />
          <el-table-column prop="bankName" label="은행" min-width="100" align="center" />
          <el-table-column prop="amount" label="이체금액" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.amount.toLocaleString() }}원
            </template>
          </el-table-column>
          <el-table-column prop="transferDate" label="이체일" min-width="120" align="center" />
          <el-table-column label="상태" min-width="100" align="center">
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
  name: 'PayrollTransferOutput',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  created() {
    // 목업 데이터 늘리기 (총 80행)
    const base = [...this.transferData]
    const targetCount = 80
    const mockNames = ['김민준','이서연','박도윤','최지우','정하준','한유진','조준서','윤예린','장수아','임시우','오태윤','서연우','신아윤','권승현','황재민','문서윤','홍지안','강유나','배민서','류하린']
    let i = 0
    while (this.transferData.length < targetCount) {
      const src = base[i % base.length]
      const idx = this.transferData.length + 1
      const varied = {
        employeeName: mockNames[idx % mockNames.length],
        accountNumber: src.accountNumber.replace(/\d/g, (d) => ((+d + idx) % 10)),
        bankName: src.bankName,
        amount: src.amount + (idx % 7) * 5000,
        transferDate: src.transferDate,
        status: src.status
      }
      this.transferData.push(varied)
      i++
    }
  },
  data() {
    return {
      transferPeriod: new Date(),
      selectedBank: '',
      fileFormat: 'csv',
      transferData: [
        {
          employeeName: '김철수',
          accountNumber: '123-456-789012',
          bankName: '국민은행',
          amount: 2747000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '이영희',
          accountNumber: '987-654-321098',
          bankName: '신한은행',
          amount: 2624000,
          transferDate: '2024-09-25',
          status: '완료'
        },
        {
          employeeName: '박민수',
          accountNumber: '456-789-123456',
          bankName: '우리은행',
          amount: 2214000,
          transferDate: '2024-09-25',
          status: '완료'
        }
      ]
    }
  },
  methods: {
    generateFile() {
      this.success('급여 이체 파일이 생성되었습니다.')
    },
    downloadFile() {
      this.success('파일 다운로드가 시작되었습니다.')
    },
    // CSV 이체 파일 생성
    generateCSVFile() {
      const headers = ['직원명', '계좌번호', '은행', '이체금액', '이체일', '상태']
      const csvContent = [
        headers.join(','),
        ...this.transferData.map(item => [
          item.employeeName,
          item.accountNumber,
          item.bankName,
          item.amount,
          item.transferDate,
          item.status
        ].join(','))
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `급여이체파일_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.success('CSV 이체 파일이 다운로드되었습니다.')
    },
    // TXT 이체 파일 생성 (은행 이체용)
    generateTXTFile() {
      const txtContent = this.transferData.map(item => 
        `${item.employeeName}|${item.accountNumber}|${item.bankName}|${item.amount}|${item.transferDate}|${item.status}`
      ).join('\n')

      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `급여이체파일_${new Date().toISOString().slice(0, 10)}.txt`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.success('TXT 이체 파일이 다운로드되었습니다.')
    }
  }
}
</script>

<style scoped>
.payroll-transfer-output {
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

.transfer-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.transfer-table {
  margin-top: 20px;
}
</style>
