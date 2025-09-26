<template>
  <div class="balance-management">
    <div class="content-card">
      <div class="card-header">
        <h3>연차 잔고 관리</h3>
        <el-button type="primary" @click="exportToExcel">
          <el-icon><Download /></el-icon>
          <span style="margin-left: 8px;">엑셀로 내보내기</span>
        </el-button>
      </div>
      <div class="filter-section">
        <el-select v-model="selectedDepartment" placeholder="부서 필터" clearable style="width: 200px;">
          <el-option label="전체 부서" value=""></el-option>
          <el-option label="개발팀" value="dev"></el-option>
          <el-option label="디자인팀" value="design"></el-option>
          <el-option label="마케팅팀" value="marketing"></el-option>
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="이름으로 검색"
          clearable
          style="width: 240px;"
        >
          <template #prepend>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="balance-table">
        <el-table :data="mockData" style="width: 100%">
          <el-table-column prop="name" label="이름" width="150"></el-table-column>
          <el-table-column prop="department" label="부서" width="180"></el-table-column>
          <el-table-column prop="totalGranted" label="총 연차" align="right"></el-table-column>
          <el-table-column prop="used" label="사용 일수" align="right"></el-table-column>
          <el-table-column prop="remaining" label="잔여 일수" align="right">
            <template #default="scope">
              <span style="font-weight: bold; color: #4f46e5;">{{ scope.row.remaining }}</span>
            </template>
          </el-table-column>
          <el-table-column label="작업" width="180" align="center">
            <template #default="scope">
              <el-button size="small" @click="adjustBalance(scope.row)">잔고 조정</el-button>
              <el-button size="small" type="info" plain @click="viewHistory(scope.row)">이력 보기</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BalanceManagement',
  data() {
    return {
      searchQuery: '',
      selectedDepartment: '',
      mockData: [
        { id: 1, name: '김철수', department: '개발팀', totalGranted: 15, used: 5, remaining: 10 },
        { id: 2, name: '이영희', department: '디자인팀', totalGranted: 15, used: 10, remaining: 5 },
        { id: 3, name: '박민준', department: '개발팀', totalGranted: 16, used: 15.5, remaining: 0.5 },
        { id: 4, name: '최지우', department: '마케팅팀', totalGranted: 2, used: 0, remaining: 2 },
        { id: 5, name: '정다솜', department: '개발팀', totalGranted: 15, used: 7, remaining: 8 },
      ]
    };
  },
  methods: {
    exportToExcel() { console.log('Exporting to Excel...'); },
    adjustBalance(row) { console.log('Adjusting balance for', row.name); },
    viewHistory(row) { console.log('Viewing history for', row.name); },
  }
}
</script>

<style scoped>
.balance-management {
  max-width: 1200px;
  margin: 0 auto;
}
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}
.filter-section {
  padding: 20px 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  background-color: #f8f9fa;
}
.balance-table {
  padding: 0 24px 24px;
}
</style>
