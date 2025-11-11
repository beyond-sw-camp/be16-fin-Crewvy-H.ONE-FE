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
                                  <el-select
                                    v-model="form.policyIds"
                                    multiple
                                    collapse-tags
                                    collapse-tags-tooltip
                                    placeholder="정책을 선택하세요 (다중 선택 가능)"
                                    style="width: 100%;"
                                  >
                                    <el-option
                                      v-for="policy in policies"
                                      :key="policy.policyId"
                                      :label="`${policy.name} ${policy.isActive ? '(활성)' : '(비활성)'}`"
                                      :value="policy.policyId"
                                    ></el-option>
                                  </el-select>
                                </el-form-item>
                                
                                <el-card v-if="checkedSummary.total > 0 || form.policyIds.length > 0" shadow="never" class="selection-info">
                                   <div class="selection-header">
                                      <el-icon color="#409EFC" :size="20" style="margin-right: 8px;"><Pointer /></el-icon>
                                      <h4>선택된 할당 정보</h4>
                                   </div>
                                  <p><strong>선택된 정책:</strong> {{ form.policyIds.length }} 개</p>
                                  <p><strong>대상 조직:</strong> {{ checkedSummary.organizations }} 개</p>
                                  <p><strong>대상 직원:</strong> {{ checkedSummary.members }} 명</p>
                                  <p><strong>총 할당 수:</strong> {{ form.policyIds.length * checkedSummary.total }} 건</p>
                                </el-card>
                              </el-col>
                            </el-row>
                  
                            <el-form-item style="margin-top: 20px;">
                              <el-button
                                type="primary"
                                @click="handleAssign"
                                :loading="isAssigning"
                                size="large"
                                :disabled="checkedSummary.total === 0 || form.policyIds.length === 0"
                              >
                                <el-icon><Check /></el-icon>
                                <span style="margin-left: 8px;">
                                  {{ form.policyIds.length }}개 정책을 {{ checkedSummary.total }}개 대상에 할당 (총 {{ form.policyIds.length * checkedSummary.total }}건)
                                </span>
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
                                type="primary"
                                @click="handleBulkReactivate"
                                :disabled="selectedAssignments.length === 0"
                              >
                                선택 항목 재활성
                              </el-button>
                              <el-button 
                                type="primary"
                                @click="handleBulkRevoke"
                                :disabled="selectedAssignments.length === 0"
                              >
                                선택 항목 해지
                              </el-button>
                              <el-button 
                                type="primary" 
                                @click="handleBulkDelete" 
                                :disabled="selectedAssignments.length === 0"
                              >
                                선택 항목 삭제
                              </el-button>
                              <el-button @click="fetchAllAssignments" :loading="isLoading">
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
        <el-table-column 
          prop="policyName" 
          label="정책 이름" 
          width="200"
          :filters="policyNameFilters"
          :filter-method="filterHandler"
        ></el-table-column>
        <el-table-column 
          prop="scopeType" 
          label="할당 유형" 
          width="120"
          :filters="scopeTypeFilters"
          :filter-method="filterHandler"
        >
          <template #default="{ row }">
            <el-tag :type="row.scopeType === 'COMPANY' ? 'danger' : row.scopeType === 'ORGANIZATION' ? 'warning' : 'success'">
              {{ row.scopeType === 'COMPANY' ? '회사' : row.scopeType === 'ORGANIZATION' ? '조직' : '개인' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          prop="targetName" 
          label="할당 대상" 
          width="150"
          :filters="targetNameFilters"
          :filter-method="filterHandler"
        ></el-table-column>
        <el-table-column 
          prop="targetAffiliation" 
          label="소속" 
          width="150"
          :filters="affiliationFilters"
          :filter-method="filterHandler"
        ></el-table-column>
        <el-table-column 
          prop="isActive" 
          label="상태" 
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '활성' : '비활성' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          prop="assignedAt" 
          label="할당일" 
          width="180" 
          sortable
        >
          <template #default="{ row }">
            {{ new Date(row.assignedAt).toLocaleString('ko-KR') }}
          </template>
        </el-table-column>
        <el-table-column label="작업" width="250" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.isActive" size="small" type="warning" @click="handleRevoke(row.policyAssignmentId)">해지</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.policyAssignmentId)">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 페이지네이션 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next, total"
          :total="pagination.totalElements"
          :page-size="pagination.size"
          :current-page="pagination.page + 1"
          @current-change="handlePageChange"
        />
      </div>
                                              </el-card>
                                            </div>
                                          </template>
                        
                                          <script>
                                          import { ref, onMounted, watch, computed } from 'vue';
                                          import { useSnackbar } from '@/composables/useSnackbar';                                    import { getPolicies, createAssignment, getPolicyAssignments, deleteAssignment, deleteAssignments, revokeAssignments, reactivateAssignments } from '@/api/attendance';
                                                            import apiClient from '@/api/http';
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
                                                                const pagination = ref({
                                                                  page: 0,
                                                                  size: 10,
                                                                  totalElements: 0,
                                                                });
                                                                const isLoading = ref(false);
                                                                const isAssigning = ref(false);
                                          
                                                                const treeRef = ref(null);
                                                                const filterText = ref('');
                                                                const organizationTree = ref([]);
                                          
                                                                const form = ref({ policyIds: [] });
                                          
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

                                                                        // 조직과 멤버 노드 분리
                                                                        const organizationNodes = checkedNodes.filter(node => node.type !== 'member');
                                                                        const memberNodes = checkedNodes.filter(node => node.type === 'member');

                                                                        // 조직의 직계 자식 멤버인지 확인
                                                                        const isChildOfCheckedOrg = (memberId) => {
                                                                          const memberNodeInTree = nodeMap.value.get(memberId);
                                                                          if (!memberNodeInTree || !memberNodeInTree.parent) return false;
                                                                          return organizationNodes.some(org => org.id === memberNodeInTree.parent.id);
                                                                        };

                                                                        // 조직의 직계 자식이 아닌 멤버만 카운트
                                                                        const filteredMembers = memberNodes.filter(member => !isChildOfCheckedOrg(member.id));

                                                                        const organizations = organizationNodes.length;
                                                                        const members = filteredMembers.length;
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
                                                                    // 임시: search-service 대신 member-service 직접 호출 (Elasticsearch 미실행)
                                                                    const response = await apiClient.get('/member-service/organization/tree-with-members');
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
                                    const params = {
                                      page: pagination.value.page,
                                      size: pagination.value.size,
                                      sort: 'assignedAt,desc'
                                    };
                                    const response = await getPolicyAssignments(params);
                                    assignments.value = response.content || [];
                                    // totalElements가 항상 유효한 숫자가 되도록 보장
                                    pagination.value.totalElements = Number(response.totalElements) || 0;
                                  } catch (err) {
                                    assignments.value = [];
                                    pagination.value.totalElements = 0; // 오류 발생 시 초기화
                                    error(err.message || '할당 목록 조회에 실패했습니다.');
                                  } finally {
                                    isLoading.value = false;
                                  }
                                };                        
                            const handlePageChange = (newPage) => {
                              pagination.value.page = newPage - 1;
                              fetchAllAssignments();
                            };
                                          
                                              const handleAssign = async () => {
                                                if (form.value.policyIds.length === 0 || checkedSummary.value.total === 0) {
                                                  error('정책과 할당 대상을 모두 선택하세요.');
                                                  return;
                                                }
                                                isAssigning.value = true;
                                                try {
                                                  // 모든 체크된 키 가져오기
                                                  const allCheckedKeys = treeRef.value.getCheckedKeys(false);

                                                  // 부모도 체크된 노드는 제외 (직접 체크한 노드만 남김)
                                                  const directlyCheckedKeys = allCheckedKeys.filter(key => {
                                                    const node = treeRef.value.getNode(key);
                                                    // 부모가 없으면 (최상위) 또는 부모가 체크 안 되어 있으면 직접 체크한 것
                                                    if (!node.parent || node.parent.level === 0) return true; // 최상위 노드
                                                    return !allCheckedKeys.includes(node.parent.data.id); // 부모가 체크 안 되어 있음
                                                  });

                                                  // 키로 노드 객체 찾기
                                                  const checkedNodes = directlyCheckedKeys.map(key => treeRef.value.getNode(key).data);

                                                  console.log('전체 체크된 노드:', allCheckedKeys.length);
                                                  console.log('직접 체크한 노드:', checkedNodes.length);
                                                  console.log('노드 상세:', checkedNodes.map(n => ({ id: n.id, label: n.mainLabel, type: n.type })));

                                                  // 조직과 멤버 노드 분리
                                                  const organizationNodes = checkedNodes.filter(node => node.type !== 'member');
                                                  const memberNodes = checkedNodes.filter(node => node.type === 'member');

                                                  // 조직의 직계 자식 멤버인지 확인하는 함수
                                                  const isChildOfCheckedOrg = (memberId) => {
                                                    const memberNodeInTree = nodeMap.value.get(memberId);
                                                    if (!memberNodeInTree || !memberNodeInTree.parent) return false;
                                                    return organizationNodes.some(org => org.id === memberNodeInTree.parent.id);
                                                  };

                                                  // 조직의 직계 자식이 아닌 멤버만 포함 (조직이 체크되어 있으면 그 소속 직원은 제외)
                                                  const filteredMembers = memberNodes.filter(member => !isChildOfCheckedOrg(member.id));

                                                  // 최종 할당 대상: 조직 + 필터링된 멤버
                                                  const targetNodes = [...organizationNodes, ...filteredMembers];

                                                  // 여러 정책 × 여러 대상 = 모든 조합 생성
                                                  const assignmentsPayload = [];

                                                  form.value.policyIds.forEach(policyId => {
                                                    targetNodes.forEach(node => {
                                                      let scopeType;
                                                      if (node.type === 'member') {
                                                        scopeType = 'MEMBER';
                                                      } else if (node.type === 'company') {
                                                        scopeType = 'COMPANY';
                                                      } else {
                                                        scopeType = 'ORGANIZATION';
                                                      }

                                                      assignmentsPayload.push({
                                                        policyId: policyId,
                                                        targetId: node.id,
                                                        scopeType: scopeType
                                                      });
                                                    });
                                                  });

                                                  const requestData = { assignments: assignmentsPayload };
                                                  const response = await createAssignment(requestData);

                                                  // 백엔드에서 실제로 생성된 개수를 표시 (중복 제외)
                                                  const actualCreatedCount = response?.length || response?.data?.length || 0;
                                                  const skippedCount = assignmentsPayload.length - actualCreatedCount;

                                                  if (actualCreatedCount === 0) {
                                                    // 전부 중복인 경우 - 에러 메시지
                                                    error(`이미 할당된 내역입니다. 선택한 모든 대상에 해당 정책이 이미 할당되어 있습니다. (${assignmentsPayload.length}건 중복)`);
                                                  } else if (skippedCount > 0) {
                                                    // 일부만 중복인 경우 - 성공 메시지에 스킵 건수 포함
                                                    success(`정책 할당 완료: ${actualCreatedCount}건 생성, ${skippedCount}건 중복 스킵 (요청 ${assignmentsPayload.length}건)`);
                                                  } else {
                                                    // 모두 성공한 경우
                                                    success(`${form.value.policyIds.length}개 정책을 ${targetNodes.length}개 대상에 할당했습니다. (총 ${actualCreatedCount}건)`);
                                                  }

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
                                                  await ElMessageBox.confirm(
                                                    '이 할당을 영구적으로 삭제하시겠습니까?\n\n주의: 이미 사용한 휴가 내역이 있으면 삭제할 수 없습니다.\n정책을 중단하려면 "해지(비활성화)"를 사용하세요.',
                                                    '영구 삭제 경고',
                                                    {
                                                      type: 'error',
                                                      confirmButtonText: '삭제',
                                                      cancelButtonText: '취소'
                                                    }
                                                  );
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
                                                  await ElMessageBox.confirm(
                                                    `선택된 ${selectedAssignments.value.length}개의 할당을 영구적으로 삭제하시겠습니까?\n\n주의: 이미 사용한 휴가 내역이 있으면 삭제할 수 없습니다.\n정책을 중단하려면 "해지(비활성화)"를 사용하세요.`,
                                                    '일괄 삭제 확인',
                                                    {
                                                      type: 'error',
                                                      confirmButtonText: '삭제',
                                                      cancelButtonText: '취소'
                                                    }
                                                  );
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
                                                  await ElMessageBox.confirm(
                                                    '이 정책 할당을 해지(비활성화)하시겠습니까?\n\n- 휴가 잔액이 사용 불가 상태로 변경됩니다.\n- 사용 내역은 유지되며, 추후 재활성할 수 있습니다.',
                                                    '해지 확인',
                                                    {
                                                      type: 'warning',
                                                      confirmButtonText: '해지',
                                                      cancelButtonText: '취소'
                                                    }
                                                  );
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
                                                  await ElMessageBox.confirm(
                                                    `선택된 ${selectedAssignments.value.length}개의 할당을 해지하시겠습니까?\n\n- 휴가 잔액이 사용 불가 상태로 변경됩니다.\n- 사용 내역은 유지되며, 추후 재활성할 수 있습니다.`,
                                                    '일괄 해지 확인',
                                                    {
                                                      type: 'warning',
                                                      confirmButtonText: '해지',
                                                      cancelButtonText: '취소'
                                                    }
                                                  );
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
                                                // 자식이 있고 접혀있는 노드만 최초 1번 펼치기 (이후에는 토글 안 함)
                                                if (node && node.childNodes.length > 0 && !node.expanded) {
                                                  node.expanded = true;
                                                }
                                              };
                                          
                                              const handleSelectionChange = (selection) => {
                                                selectedAssignments.value = selection;
                                              };
                                          
                                              const resetForm = () => {
                                                form.value.policyIds = [];
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
                                                pagination,
                                                handlePageChange,
                                              };  }
                        };</script>

<style scoped>
.policy-assignment {
  width: 100%;
}

.policy-assignment :deep(.el-card) {
  border-radius: var(--surface-radius);
  box-shadow: var(--surface-shadow);
  border: none;
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
  border-radius: var(--surface-radius);
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
  border-radius: var(--surface-radius);
  border: 1px solid rgba(79, 70, 229, 0.15);
  padding: 16px;
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
