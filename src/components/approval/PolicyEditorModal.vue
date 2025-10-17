<template>
  <el-dialog
    :model-value="visible"
    title="정책 관리"
    width="80%"
    top="5vh"
    @update:modelValue="$emit('update:visible', $event)"
  >
    <div class="editor-layout">
      <!-- Left: Policy Settings -->
      <div class="policy-settings-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>정책 설정</span>
              <el-select v-model="policy.target" style="width: 120px;">
                <el-option label="직책" value="position"></el-option>
                <el-option label="직원" value="employee"></el-option>
              </el-select>
            </div>
          </template>
          <div v-if="policy.target === 'employee'">
            <el-tree
              :data="orgChartData"
              :props="defaultProps"
              node-key="id"
              @node-dblclick="addEmployeeToLine"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node" @dblclick="() => addEmployeeToLine(data)">
                  <span>{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
          <div v-if="policy.target === 'position'" class="position-list">
            <div v-for="pos in positions" :key="pos.id" class="position-card" @dblclick="addPositionToLine(pos)">
              {{ pos.name }}
            </div>
          </div>
        </el-card>
      </div>

      <!-- Right: Approval Line -->
      <div class="approval-line-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>결재 라인</span>
            </div>
          </template>
          <draggable
            v-model="approvalLine"
            :item-key="item => item.requirementType + item.requirementId"
            class="drag-area"
          >
            <template #item="{ element, index }">
              <div class="approver-item">
                <span>{{ index + 1 }}. {{ element.name }}</span>
                <el-button type="danger" size="small" plain @click="removeApprover(index)">삭제</el-button>
              </div>
            </template>
          </draggable>
          <div v-if="approvalLine.length === 0" class="empty-state">
            <p>정책 설정 또는 조직도에서 결재자를 더블클릭하여 추가하세요.</p>
          </div>

        </el-card>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">취소</el-button>
      <el-button type="primary" @click="savePolicy">저장</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/http';
import draggable from 'vuedraggable';
import { ElMessageBox, ElMessage } from 'element-plus';

export default {
  name: 'PolicyEditorModal',
  components: {
    draggable,
  },
  props: {
    visible: Boolean,
    documentId: String,
  },
  emits: ['update:visible', 'save'],
  setup(props, { emit }) {
    const policy = ref({
      lineType: 'default',
      autoApprove: false,
      target: 'position',
    });

    const orgChartData = ref([]);
    const defaultProps = {
      children: 'children',
      label: 'label',
      isLeaf: 'isLeaf',
    };

    const approvalLine = ref([]);

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

    const positions = ref([]);

    const fetchPositions = async () => {
      try {
        const response = await apiClient.get('/member-service/member/title');
        positions.value = response.data.data;
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      }
    };

    onMounted(() => {
      fetchOrgChartData();
      fetchPositions();
    });

    const addPositionToLine = (pos) => {
      if (!approvalLine.value.some(item => item.requirementId === pos.id)) {
        approvalLine.value.push({ requirementType: 'TITLE', requirementId: pos.id, name: pos.name });
      }
    };

    const addEmployeeToLine = (data) => {
      if (data.isLeaf && !approvalLine.value.some(item => item.requirementId === data.memberData.memberPositionId)) {
        approvalLine.value.push({ requirementType: 'MEMBER_POSITION', requirementId: data.memberData.memberPositionId, name: data.label });
      }
    };

    const removeApprover = (index) => {
      approvalLine.value.splice(index, 1);
    };

    const savePolicy = () => {
      ElMessageBox.confirm('정책을 저장하시겠습니까?', '저장 확인', {
        confirmButtonText: '저장',
        cancelButtonText: '취소',
        type: 'info',
      }).then(async () => {
        const requestBody = approvalLine.value.map((item, index) => ({
          requirementType: item.requirementType,
          requirementId: item.requirementId,
          lineIndex: index + 2,
        }));

        try {
          await apiClient.put(`/workforce-service/approval/document-policy/${props.documentId}`, requestBody);
          ElMessage({ type: 'success', message: '정책이 저장되었습니다.' });
          emit('save');
          emit('update:visible', false);
        } catch (error) {
          console.error('Failed to save policy:', error);
          ElMessage({ type: 'error', message: '정책 저장에 실패했습니다.' });
        }
      }).catch(() => {
        // Action cancelled
      });
    };

    return {
      policy,
      savePolicy,
      orgChartData,
      defaultProps,
      positions,
      approvalLine,
      addPositionToLine,
      addEmployeeToLine,
      removeApprover,
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
.policy-settings-section, .approval-line-section {
  flex: 1;
}
.box-card {
  height: 100%;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.setting-description {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
.position-list {}
.position-card {
  background-color: #f9f9f9;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  transition: all 0.3s ease;
}
.position-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  cursor: pointer;
}
.drag-area {
  min-height: 100px; 
}
.approver-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}
.empty-state {
  text-align: center;
  color: #909399;
  padding-top: 40px;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
