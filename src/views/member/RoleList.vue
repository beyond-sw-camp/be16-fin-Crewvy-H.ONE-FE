<template>
  <div class="role-list-page">
    <div class="page-header">
      <h1>역할 목록</h1>
      <el-button type="primary" @click="goToCreateRole">
        <el-icon><Plus /></el-icon> 새로운 역할 생성
      </el-button>
    </div>

    <el-row :gutter="24">
      <!-- Left Column: Role Cards -->
      <el-col :span="8">
        <div class="role-cards-container">
          <el-card 
            v-for="role in roles" 
            :key="role.id" 
            class="role-card" 
            :class="{ active: selectedRole && selectedRole.id === role.id }"
            @click="selectRole(role)"
          >
            <div class="role-card-header">
              <span class="role-name">{{ role.name }}</span>
              <span class="member-count">{{ role.memberCount }}명</span>
            </div>
            <p class="role-description">{{ role.description }}</p>
          </el-card>
        </div>
      </el-col>

      <!-- Right Column: Role Details -->
      <el-col :span="16">
        <el-card class="details-card" v-if="selectedRole">
          <template #header>
            <div class="details-header">
              <h3>{{ selectedRole.name }}</h3>
              <div>
                <el-button type="primary" plain size="small" @click="editRole(selectedRole)">수정</el-button>
                <el-button type="danger" plain size="small" @click="deleteRole(selectedRole)">삭제</el-button>
              </div>
            </div>
          </template>

          <div class="details-section">
            <h4>권한</h4>
            <div class="permissions-list">
              <el-tag v-for="permission in selectedRole.permissions" :key="permission" class="permission-tag">
                {{ permission }}
              </el-tag>
            </div>
          </div>

          <div class="details-section">
            <h4>할당된 멤버 ({{ selectedRole.memberCount }})</h4>
            <el-table :data="selectedRole.members" stripe style="width: 100%" height="300">
              <el-table-column prop="name" label="이름"></el-table-column>
              <el-table-column prop="department" label="부서"></el-table-column>
              <el-table-column prop="position" label="직책"></el-table-column>
            </el-table>
          </div>
        </el-card>
        <div v-else class="no-selection">
          <el-empty description="왼쪽에서 역할을 선택하세요." />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'RoleList',
  data() {
    return {
      selectedRole: null,
      roles: [
        {
          id: 1, 
          name: 'System Administrator',
          description: '시스템의 모든 기능에 접근할 수 있는 최상위 관리자입니다.',
          memberCount: 2,
          permissions: ['모든 설정 접근', '사용자 관리', '데이터베이스 관리', '서버 모니터링'],
          members: [
            { id: 101, name: '김관리', department: 'IT 지원팀', position: '시스템 관리자' },
            { id: 102, name: '박서버', department: 'IT 지원팀', position: '서버 관리자' },
          ]
        },
        {
          id: 2, 
          name: 'HR Manager',
          description: '인사 관련 정보(채용, 평가, 급여)를 관리합니다.',
          memberCount: 3,
          permissions: ['직원 정보 조회', '직원 정보 수정', '급여 관리', '채용 관리'],
          members: [
            { id: 201, name: '이인사', department: '인사팀', position: '팀장' },
            { id: 202, name: '최채용', department: '인사팀', position: '대리' },
            { id: 203, name: '정평가', department: '인사팀', position: '사원' },
          ]
        },
        {
          id: 3, 
          name: 'General User',
          description: '자신의 정보 조회, 게시판 사용 등 기본 기능만 사용합니다.',
          memberCount: 15,
          permissions: ['내 정보 조회', '게시판 사용', '근태 기록'],
          members: [
            { id: 301, name: '오일반', department: '개발팀', position: '선임 연구원' },
            { id: 302, name: '강평범', department: '디자인팀', position: '디자이너' },
            // ... more members
          ]
        },
      ],
    };
  },
  methods: {
    selectRole(role) {
        this.selectedRole = role;
    },
    goToCreateRole() {
      this.$router.push('/employee/roles/create');
    },
    editRole(role) {
      this.$router.push(`/employee/roles/edit/${role.id}`);
    },
    deleteRole(role) {
      this.$confirm(`'${role.name}' 역할을 삭제하시겠습니까?`, '경고', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        const index = this.roles.findIndex(r => r.id === role.id);
        if (index !== -1) {
          this.roles.splice(index, 1);
          this.selectedRole = null; // Clear selection
        }
        this.$message({ type: 'success', message: '삭제되었습니다.' });
      }).catch(() => {
        this.$message({ type: 'info', message: '삭제가 취소되었습니다.' });
      });
    }
  },
  mounted() {
      // Select the first role by default
      if (this.roles.length > 0) {
          this.selectedRole = this.roles[0];
      }
  }
};
</script>

<style scoped>
.role-list-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.page-header p {
    font-size: 14px;
    color: #606266;
    margin-top: 8px;
    margin-bottom: 16px;
}

.role-cards-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 60vh;
    overflow-y: auto;
    padding-right: 10px;
}

.role-card {
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.role-card.active {
    border-color: #4f46e5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.role-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.role-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.role-name {
    font-size: 16px;
    font-weight: 600;
}

.member-count {
    font-size: 14px;
    color: #909399;
}

.role-description {
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
}

.details-card {
    height: calc(60vh + 32px);
}

.details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.details-header h3 {
    font-size: 20px;
    font-weight: 600;
}

.details-section {
    margin-bottom: 32px;
}

.details-section:last-child {
    margin-bottom: 0;
}

.details-section h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
}

.permissions-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.no-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60vh;
}
</style>