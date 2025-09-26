<template>
  <div class="title-management-page">
    <div class="page-header">
      <h1>직책 관리</h1>
    </div>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>직책 목록</span>
          <el-button type="primary" @click="openAddModal">
            <el-icon style="margin-right: 8px"><Plus /></el-icon> 새로운 직책 추가
          </el-button>
        </div>
      </template>

      <el-table :data="titles" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="직책명" width="180" />
        <el-table-column prop="description" label="설명" />
        <el-table-column prop="employeeCount" label="인원" width="100">
          <template #default="scope">
            <span>{{ scope.row.employeeCount }}명</span>
          </template>
        </el-table-column>
        <el-table-column label="액션" width="150">
          <template #default="scope">
            <el-button size="small" @click="openEditModal(scope.row)">수정</el-button>
            <el-button size="small" type="danger" @click="deleteTitle(scope.row)">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="modalTitle" width="500px">
      <el-form :model="currentTitle" label-position="top">
        <el-form-item label="직책명">
          <el-input v-model="currentTitle.name" placeholder="예: 팀장, 실장"></el-input>
        </el-form-item>
        <el-form-item label="설명">
          <el-input 
            type="textarea"
            :rows="3"
            v-model="currentTitle.description"
            placeholder="직책에 대한 설명을 입력하세요."
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">취소</el-button>
          <el-button type="primary" @click="saveTitle">저장</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TitleManagement',
  data() {
    return {
      loading: false,
      titles: [
        { id: 1, name: '팀원', description: '프로젝트 팀의 구성원입니다.', employeeCount: 15 },
        { id: 2, name: '팀장', description: '프로젝트 팀을 이끄는 리더입니다.', employeeCount: 3 },
        { id: 3, name: '실장', description: '특정 부서를 총괄하는 책임자입니다.', employeeCount: 2 },
        { id: 4, name: '본부장', description: '사업 본부를 총괄하는 최고 책임자입니다.', employeeCount: 1 },
      ],
      dialogVisible: false,
      isEdit: false,
      currentTitle: {
        id: null,
        name: '',
        description: '',
        employeeCount: 0
      }
    };
  },
  computed: {
    modalTitle() {
      return this.isEdit ? '직책 수정' : '직책 추가';
    }
  },
  methods: {
    openAddModal() {
      this.isEdit = false;
      this.currentTitle = { id: null, name: '', description: '', employeeCount: 0 };
      this.dialogVisible = true;
    },
    openEditModal(title) {
      this.isEdit = true;
      this.currentTitle = { ...title };
      this.dialogVisible = true;
    },
    saveTitle() {
      if (this.isEdit) {
        const index = this.titles.findIndex(t => t.id === this.currentTitle.id);
        if (index !== -1) {
          this.titles.splice(index, 1, this.currentTitle);
        }
        this.$message.success('직책이 수정되었습니다.');
      } else {
        this.currentTitle.id = Date.now(); // Simple ID generation
        this.titles.push(this.currentTitle);
        this.$message.success('새로운 직책이 추가되었습니다.');
      }
      this.dialogVisible = false;
    },
    deleteTitle(title) {
      this.$confirm(`'${title.name}' 직책을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`, '경고', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        setTimeout(() => { // Simulate API call
          const index = this.titles.findIndex(t => t.id === title.id);
          if (index !== -1) {
            this.titles.splice(index, 1);
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
.title-management-page {
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