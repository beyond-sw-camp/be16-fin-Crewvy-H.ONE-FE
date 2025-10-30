<template>
  <el-dialog v-model="visible" title="조직 선택" width="400px">
    <div class="org-tree-container-modal">
      <el-input v-model="orgSearch" placeholder="조직 검색" clearable class="search-input-modal" />
      <div class="tree-container">
        <el-tree
          ref="orgTreeRef"
          :data="orgTree"
          :props="defaultProps"
          node-key="id"
          :default-expanded-keys="expandedKeys"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          class="org-tree"
        >
        </el-tree>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">취소</el-button>
        <el-button type="primary" @click="confirmSelection">확인</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits, defineExpose, watch } from 'vue';
import { ElMessage } from 'element-plus';
import organizationService from '@/api/organizationService';

const visible = ref(false);
const orgTree = ref([]);
const defaultProps = { children: 'children', label: 'label' };
const expandedKeys = ref([]);
const orgTreeRef = ref(null);
const selectedNode = ref(null);
const orgSearch = ref('');

const emit = defineEmits(['organization-selected']);

const fetchOrganizations = async () => {
  try {
    const response = await organizationService.getOrganizationTreeForCreation();
    if (response.data && Array.isArray(response.data.data)) {
      orgTree.value = response.data.data;
      // Expand top-level nodes by default
      expandedKeys.value = orgTree.value.map(org => org.id);
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

const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};

watch(orgSearch, (val) => {
  orgTreeRef.value.filter(val);
});

defineExpose({
  open
});
</script>

<style scoped>
.org-tree-container-modal {
  display: flex;
  flex-direction: column;
}
.search-input-modal {
  margin-bottom: 16px;
}
.tree-container {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
  max-height: 400px;
  overflow-y: auto;
}
.custom-tree-node-modal {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.member-count {
  color: #909399;
  font-size: 12px;
}
</style>
