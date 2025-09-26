<template>
  <div class="grade-management-page">
    <div class="page-header">
      <h1>직급 관리</h1>
    </div>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>직급 목록</span>
          <el-button type="primary" @click="openAddModal">
            <el-icon style="margin-right: 8px"><Plus /></el-icon> 새로운 직급 추가
          </el-button>
        </div>
      </template>

      <el-table :data="grades" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="직급명" width="180" />
        <el-table-column prop="description" label="설명" />
        <el-table-column prop="employeeCount" label="인원" width="100">
          <template #default="scope">
            <span>{{ scope.row.employeeCount }}명</span>
          </template>
        </el-table-column>
        <el-table-column label="액션" width="150">
          <template #default="scope">
            <el-button size="small" @click="openEditModal(scope.row)">수정</el-button>
            <el-button size="small" type="danger" @click="deleteGrade(scope.row)">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="modalTitle" width="500px">
      <el-form :model="currentGrade" label-position="top">
        <el-form-item label="직급명">
          <el-input v-model="currentGrade.name" placeholder="예: 사원, 대리, 과장"></el-input>
        </el-form-item>
        <el-form-item label="설명">
          <el-input 
            type="textarea"
            :rows="3"
            v-model="currentGrade.description"
            placeholder="직급에 대한 설명을 입력하세요."
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">취소</el-button>
          <el-button type="primary" @click="saveGrade">저장</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GradeManagement',
  data() {
    return {
      loading: false,
      grades: [
        { id: 1, name: '사원', description: '회사의 기본 구성원입니다.', employeeCount: 8 },
        { id: 2, name: '주임', description: '실무 경험을 갖춘 구성원입니다.', employeeCount: 5 },
        { id: 3, name: '대리', description: '중간 관리자 역할을 수행합니다.', employeeCount: 4 },
        { id: 4, name: '과장', description: '팀의 핵심 실무를 담당합니다.', employeeCount: 3 },
        { id: 5, name: '차장', description: '부서의 주요 의사결정에 참여합니다.', employeeCount: 2 },
        { id: 6, name: '부장', description: '부서를 총괄하는 책임자입니다.', employeeCount: 1 },
      ],
      dialogVisible: false,
      isEdit: false,
      currentGrade: {
        id: null,
        name: '',
        description: '',
        employeeCount: 0
      }
    };
  },
  computed: {
    modalTitle() {
      return this.isEdit ? '직급 수정' : '직급 추가';
    }
  },
  methods: {
    openAddModal() {
      this.isEdit = false;
      this.currentGrade = { id: null, name: '', description: '', employeeCount: 0 };
      this.dialogVisible = true;
    },
    openEditModal(grade) {
      this.isEdit = true;
      this.currentGrade = { ...grade };
      this.dialogVisible = true;
    },
    saveGrade() {
      if (this.isEdit) {
        const index = this.grades.findIndex(g => g.id === this.currentGrade.id);
        if (index !== -1) {
          this.grades.splice(index, 1, this.currentGrade);
        }
        this.$message.success('직급이 수정되었습니다.');
      } else {
        this.currentGrade.id = Date.now(); // Simple ID generation
        this.grades.push(this.currentGrade);
        this.$message.success('새로운 직급이 추가되었습니다.');
      }
      this.dialogVisible = false;
    },
    deleteGrade(grade) {
      this.$confirm(`'${grade.name}' 직급을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`, '경고', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        setTimeout(() => { // Simulate API call
          const index = this.grades.findIndex(g => g.id === grade.id);
          if (index !== -1) {
            this.grades.splice(index, 1);
          }
          this.loading = false;
          this.$message.success('삭제되었습니다.');
        }, 500);
      }).catch(() => {
        this.$message.info('삭제가 취소되었습니다.');
      });
    }
  }
};
</script>

<style scoped>
.grade-management-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.box-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: 600;
}

.el-table th {
  background-color: #f5f7fa;
}

.dialog-footer {
  text-align: right;
}
</style>