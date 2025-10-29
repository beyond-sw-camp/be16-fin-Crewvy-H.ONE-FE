<template>
  <el-dialog v-model="visible" title="조직 선택" width="400px">
    <el-tree
      ref="orgTreeRef"
      :data="orgTree"
      :props="defaultProps"
      node-key="id"
      :default-expanded-keys="expandedKeys"
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
      class="org-tree"
    >
    </el-tree>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">취소</el-button>
        <el-button type="primary" @click="confirmSelection">확인</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits, defineExpose } from 'vue';
import { ElMessage } from 'element-plus';
import organizationService from '@/api/organizationService';

const visible = ref(false);
const orgTree = ref([]);
const defaultProps = { children: 'children', label: 'label' };
const expandedKeys = ref([]);
const orgTreeRef = ref(null);
const selectedNode = ref(null);

const emit = defineEmits(['organization-selected']);

const fetchOrganizations = async () => {
  try {
    const response = await organizationService.getOrganizationTreeForCreation();
    if (response.data && Array.isArray(response.data.data)) {
      orgTree.value = response.data.data;
    } else {
      console.error("Fetched data is not in the expected format.", response.data);
      orgTree.value = []; // Ensure tree is empty on bad data
    }
  } catch (error) {
    console.error("Failed to fetch organization tree:", error);
    ElMessage.error('조직도 정보를 불러오는 데 실패했습니다.');
    orgTree.value = []; // Ensure tree is empty on error
  }
};

const handleNodeClick = (data) => {
  selectedNode.value = data;
};

const confirmSelection = () => {
  if (selectedNode.value) {
    emit('organization-selected', selectedNode.value);
    close();
  }
  else {
    ElMessage.warning('조직을 선택해주세요.');
  }
};

const open = () => {
  visible.value = true;
  fetchOrganizations();
};

const close = () => {
  visible.value = false;
};

defineExpose({
  open
});
</script>

<style scoped>
.search-input {
  margin-bottom: 16px;
}
.org-tree {
  max-height: 400px;
  overflow-y: auto;
}
</style>
