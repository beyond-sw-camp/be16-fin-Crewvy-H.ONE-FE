<template>
  <div class="add-organization-container">
    <h1 class="page-title">조직 추가</h1>
    <div class="form-container">
      <el-form ref="orgForm" :model="organization" label-position="top">
        <el-form-item label="조직명">
          <el-input v-model="organization.name" placeholder="조직명을 입력하세요"></el-input>
        </el-form-item>
        <el-form-item label="상위 조직">
          <el-select v-model="organization.parentId" placeholder="상위 조직을 선택하세요" style="width: 100%;">
            <el-option label="(최상위 조직)" :value="null"></el-option>
            <el-option label="경영팀" value="2"></el-option>
            <el-option label="개발팀" value="3"></el-option>
            <el-option label="디자인팀" value="4"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="form-actions">
        <el-button @click="handleCancel">취소</el-button>
        <el-button type="primary" @click="handleSubmit">추가</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddOrganization',
  data() {
    return {
      organization: {
        name: '',
        parentId: null,
      },
    };
  },
  methods: {
    async handleSubmit() {
      if (!this.organization.name) {
        this.$message.error('조직명을 입력해주세요.');
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': token ? `Bearer ${token}` : null };
        
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/organization/create`, 
          { parentId: this.organization.parentId, name: this.organization.name },
          { headers }
        );
        this.$message.success('새로운 조직이 추가되었습니다.');
        this.$router.push('/organization');
      } catch (error) {
        this.$message.error('작업에 실패했습니다.');
        console.error(error);
      }
    },
    handleCancel() {
      this.$router.push('/organization');
    },
  },
};
</script>

<style scoped>
.add-organization-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
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

.el-form-item {
  margin-bottom: 22px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
</style>
