<template>
  <el-dialog
    :model-value="visible"
    title="팀원 선택"
    width="80%"
    top="5vh"
    @update:modelValue="$emit('update:visible', $event)"
  >
    <div class="editor-layout">
      <!-- Left: Organization Chart -->
      <div class="org-chart-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>조직도 (더블클릭하여 추가)</span>
            </div>
          </template>
          <div>
            <el-tree
              :data="orgChartData"
              :props="defaultProps"
              node-key="id"
              @node-dblclick="handleNodeDoubleClick"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node" @dblclick="() => handleNodeDoubleClick(data)">
                  <span>{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-card>
      </div>

      <!-- Right: Selected Team Members -->
      <div class="selected-members-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>선택된 팀원</span>
            </div>
          </template>
          <div>
            <div v-if="selectedMembers.length === 0" class="empty-state">
              <p>조직도에서 팀원을 더블클릭하여 추가하세요.</p>
            </div>
            <div v-else>
              <div v-for="(member, index) in selectedMembers" :key="member.id" class="member-item">
                <div class="member-info">
                  <el-icon v-if="member.isCreater"><Star /></el-icon>
                  <el-icon v-else><User /></el-icon>
                  <span>{{ member.name }} ({{ member.department }} / {{ member.position }})</span>
                  <span class="member-role">{{ member.isCreater ? '관리자' : '팀원' }}</span>
                </div>
                <el-button v-if="!member.isCreater" type="danger" size="small" plain @click="removeMember(index)">삭제</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">취소</el-button>
      <el-button type="primary" @click="saveSelectedMembers">저장</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { User, Star } from '@element-plus/icons-vue';
import apiClient from '@/api/http';

export default {
  name: 'TeamMemberSelectionModal',
  components: {
    User,
    Star,
  },
  props: {
    visible: Boolean,
    initialSelectedMembers: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:visible', 'save'],
  setup(props, { emit }) {
    const orgChartData = ref([]);
    const selectedMembers = ref([]);

    const defaultProps = {
      children: 'children',
      label: 'label',
      isLeaf: 'isLeaf',
    };

    const transformOrgData = (nodes) => {
      if (!nodes) return [];
      return nodes.map(node => {
        const childDepartments = transformOrgData(node.children);

        let memberNodes = [];
        if (node.members && node.members.length > 0) {
          memberNodes = node.members.map(member => ({
            id: member.id,
            label: `${member.name} (${member.position})`,
            isLeaf: true,
            memberData: member,
          }));
        }

        const combinedChildren = [...memberNodes, ...childDepartments];

        return {
          id: node.id,
          label: node.label,
          children: combinedChildren,
        };
      });
    };

    const fetchOrgChartData = async () => {
      try {
        const response = await apiClient.get('/member-service/organization/tree-with-members');
        const transformedData = transformOrgData(response.data.data);
        orgChartData.value = transformedData;
      } catch (error) {
        console.error("Failed to fetch organization chart data:", error);
      }
    };

    onMounted(async () => {
      await fetchOrgChartData();
    });

    watch(() => props.visible, (newValue) => {
      if (newValue) {
        selectedMembers.value = JSON.parse(JSON.stringify(props.initialSelectedMembers));
      }
    });

    const handleNodeDoubleClick = (data) => {
      if (data.isLeaf && !selectedMembers.value.some(m => m.id === data.id)) {
        selectedMembers.value.push({
          id: data.id,
          name: data.memberData.name,
          department: data.memberData.department,
          position: data.memberData.position,
          memberPositionId: data.memberData.memberPositionId,
          isCreater: false,
        });
      }
    };

    const removeMember = (index) => {
      selectedMembers.value.splice(index, 1);
    };

    const saveSelectedMembers = () => {
      emit('save', selectedMembers.value);
      emit('update:visible', false);
    };

    return {
      orgChartData,
      defaultProps,
      selectedMembers,
      handleNodeDoubleClick,
      removeMember,
      saveSelectedMembers,
    };
  },
};
</script>

<style scoped>
.editor-layout {
  display: flex;
  gap: 20px;
  height: 60vh;
}
.org-chart-section, .selected-members-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.box-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.org-chart-section :deep(.el-card__body),
.selected-members-section :deep(.el-card__body) {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}
.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.empty-state {
  text-align: center;
  color: #909399;
  padding-top: 40px;
}

.member-role {
  font-size: 12px;
  color: #409eff;
  margin-left: 8px;
  font-weight: 500;
}
</style>
