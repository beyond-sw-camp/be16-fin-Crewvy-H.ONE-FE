<template>
  <div class="approval-line-management">
    <div class="content-card">
      <div class="card-header">
        <h3>결재선 관리</h3>
        <el-button type="primary" @click="createLine">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">새 결재선 추가</span>
        </el-button>
      </div>
      <div class="line-table">
        <el-table :data="mockData" style="width: 100%">
          <el-table-column prop="name" label="결재선 이름" width="250"></el-table-column>
          <el-table-column prop="description" label="설명"></el-table-column>
          <el-table-column label="단계">
            <template #default="scope">
              <el-tag v-for="step in scope.row.steps" :key="step" style="margin-right: 5px;">{{ step }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="작업" width="150" align="center">
            <template #default="scope">
              <el-button size="small" @click="editLine(scope.row)">수정</el-button>
              <el-button size="small" type="danger" plain @click="deleteLine(scope.row)">삭제</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApprovalLineManagement',
  data() {
    return {
      mockData: [
        {
          id: 1, 
          name: '기본 결재선', 
          description: '모든 부서의 기본 결재 라인입니다.', 
          steps: ['팀장', '부서장']
        },
        {
          id: 2, 
          name: '인사팀 결재선', 
          description: '인사 관련 문서를 위한 결재 라인입니다.', 
          steps: ['인사팀 담당자', '인사팀장', '경영지원실장']
        },
        {
          id: 3, 
          name: '긴급 지출 결의', 
          description: '50만원 이하 긴급 지출 시 사용됩니다.', 
          steps: ['재무팀장']
        },
      ]
    };
  },
  methods: {
    createLine() { console.log('Creating new line...'); },
    editLine(row) { console.log('Editing line', row.name); },
    deleteLine(row) { console.log('Deleting line', row.name); },
  }
}
</script>

<style scoped>
.approval-line-management {
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
.line-table {
  padding: 24px;
}
</style>
