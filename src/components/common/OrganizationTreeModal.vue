<template>
  <el-dialog v-model="isModalVisible" title="직원 찾기" width="70%" @close="closeModal" top="5vh"
    custom-class="org-employee-modal" height="70%">
    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- Organization Tree Tab -->
      <el-tab-pane label="조직도" name="orgTree">
        <div class="two-pane-container">
          <!-- Left Pane: Org Tree -->
          <div class="left-pane">
            <el-input v-model="orgSearch" placeholder="조직 검색" clearable class="search-input" />
            <div class="tree-container">
              <el-tree ref="orgTree" :data="orgTreeData" :props="defaultProps" node-key="id"
                @node-click="handleOrgNodeClick" :filter-node-method="filterNode" :expand-on-click-node="false"
                :default-expanded-keys="defaultExpandedOrgKeys" class="org-tree">
                <template #default="{ node, data }">
                  <div class="custom-tree-node">
                    <span><i class="el-icon-folder"></i> {{ node.label }}</span>
                    <span v-if="data.members && data.members.length > 0" class="member-count">
                      {{ data.members.length }}
                    </span>
                  </div>
                </template>
              </el-tree>
            </div>
          </div>

          <!-- Right Pane: Employee List -->
          <div class="right-pane">
            <div v-if="!selectedOrg.id">
              <el-empty description="조직을 선택해주세요"></el-empty>
            </div>
            <div v-else class="employee-list-container">
              <h2 class="group-title">{{ selectedOrg.name }}</h2>
              <div v-if="isLoadingMembers" class="loading-container">
                <el-spinner />
              </div>
              <div v-else-if="!selectedOrg.members || selectedOrg.members.length === 0">
                <el-empty :description="`${selectedOrg.name}에 소속된 직원이 없습니다.`"></el-empty>
              </div>
              <div v-else class="employee-list-wrapper">
                <div class="employee-list">
                  <div class="employee-list-header">
                    <div class="employee-list-cell name">이름</div>
                    <div class="employee-list-cell position">직책</div>
                    <div class="employee-list-cell contact">연락처</div>
                    <div class="employee-list-cell email">이메일</div>
                    <div class="employee-list-cell status">상태</div>
                  </div>
                  <div v-for="member in selectedOrg.members" :key="member.id" class="employee-list-row">
                    <div class="employee-list-cell name">
                      <el-tooltip :content="member.name" placement="top" effect="dark" :show-after="1000">
                        <span class="cell-content">{{ member.name }}</span>
                      </el-tooltip>
                    </div>
                    <div class="employee-list-cell position">
                      <el-tooltip :content="member.titleName ? member.titleName.join(', ') : (member.position || '')"
                        placement="top" effect="dark" :show-after="1000">
                        <span class="cell-content">{{ member.titleName ? member.titleName.join(', ') : (member.position
                          || '')
                        }}</span>
                      </el-tooltip>
                    </div>
                    <div class="employee-list-cell contact">
                      <el-tooltip :content="member.phoneNumber || 'N/A'" placement="top" effect="dark"
                        :show-after="1000">
                        <span class="cell-content">{{ member.phoneNumber || 'N/A' }}</span>
                      </el-tooltip>
                    </div>
                    <div class="employee-list-cell email">
                      <el-tooltip :content="member.email || 'N/A'" placement="top" effect="dark" :show-after="1000">
                        <span class="cell-content">{{ member.email || 'N/A' }}<el-button :icon="CopyDocument" circle
                            plain @click="copyToClipboard(member.email, '이메일')" /></span>
                      </el-tooltip>
                    </div>
                    <div class="employee-list-cell status">{{ member.memberStatus || 'N/A' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Employee Search Tab -->
      <el-tab-pane label="직원 검색" name="empSearch">
        <div class="full-width-search-pane">
          <el-input v-model="employeeSearchQuery" placeholder="직원 이름, 부서, 연락처로 검색" clearable class="search-input"
            @keyup.enter="searchEmployees">
            <template #append>
              <el-button @click="searchEmployees" :loading="isEmployeeSearchLoading">
                <el-icon>
                  <Search />
                </el-icon>
              </el-button>
            </template>
          </el-input>
          <div class="employee-search-results-full-width">
            <div v-if="isEmployeeSearchLoading" class="loading-container">
              <el-spinner />
            </div>
            <div v-else-if="employeeSearchResults.length > 0" class="employee-list-wrapper">
              <div class="employee-list">
                <div class="employee-list-header">
                  <div class="employee-list-cell name">이름</div>
                  <div class="employee-list-cell position">직책</div>
                  <div class="employee-list-cell contact">연락처</div>
                  <div class="employee-list-cell email">이메일</div>
                  <div class="employee-list-cell status">상태</div>
                </div>
                <div v-for="member in employeeSearchResults" :key="member.memberId" class="employee-list-row">
                  <div class="employee-list-cell name">
                    <el-tooltip :content="member.name" placement="top" effect="dark" :show-after="1000">
                      <span class="cell-content">{{ member.name }}</span>
                    </el-tooltip>
                  </div>
                  <div class="employee-list-cell position">
                    <el-tooltip :content="member.titleName ? member.titleName.join(', ') : ''" placement="top"
                      effect="dark" :show-after="1000">
                      <span class="cell-content">{{ member.titleName ? member.titleName.join(', ') : '' }}</span>
                    </el-tooltip>
                  </div>
                  <div class="employee-list-cell contact">
                    <el-tooltip :content="member.phoneNumber || 'N/A'" placement="top" effect="dark" :show-after="1000">
                      <span class="cell-content">{{ member.phoneNumber || 'N/A' }}</span>
                    </el-tooltip>
                  </div>
                  <div class="employee-list-cell email">
                    <el-tooltip :content="member.email || 'N/A'" placement="top" effect="dark" :show-after="1000">
                      <span class="cell-content">{{ member.email || 'N/A' }}<el-button :icon="CopyDocument" circle plain
                          @click="copyToClipboard(member.email, '이메일')" /></span>
                    </el-tooltip>
                  </div>
                  <div class="employee-list-cell status">{{ member.memberStatus || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <el-empty v-else description="검색 결과가 없습니다." :image-size="80"></el-empty>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <div class="dialog-footer-flex">
        <div class="pagination-wrapper">
          <el-pagination v-if="activeTab === 'orgTree' && orgEmployeeTotal > 0" background layout="prev, pager, next"
            :total="orgEmployeeTotal" :page-size="orgEmployeeSize" v-model:current-page="orgEmployeePage"
            class="pagination-container" />
          <el-pagination v-if="activeTab === 'empSearch' && searchTotal > 0" background layout="prev, pager, next"
            :total="searchTotal" :page-size="searchSize" v-model:current-page="searchPage"
            class="pagination-container" />
        </div>
        <el-button @click="closeModal">닫기</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import searchService from '@/api/searchService';
import { useSnackbar } from '@/composables/useSnackbar';
import { Search, CopyDocument } from '@element-plus/icons-vue';
import { ElSpinner } from 'element-plus';

export default {
  name: 'OrganizationTreeModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:visible', 'select'],
  components: { Search, ElSpinner },
  setup() {
    const { success, error } = useSnackbar();
    return { success, error, CopyDocument };
  },
  data() {
    return {
      activeTab: 'orgTree',
      orgSearch: '',
      orgTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'label',
      },
      defaultExpandedOrgKeys: [],
      selectedOrg: {
        id: null,
        name: '',
        members: [],
      },
      currentSelectedOrgNode: null, // Store the selected node
      orgEmployeePage: 1,
      orgEmployeeSize: 5,
      orgEmployeeTotal: 0,
      isLoadingMembers: false,
      employeeSearchQuery: '',
      employeeSearchResults: [],
      searchPage: 1,
      searchSize: 5,
      searchTotal: 0,
      isEmployeeSearchLoading: false,
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
        this.resetSelection();
      }
    },
    orgEmployeePage(newPage) {
      if (this.currentSelectedOrgNode) {
        this.handleOrgNodeClick(this.currentSelectedOrgNode, newPage);
      }
    },
    searchPage(newPage) {
      this.searchEmployees(newPage);
    },
  },
  methods: {
    resetSelection() {
      this.selectedOrg = { id: null, name: '', members: [] };
      this.currentSelectedOrgNode = null;
      this.employeeSearchQuery = '';
      this.employeeSearchResults = [];
      this.activeTab = 'orgTree';
      this.isLoadingMembers = false;
      this.orgEmployeePage = 1;
      this.orgEmployeeTotal = 0;
      this.searchPage = 1;
      this.searchTotal = 0;
    },
    closeModal() {
      this.isModalVisible = false;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },

    async handleOrgNodeClick(data, page = 1) {
      // If the same node is clicked, do nothing unless the page changes.
      if (this.currentSelectedOrgNode && this.currentSelectedOrgNode.id === data.id && this.orgEmployeePage === page) {
        return;
      }
      this.currentSelectedOrgNode = data; // Save current node
      this.selectedOrg.id = data.id;
      this.selectedOrg.name = data.label;
      this.isLoadingMembers = true;
      this.orgEmployeePage = page;

      try {
        const response = await searchService.searchEmployeesByOrganization(
          data.id,
          { page: this.orgEmployeePage - 1, size: this.orgEmployeeSize }
        );
        const pageData = response.data.data;
        this.selectedOrg.members = pageData.content || [];
        this.orgEmployeeTotal = pageData.totalElements || 0;
      } catch (err) {
        console.error('Failed to fetch members for organization:', err);
        this.error('조직의 직원 정보를 불러오는데 실패했습니다.');
        this.selectedOrg.members = [];
        this.orgEmployeeTotal = 0;
      } finally {
        this.isLoadingMembers = false;
      }
    },

    async searchEmployees(page = 1) {
      if (!this.employeeSearchQuery) {
        this.employeeSearchResults = [];
        this.searchTotal = 0;
        return;
      }
      this.isEmployeeSearchLoading = true;
      this.searchPage = page;
      try {
        const response = await searchService.searchEmployees(
          this.employeeSearchQuery,
          { page: this.searchPage - 1, size: this.searchSize }
        );
        const pageData = response.data.data;
        this.employeeSearchResults = pageData.content || [];
        this.searchTotal = pageData.totalElements || 0;

      } catch (err) {
        console.error("Failed to search employees:", err);
        this.error("직원 검색에 실패했습니다.");
        this.employeeSearchResults = [];
        this.searchTotal = 0;
      } finally {
        this.isEmployeeSearchLoading = false;
      }
    },

    selectEmployee(member) {
      const selection = {
        id: member.memberId || member.id,
        name: member.name,
        ...member
      };
      this.$emit('select', selection);
      this.closeModal();
    },
    copyToClipboard(text, type) {
      if (!text || text === 'N/A') {
        this.error(`${type} 정보가 없어 복사할 수 없습니다.`);
        return;
      }
      navigator.clipboard.writeText(text).then(() => {
        this.success(`${type}이 클립보드에 복사되었습니다.`);
      }, (err) => {
        console.error('Could not copy text: ', err);
        this.error('복사에 실패했습니다.');
      });
    },
    buildOrganizationTree(nodes) {
      const map = {};
      nodes.forEach(node => {
        map[node.organizationId] = {
          ...node,
          id: node.organizationId,
          label: node.label,
          members: node.memberList || [],
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
        const response = await searchService.getOrganizationTree();
        const orgTreeData = response.data.data || [];
        this.orgTreeData = this.buildOrganizationTree(orgTreeData);
        if (this.orgTreeData && this.orgTreeData.length > 0) {
          this.defaultExpandedOrgKeys = this.orgTreeData.map(rootNode => rootNode.id);
        }
      } catch (err) {
        console.error('Failed to fetch organization tree:', err);
        this.error('조직도를 불러오는데 실패했습니다.');
      }
    },
  },
};
</script>

<style>
.el-dialog.org-employee-modal {
  height: 70vh !important;
  display: flex !important;
  flex-direction: column !important;
}

.el-dialog.org-employee-modal .el-dialog__header {
  flex-shrink: 0 !important;
}

.el-dialog.org-employee-modal .el-dialog__body {
  flex-grow: 1 !important;
  overflow-y: hidden !important;
  padding: 0 !important;
}

.el-dialog.org-employee-modal .el-tabs__header {
  margin: 0 15px;
  flex-shrink: 0 !important;
}

.el-dialog.org-employee-modal .el-tabs__content {
  flex-grow: 1 !important;
  overflow-y: auto !important;
}

.el-dialog.org-employee-modal .el-dialog__footer {
  padding: 10px 20px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0 !important;
}

.dialog-footer-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}
</style>

<style scoped>
:deep(.org-employee-modal) {
  height: 70vh !important;
  display: flex;
  flex-direction: column;
}

:deep(.org-employee-modal .el-dialog__body) {
  flex-grow: 1;
  overflow-y: hidden;
  padding: 0;
}

:deep(.org-employee-modal .el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.org-employee-modal .el-tabs__content) {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 15px;
}

.main-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.two-pane-container {
  display: flex;
  height: 100%;
}

/* Left Pane */
.left-pane {
  width: 40%;
  border-right: 1px solid #e4e7ed;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-input {
  margin-bottom: 15px;
}

.tree-container {
  flex: 1;
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

.member-count {
  color: #909399;
  font-size: 12px;
  background-color: #f0f2f5;
  border-radius: 10px;
  padding: 2px 6px;
  font-weight: 500;
}

/* Right Pane */
.right-pane {
  width: 60%;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  /* Changed from auto */
}

.employee-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  margin: 0;
  flex-shrink: 0;
}

.employee-list-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
}

.employee-list {
  flex: 1;
  overflow-y: auto;
}

.pagination-container {
  padding: 10px 0;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.employee-list-header,
.employee-list-row {
  display: flex;
  padding: 12px 20px;
  align-items: center;
  border-bottom: 1px solid #f0f2f5;
}

.employee-list-header {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.employee-list-row:hover {
  background-color: #f9fbfd;
}

.employee-list-cell {
  font-size: 14px;
  color: #606266;
  padding: 0 5px;
  text-align: center;
  min-width: 0;
}

.cell-content {
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.employee-list-cell.name {
  flex: 1.5;
  font-weight: 500;
  color: #303133;
}

.employee-list-cell.position {
  flex: 1.5;
}

.employee-list-cell.contact {
  flex: 2;
}

.employee-list-cell.email {
  flex: 2.5;
}

.employee-list-cell.status {
  flex: 1;
}

.employee-list-cell.action {
  flex: 1;
  text-align: center;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* Full-width Employee Search Pane */
.full-width-search-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  /* Changed from auto */
  padding: 15px;
}

.employee-search-results-full-width {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  margin-top: 15px;
}
</style>
