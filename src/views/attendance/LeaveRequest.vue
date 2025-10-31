<template>
  <div class="leave-request-page">
    <el-row :gutter="20">
      <!-- 신청서 섹션 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <h2>휴가/출장 신청</h2>
            </div>
          </template>
          <el-form ref="formRef" :model="form" label-width="120px" @submit.prevent="submitForm">
            <el-form-item label="신청 종류" prop="requestType">
              <el-radio-group v-model="requestType" @change="handleRequestTypeChange">
                <el-radio-button label="leave">휴가</el-radio-button>
                <el-radio-button label="trip">출장</el-radio-button>
                <el-radio-button label="overtime">연장근무</el-radio-button>
                <el-radio-button label="night">야간근무</el-radio-button>
                <el-radio-button label="holiday">휴일근무</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="requestType === 'leave'" label="휴가 종류" prop="policyId" :rules="{ required: true, message: '휴가 종류를 선택하세요', trigger: 'change' }">
              <el-select v-model="form.policyId" placeholder="휴가 종류를 선택하세요">
                <el-option v-for="policy in leavePolicies" :key="policy.policyId" :label="policy.name" :value="policy.policyId" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="requestType === 'trip'" label="출장 종류" prop="policyId" :rules="{ required: true, message: '출장 종류를 선택하세요', trigger: 'change' }">
              <el-select v-model="form.policyId" placeholder="출장 종류를 선택하세요">
                <el-option v-for="policy in tripPolicies" :key="policy.policyId" :label="policy.name" :value="policy.policyId" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="requestType === 'overtime'" label="연장근무 정책" prop="policyId" :rules="{ required: true, message: '연장근무 정책을 선택하세요', trigger: 'change' }">
              <el-select v-model="form.policyId" placeholder="연장근무 정책을 선택하세요">
                <el-option v-for="policy in overtimePolicies" :key="policy.policyId" :label="policy.name" :value="policy.policyId" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="requestType === 'night'" label="야간근무 정책" prop="policyId" :rules="{ required: true, message: '야간근무 정책을 선택하세요', trigger: 'change' }">
              <el-select v-model="form.policyId" placeholder="야간근무 정책을 선택하세요">
                <el-option v-for="policy in nightWorkPolicies" :key="policy.policyId" :label="policy.name" :value="policy.policyId" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="requestType === 'holiday'" label="휴일근무 정책" prop="policyId" :rules="{ required: true, message: '휴일근무 정책을 선택하세요', trigger: 'change' }">
              <el-select v-model="form.policyId" placeholder="휴일근무 정책을 선택하세요">
                <el-option v-for="policy in holidayWorkPolicies" :key="policy.policyId" :label="policy.name" :value="policy.policyId" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="requestType === 'leave'" label="신청 단위" prop="requestUnit">
              <el-radio-group v-model="form.requestUnit">
                <el-radio-button label="DAY" :disabled="!isRequestUnitAllowed('DAY')">종일</el-radio-button>
                <el-radio-button label="HALF_DAY_AM" :disabled="!isRequestUnitAllowed('HALF_DAY_AM')">오전 반차</el-radio-button>
                <el-radio-button label="HALF_DAY_PM" :disabled="!isRequestUnitAllowed('HALF_DAY_PM')">오후 반차</el-radio-button>
                <el-radio-button label="TIME_OFF" :disabled="!isRequestUnitAllowed('TIME_OFF')">시간 단위</el-radio-button>
              </el-radio-group>
              <span v-if="selectedPolicy && selectedPolicy.allowedRequestUnits" class="form-description">
                * 이 정책은 {{ formatAllowedUnits(selectedPolicy.allowedRequestUnits) }} 신청만 가능합니다.
              </span>
            </el-form-item>

            <el-form-item v-if="form.requestUnit !== 'TIME_OFF'" label="기간" prop="dateRange" :rules="{ required: true, message: '기간을 선택하세요', trigger: 'change' }">
              <el-date-picker
                v-model="form.dateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="시작일"
                end-placeholder="종료일"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item v-if="form.requestUnit === 'TIME_OFF'" label="시간" prop="dateTimeRange" :rules="{ required: true, message: '시간을 선택하세요', trigger: 'change' }">
              <el-date-picker
                v-model="form.dateTimeRange"
                type="datetimerange"
                range-separator="-"
                start-placeholder="시작 시각"
                end-placeholder="종료 시각"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
            
            <el-form-item v-if="requestType === 'trip'" label="출장지" prop="workLocation">
              <el-select v-model="form.workLocation" placeholder="출장지를 선택하세요">
                <el-option v-for="loc in workLocations" :key="loc.workLocationId" :label="loc.name" :value="loc.name" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="requestType === 'overtime' || requestType === 'night' || requestType === 'holiday'" label="근무 시간" prop="dateTimeRange" :rules="{ required: true, message: '근무 시간을 선택하세요', trigger: 'change' }">
              <el-date-picker
                v-model="form.dateTimeRange"
                type="datetimerange"
                range-separator="-"
                start-placeholder="시작 시각"
                end-placeholder="종료 시각"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>

            <el-form-item label="사유" prop="reason" :rules="{ required: true, message: '사유를 입력하세요', trigger: 'blur' }">
              <el-input v-model="form.reason" type="textarea" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="isSubmitting">제출</el-button>
              <el-button @click="resetForm">초기화</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 신청 현황 섹션 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <h2>신청 현황</h2>
              <el-button class="button" text @click="fetchMyRequests" :icon="Refresh">새로고침</el-button>
            </div>
          </template>
          <el-table :data="myRequests" v-loading="tableLoading" stripe height="400">
            <el-table-column prop="policyName" label="신청 종류" />
            <el-table-column label="신청 기간" width="220">
              <template #default="{ row }">
                {{ formatPeriod(row) }}
              </template>
            </el-table-column>
            <el-table-column prop="deductionDays" label="차감일수" width="90" />
            <el-table-column prop="reason" label="사유" show-overflow-tooltip />
            <el-table-column label="상태" width="90">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ formatStatus(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            small
            background
            layout="prev, pager, next"
            :total="pagination.total"
            :page-size="pagination.size"
            :current-page="pagination.page"
            @current-change="handlePageChange"
            class="pagination"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSnackbar } from '@/composables/useSnackbar';
