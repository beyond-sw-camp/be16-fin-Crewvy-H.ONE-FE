<template>
  <div class="organizationView-page">
    <div class="page-header">
      <div class="header-content">
        <h1>조직 관리</h1>
      </div>
      <div class="header-actions">
        <!-- 필요한 경우 여기에 버튼을 추가할 수 있습니다. -->
      </div>
    </div>

    <div class="organization-content">
      <el-card class="org-tree-card">
        <template #header>
                  <div class="card-header">
                    <span>조직도</span>
                  </div>        </template>
        <el-input v-model="orgSearch" placeholder="조직 검색" clearable class="search-input" />
        <el-tree
          ref="orgTreeRef"
          :data="orgTree"
          :props="defaultProps"
          node-key="id"
          :default-expanded-keys="expandedKeys"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          draggable
          :allow-drop="allowDrop"
          @node-drop="handleNodeDrop"
          @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse"
          class="org-tree"
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span class="node-actions">
                <el-button size="small" type="success" plain @click.stop="openAddModal(data)">추가</el-button>
                <el-button size="small" plain @click.stop="openEditModal(data)">수정</el-button>
                <el-button size="small" type="danger" plain @click.stop="deleteNode(data)">삭제</el-button>
              </span>
            </div>
          </template>
        </el-tree>
      </el-card>
    </div>

    <el-dialog v-model="dialogVisible" :title="modalTitle" width="400px" @opened="handleDialogOpened">
      <el-form :model="currentOrg" label-position="top" @submit.prevent="saveOrganization">
        <el-form-item label="조직명">
          <el-input ref="orgNameInput" v-model="currentOrg.name" placeholder="조직의 이름을 입력하세요"></el-input> <!-- @keyup.enter 제거 -->
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">취소</el-button>
          <el-button type="primary" @click="saveOrganization">저장</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

const orgSearch = ref('');
const orgTree = ref([]);
const defaultProps = { children: 'children', label: 'name' };
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentOrg = reactive({ id: null, name: '' });
const parentNode = ref(null);
const expandedKeys = ref([]);
const orgTreeRef = ref(null);
const orgNameInput = ref(null); // ref 선언

const modalTitle = computed(() => (isEdit.value ? '조직 수정' : '조직 추가'));

// 모달이 열릴 때 입력 필드에 포커스
const handleDialogOpened = () => {
  if (orgNameInput.value) {
    orgNameInput.value.focus();
  }
};

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

const openAddModal = (data) => {
  isEdit.value = false;
  parentNode.value = data;
  currentOrg.id = null;
  currentOrg.name = '';
  dialogVisible.value = true;
};

const openEditModal = (data) => {
  isEdit.value = true;
  parentNode.value = null;
  Object.assign(currentOrg, data);
  dialogVisible.value = true;
};

const saveOrganization = async () => {
  if (!currentOrg.name) {
    ElMessage.error('조직명을 입력해주세요.');
    return;
  }

  try {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Authorization': token ? `Bearer ${token}` : null };

    if (isEdit.value) {
      await axios.put(`${process.env.VUE_APP_API_BASE_URL}/member-service/organization/${currentOrg.id}`,
        { name: currentOrg.name },
        { headers }
      );
      ElMessage.success('조직이 수정되었습니다.');
    } else {
      const parentId = parentNode.value ? parentNode.value.id : null;
      if (!parentId) {
        ElMessage.error('최상위 조직은 하나만 존재할 수 있습니다.');
        return;
      }
      await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/organization/create`,
        { parentId: parentId, name: currentOrg.name },
        { headers }
      );
      ElMessage.success('새로운 조직이 추가되었습니다.');
    }
    dialogVisible.value = false;
    fetchOrganizations();
  } catch (error) {
    ElMessage.error('작업에 실패했습니다.');
    console.error(error);
  }
};

const deleteNode = (data) => {
  ElMessageBox.confirm(`'${data.name}' 을 삭제하시겠습니까?`, '경고', {
    confirmButtonText: '삭제',
    cancelButtonText: '취소',
    type: 'warning',
  }).then(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/member-service/organization/${data.id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : null
        }
      });
      ElMessage.success('삭제되었습니다.');
      fetchOrganizations();
    } catch (error) {
      const errorMessage = error.response?.data?.message || '삭제에 실패했습니다.';
      ElMessage.error(errorMessage);
      console.error(error);
    }
  }).catch(() => {
    ElMessage.info('삭제가 취소되었습니다.');
  });
};

const allowDrop = (draggingNode, dropNode, type) => {
  if (dropNode.data.parent === null) {
    return type !== 'inner';
  }
  if (draggingNode.data.parent === null) {
    return false;
  }
  return true;
};

const handleNodeDrop = async (draggingNode, dropNode, dropType) => {
  let parent = dropNode.parent;
  if (dropType === 'inner') {
    parent = dropNode;
  }

  const children = parent.childNodes.map(node => node.data.id);

  try {
    const token = localStorage.getItem('accessToken');
    await axios.put(`${process.env.VUE_APP_API_BASE_URL}/member-service/organization/reorder`, { idList: children }, { // ReorderReq DTO 형식에 맞춰 변경
      headers: {
        'Authorization': token ? `Bearer ${token}` : null
      }
    });
    ElMessage.success('조직 순서가 변경되었습니다.');
    fetchOrganizations();
  } catch (error) {
    ElMessage.error('조직 순서 변경에 실패했습니다.');
    console.error(error);
  }
};

const handleNodeExpand = (data) => {
  expandedKeys.value.push(data.id);
};

const handleNodeCollapse = (data) => {
  const index = expandedKeys.value.indexOf(data.id);
  if (index > -1) {
    expandedKeys.value.splice(index, 1);
  }
};

onMounted(() => {
  fetchOrganizations();
});
</script>

<style scoped>
.organizationView-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.header-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.header-actions {
  display: flex;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.org-tree-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background: white;
  padding: 20px 24px; /* 내부 패딩 추가 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: 600;
}

.search-input {
  margin-bottom: 16px;
}

.org-tree {
  background: transparent;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding: 10px 8px;
}

.node-actions {
  display: none; /* Hidden by default */
}

.custom-tree-node:hover .node-actions {
  display: inline-block; /* Show on hover */
}

.dialog-footer {
  text-align: right;
}
</style>
