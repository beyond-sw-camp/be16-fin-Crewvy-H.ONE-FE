<template>
  <div class="role-edit-page">
    <div class="page-header">
      <h1>역할 수정</h1>
    </div>

    <el-card class="form-card">
      <el-form label-position="top">
        <el-form-item label="역할명">
          <el-input v-model="roleName" placeholder="역할의 이름을 입력하세요"></el-input>
        </el-form-item>

        <el-form-item label="설명">
          <el-input v-model="description" type="textarea" placeholder="역할에 대한 설명을 입력하세요"></el-input>
        </el-form-item>

        <div class="permission-section-header">
          <span class="section-title">권한 설정</span>
          <div class="bulk-actions">
            <span style="font-size: 14px; font-weight: 600; color: #606266; margin-right: 10px;">일괄 적용:</span>
            <el-button size="small" @click="setAllPermissions('없음')">없음</el-button>
            <el-button size="small" @click="setAllPermissions('본인')">본인</el-button>
            <el-button size="small" @click="setAllPermissions('부서')">부서</el-button>
            <el-button size="small" @click="setAllPermissions('전사')">전사</el-button>
          </div>
        </div>
        <div class="table-wrapper">
          <el-table :data="permissions" style="width: 100%" stripe border>
            <el-table-column prop="resource" label="리소스" min-width="150" header-align="center" align="center"></el-table-column>
            <el-table-column prop="action" label="액션" min-width="150" header-align="center" align="center"></el-table-column>
            <el-table-column label="범위" min-width="600" header-align="center">
              <template #default="scope">
                <el-radio-group v-model="scope.row.selectedRange">
                  <el-radio
                    v-for="option in rangeOptions"
                    :key="option"
                    :label="option"
                    :disabled="!scope.row.availableRanges.includes(option)"
                  >{{ option }}</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>

      <div class="form-actions">
        <el-button @click="handleCancel">취소</el-button>
        <el-button type="primary" @click="updateRole">저장</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import roleService from '@/api/roleService';

export default {
  name: 'RoleEdit',
  data() {
    return {
      roleName: '',
      description: '',
      permissions: [],
      rangeOptions: ['없음', '본인', '부서', '전사'],
    };
  },
  methods: {
    setAllPermissions(range) {
      this.permissions.forEach(p => {
        p.selectedRange = range;
      });
      this.$message.success(`모든 권한 범위를 '${range}'(으)로 설정했습니다.`);
    },
    async fetchRoleData(id) {
      try {
        const response = await roleService.fetchRole(id);
        const roleData = response.data.data;
        this.roleName = roleData.name;
        this.description = roleData.description;

        const rangeMapping = {
          NONE: '없음',
          INDIVIDUAL: '본인',
          DEPARTMENT: '부서',
          COMPANY: '전사',
        };

        this.permissions = roleData.permissionResList.map(p => {
          const availableRanges = Object.keys(p.rangeToIdMap).map(key => rangeMapping[key]);
          return {
            resource: p.resource,
            action: p.action,
            selectedRange: rangeMapping[p.permissionRange],
            rangeToIdMap: p.rangeToIdMap,
            availableRanges: availableRanges,
          };
        });

        this.permissions.sort((a, b) => a.resource.localeCompare(b.resource));

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
        '없음': 'NONE',
      };

      const selectedPermissions = this.permissions
        .filter(p => p.selectedRange !== '없음')
        .map(p => {
          const rangeEnum = rangeReverseMapping[p.selectedRange];
          const permissionId = p.rangeToIdMap[rangeEnum];
          if (permissionId !== null && permissionId !== undefined) {
            return {
              permissionId: permissionId,
              selectedRange: rangeEnum,
            };
          } else {
            return null;
          }
        })
        .filter(p => p !== null);

      const roleId = this.$route.params.id;
      const roleData = {
        name: this.roleName,
        description: this.description,
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
      this.$router.push('/employee/role');
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

.form-card {
  border-radius: 8px;
}

.form-card :deep(.el-form-item__label) {
  font-size: 14px;
  color: #606266;
  font-weight: 700;
}

.permission-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  color: #606266;
  font-weight: 700;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-wrapper {
  border-radius: 4px;
  overflow: hidden; /* Ensures border-radius is applied to the table */
  margin-bottom: 24px; /* Add margin to separate from form actions */
}

.table-wrapper :deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #303133;
  font-weight: 600;
}

.table-wrapper :deep(.el-table td, .el-table th) {
  padding: 16px 0;
  text-align: center;
}

.table-wrapper :deep(.el-radio-group) {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
</style>
