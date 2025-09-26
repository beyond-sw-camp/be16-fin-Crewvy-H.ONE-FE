<template>
  <div class="create-role-page">
    <div class="page-header">
      <h1>역할 생성</h1>
    </div>

    <div class="form-container">
      <el-form label-position="top">
        <el-form-item label="역할명">
          <el-input v-model="roleName" placeholder="새 역할의 이름을 입력하세요"></el-input>
        </el-form-item>

        <el-form-item label="권한 설정">
          <el-table :data="permissions" style="width: 100%">
            <el-table-column prop="name" label="권한명"></el-table-column>
            <el-table-column prop="description" label="설명"></el-table-column>
            <el-table-column label="범위" width="350">
              <template #default="scope">
                <el-radio-group v-model="scope.row.selectedRange">
                  <el-radio v-for="option in rangeOptions" :key="option" :label="option">{{ option }}</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>

      <div class="form-actions">
        <el-button @click="handleCancel">취소</el-button>
        <el-button type="primary" @click="saveRole">저장</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateRole',
  data() {
    return {
      roleName: '',
      permissions: [
        { id: 1, name: '멤버 조회', description: '멤버 목록을 조회합니다.', selectedRange: '없음' },
        { id: 2, name: '멤버 상세정보', description: '멤버의 상세 정보를 봅니다.', selectedRange: '없음' },
        { id: 3, name: '멤버 추가', description: '새로운 멤버를 추가합니다.', selectedRange: '없음' },
        { id: 4, name: '멤버 수정', description: '멤버 정보를 수정합니다.', selectedRange: '없음' },
        { id: 5, name: '급여 정보 조회', description: '급여 정보를 조회합니다.', selectedRange: '없음' },
        { id: 6, name: '인사 평가 수행', description: '인사 평가를 수행합니다.', selectedRange: '없음' },
      ],
      rangeOptions: ['없음', '본인', '부서', '전사'],
    };
  },
  methods: {
    saveRole() {
      const selectedPermissions = this.permissions
        .filter(p => p.selectedRange !== '없음')
        .map(p => ({ permissionId: p.id, range: p.selectedRange }));

      console.log('Saving Role:', {
        roleName: this.roleName,
        permissions: selectedPermissions,
      });

      this.$message.success('역할이 성공적으로 생성되었습니다.');
      this.$router.push('/'); // Redirect to a relevant page after saving
    },
    handleCancel() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
.create-role-page {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 24px;
}

.form-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
</style>
