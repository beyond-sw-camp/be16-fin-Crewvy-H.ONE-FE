<template>
  <div class="organization-page">
    <div class="page-header">
      <h1>조직 관리</h1>
    </div>

    <div class="organization-content">
      <el-card class="org-tree-card">
        <template #header>
                  <div class="card-header">
                    <span>조직도</span>
                  </div>        </template>
        <el-input v-model="orgSearch" placeholder="조직 검색" clearable class="search-input" />
        <el-tree
          ref="orgTree"
          :data="orgTree"
          :props="defaultProps"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
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

    <el-dialog v-model="dialogVisible" :title="modalTitle" width="400px">
      <el-form :model="currentOrg" label-position="top">
        <el-form-item label="조직명">
          <el-input v-model="currentOrg.label" placeholder="조직의 이름을 입력하세요"></el-input>
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

<script>
export default {
  name: 'OrganizationPage',
  data() {
    return {
      orgSearch: '',
      orgTree: [
        {
          id: 1,
          label: 'H.ONE',
          children: [
            { id: 2, label: '경영팀', children: [] },
            {
              id: 3,
              label: '개발팀',
              children: [
                { id: 5, label: '프론트엔드', children: [] },
                { id: 6, label: '백엔드', children: [] },
              ],
            },
            { id: 4, label: '디자인팀', children: [] },
          ],
        },
      ],
      defaultProps: { children: 'children', label: 'label' },
      dialogVisible: false,
      isEdit: false,
      currentOrg: { id: null, label: '' },
      parentNode: null, // For adding new nodes
    };
  },
  computed: {
    modalTitle() {
      return this.isEdit ? '조직 수정' : '조직 추가';
    }
  },
  watch: {
    orgSearch(val) {
      this.$refs.orgTree.filter(val);
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.label.toLowerCase().includes(value.toLowerCase());
    },
    openAddModal(data) {
      this.isEdit = false;
      this.parentNode = data; // If data is null, it's a root node
      this.currentOrg = { id: null, label: '' };
      this.dialogVisible = true;
    },
    openEditModal(data) {
      this.isEdit = true;
      this.parentNode = null; // Not needed for editing
      this.currentOrg = { ...data };
      this.dialogVisible = true;
    },
    saveOrganization() {
      if (!this.currentOrg.label) {
        this.$message.error('조직명을 입력해주세요.');
        return;
      }

      if (this.isEdit) {
        // Find the node in the tree and update its label
        const node = this.$refs.orgTree.getNode(this.currentOrg.id);
        if (node) {
          node.data.label = this.currentOrg.label;
        }
        this.$message.success('조직이 수정되었습니다.');
      } else {
        // Add a new node
        const newNode = { id: Date.now(), label: this.currentOrg.label, children: [] };
        if (this.parentNode) {
          // Add to a specific parent
          if (!this.parentNode.children) {
            this.parentNode.children = [];
          }
          this.parentNode.children.push(newNode);
        } else {
          // Add as a root node
          this.orgTree.push(newNode);
        }
        this.$message.success('새로운 조직이 추가되었습니다.');
      }
      this.dialogVisible = false;
    },
    deleteNode(data) {
      this.$confirm(`'${data.label}' 조직을 삭제하시겠습니까? 하위 조직도 모두 삭제됩니다.`, '경고', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning',
      }).then(() => {
        const remove = (node, id) => {
          const parent = node.parent;
          const children = parent.data.children || parent.data;
          const index = children.findIndex(d => d.id === id);
          children.splice(index, 1);
        };
        remove(this.$refs.orgTree.getNode(data.id), data.id);
        this.$message.success('삭제되었습니다.');
      }).catch(() => {
        this.$message.info('삭제가 취소되었습니다.');
      });
    },
  },
};
</script>

<style scoped>
.organization-page {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 24px;
}

.org-tree-card {
  border-radius: 8px;
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
  padding-right: 8px;
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
