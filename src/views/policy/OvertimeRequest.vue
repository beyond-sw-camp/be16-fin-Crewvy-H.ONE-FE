<template>
  <div class="form-container">
    <el-row :gutter="20">
      <!-- Left Column: Form -->
      <el-col :span="18">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <h2 class="form-title">연장근무신청서</h2>
            </div>
          </template>

          <el-form label-position="top">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="작성부서">
                  <el-input value="영업부" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="작성일자">
                  <el-date-picker v-model="form.requestDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="작성자">
                  <el-input value="김대리" disabled />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="제목">
              <el-input v-model="form.title" placeholder="제목을 입력하세요" />
            </el-form-item>

            <el-form-item label="추가근무 정책" required>
              <el-select v-model="form.policyId" placeholder="추가근무 정책을 선택하세요" style="width: 100%;" :loading="policiesLoading">
                <el-option
                  v-for="policy in extraWorkPolicies"
                  :key="policy.id"
                  :label="`${policy.name} (${getPolicyTypeLabel(policy.policyTypeCode)})`"
                  :value="policy.id"
                >
                  <div style="display: flex; justify-content: space-between;">
                    <span>{{ policy.name }}</span>
                    <span style="color: var(--el-text-color-secondary); font-size: 12px;">{{ getPolicyTypeLabel(policy.policyTypeCode) }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="총 연장근무 시간">
                  <el-input :value="totalOvertimeHours" disabled>
                    <template #append>시간</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="잔여 연장근무 가능 시간">
                  <el-input value="12.5" disabled>
                    <template #append>시간</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 업무내역 Section -->
            <div class="section">
              <div class="section-header">
                <span>업무내역</span>
                <el-button @click="addRow" size="small" :icon="Plus">행 추가</el-button>
              </div>
              <el-table :data="form.rows" style="width: 100%" border>
                <el-table-column type="index" label="순번" width="60" align="center" />
                <el-table-column label="근무일" width="150">
                  <template #default="{ row }">
                    <el-date-picker v-model="row.workDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
                  </template>
                </el-table-column>
                <el-table-column label="시작 시간" width="120">
                  <template #default="{ row }">
                    <el-time-picker v-model="row.startTime" format="HH:mm" value-format="HH:mm" style="width: 100%;" />
                  </template>
                </el-table-column>
                <el-table-column label="종료 시간" width="120">
                  <template #default="{ row }">
                    <el-time-picker v-model="row.endTime" format="HH:mm" value-format="HH:mm" style="width: 100%;" />
                  </template>
                </el-table-column>
                <el-table-column label="총 근무 시간" width="120" align="center">
                  <template #default="{ row }">
                    {{ calculateRowDuration(row) }} 시간
                  </template>
                </el-table-column>
                <el-table-column label="야간/주말" width="100" align="center">
                  <template #default="{ row }">
                     <el-checkbox v-model="row.isNightWeekend" label="포함" size="large" />
                  </template>
                </el-table-column>
                <el-table-column label="작업 내용">
                  <template #default="{ row }">
                    <el-input v-model="row.task" placeholder="작업 내용" />
                  </template>
                </el-table-column>
                <el-table-column label="삭제" width="70" align="center">
                  <template #default="{ $index }">
                    <el-button @click="removeRow($index)" type="danger" :icon="Delete" circle plain />
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 첨부문서 Section -->
            <div class="section">
               <el-form-item label="첨부문서">
                <el-upload
                  drag
                  action="#"
                  multiple
                  :auto-upload="false"
                  style="width: 100%"
                >
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text">
                    파일을 드래그하거나 <em>클릭하여 업로드</em>
                  </div>
                </el-upload>
              </el-form-item>
            </div>

          </el-form>
        </el-card>
      </el-col>

      <!-- Right Column: Approval Line -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>결재라인</span>
              <el-button type="primary" plain size="small" :icon="Edit" @click="showApprovalLineModal = true">편집</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item 
              v-for="(approver, index) in approvalLine" 
              :key="index" 
              :timestamp="`${approver.position} / ${approver.department || '영업부'}`" 
              placement="top"
            >
              <el-card>
                <h4>{{ approver.name }} ({{ index === 0 ? '기안' : '승인' }})</h4>
                <p>{{ approver.status || (index === 0 ? new Date().toLocaleString() : '대기중') }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- Bottom Buttons -->
    <el-row justify="center" class="form-footer">
        <el-button>임시저장</el-button>
        <el-button type="primary">결재요청</el-button>
        <el-button @click="$router.back()">취소</el-button>
    </el-row>

    <!-- Approval Line Editor Modal -->
    <approval-line-editor-modal 
      v-model:visible="showApprovalLineModal"
      :current-approvers="approvalLine"
      @update:approvers="updateApprovers"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Plus, Delete, UploadFilled, Edit } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ApprovalLineEditorModal from '@/components/approval/ApprovalLineEditorModal.vue';
import { getApplicablePolicies } from '@/api/attendance';

const route = useRoute();

const form = ref({
  requestDate: new Date().toISOString().slice(0, 10),
  title: '',
  policyId: null,
  rows: [
    { workDate: new Date().toISOString().slice(0, 10), startTime: '18:00', endTime: '20:00', task: '', isNightWeekend: false },
  ],
});

// 추가근무 정책 목록 (PTC103, PTC104, PTC105만 필터링)
const extraWorkPolicies = ref([]);
const policiesLoading = ref(false);

// 정책 타입 코드 -> 라벨 변환
const getPolicyTypeLabel = (code) => {
  const labels = {
    'PTC103': '연장근무',
    'PTC104': '야간근무',
    'PTC105': '휴일근무',
  };
  return labels[code] || code;
};

// 추가근무 정책 목록 조회
const fetchExtraWorkPolicies = async () => {
  policiesLoading.value = true;
  try {
    const allPolicies = await getApplicablePolicies();
    // PTC103 (연장근무), PTC104 (야간근무), PTC105 (휴일근무)만 필터링
    extraWorkPolicies.value = allPolicies.filter(policy =>
      ['PTC103', 'PTC104', 'PTC105'].includes(policy.policyTypeCode)
    );

    if (extraWorkPolicies.value.length === 0) {
      ElMessage.warning('할당된 추가근무 정책이 없습니다.');
    }
  } catch (error) {
    ElMessage.error(error.message || '정책 목록을 불러오는 데 실패했습니다.');
  } finally {
    policiesLoading.value = false;
  }
};

onMounted(() => {
  if (route.query.reason) {
    form.value.title = route.query.reason;
  }
  fetchExtraWorkPolicies();
});

const showApprovalLineModal = ref(false);

const approvalLine = ref([
  { name: "김대리", position: "대리", department: "영업부", status: new Date().toLocaleString() },
  { name: "박과장", position: "과장", department: "영업부", status: "대기중" },
  { name: "최부장", position: "부장", department: "영업부", status: "대기중" },
]);

const calculateRowDuration = (row) => {
  if (!row.startTime || !row.endTime) return 0;
  const start = new Date(`2000/01/01 ${row.startTime}`);
  const end = new Date(`2000/01/01 ${row.endTime}`);
  let diff = (end - start) / (1000 * 60 * 60); // Difference in hours
  if (diff < 0) diff += 24; // Handle overnight shifts
  return diff.toFixed(1);
};

const totalOvertimeHours = computed(() => {
  return form.value.rows.reduce((sum, row) => sum + parseFloat(calculateRowDuration(row)), 0).toFixed(1);
});

const addRow = () => {
  form.value.rows.push({ workDate: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', task: '', isNightWeekend: false });
};

const removeRow = (index) => {
  form.value.rows.splice(index, 1);
};

const updateApprovers = (newApprovers) => {
  approvalLine.value = newApprovers;
};

</script>

<style scoped>
.form-container {
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px;
}
.form-title {
  margin: 0;
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section {
  margin-top: 20px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
}
.form-footer {
  margin-top: 20px;
}
</style>
