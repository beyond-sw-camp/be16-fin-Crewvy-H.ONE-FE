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
import axios from 'axios';
import { ElMessage } from 'element-plus';

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

const fetchOrganizations = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/organization/list`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : null
      }
    });
    orgTree.value = response.data.data;
    if (orgTree.value.length > 0 && expandedKeys.value.length === 0) {
      expandedKeys.value = [orgTree.value[0].id];
    }
  } catch (error) {
    ElMessage.error('조직도 데이터를 불러오는 데 실패했습니다.');
    console.error(error);
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