import { createLeaveRequest, getMyAssignedPolicies, getActiveWorkLocations, getMyLeaveRequests } from '@/api/attendance';
import { Refresh } from '@element-plus/icons-vue';

export default {
  name: 'LeaveRequest',
  components: { }, // Refresh 아이콘 컴포넌트 등록
  setup() {
    const router = useRouter();
    const { success, error } = useSnackbar();
    const formRef = ref(null);
    const isSubmitting = ref(false);
    const requestType = ref('leave');

    const allPolicies = ref([]);
    const workLocations = ref([]);

    const form = ref({
      policyId: null,
      requestUnit: 'DAY',
      dateRange: [],
      dateTimeRange: [],
      reason: '',
      workLocation: null,
    });

    // --- 신청 현황 테이블용 상태 변수 ---
    const myRequests = ref([]);
    const pagination = ref({ page: 1, size: 10, total: 0 });
    const tableLoading = ref(false);

    const leavePolicies = computed(() =>
      allPolicies.value.filter(p => p && p.typeCode && (p.typeCode.includes('LEAVE') || p.typeCode.startsWith('PTC00')))
    );
    const tripPolicies = computed(() =>
      allPolicies.value.filter(p => p && p.typeCode && p.typeCode === 'PTC102')
    );
    const overtimePolicies = computed(() =>
      allPolicies.value.filter(p => p && p.typeCode && p.typeCode === 'PTC103')
    );
    const nightWorkPolicies = computed(() =>
      allPolicies.value.filter(p => p && p.typeCode && p.typeCode === 'PTC104')
    );
    const holidayWorkPolicies = computed(() =>
      allPolicies.value.filter(p => p && p.typeCode && p.typeCode === 'PTC105')
    );

    // 선택된 정책 정보
    const selectedPolicy = computed(() => {
      if (!form.value.policyId) return null;
      return allPolicies.value.find(p => p.policyId === form.value.policyId);
    });

    // 신청 단위 허용 여부 확인
    const isRequestUnitAllowed = (unit) => {
      if (!selectedPolicy.value) return true; // 정책 미선택 시 모두 허용
      if (!selectedPolicy.value.allowedRequestUnits || selectedPolicy.value.allowedRequestUnits.length === 0) {
        return true; // allowedRequestUnits가 없으면 모두 허용
      }
      return selectedPolicy.value.allowedRequestUnits.includes(unit);
    };

    // 허용된 단위 포맷팅
    const formatAllowedUnits = (units) => {
      const unitMap = {
        'DAY': '종일',
        'HALF_DAY_AM': '오전 반차',
        'HALF_DAY_PM': '오후 반차',
        'TIME_OFF': '시간 단위'
      };
      return units.map(u => unitMap[u] || u).join(', ');
    };

    watch(requestType, (newType) => {
      if (newType === 'trip') {
        form.value.requestUnit = 'DAY';
      } else if (newType === 'overtime' || newType === 'night' || newType === 'holiday') {
        form.value.requestUnit = 'TIME_OFF';
      }
    });

    // 정책 선택 시 신청 단위 자동 조정
    watch(() => form.value.policyId, (newPolicyId) => {
      if (newPolicyId && selectedPolicy.value && selectedPolicy.value.allowedRequestUnits) {
        // 현재 선택된 신청 단위가 허용되지 않으면 첫 번째 허용된 단위로 변경
        if (!isRequestUnitAllowed(form.value.requestUnit)) {
          form.value.requestUnit = selectedPolicy.value.allowedRequestUnits[0] || 'DAY';
        }
      }
    });

    const fetchInitialData = async () => {
      try {
        // 내게 할당된 정책만 가져오기
        const assignedPolicies = await getMyAssignedPolicies();
        console.log('Fetched Assigned Policies:', assignedPolicies); // 데이터 확인용 콘솔 로그
        allPolicies.value = assignedPolicies || [];

        workLocations.value = await getActiveWorkLocations();
      } catch (err) {
        error(err.message || '필요한 데이터를 불러오는 데 실패했습니다.');
      }
    };

    const fetchMyRequests = async () => {
      tableLoading.value = true;
      try {
        const params = { page: pagination.value.page - 1, size: pagination.value.size, sort: 'createdAt,desc' };
        const response = await getMyLeaveRequests(params);
        myRequests.value = response.content;
        pagination.value.total = response.totalElements;
      } catch (err) {
        error(err.message || '신청 현황을 불러오는 데 실패했습니다.');
      } finally {
        tableLoading.value = false;
      }
    };

    onMounted(() => {
      fetchInitialData();
      fetchMyRequests(); // onMounted에 추가
    });

    const submitForm = async () => {
      if (!formRef.value) return;
      await formRef.value.validate(async (valid) => {
        if (valid) {
          isSubmitting.value = true;
          try {
            const payload = {
              policyId: form.value.policyId,
              requestUnit: form.value.requestUnit,
              reason: form.value.reason,
              workLocation: requestType.value === 'trip' ? form.value.workLocation : null,
            };

            if (form.value.requestUnit === 'TIME_OFF') {
              payload.startDateTime = form.value.dateTimeRange[0];
              payload.endDateTime = form.value.dateTimeRange[1];
            } else {
              payload.startAt = form.value.dateRange[0];
              payload.endAt = form.value.dateRange[1];
            }

            const response = await createLeaveRequest(payload);

            // 자동 승인 여부에 따라 다른 메시지 표시
            if (response.autoApproved && response.status === 'APPROVED') {
              success('자동승인처리되었습니다.');
            } else {
              success('신청이 성공적으로 제출되었습니다.');
            }
            fetchMyRequests(); // 신청 성공 후 목록 새로고침
            router.push({ name: 'AttendanceManagement' });
          } catch (err) {
            error(err.message || '신청 제출에 실패했습니다.');
          } finally {
            isSubmitting.value = false;
          }
        }
      });
    };

    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields();
      }
      form.value.dateTimeRange = [];
    };
    
    const handleRequestTypeChange = () => {
      // 신청 종류 변경 시 모든 필드 초기화
      form.value.policyId = null;
      form.value.dateRange = [];
      form.value.dateTimeRange = [];
      form.value.workLocation = null;
      form.value.reason = '';
    };

    const handleSizeChange = (newSize) => {
      pagination.value.size = newSize;
      fetchMyRequests();
    };

    const handlePageChange = (newPage) => {
      pagination.value.page = newPage;
      fetchMyRequests();
    };

    const formatRequestUnit = (unit) => ({ 'DAY': '종일', 'HALF_DAY_AM': '오전 반차', 'HALF_DAY_PM': '오후 반차', 'TIME_OFF': '시간 단위' }[unit] || unit);
    const formatStatus = (status) => ({ 'PENDING': '대기중', 'APPROVED': '승인', 'REJECTED': '반려', 'CANCELED': '취소' }[status] || status);
    const getStatusType = (status) => ({ 'PENDING': 'info', 'APPROVED': 'success', 'REJECTED': 'danger', 'CANCELED': 'warning' }[status] || 'info');
    const formatDate = (dateTimeStr) => dateTimeStr ? dateTimeStr.split('T')[0] : '';
    const formatPeriod = (row) => {
      if (!row) return '';
      if (row.requestUnit === 'TIME_OFF') {
        const start = row.startDateTime ? row.startDateTime.replace('T', ' ').substring(0, 16) : '';
        const end = row.endDateTime ? row.endDateTime.replace('T', ' ').substring(0, 16) : '';
        return `${start} ~ ${end}`;
      }
      const startAt = row.startDateTime ? row.startDateTime.substring(0, 10) : '';
      const endAt = row.endDateTime ? row.endDateTime.substring(0, 10) : '';
      return `${startAt} ~ ${endAt}`;
    };

    return {
      form,
      formRef,
      isSubmitting,
      requestType,
      leavePolicies,
      tripPolicies,
      overtimePolicies,
      nightWorkPolicies,
      holidayWorkPolicies,
      workLocations,
      submitForm,
      resetForm,
      handleRequestTypeChange,
      myRequests,
      pagination,
      tableLoading,
      fetchMyRequests,
      handleSizeChange,
      handlePageChange,
      formatRequestUnit,
      formatStatus,
      getStatusType,
      formatDate,
      formatPeriod,
      Refresh,
      selectedPolicy,
      isRequestUnitAllowed,
      formatAllowedUnits,
    };
  },
};
</script>

<style scoped>
.leave-request-page {
  max-width: 1600px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  justify-content: center;
  margin-top: 20px;
}
.form-description {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
  display: block;
  margin-top: 5px;
}
</style>
