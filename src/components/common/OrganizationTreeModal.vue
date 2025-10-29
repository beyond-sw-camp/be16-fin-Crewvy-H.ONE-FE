<template>
  <el-dialog v-model="isModalVisible" title="조직 선택" width="500px" @close="closeModal">
    <div class="org-tree-container-modal">
      <el-input v-model="orgSearch" placeholder="조직 검색" clearable class="search-input-modal" />
      <div class="tree-container">
        <el-tree
          ref="orgTree"
          :data="orgTreeData"
          :props="defaultProps"
          node-key="id"
          @node-click="handleOrgNodeClick"
          :filter-node-method="filterNode"
          :expand-on-click-node="false"
          :default-expanded-keys="defaultExpandedOrgKeys"
          class="org-tree"
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node-modal">
              <span>{{ node.label }}</span>
              <span v-if="data.members && data.members.length > 0" class="member-count">
                {{ data.members.length }}명
              </span>
            </div>
          </template>
        </el-tree>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeModal">닫기</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import organizationService from '@/api/organizationService';
import { useSnackbar } from '@/composables/useSnackbar';

export default {
  name: 'OrganizationTreeModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:visible', 'select'],
  setup() {
    const { error } = useSnackbar();
    return { error };
  },
  data() {
    return {
      orgSearch: '',
      orgTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'label',
      },
      defaultExpandedOrgKeys: [],
    };
  },
  computed: {
    isModalVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit('update:visible', value);
      },
    },
  },
  watch: {
    orgSearch(val) {
      this.$refs.orgTree.filter(val);
    },
    visible(newVal) {
      if (newVal) {
        this.fetchOrganizationTree();
      }
    },
  },
  methods: {
    closeModal() {
      this.isModalVisible = false;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    handleOrgNodeClick(data) {
      this.$emit('select', { id: data.id, name: data.label });
      this.closeModal();
    },
    buildOrganizationTree(flatList) {
      if (!flatList || flatList.length === 0) {
        return [];
      }
      const map = {};
      flatList.forEach(org => {
        map[org.organizationId] = {
          ...org,
          id: org.organizationId,
          label: org.label,
          children: [],
        };
      });

      const roots = [];
      Object.values(map).forEach(node => {
        if (node.parentId) {
          const parent = map[node.parentId];
          if (parent) {
            parent.children.push(node);
          }
        } else {
          roots.push(node);
        }
      });
      return roots;
    },
    async fetchOrganizationTree() {
      try {
        const orgTreeData = (await organizationService.getOrganizationTree()).data.data;
        this.orgTreeData = this.buildOrganizationTree(orgTreeData);
        if (this.orgTreeData && this.orgTreeData.length > 0) {
          this.defaultExpandedOrgKeys = this.orgTreeData.map(rootNode => rootNode.id);
        }
      } catch (error) {
        console.error('Failed to fetch organization tree:', error);
        this.error('조직도를 불러오는데 실패했습니다.');
      }
    },
  },
};
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
