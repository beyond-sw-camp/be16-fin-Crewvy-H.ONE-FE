<template>
  <el-dialog
    :model-value="visible"
    title="결재 라인 편집"
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

      <!-- Right: Applied Approval Line -->
      <div class="approval-line-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>결재 라인 (드래그하여 순서 변경)</span>
            </div>
          </template>
          <div>
            <!-- Static First Approver -->
            <div v-if="firstApprover" class="approver-item locked">
              <div class="approver-info">
                <el-icon><User /></el-icon>
                <span>1. {{ firstApprover.name }} ({{ firstApprover.department }} / {{ firstApprover.position }})</span>
              </div>
            </div>

            <!-- Draggable List for the rest -->
            <draggable
              v-model="draggableApprovers"
              item-key="id"
              class="drag-area"
              handle=".approver-info"
            >
              <template #item="{ element, index }">
                <div class="approver-item">
                  <div class="approver-info">
                    <el-icon><Rank /></el-icon>
                    <span>{{ index + 2 }}. {{ element.name }} ({{ element.department }} / {{ element.position }})</span>
                  </div>
                  <el-button type="danger" size="small" plain @click="removeApprover(index)">삭제</el-button>
                </div>
              </template>
            </draggable>
            
            <div v-if="approvalLine.length === 0" class="empty-state">
              <p>조직도에서 결재자를 더블클릭하여 추가하세요.</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">취소</el-button>
      <el-button type="primary" @click="saveApprovalLine">저장</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import draggable from 'vuedraggable';
import { Rank, User } from '@element-plus/icons-vue';
import apiClient from '@/api/http';

export default {
  name: 'ApprovalLineEditorModal',
  components: {
    draggable,
    Rank,
    User,
  },
  props: {
    visible: Boolean,
  },
  emits: ['update:visible', 'save'],
  setup(props, { emit }) {
    const orgChartData = ref([]);

    const defaultProps = {
      children: 'children',
      label: 'label',
      isLeaf: 'isLeaf',
    };

    const approvalLine = ref([]);

    const firstApprover = computed(() => approvalLine.value[0]);

    const draggableApprovers = computed({
      get() {
        return approvalLine.value.slice(1);
      },
      set(newValue) {
        approvalLine.value = [firstApprover.value, ...newValue];
      }
    });

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

    const findMemberNodeById = (nodes, userId) => {
      for (const node of nodes) {
        if (node.isLeaf && node.id === userId) {
          return node;
        }
        if (node.children) {
          const found = findMemberNodeById(node.children, userId);
          if (found) return found;
        }
      }
      return null;
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

    const resetApprovalLine = () => {
      approvalLine.value = [];
      const currentUserId = localStorage.getItem('memberId');
      if (currentUserId) {
        const userNode = findMemberNodeById(orgChartData.value, currentUserId);
        if (userNode) {
          approvalLine.value.push({
            id: userNode.id,
            name: userNode.memberData.name,
            department: userNode.memberData.department,
            position: userNode.memberData.position,
            memberPositionId: userNode.memberData.memberPositionId,
          });
        }
      }
    };

    onMounted(async () => {
      await fetchOrgChartData();
      resetApprovalLine();
    });

    watch(() => props.visible, (newValue) => {
      if (newValue) {
        resetApprovalLine();
      }
    });

    const handleNodeDoubleClick = (data) => {
      if (data.isLeaf && !approvalLine.value.some(a => a.id === data.id)) {
        approvalLine.value.push({
          id: data.id,
          name: data.memberData.name,
          department: data.memberData.department,
          position: data.memberData.position,
          memberPositionId: data.memberData.memberPositionId,
        });
      }
    };

    const removeApprover = (index) => {
      approvalLine.value.splice(index + 1, 1);
    };

    const saveApprovalLine = () => {
      const lineToSave = approvalLine.value.map(item => ({
        id: item.id,
        name: item.name,
        department: item.department,
        position: item.position,
        memberPositionId: item.memberPositionId,
      }));
      emit('save', lineToSave);
      emit('update:visible', false);
    };

    return {
      orgChartData,
      defaultProps,
      approvalLine,
      firstApprover,
      draggableApprovers,
      handleNodeDoubleClick,
      removeApprover,
      saveApprovalLine,
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
.org-chart-section, .approval-line-section {
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
.approval-line-section :deep(.el-card__body) {
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
.drag-area {
  min-height: 100px; /* Ensure drop area is available */
}
.approver-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}
.approver-item.locked {
  background-color: #f5f7fa;
  cursor: not-allowed;
}
.approver-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: grab;
}
.empty-state {
  text-align: center;
  color: #909399;
  padding-top: 40px;
}
</style>