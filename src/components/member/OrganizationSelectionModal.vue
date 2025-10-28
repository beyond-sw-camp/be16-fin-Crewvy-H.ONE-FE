<template>
  <el-dialog v-model="visible" title="조직 선택" width="400px">
    <el-input v-model="orgSearch" placeholder="조직 검색" clearable class="search-input" />
    <el-tree
      ref="orgTreeRef"
      :data="orgTree"
      :props="defaultProps"
      node-key="id"
      :default-expanded-keys="expandedKeys"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
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
import { ref, watch, defineEmits, defineExpose } from 'vue';
import { ElMessage } from 'element-plus';
import organizationService from '@/api/organizationService';

const visible = ref(false);
const orgSearch = ref('');
const orgTree = ref([]);
const defaultProps = { children: 'children', label: 'name' };
const expandedKeys = ref([]);
const orgTreeRef = ref(null);
const selectedNode = ref(null);

const emit = defineEmits(['organization-selected']);

watch(orgSearch, (val) => {
  orgTreeRef.value.filter(val);
});

// Simplified fetchOrganizations for debugging
const fetchOrganizations = async () => {
  console.log("MODAL: Attempting to fetch organizations...");
  try {
    const response = await organizationService.getOrganizationTree();
    console.log("MODAL API SUCCESS:", response);
    console.log("Raw data from API:", response.data.data);
  } catch (error) {
    console.error("MODAL API ERROR:", error);
  }
};

const filterNode = (value, data) => {
  if (!value) return true;
  return data.name.toLowerCase().includes(value.toLowerCase());
};

const handleNodeClick = (data) => {
  selectedNode.value = data;
};

const confirmSelection = () => {
  if (selectedNode.value) {
    emit('organization-selected', selectedNode.value);
    close();
  } else {
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
