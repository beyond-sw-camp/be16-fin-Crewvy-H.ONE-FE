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
          <div class="tree-content">
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
          <div class="tree-content">
            <draggable
              v-model="approvalLine"
              item-key="id"
              class="drag-area"
              handle=".handle"
            >
              <template #item="{ element, index }">
                <div class="approver-item">
                  <div class="approver-info">
                    <el-icon class="handle"><Rank /></el-icon>
                    <span>{{ index + 1 }}. {{ element.label }}</span>
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
import { ref } from 'vue';
import draggable from 'vuedraggable';
import { Rank } from '@element-plus/icons-vue';

export default {
  name: 'ApprovalLineEditorModal',
  components: {
    draggable,
    Rank,
  },
  props: {
    visible: Boolean,
  },
  emits: ['update:visible', 'save'],
  setup(props, { emit }) {
    const orgChartData = ref([
      {
        id: 'dept1', label: '경영지원본부',
        children: [
          { id: 'dept1-1', label: '인사팀', children: [{ id: 'user1', label: '김인사 (팀장)' }] },
          { id: 'dept1-2', label: '총무팀', children: [{ id: 'user2', label: '박총무 (사원)' }] },
        ],
      },
      {
        id: 'dept2', label: '개발본부',
        children: [
          {
            id: 'dept2-1', label: 'FE개발팀',
            children: [
              { id: 'user3', label: '최개발 (팀장)' },
              { id: 'user4', label: '이코딩 (대리)' },
            ],
          },
          {
            id: 'dept2-2', label: 'BE개발팀',
            children: [{ id: 'user5', label: '강서버 (과장)' }],
          },
        ],
      },
    ]);

    const defaultProps = {
      children: 'children',
      label: 'label',
    };

    const approvalLine = ref([
      { id: 'user3', label: '최개발 (팀장)' },
    ]);

    const addApprover = (data) => {
      // Only add if it's a user node (no children) and not already in the list
      if (data.id && !data.children && !approvalLine.value.some(a => a.id === data.id)) {
        approvalLine.value.push({ id: data.id, label: data.label });
      }
    };

    const handleNodeDoubleClick = (data) => {
      addApprover(data);
    };

    const removeApprover = (index) => {
      approvalLine.value.splice(index, 1);
    };

    const saveApprovalLine = () => {
      const lineToSave = approvalLine.value.map(item => ({ 
        id: item.id, 
        name: item.label.split(' (')[0] 
      }));
      emit('save', lineToSave);
      emit('update:visible', false);
    };

    return {
      orgChartData,
      defaultProps,
      approvalLine,
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
}
.box-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tree-content {
  flex-grow: 1;
  overflow-y: auto;
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
  height: 100%;
}
.approver-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}
.approver-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.handle {
  cursor: grab;
}
.empty-state {
  text-align: center;
  color: #909399;
  padding-top: 40px;
}
</style>