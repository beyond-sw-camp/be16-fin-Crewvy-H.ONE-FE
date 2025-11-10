<template>
  <div class="approval-form-container">

    <div class="form-layout">
      <!-- Left Side: Form Content -->
      <div class="form-content-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>{{ formTitle }}</span>
            </div>
          </template>
          <div v-if="formSchema" class="dynamic-form">
            <el-form :model="formData" label-position="top">
              <el-form-item label="결재 제목" required>
                <el-input v-model="approvalTitle" placeholder="결재 제목을 입력하세요." />
              </el-form-item>

              <el-row v-for="(row, rowIndex) in formSchema.rows" :key="rowIndex" :gutter="20">
                <el-col v-for="field in row" :key="field.id" :span="field.type === 'grid' ? 24 : 24 / row.length">
                  <el-form-item v-if="field.type !== 'grid' && shouldShowField(field)" :label="field.label" :required="field.required">
                    <!-- Text Input -->
                    <el-input
                      v-if="field.type === 'text'"
                      v-model="formData[field.id]"
                      :placeholder="field.placeholder"
                      :readonly="field.readonly"
                    />
                    <!-- Textarea -->
                    <el-input
                      v-if="field.type === 'textarea'"
                      type="textarea"
                      v-model="formData[field.id]"
                      :placeholder="field.placeholder"
                      :rows="4"
                    />
                    <!-- Date Picker -->
                    <el-date-picker
                      v-if="field.type === 'date'"
                      v-model="formData[field.id]"
                      type="date"
                      :placeholder="field.placeholder"
                      style="width: 100%;"
                    />
                    <!-- DateTime Picker -->
                    <el-date-picker
                      v-if="field.type === 'datetime'"
                      v-model="formData[field.id]"
                      type="datetime"
                      :placeholder="field.placeholder"
                      style="width: 100%;"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DDTHH:mm:ss"
                    />
                    <!-- Number Input -->
                    <el-input-number
                      v-if="field.type === 'number'"
                      v-model="formData[field.id]"
                      :placeholder="field.placeholder"
                      style="width: 100%;"
                      :readonly="field.readonly"
                    />
                    <!-- Tel Input -->
                    <el-input
                      v-if="field.type === 'tel'"
                      v-model="formData[field.id]"
                      type="tel"
                      :placeholder="field.placeholder"
                    />
                    <!-- Email Input -->
                    <el-input
                      v-if="field.type === 'email'"
                      v-model="formData[field.id]"
                      type="email"
                      :placeholder="field.placeholder"
                    />
                    <!-- Select Input -->
                    <el-select
                      v-if="field.type === 'select'"
                      v-model="formData[field.id]"
                      :placeholder="field.label"
                      style="width: 100%;"
                    >
                      <el-option
                        v-for="option in field.options"
                        :key="option"
                        :label="option"
                        :value="option"
                      />
                    </el-select>
                  </el-form-item>
                  <!-- Grid 필드는 별도 처리 -->
                  <el-form-item v-if="field.type === 'grid'" :label="field.label" :required="field.required">
                    <div class="grid-field-container">
                      <el-table
                        :data="formData[field.id] || []"
                        border
                        style="width: 100%"
                      >
                        <el-table-column
                          v-for="column in field.columns"
                          :key="column.id"
                          :prop="column.id"
                          :label="column.label"
                          :width="getColumnWidth(column)"
                          header-align="center"
                          :align="column.id === 'amount' || column.id === 'estimatedUnitPrice' || column.id === 'estimatedTotalPrice' ? 'right' : undefined"
                        >
                          <template #default="scope">
                            <!-- Text Input -->
                            <el-input
                              v-if="column.type === 'text'"
                              v-model="scope.row[column.id]"
                              :placeholder="column.placeholder"
                              size="small"
                            />
                            <!-- Number Input -->
                            <el-input-number
                              v-else-if="column.type === 'number'"
                              v-model="scope.row[column.id]"
                              :placeholder="column.placeholder"
                              size="small"
                              style="width: 100%;"
                              :min="0"
                              :precision="0"
                              :readonly="column.readonly"
                              :formatter="(value) => formatNumber(value)"
                              :parser="(value) => parseNumber(value)"
                              @change="handleGridAmountChange(field.id, column.id, field)"
                            />
                            <!-- Date Picker -->
                            <el-date-picker
                              v-else-if="column.type === 'date'"
                              v-model="scope.row[column.id]"
                              type="date"
                              :placeholder="column.placeholder"
                              size="small"
                              style="width: 100%;"
                              format="YYYY-MM-DD"
                              value-format="YYYY-MM-DD"
                            />
                            <!-- Select Input -->
                            <el-select
                              v-else-if="column.type === 'select'"
                              v-model="scope.row[column.id]"
                              :placeholder="column.label"
                              size="small"
                              style="width: 100%;"
                            >
                              <el-option
                                v-for="option in column.options"
                                :key="option"
                                :label="option"
                                :value="option"
                              />
                            </el-select>
                          </template>
                        </el-table-column>
                        <el-table-column label="관리" width="80" align="center" header-align="center">
                          <template #default="scope">
                            <el-button
                              type="danger"
                              size="small"
                              @click="removeGridRow(field.id, scope.$index)"
                            >
                              <el-icon><Delete /></el-icon>
                            </el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-button
                        type="primary"
                        size="small"
                        style="margin-top: 10px;"
                        @click="addGridRow(field)"
                      >
                        행 추가
                      </el-button>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>

            <!-- Attachment Section -->
            <el-divider>첨부파일</el-divider>
            <div class="attachment-section">
              <el-upload
                v-model:file-list="fileList"
                class="upload-demo"
                drag
                action="#"
                :auto-upload="false"
                multiple
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  클릭하거나 파일을 드래그하여 업로드하세요
                </div>
              </el-upload>
            </div>
          </div>
          <div v-else class="form-placeholder">
            <p>선택된 결재 양식을 불러오는 중입니다...</p>
          </div>
        </el-card>
      </div>

      <!-- Right Side: Approval Line -->
      <div class="approval-line-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>결재 라인</span>
              <el-button type="primary" plain size="small" @click="showApprovalLineEditor = true">결재라인 편집</el-button>
            </div>
          </template>
          <div class="approval-line-display">
             <div v-for="approver in currentApprovalLine" :key="approver.id" class="approver-display-item">
              <div class="approver-name">{{ approver.name }}</div>
              <div class="approver-details">{{ approver.department }} / {{ approver.position }}</div>
            </div>
            <div v-if="currentApprovalLine.length === 0" class="empty-state">
              <p>결재라인을 추가해 주세요.</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    <div class="form-actions">
        <el-button type="danger" v-if="draftApprovalId" @click="deleteDraft">삭제</el-button>
        <el-button type="warning" v-if="requestId && !draftApprovalId" @click="cancelRequest">취소</el-button>
        <el-button @click="draftApproval">임시저장</el-button>
        <el-button type="primary" @click="submitApproval">결재요청</el-button>
      </div>

    <!-- Approval Line Editor Modal -->
    <ApprovalLineEditorModal 
      :visible="showApprovalLineEditor" 
      :initial-line="currentApprovalLine"
      @update:visible="showApprovalLineEditor = $event"
      @save="updateApprovalLine"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useSnackbar } from '@/composables/useSnackbar';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api/http';
