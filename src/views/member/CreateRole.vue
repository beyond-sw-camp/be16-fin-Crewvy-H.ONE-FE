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
          <el-table :data="permissions" style="width: 100%">
            <el-table-column prop="resource" label="리소스"></el-table-column>
            <el-table-column prop="action" label="액션"></el-table-column>
            <el-table-column label="범위" width="350">
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
        <el-button type="primary" @click="saveRole">저장</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import roleService from '@/api/roleService';

export default {
  name: 'CreateRole',
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
    async fetchPermissions() {
      try {
        const response = await roleService.fetchAllPermissions();
        const permissionData = response.data.data;

        console.log('Fetched permissionData:', permissionData); // Debug log
        if (!Array.isArray(permissionData) || permissionData.length === 0) {
          console.warn('permissionData is empty or not an array:', permissionData);
          this.$message.warning('권한 데이터가 비어있거나 올바른 형식이 아닙니다.');
          this.permissions = []; // Ensure permissions array is empty
          return; // Stop further processing
        }

        const rangeMapping = {
          NONE: '없음',
          INDIVIDUAL: '본인',
          DEPARTMENT: '부서',
          COMPANY: '전사',
        };

        this.permissions = permissionData.map(p => {
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
        console.log('Final this.permissions array:', this.permissions); // Add this log

      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        this.$message.error('권한 목록을 불러오는데 실패했습니다.');
      }
    },
    async saveRole() {
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
          if (permissionId !== null && permissionId !== undefined) { // More explicit check
            return {
              permissionId: permissionId,
              selectedRange: rangeEnum,
            };
          } else {
            return null; // Return null for permissions without a valid ID for the selected range
          }
        })
        .filter(p => p !== null); // Filter out null entries

      console.log('Final selectedPermissions before sending:', selectedPermissions); // Add this log

      const roleData = {
        name: this.roleName,
        description: this.description,
        permissions: selectedPermissions,
      };

      console.log('Sending roleData:', roleData); // Debug log

      try {
        await roleService.createRole(roleData);
        this.$message.success('역할이 성공적으로 생성되었습니다.');
        this.$router.push('/employee/role');
      } catch (error) {
        console.error('Failed to create role:', error);
        this.$message.error('역할 생성에 실패했습니다.');
      }
    },
    handleCancel() {
      this.$router.push('/employee/role');
    }
  },
  created() {
    this.fetchPermissions();
  }
};
</script>

<style scoped>
.create-role-page {
  padding: 24px;
  max-width: 1200px;
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

.form-container :deep(.el-form-item__label) {
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
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
</style>