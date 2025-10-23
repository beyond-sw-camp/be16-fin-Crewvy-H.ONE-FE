<template>
  <div class="policy-assignment">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>정책 할당</h2>
          <el-button @click="$router.back()">돌아가기</el-button>
        </div>
      </template>

      <!-- 정책 할당 폼 -->
      <div class="assignment-section">
        <h3>정책 할당하기</h3>
        <p class="section-description">조직도에서 정책을 할당할 대상을 모두 선택한 후, 정책을 선택하여 할당하세요.</p>
        <el-form :model="form" label-width="120px" label-position="top">
          <el-row :gutter="20">
            <el-col :md="12" :sm="24">
              <el-form-item label="1. 할당 대상 선택 (다중 선택 가능)" required>
                <el-input v-model="filterText" placeholder="조직 또는 직원 이름으로 검색" clearable />
                <el-tree
                  ref="treeRef"
                  :data="organizationTree"
                  :props="{ children: 'children', label: 'mainLabel' }"
                                    :filter-node-method="filterNode"
                                    class="org-tree"
                                    node-key="id"
                                    show-checkbox
                                    @check="handleNodeCheck"
                                  >
                                    <template #default="{ data }">
                                      <span class="custom-tree-node">
                                        <div class="node-main-content">
                                          <el-icon v-if="data.type === 'department'"><OfficeBuilding /></el-icon>
                                          <el-icon v-else-if="data.type === 'team'"><School /></el-icon>
                                          <el-icon v-else-if="data.type === 'member'"><User /></el-icon>
                                          <span class="node-label">{{ data.mainLabel }}</span>
                                        </div>
                                        <span v-if="data.subLabel" class="node-sub-label">{{ data.subLabel }}</span>
                                      </span>
                                    </template>
                                  </el-tree>
                                </el-form-item>
                              </el-col>
                              <el-col :md="12" :sm="24">
                                <el-form-item label="2. 할당할 정책 선택" required>
                                  <el-select v-model="form.policyId" placeholder="정책을 선택하세요" style="width: 100%;">
                                    <el-option
                                      v-for="policy in policies"
                                      :key="policy.policyId"
                                      :label="`${policy.name} ${policy.isActive ? '(활성)' : '(비활성)'}`"
                                      :value="policy.policyId"
                                    ></el-option>
                                  </el-select>
                                </el-form-item>
                                
                                <el-card v-if="checkedSummary.total > 0" shadow="never" class="selection-info">
                                   <div class="selection-header">
                                      <el-icon color="#409EFC" :size="20" style="margin-right: 8px;"><Pointer /></el-icon>
                                      <h4>선택된 할당 대상 요약</h4>
                                   </div>
                                  <p><strong>조직:</strong> {{ checkedSummary.organizations }} 개</p>
                                  <p><strong>직원:</strong> {{ checkedSummary.members }} 명</p>
                                   <p><strong>총:</strong> {{ checkedSummary.total }} 개</p>
                                </el-card>
                              </el-col>
                            </el-row>
                  
                            <el-form-item style="margin-top: 20px;">
                              <el-button type="primary" @click="handleAssign" :loading="isAssigning" size="large" :disabled="checkedSummary.total === 0 || !form.policyId">
                                <el-icon><Check /></el-icon>
                                <span style="margin-left: 8px;">선택한 {{ checkedSummary.total }}개 대상에 정책 할당</span>
                              </el-button>
                              <el-button @click="resetForm" size="large">초기화</el-button>
                            </el-form-item>
                          </el-form>
                        </div>
                  
                        <el-divider></el-divider>
                  
                        <!-- 할당 목록 섹션 -->
                        <div class="assignments-section">
                          <div class="section-header">
                            <h3>할당된 정책 목록</h3>
                            <div>
                              <el-button 
                                type="success"
                                @click="handleBulkReactivate"
                                :disabled="selectedAssignments.length === 0"
                              >
                                선택 항목 재활성
                              </el-button>
                              <el-button 
                                type="warning"
                                @click="handleBulkRevoke"
                                :disabled="selectedAssignments.length === 0"
                              >
                                선택 항목 해지
                              </el-button>
                              <el-button 
                                type="danger" 
                                @click="handleBulkDelete" 
                                :disabled="selectedAssignments.length === 0"
                              >
                                선택 항목 삭제
                              </el-button>
                              <el-button type="primary" @click="fetchAllAssignments" :loading="isLoading">
                                <el-icon><Refresh /></el-icon>
                                <span style="margin-left: 8px;">새로고침</span>
                              </el-button>
                            </div>
                          </div>
                          <p class="section-description">현재 회사의 모든 정책 할당 내역을 확인할 수 있습니다.</p>
                        </div>
                  
                        <!-- 할당 목록 테이블 -->
                        <el-table
                          :data="processedAssignments"
                          @selection-change="handleSelectionChange"
                          v-loading="isLoading"
                          border
                          stripe
                          style="width: 100%; margin-top: 20px;"
                          empty-text="할당된 정책이 없습니다."
                        >
                          <el-table-column type="selection" width="55" align="center" />
                          <el-table-column type="index" label="No" width="60" align="center"></el-table-column>
                          <el-table-column 
                            prop="policyName" 
                            label="정책 이름" 
                            :filters="policyNameFilters"
                            :filter-method="filterHandler"
                          ></el-table-column>
                          <el-table-column 
                            prop="targetName" 
                            label="할당 대상" 
                            :filters="targetNameFilters"
                            :filter-method="filterHandler"
                          >
                          </el-table-column>
                          <el-table-column 
                            prop="targetAffiliation" 
                            label="소속" 
                            :filters="affiliationFilters"
                            :filter-method="filterHandler"
                          >
                          </el-table-column>
                          <el-table-column 
                            prop="scope" 
                            label="대상 유형" 
                            width="120" 
                            align="center"
                            :filters="scopeTypeFilters"
                            :filter-method="filterHandler"
                          >
                            <template #default="{ row }">
                              <el-tag v-if="row.scope === 'COMPANY'" type="danger" effect="dark">회사</el-tag>
                              <el-tag v-else-if="row.scope === 'ORGANIZATION'" type="warning" effect="dark">조직</el-tag>
                              <el-tag v-else type="info" effect="dark">개인</el-tag>
                            </template>
                          </el-table-column>
                          <el-table-column prop="isActive" label="상태" width="100" align="center">
                            <template #default="{ row }">
                              <el-tag :type="row.isActive ? 'success' : 'info'" effect="dark">{{ row.isActive ? '활성' : '해지됨' }}</el-tag>
                            </template>
                          </el-table-column>
                          <el-table-column prop="assignedAt" label="할당일시" width="180">
                            <template #default="{ row }">
                              {{ new Date(row.assignedAt).toLocaleString() }}
                            </template>
                          </el-table-column>
                          <el-table-column label="작업" width="180" align="center" fixed="right">
                            <template #default="{ row }">
                              <el-button
                                v-if="!row.isActive"
                                type="success"
                                size="small"
                                @click="handleReactivate(row.policyAssignmentId)"
                              >재활성</el-button>
                              <el-button
                                v-if="row.isActive"
                                type="warning"
                                size="small"
                                @click="handleRevoke(row.policyAssignmentId)"
                              >해지</el-button>
                              <el-button
                                type="danger"
                                size="small"
                                @click="handleDelete(row.policyAssignmentId)"
                              >삭제</el-button>
                            </template>
                          </el-table-column>
                        </el-table>
                      </el-card>
                    </div>
                  </template>
                  
                  <script>
                                    import { ref, onMounted, watch, computed, nextTick } from 'vue';
                                    import { useSnackbar } from '@/composables/useSnackbar';
                                    import { getPolicies, createAssignment, getPolicyAssignments, deleteAssignment, deleteAssignments, revokeAssignments, reactivateAssignments } from '@/api/attendance';
                                    import organizationService from '@/api/organizationService';
                                    import { ElMessageBox } from 'element-plus';
                                    import { OfficeBuilding, User, Check, Refresh, School, Pointer } from '@element-plus/icons-vue';
                  
                                    export default {
                                      name: 'PolicyAssignment',
                                      components: {
                                        OfficeBuilding, User, Check, Refresh, School, Pointer
                                      },
                                      setup() {
                                        const { success, error } = useSnackbar();
                  
                                        const policies = ref([]);
                                        const assignments = ref([]);
                                        const selectedAssignments = ref([]);
                                        const isLoading = ref(false);
                                        const isAssigning = ref(false);
                  
                                        const treeRef = ref(null);
                                        const filterText = ref('');
                                        const organizationTree = ref([]);
                  
                                        const form = ref({ policyId: null });
                  
                                        const nodeMap = computed(() => {
                                          const map = new Map();
                                          const traverse = (nodes, parent) => {
                                            nodes.forEach(node => {
                                              map.set(node.id, { ...node, parent });
                                              if (node.children) {
                                                traverse(node.children, node);
                                              }
                                            });
                                          };
                                          traverse(organizationTree.value, null);
                                          return map;
                                        });
                  
                                              const processedAssignments = computed(() => {
                                                if (!assignments.value) return []; // 방어 코드
                                                if (assignments.value.length === 0 || nodeMap.value.size === 0) {
                                                  return assignments.value;
                                                }
                                                return assignments.value.map(assignment => {
                                                  const node = nodeMap.value.get(assignment.targetId);
                                                  let targetName = '정보 없음';
                                                  let targetAffiliation = '-';
                  
                                                  if (node) {
                                                    targetName = node.mainLabel;
                                                    if (node.parent) {
                                                      targetAffiliation = node.parent.mainLabel;
                                                    }
                                                  }
                  
                                                  return {
                                                    ...assignment,
                                                    targetName,
                                                    targetAffiliation,
                                                  };
                                                });
                                              });
                  
                                              const checkedSummary = computed(() => {
                                                if (!treeRef.value) return { organizations: 0, members: 0, total: 0 };
                                                const checkedNodes = treeRef.value.getCheckedNodes();
                                                const organizations = checkedNodes.filter(node => node.type !== 'member').length;
                                                const members = checkedNodes.filter(node => node.type === 'member').length;
                                                return { organizations, members, total: organizations + members };
                                              });
                  
                                              const filterHandler = (value, row, column) => {
                                                const property = column['property'];
                                                return row[property] === value;
                                              };
                  
                                              const scopeTypeFilters = [
                                                { text: '회사', value: 'COMPANY' },
                                                { text: '조직', value: 'ORGANIZATION' },
                                                { text: '개인', value: 'MEMBER' },
                                              ];
                  
                                              const policyNameFilters = computed(() => {
                                                if (!processedAssignments.value) return []; // 방어 코드
                                                const names = new Set(processedAssignments.value.map(item => item.policyName));
                                                return Array.from(names).map(name => ({ text: name, value: name }));
                                              });
                  
                                              const targetNameFilters = computed(() => {
                                                if (!processedAssignments.value) return []; // 방어 코드
                                                const names = new Set(processedAssignments.value.map(item => item.targetName).filter(Boolean));
                                                return Array.from(names).map(name => ({ text: name, value: name }));
                                              });
                  
                                              const affiliationFilters = computed(() => {
                                                if (!processedAssignments.value) return []; // 방어 코드
                                                const names = new Set(processedAssignments.value.map(item => item.targetAffiliation).filter(Boolean));
                                                return Array.from(names).map(name => ({ text: name, value: name }));
                                              });                  
                                        const fetchOrganizationTree = async () => {
                                          try {
                                            const response = await organizationService.getOrganizationTreeWithMembers();
                                            const rawTreeData = response.data?.data || response.data || [];
                                            const transformDataForTree = (nodes) => {
                                              return nodes.map(node => {
                                                const newNode = {
                                                  id: node.id,
                                                  mainLabel: node.label,
                                                  subLabel: null,
                                                  type: node.type,
                                                  children: node.children ? transformDataForTree(node.children) : []
                                                };
                                                if (node.members && node.members.length > 0) {
                                                  const memberNodes = node.members.map(member => ({
                                                    id: member.id,
                                                    mainLabel: member.name,
                                                    subLabel: `(${member.position} / ${member.email})`,
                                                    type: 'member'
                                                  }));
                                                  newNode.children = [...newNode.children, ...memberNodes];
                                                }
                                                return newNode;
                                              });
                                            };
                                            organizationTree.value = transformDataForTree(Array.isArray(rawTreeData) ? rawTreeData : [rawTreeData]);
                                          } catch (err) {
                                            error(err.message || '조직도 데이터를 불러오는 데 실패했습니다.');
                                          }
                                        };
                  
                                        watch(filterText, (val) => {
                                          if (treeRef.value) {
                                            treeRef.value.filter(val);
                                          }
                                        });
                  
                                        const filterNode = (value, data) => {
                                          if (!value) return true;
                                          return data.mainLabel.toLowerCase().includes(value.toLowerCase());
                                        };
                  
                                        const fetchPolicies = async () => {
                                          try {
                                            const response = await getPolicies({ page: 0, size: 100 });
                                            policies.value = response.content || [];
                                          } catch (err) {
                                            error(err.message || '정책 목록을 불러오는 데 실패했습니다.');
                                          }
                                        };
                  
                                        const fetchAllAssignments = async () => {
                                          isLoading.value = true;
                                          try {
                                            assignments.value = await getPolicyAssignments() || [];
                                          } catch (err) {
                                            assignments.value = [];
                                            error(err.response?.data?.message || '할당 목록 조회에 실패했습니다.');
                                          } finally {
                                            // 렌더링이 완료된 후 로딩 상태를 해제하여 경쟁 상태 방지
                                            await nextTick();
                                            isLoading.value = false;
                                          }
                                        };                  
                      const handleAssign = async () => {
                        if (!form.value.policyId || checkedSummary.value.total === 0) {
                          error('정책과 할당 대상을 모두 선택하세요.');
                          return;
                        }
                        isAssigning.value = true;
                        try {
                          const checkedNodes = treeRef.value.getCheckedNodes();
                          const assignmentsPayload = checkedNodes.map(node => {
                            let scopeType;
                            if (node.type === 'member') {
                              scopeType = 'MEMBER';
                            } else if (node.type === 'company') {
                              scopeType = 'COMPANY';
                            } else {
                              scopeType = 'ORGANIZATION';
                            }
                            return {
                              policyId: form.value.policyId,
                              targetId: node.id,
                              scopeType: scopeType
                            };
                          });
                          const requestData = { assignments: assignmentsPayload };
                          await createAssignment(requestData);
                          success(`${checkedSummary.value.total}개 대상에게 정책이 성공적으로 할당되었습니다.`);
                          fetchAllAssignments();
                          resetForm();
                        } catch (err) {
                          error(err.response?.data?.message || '정책 할당에 실패했습니다.');
                        } finally {
                          isAssigning.value = false;
                        }
                      };
                  
                      const handleDelete = async (assignmentId) => {
                        try {
                          await ElMessageBox.confirm('이 할당을 영구적으로 삭제하시겠습니까?', '영구 삭제 경고', { type: 'error' });
                          await deleteAssignment(assignmentId);
                          success('정책 할당이 영구적으로 삭제되었습니다.');
                          fetchAllAssignments();
                        } catch (err) {
                          if (err !== 'cancel') {
                            error(err.message || '삭제에 실패했습니다.');
                          }
                        }
                      };
                      
                      const handleBulkDelete = async () => {
                        if (selectedAssignments.value.length === 0) {
                          error('삭제할 항목을 선택하세요.');
                          return;
                        }
                        try {
                          await ElMessageBox.confirm(`선택된 ${selectedAssignments.value.length}개의 할당을 영구적으로 삭제하시겠습니까?`, '일괄 삭제 확인', { type: 'error' });
                          const idsToDelete = selectedAssignments.value.map(item => item.policyAssignmentId);
                          await deleteAssignments(idsToDelete);
                          success('선택된 정책 할당이 삭제되었습니다.');
                          fetchAllAssignments();
                        } catch (err) {
                          if (err !== 'cancel') {
                            error(err.message || '일괄 삭제에 실패했습니다.');
                          }
                        }
                      };
                  
                      const handleRevoke = async (assignmentId) => {
                        try {
                          await ElMessageBox.confirm('이 정책 할당을 해지(비활성화)하시겠습니까?', '해지 확인', { type: 'warning' });
                          await revokeAssignments([assignmentId]); // 일괄 API 재사용
                          success('정책 할당이 해지되었습니다.');
                          fetchAllAssignments();
                        } catch (err) {
                          if (err !== 'cancel') {
                            error(err.message || '해지에 실패했습니다.');
                          }
                        }
                      };
                  
                      const handleBulkRevoke = async () => {
                        if (selectedAssignments.value.length === 0) {
                          error('해지할 항목을 선택하세요.');
                          return;
                        }
                        try {
                          await ElMessageBox.confirm(`선택된 ${selectedAssignments.value.length}개의 할당을 해지하시겠습니까?`, '일괄 해지 확인', { type: 'warning' });
                          const idsToRevoke = selectedAssignments.value.map(item => item.policyAssignmentId);
                          await revokeAssignments(idsToRevoke);
                          success('선택된 정책 할당이 해지되었습니다.');
                          fetchAllAssignments();
                        } catch (err) {
                          if (err !== 'cancel') {
                            error(err.message || '일괄 해지에 실패했습니다.');
                          }
                        }
                      };
                  
                      const handleBulkReactivate = async () => {
                        if (selectedAssignments.value.length === 0) {
                          error('재활성화할 항목을 선택하세요.');
                          return;
                        }
                        try {
                          await ElMessageBox.confirm(`선택된 ${selectedAssignments.value.length}개의 할당을 재활성화하시겠습니까?`, '일괄 재활성 확인', { type: 'success' });
                          const idsToReactivate = selectedAssignments.value.map(item => item.policyAssignmentId);
                          await reactivateAssignments(idsToReactivate);
                          success('선택된 정책 할당이 재활성화되었습니다.');
                          fetchAllAssignments();
                        } catch (err) {
                          if (err !== 'cancel') {
                            error(err.message || '일괄 재활성에 실패했습니다.');
                          }
                        }
                      };
                  
                      const handleNodeCheck = (data) => {
                        const node = treeRef.value.getNode(data.id);
                        if (node && node.childNodes.length > 0) { // 자식이 있는 노드만 토글
                          node.expanded = !node.expanded;
                        }
                      };
                  
                      const handleSelectionChange = (selection) => {
                        selectedAssignments.value = selection;
                      };
                  
                      const resetForm = () => {
                        form.value.policyId = null;
                        if (treeRef.value) {
                          treeRef.value.setCheckedKeys([]);
                        }
                      };
                  
                      onMounted(() => {
                        fetchPolicies();
                        fetchOrganizationTree();
                        fetchAllAssignments();
                      });
                  
                      return {
                        policies,
                        assignments,
                        processedAssignments,
                        isLoading,
                        isAssigning,
                        treeRef,
                        filterText,
                        organizationTree,
                        form,
                        checkedSummary,
                        selectedAssignments,
                        handleAssign,
                        fetchAllAssignments,
                        handleDelete,
                        handleBulkDelete,
                        handleRevoke,
                        handleBulkRevoke,
                        handleBulkReactivate,
                        handleSelectionChange,
                        resetForm,
                        filterNode,
                        filterHandler,
                        scopeTypeFilters,
                        policyNameFilters,
                        targetNameFilters,
                        affiliationFilters,
                        treeProps: { children: 'children', label: 'mainLabel' },
                        handleNodeCheck,
                      };  }
};
</script>

<style scoped>
.policy-assignment {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h2 { margin: 0; font-size: 1.5rem; }
.section-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 20px;
}
.org-tree {
  margin-top: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}
.custom-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}
.node-label {
  font-weight: 500;
  flex-grow: 1;
}
.node-sub-label {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
  padding-right: 8px;
}
.selection-info {
  margin-top: 15px;
  background-color: #f4f4f5;
}
.selection-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
.selection-header h4 {
    margin: 0;
    font-size: 1rem;
    color: #303133;
}
.selection-info p {
  margin: 5px 0;
  font-size: 14px;
}
.assignments-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>