import ApprovalLineEditorModal from '@/components/approval/ApprovalLineEditorModal.vue';
import { UploadFilled, Delete } from '@element-plus/icons-vue';

export default {
  name: 'ApprovalRequestForm',
  components: {
    ApprovalLineEditorModal,
    UploadFilled,
    Delete,
  },
  setup() {
    const { success, error } = useSnackbar();
    const router = useRouter();
    const route = useRoute();
    const documentId = ref(null); // For the template
    const draftApprovalId = ref(null); // For the specific draft instance being edited
    const requestId = ref(null); // For linking to attendance request
    const formSchema = ref(null);
    const formData = ref({});
    const formTitle = ref('');
    const approvalTitle = ref('');
    const showApprovalLineEditor = ref(false);
    const currentApprovalLine = ref([]);
    const fileList = ref([]); // For <el-upload>
    const memberInfo = ref(null);

    const fetchMemberInfo = async () => {
      try {
        const memberPositionId = localStorage.getItem('memberPositionId');
        console.log('🔍 [ApprovalForm] localStorage memberPositionId:', memberPositionId);
        if (!memberPositionId) {
          console.warn('⚠️ [ApprovalForm] memberPositionId가 localStorage에 없습니다.');
          return;
        }

        const response = await apiClient.post('/member-service/member/position-list', {
          uuidList: [memberPositionId]
        });

        console.log('📥 [ApprovalForm] member-service 응답:', response.data);

        if (response.data.data && response.data.data.length > 0) {
          memberInfo.value = response.data.data[0];
          console.log('✅ [ApprovalForm] memberInfo 설정됨:', memberInfo.value);
        } else {
          console.warn('⚠️ [ApprovalForm] member-service 응답에 데이터가 없습니다.');
        }
      } catch (err) {
        console.error('❌ [ApprovalForm] Failed to fetch member info:', err);
        error('회원 정보를 불러오는 데 실패했습니다.');
      }
    };

    const initializeFormData = (schema, userInfo, requestData = null) => {
      const data = {};
      if (schema && schema.rows) {
        schema.rows.forEach(row => {
          row.forEach(field => {
            if (userInfo) {
              if (field.id === 'department') {
                data[field.id] = userInfo.organizationName;
              } else if (field.id === 'position') {
                data[field.id] = userInfo.titleName;
              } else if (field.id === 'name') {
                data[field.id] = userInfo.memberName;
              } else {
                // grid 타입 필드는 배열로 초기화
                if (field.type === 'grid') {
                  data[field.id] = [];
                } else {
                  data[field.id] = null;
                }
              }
            } else {
              // grid 타입 필드는 배열로 초기화
              if (field.type === 'grid') {
                data[field.id] = [];
              } else {
                data[field.id] = null;
              }
            }
          });
        });
      }
      
      // request 데이터가 있으면 id와 매칭하여 데이터 채우기
      if (requestData) {
        Object.keys(requestData).forEach(key => {
          if (key in data) {
            data[key] = requestData[key];
          }
        });
      }
      
      formData.value = data;
    };

    const fetchFormSchema = async (id, userInfo, requestId = null) => {
      try {
        const params = {};
        if (requestId) {
          params.requestId = requestId;
        }
        const response = await apiClient.get(`/workforce-service/approval/get-document/${id}`, { params });
        const doc = response.data.data;
        formTitle.value = doc.documentName;

        // request 데이터 추출
        const requestData = doc.request || null;

        if (doc.metadata) {
          // metadata.metadata.schema 구조 확인
          const schema = doc.metadata.metadata?.schema || doc.metadata.schema;
          if (schema) {
            formSchema.value = schema;
            initializeFormData(schema, userInfo, requestData);
          } else {
            // metadata가 직접 schema인 경우
            formSchema.value = doc.metadata.schema;
            initializeFormData(doc.metadata.schema, userInfo, requestData);
          }
        }
        if (doc.policy && doc.policy.length > 0) {
          const sortedPolicy = doc.policy.sort((a, b) => a.index - b.index);
          const approverIds = sortedPolicy.map(p => p.approverId);

          const positionResponse = await apiClient.post('/member-service/member/position-list', {
            uuidList: approverIds
          });

          if (positionResponse.data.data) {
            const positionDataMap = new Map(positionResponse.data.data.map(p => [p.memberPositionId, p]));

            const policyApprovers = sortedPolicy.map(p => {
              const positionInfo = positionDataMap.get(p.approverId);
              return {
                id: p.approverId,
                name: p.approverName,
                department: p.approverOrganization,
                position: p.approverPosition,
                memberPositionId: positionInfo ? positionInfo.memberPositionId : null
              };
            });

            // Filter out the current user if they are already the first approver
            const currentUserMemberPositionId = memberInfo.value ? memberInfo.value.memberPositionId : null;
            const filteredPolicyApprovers = policyApprovers.filter(approver => 
              approver.memberPositionId !== currentUserMemberPositionId
            );

            currentApprovalLine.value.push(...filteredPolicyApprovers);
          }
        }
      } catch (err) {
        console.error('Failed to fetch form schema:', err);
        error('결재 양식 스키마를 불러오는 데 실패했습니다.');
      }
    };

    const fetchDraftData = async (id, userInfo) => {
      try {
        const response = await apiClient.get(`/workforce-service/approval/find-approval/${id}`);
        const draftData = response.data.data;

        approvalTitle.value = draftData.title;
        formData.value = draftData.contents;

        if (userInfo) {
          formData.value.department = userInfo.organizationName;
          formData.value.position = userInfo.titleName;
          formData.value.name = userInfo.memberName;
        }
        
        if (draftData.document) {
            documentId.value = draftData.document.documentId;
            formTitle.value = draftData.document.documentName;
            if (draftData.document.metadata) {
                formSchema.value = draftData.document.metadata.schema;
            }
        }
        
        if (draftData.attachmentList) {
          fileList.value = draftData.attachmentList.map(file => {
            const url = file.attachmentUrl;
            const firstUnderscoreIndex = url.indexOf('_');
            const displayName = firstUnderscoreIndex !== -1 
              ? url.substring(firstUnderscoreIndex + 1) 
              : url; // Fallback to full URL if no underscore

            return {
              name: displayName,
              id: file.attachmentId,
              status: 'success',
              url: url // Keep the original URL for potential downloads
            };
          });
        }

        if (draftData.lineList && draftData.lineList.length > 0) {
          currentApprovalLine.value = draftData.lineList.map(line => ({
            id: line.approverId,
            name: line.approverName,
            position: line.approverPosition,
            department: line.approverOrganization,
            memberPositionId: line.approverId // approverId를 memberPositionId로 사용
          }));
        }

      } catch (err) {
        console.error('Failed to fetch draft data:', err);
        error('임시 저장된 결재 데이터를 불러오는 데 실패했습니다.');
      }
    };

    onMounted(async () => {
      await fetchMemberInfo();

      console.log('🚀 [ApprovalForm] onMounted - memberInfo:', memberInfo.value);

      if (memberInfo.value) {
        const approverData = {
          id: memberInfo.value.memberId,
          name: memberInfo.value.memberName,
          department: memberInfo.value.organizationName,
          position: memberInfo.value.titleName,
          memberPositionId: memberInfo.value.memberPositionId,
        };
        console.log('👤 [ApprovalForm] 결재선에 추가할 본인 정보:', approverData);
        currentApprovalLine.value.push(approverData);
        console.log('📋 [ApprovalForm] currentApprovalLine:', currentApprovalLine.value);
      } else {
        console.warn('⚠️ [ApprovalForm] memberInfo가 null입니다. 결재선에 본인을 추가할 수 없습니다.');
      }

      const approvalIdFromRoute = route.params.id;
      const documentIdFromRoute = route.params.documentId;
      const requestIdFromQuery = route.query.requestId;

      if (requestIdFromQuery) {
        requestId.value = requestIdFromQuery;
      }

      if (approvalIdFromRoute) {
        draftApprovalId.value = approvalIdFromRoute;
        fetchDraftData(approvalIdFromRoute, memberInfo.value);
      } else if (documentIdFromRoute) {
        documentId.value = documentIdFromRoute;
        fetchFormSchema(documentIdFromRoute, memberInfo.value, requestIdFromQuery);
      }
    });

    const handleFileUpload = async (approvalId) => {
      if (fileList.value.length === 0) return; // No files to upload

      const formData = new FormData();
      const newFiles = [];
      const existingFileIds = [];

      fileList.value.forEach(file => {
        if (file.raw) { // New file selected by user
          newFiles.push(file.raw);
        } else if (file.status === 'success') { // Existing file
          existingFileIds.push(file.id);
        }
      });

      const attachmentInfoDto = {
        existingFileIds: existingFileIds,
      };

      formData.append('attachmentInfo', new Blob([JSON.stringify(attachmentInfoDto)], { type: 'application/json' }));
      
      if (newFiles.length > 0) {
        newFiles.forEach(file => {
          formData.append('newFiles', file);
        });
      }

      try {
        await apiClient.patch(`/workforce-service/approval/attachment/${approvalId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        console.error('File upload failed:', error);
        error('파일 업로드에 실패했습니다.');
      }
    };

    const submitApproval = async () => {
      console.log('Submitting with documentId:', documentId.value);
      const lineDtoList = currentApprovalLine.value.map((approver, index) => ({
        memberPositionId: approver.memberPositionId,
        lineIndex: index + 1,
      }));
      console.log(lineDtoList);

      const approvalData = {
        documentId: documentId.value,
        title: approvalTitle.value,
        contents: formData.value,
        lineDtoList: lineDtoList,
      };

      console.log(approvalData);

      if (draftApprovalId.value) {
        approvalData.approvalId = draftApprovalId.value;
      }

      if (requestId.value) {
        approvalData.requestId = requestId.value;
        console.log('Including requestId:', requestId.value);
      }

      try {
        const response = await apiClient.post('/workforce-service/approval/create-approval', approvalData);
        const newApprovalId = response.data.data.approvalId;
        if (newApprovalId) {
          await handleFileUpload(newApprovalId);
        }
        success('결재 요청이 성공적으로 전송되었습니다.');
        router.push('/approval');
      } catch (error) {
        console.error('결재 요청 실패:', error);
        error('결재 요청에 실패했습니다.');
      }
    };

    const draftApproval = async () => {
      const lineDtoList = currentApprovalLine.value.map((approver, index) => ({
        memberPositionId: approver.memberPositionId,
        lineIndex: index + 1,
      }));

      const approvalData = {
        documentId: documentId.value,
        title: approvalTitle.value,
        contents: formData.value,
        lineDtoList: lineDtoList,
      };

      if (draftApprovalId.value) {
        approvalData.approvalId = draftApprovalId.value;
      }

      if (requestId.value) {
        approvalData.requestId = requestId.value;
      }

      try {
        const response = await apiClient.post('/workforce-service/approval/draft-approval', approvalData);
        const newApprovalId = response.data.data;
        console.log(newApprovalId);
        if (newApprovalId) {
          await handleFileUpload(newApprovalId);
        }
        success('결재가 임시저장되었습니다.');
        router.push('/approval');
      } catch (error) {
        console.error('임시저장 실패:', error);
        error('임시저장에 실패했습니다.');
      }
    };

    const deleteDraft = async () => {
      if (!draftApprovalId.value) return;

      if (confirm('이 임시저장 문서를 삭제하시겠습니까?')) {
        try {
          await apiClient.delete(`/workforce-service/approval/discard-approval/${draftApprovalId.value}`);
          success('문서가 삭제되었습니다.');
          router.push('/approval');
        } catch (err) {
          console.error('삭제 실패:', err);
          error('삭제에 실패했습니다.');
        }
      }
    };

    const cancelRequest = async () => {
      if (!requestId.value) return;

      if (confirm('이 신청을 취소하시겠습니까? 작성한 내용이 모두 삭제됩니다.')) {
        try {
          await apiClient.delete(`/workforce-service/requests/${requestId.value}/cancel`);
          success('신청이 취소되었습니다.');
          router.push('/leave-request');
        } catch (err) {
          console.error('취소 실패:', err);
          error('신청 취소에 실패했습니다.');
        }
      }
    };

    const updateApprovalLine = (newLine) => {
      currentApprovalLine.value = newLine;
    };

    const addGridRow = (field) => {
      if (!formData.value[field.id]) {
        formData.value[field.id] = [];
      }
      const newRow = {};
      field.columns.forEach(column => {
        newRow[column.id] = null;
      });
      formData.value[field.id].push(newRow);
      // 행 추가 후 계산 (구매품의서의 경우)
      calculateGridRowTotal(field.id, field);
    };

    // 필드 스키마 찾기 헬퍼 함수
    const findFieldSchema = (fieldId) => {
      if (!formSchema.value) return null;
      
      for (const row of formSchema.value.rows) {
        for (const field of row) {
          if (field.id === fieldId && field.type === 'grid') {
            return field;
          }
        }
      }
      return null;
    };

    const removeGridRow = (fieldId, index) => {
      if (formData.value[fieldId] && formData.value[fieldId].length > index) {
        formData.value[fieldId].splice(index, 1);
        // 행 삭제 후 합계 재계산
        // 지출결의서인지 구매품의서인지 확인하여 적절한 계산 함수 호출
        const fieldSchema = findFieldSchema(fieldId);
        if (fieldSchema) {
          const hasAmountColumn = fieldSchema.columns?.some(col => col.id === 'amount');
          const hasEstimatedTotalPriceColumn = fieldSchema.columns?.some(col => col.id === 'estimatedTotalPrice');
          
          if (hasAmountColumn) {
            calculateTotalAmount(fieldId);
          } else if (hasEstimatedTotalPriceColumn) {
            calculateTotalEstimatedAmount(fieldId);
          }
        }
      }
    };

    // Grid 필드의 amount 합계를 totalAmount에 자동 계산 (지출결의서용)
    const calculateTotalAmount = (gridFieldId) => {
      if (!formSchema.value || !formData.value[gridFieldId]) return;

      // 스키마에서 totalAmount 필드 찾기
      let totalAmountField = null;
      formSchema.value.rows.forEach(row => {
        row.forEach(field => {
          if (field.id === 'totalAmount') {
            totalAmountField = field;
          }
        });
      });

      if (!totalAmountField) return;

      // grid 필드에서 amount 컬럼 찾기
      let amountColumnId = null;
      formSchema.value.rows.forEach(row => {
        row.forEach(field => {
          if (field.id === gridFieldId && field.type === 'grid' && field.columns) {
            const amountColumn = field.columns.find(col => col.id === 'amount');
            if (amountColumn) {
              amountColumnId = 'amount';
            }
          }
        });
      });

      if (!amountColumnId) return;

      // amount 합계 계산
      const gridData = formData.value[gridFieldId] || [];
      const total = gridData.reduce((sum, row) => {
        const amount = row[amountColumnId];
        return sum + (amount ? Number(amount) : 0);
      }, 0);

      // totalAmount 필드에 합계 설정
      formData.value.totalAmount = total;
    };

    // Grid 행의 예상 금액 계산 (구매품의서용: 수량 * 단가)
    const calculateGridRowTotal = (gridFieldId, fieldSchema) => {
      if (!formData.value[gridFieldId]) return;

      const gridData = formData.value[gridFieldId] || [];
      const quantityCol = fieldSchema.columns?.find(col => col.id === 'quantity');
      const unitPriceCol = fieldSchema.columns?.find(col => col.id === 'estimatedUnitPrice');
      const totalPriceCol = fieldSchema.columns?.find(col => col.id === 'estimatedTotalPrice');

      if (!quantityCol || !unitPriceCol || !totalPriceCol) return;

      // 각 행의 예상 금액 계산 (수량 * 단가)
      gridData.forEach(row => {
        const quantity = row[quantityCol.id] ? Number(row[quantityCol.id]) : 0;
        const unitPrice = row[unitPriceCol.id] ? Number(row[unitPriceCol.id]) : 0;
        row[totalPriceCol.id] = quantity * unitPrice;
      });

      // 총 예상 금액 계산
      calculateTotalEstimatedAmount(gridFieldId);
    };

    // Grid 필드의 예상 금액 합계를 총 예상 금액에 자동 계산 (구매품의서용)
    const calculateTotalEstimatedAmount = (gridFieldId) => {
      if (!formSchema.value || !formData.value[gridFieldId]) return;

      // 스키마에서 totalEstimatedAmount 필드 찾기
      let totalEstimatedAmountField = null;
      formSchema.value.rows.forEach(row => {
        row.forEach(field => {
          if (field.id === 'totalEstimatedAmount') {
            totalEstimatedAmountField = field;
          }
        });
      });

      if (!totalEstimatedAmountField) return;

      // grid 필드에서 estimatedTotalPrice 컬럼 찾기
      let totalPriceColumnId = null;
      formSchema.value.rows.forEach(row => {
        row.forEach(field => {
          if (field.id === gridFieldId && field.type === 'grid' && field.columns) {
            const totalPriceColumn = field.columns.find(col => col.id === 'estimatedTotalPrice');
            if (totalPriceColumn) {
              totalPriceColumnId = 'estimatedTotalPrice';
            }
          }
        });
      });

      if (!totalPriceColumnId) return;

      // estimatedTotalPrice 합계 계산
      const gridData = formData.value[gridFieldId] || [];
      const total = gridData.reduce((sum, row) => {
        const totalPrice = row[totalPriceColumnId];
        return sum + (totalPrice ? Number(totalPrice) : 0);
      }, 0);

      // totalEstimatedAmount 필드에 합계 설정
      formData.value.totalEstimatedAmount = total;
    };

    // Grid의 값 변경 시 호출
    const handleGridAmountChange = (gridFieldId, columnId, fieldSchema) => {
      if (columnId === 'amount') {
        // 지출결의서: amount 변경 시 totalAmount 계산
        calculateTotalAmount(gridFieldId);
      } else if (columnId === 'quantity' || columnId === 'estimatedUnitPrice') {
        // 구매품의서: 수량 또는 단가 변경 시 행의 예상 금액 계산
        calculateGridRowTotal(gridFieldId, fieldSchema);
      } else if (columnId === 'estimatedTotalPrice') {
        // 구매품의서: 예상 금액 변경 시 총 예상 금액 계산
        calculateTotalEstimatedAmount(gridFieldId);
      }
    };

    // 필드 표시 여부 확인 (showIf 조건 처리)
    const shouldShowField = (field) => {
      // showIf 조건이 없으면 항상 표시
      if (!field.showIf) {
        return true;
      }

      // showIf 조건 확인
      const { field: conditionField, value: conditionValue } = field.showIf;
      
      // 조건 필드의 값이 조건 값과 일치하는지 확인
      const fieldValue = formData.value[conditionField];
      return fieldValue === conditionValue;
    };

    // 컬럼 너비 계산
    const getColumnWidth = (column) => {
      if (column.type === 'date') {
        return '150';
      } else if (column.type === 'number') {
        // amount, estimatedUnitPrice, estimatedTotalPrice 등의 금액 컬럼은 더 넓게
        if (column.id === 'amount' || column.id === 'estimatedUnitPrice' || column.id === 'estimatedTotalPrice') {
          return '180';
        }
        return '120';
      }
      return undefined;
    };

    // 숫자 천 단위 구분 포맷팅
    const formatNumber = (value) => {
      if (value === null || value === undefined || value === '') {
        return '';
      }
      return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // 천 단위 구분 제거하여 숫자로 변환
    const parseNumber = (value) => {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      return Number(String(value).replace(/,/g, ''));
    };

    return {
      documentId,
      draftApprovalId,
      requestId,
      formSchema,
      formData,
      formTitle,
      approvalTitle,
      submitApproval,
      draftApproval,
      deleteDraft,
      cancelRequest,
      showApprovalLineEditor,
      currentApprovalLine,
      updateApprovalLine,
      fileList,
      addGridRow,
      removeGridRow,
      handleGridAmountChange,
      shouldShowField,
      getColumnWidth,
      formatNumber,
      parseNumber,
    };
  },
};
</script>

<style scoped>
.approval-form-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 10px;
}

.form-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px; /* Adjusted margin */
}

.form-layout {
  display: flex;
  gap: 24px;
}

.form-content-section {
  flex: 3; /* 3:1 ratio */
}

.approval-line-section {
  flex: 1;
}

.box-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 24px; /* Increased font size */
}

.dynamic-form {
  padding: 20px;
}

.attachment-section {
  padding: 0 20px 20px 20px;
}

.form-placeholder {
  min-height: 500px; /* Ensure a decent height */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.approval-line-display {
  padding: 0;
  flex-grow: 1;
}

.approver-display-item {
  background-color: #f9f9f9;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.approver-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}
.approver-details {
  font-size: 14px;
  color: #606266;
}

.empty-state {
  text-align: center;
  color: #909399;
  padding-top: 40px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.grid-field-container {
  width: 100%;
}

.grid-field-container .el-table {
  margin-bottom: 10px;
}

.empty-grid {
  text-align: center;
  padding: 20px;
  color: #909399;
}
</style>