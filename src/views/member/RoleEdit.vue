<template>
  <div class="role-edit-page">
    <div class="page-header">
      <h1>역할 수정</h1>
    </div>

    <div class="form-container">
      <el-form label-position="top">
        <el-form-item label="역할명">
          <el-input v-model="roleName" placeholder="역할의 이름을 입력하세요"></el-input>
        </el-form-item>

        <el-form-item label="권한 설정">
          <el-table :data="permissions" style="width: 100%">
            <el-table-column prop="namePart1" label="리소스"></el-table-column>
            <el-table-column prop="namePart2" label="액션"></el-table-column>
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
        <el-button type="primary" @click="updateRole">저장</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import roleService from '@/api/roleService';

export default {
  name: 'RoleEdit',
  data() {
    return {
      roleName: '',
      permissions: [], // Initialize as empty, will be populated by API
      rangeOptions: ['없음', '본인', '부서', '전사'],
    };
  },
  methods: {
    async fetchRoleData(id) {
      try {
        const response = await roleService.fetchRole(id);
        const roleData = response.data.data;
        this.roleName = roleData.name;

        const rangeMapping = {
          NONE: '없음',
          INDIVIDUAL: '본인',
          DEPARTMENT: '부서',
          COMPANY: '전사',
        };

        this.permissions = roleData.permissions.map(p => ({
          // namePart1, namePart2는 테이블 표시에 사용됩니다.
          namePart1: p.resource,
          namePart2: p.action,
          // selectedRange는 라디오 버튼 v-model에 사용됩니다.
          selectedRange: rangeMapping[p.currentRange],
          // rangeToIdMap은 저장 시 올바른 ID를 보내기 위해 필요합니다.
          rangeToIdMap: p.rangeToIdMap,
        }));

        // 리소스 기준으로 오름차순 정렬
        this.permissions.sort((a, b) => a.namePart1.localeCompare(b.namePart1));

      } catch (error) {
        console.error('Failed to fetch role data:', error);
        this.$message.error('역할 데이터를 불러오는데 실패했습니다.');
      }
    },
    async updateRole() {
      const rangeReverseMapping = {
        '본인': 'INDIVIDUAL',
        '부서': 'DEPARTMENT',
        '전사': 'COMPANY',
        '없음': 'NONE', // 코드 명확성을 위해 유지
      };

      const selectedPermissions = this.permissions
        .filter(p => p.selectedRange !== '없음') // '없음'으로 설정된 권한은 저장하지 않음
        .map(p => {
          const rangeEnum = rangeReverseMapping[p.selectedRange];
          const permissionId = p.rangeToIdMap[rangeEnum]; // 맵에서 올바른 ID 조회
          return {
            permissionId: permissionId,
            selectedRange: rangeEnum,
          };
        });

      const roleId = this.$route.params.id;
      const roleData = {
        name: this.roleName,
        permissions: selectedPermissions,
      };

      try {
        await roleService.updateRole(roleId, roleData);
        this.$message.success('역할이 성공적으로 수정되었습니다.');
        this.$router.push('/employee/role');
      } catch (error) {
        console.error('Failed to update role:', error);
        this.$message.error('역할 수정에 실패했습니다.');
      }
    },
    handleCancel() {
      this.$router.back();
    }
  },
  created() {
    const roleId = this.$route.params.id;
    this.fetchRoleData(roleId);
  }
};
</script>

<style scoped>
.role-edit-page {
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