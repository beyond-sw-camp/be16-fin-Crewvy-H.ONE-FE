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
                <el-radio-button label="childcare">휴직</el-radio-button>
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
              <el-alert
                v-if="splitUsageWarning && requestType === 'leave'"
                :type="splitUsageWarning.type"
                :closable="false"
                style="margin-top: 8px;"
                :title="splitUsageWarning.title"
              >
                {{ splitUsageWarning.message }}
              </el-alert>
            </el-form-item>

            <el-form-item v-if="requestType === 'childcare'" label="휴직 종류" prop="policyId" :rules="{ required: true, message: '휴직 종류를 선택하세요', trigger: 'change' }">
              <el-select v-model="form.policyId" placeholder="휴직 종류를 선택하세요">
                <el-option v-for="policy in childcarePolicies" :key="policy.policyId" :label="policy.name" :value="policy.policyId" />
              </el-select>
              <el-alert
                v-if="splitUsageWarning && requestType === 'childcare'"
                :type="splitUsageWarning.type"
                :closable="false"
                style="margin-top: 8px;"
                :title="splitUsageWarning.title"
              >
                {{ splitUsageWarning.message }}
              </el-alert>
            </el-form-item>

            <el-form-item v-if="requestType === 'trip'" label="출장 종류" prop="policyId" :rules="{ required: true, message: '출장 종류를 선택하세요', trigger: 'change' }">
              <el-select v-model="form.policyId" placeholder="출장 종류를 선택하세요">
                <el-option v-for="policy in tripPolicies" :key="policy.policyId" :label="policy.name" :value="policy.policyId" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="requestType === 'trip'" label="출장지" prop="workLocation" :rules="{ required: true, message: '출장지를 선택하세요', trigger: 'change' }">
              <el-select v-model="form.workLocation" placeholder="출장지를 선택하세요">
                <el-option v-for="location in allowedWorkLocations" :key="location.workLocationId" :label="location.name" :value="location.name" />
              </el-select>
              <span v-if="selectedPolicy && selectedPolicy.ruleDetails?.tripRule?.allowedWorkLocations && selectedPolicy.ruleDetails.tripRule.allowedWorkLocations.length > 0" class="form-description">
                * 이 정책은 {{ selectedPolicy.ruleDetails.tripRule.allowedWorkLocations.join(', ') }} 출장만 가능합니다.
              </span>
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

            <el-form-item v-if="requestType === 'leave' && form.requestUnit === 'TIME_OFF'" label="시간" prop="dateTimeRange" :rules="{ required: true, message: '시간을 선택하세요', trigger: 'change' }">
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

            <el-form-item v-if="requestType === 'overtime' || requestType === 'night' || requestType === 'holiday'"
                           label="근무 시간"
                           prop="dateTimeRange"
                           :rules="{ required: true, message: '근무 시간을 선택하세요', trigger: 'change' }">
              <el-date-picker
                v-model="form.dateTimeRange"
                type="datetimerange"
                range-separator="-"
                start-placeholder="시작 시각"
                end-placeholder="종료 시각"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
              <el-alert
                v-if="weeklyOvertimeWarning"
                :type="weeklyOvertimeWarning.type"
                :closable="false"
                style="margin-top: 8px;"
                :title="weeklyOvertimeWarning.title"
              >
                {{ weeklyOvertimeWarning.message }}
              </el-alert>
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
import { createLeaveRequest, createTripRequest, getMyAssignedPolicies, getActiveWorkLocations, getMyLeaveRequests, getMyAllBalances } from '@/api/attendance';
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
    const allBalances = ref([]);
    const workLocations = ref([]);

    const form = ref({
      policyId: null,
      requestUnit: 'DAY',
      dateRange: [],
      dateTimeRange: [],
      reason: '',
      requesterComment: '',
      workLocation: null,
    });

    // --- 신청 현황 테이블용 상태 변수 ---
    const myRequests = ref([]);
    const pagination = ref({ page: 1, size: 10, total: 0 });
    const tableLoading = ref(false);

    const leavePolicies = computed(() =>
      allPolicies.value.filter(p =>
        p && p.typeCode &&
        (p.typeCode.includes('LEAVE') || p.typeCode.startsWith('PTC00')) &&
        p.typeCode !== 'PTC004' &&  // 육아휴직 제외
        p.typeCode !== 'PTC005'     // 가족돌봄휴가 제외
      )
    );
    const childcarePolicies = computed(() => {
      return allPolicies.value.filter(p =>
        p.typeCode === 'PTC004' ||  // 육아휴직
        p.typeCode === 'PTC005'     // 가족돌봄휴가
      );
    });
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

    // 출장 신청 시 허용된 출장지 목록
    const allowedWorkLocations = computed(() => {
      if (requestType.value !== 'trip') return workLocations.value;
      if (!selectedPolicy.value) return workLocations.value;

      const tripRule = selectedPolicy.value.ruleDetails?.tripRule;
      if (!tripRule || !tripRule.allowedWorkLocations || tripRule.allowedWorkLocations.length === 0) {
        return workLocations.value; // 정책에 제한이 없으면 전체 출장지 표시
      }

      // 정책에 설정된 출장지만 필터링
      return workLocations.value.filter(loc =>
        tripRule.allowedWorkLocations.includes(loc.name)
      );
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

    const weeklyOvertimeWarning = computed(() => {
      if (requestType.value !== 'overtime') return null;
      if (!form.value.dateTimeRange?.length) return null;

      const start = new Date(form.value.dateTimeRange[0]);
      const end = new Date(form.value.dateTimeRange[1]);
      const requestMin = (end - start) / 60000;

      // 이번 주 월요일~일요일 범위
      const day = start.getDay();
      const monday = new Date(start);
      monday.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);

      // 기존 연장근무 합산 (PTC103/104/105, PENDING/APPROVED)
      let existingMin = 0;
      myRequests.value.forEach(r => {
        if (!['PTC103', 'PTC104', 'PTC105'].includes(r.typeCode)) return;
        if (!['PENDING', 'APPROVED'].includes(r.status)) return;
        const rStart = new Date(r.startDateTime);
        if (rStart >= monday) {
          const rEnd = new Date(r.endDateTime);
          existingMin += (rEnd - rStart) / 60000;
        }
      });

      const total = existingMin + requestMin;
      const h = Math.floor(total / 60);
      const m = total % 60;

      if (total > 720) {
        return { type: 'error', title: '⚠️ 주간 한도 초과',
                 message: `${h}h ${m}m / 12h (근로기준법 제53조 위반)` };
      } else if (total > 600) {
        return { type: 'warning', title: '주간 한도 임박',
                 message: `${h}h ${m}m / 12h` };
      } else if (total > 0) {
        return { type: 'info', title: '주간 연장근무',
                 message: `${h}h ${m}m / 12h` };
      }
      return null;
    });

    // 분할 사용 경고 (마지막 분할 시 경고)
    const splitUsageWarning = computed(() => {
      if (!selectedPolicy.value || !form.value.policyId) return null;

      // 선택된 정책의 잔액 정보 찾기
      const balance = allBalances.value.find(b =>
        b.balanceTypeCode?.codeValue === selectedPolicy.value.typeCode
      );

      if (!balance || balance.maxSplitCount == null) return null;

      const currentCount = balance.currentSplitCount || 0;
      const maxCount = balance.maxSplitCount;

      // 마지막 분할 사용 중인 경우
      if (currentCount === maxCount - 1) {
        const remainingDays = balance.remaining || 0;
        return {
          type: 'warning',
          title: '⚠️ 마지막 분할 사용',
          message: `이번이 마지막 분할 신청입니다. (${currentCount + 1}/${maxCount}회) 잔여 ${remainingDays}일을 모두 사용하세요.`
        };
      }

      // 이미 모든 분할을 사용한 경우 (백엔드에서 막히겠지만 UI에서도 표시)
      if (currentCount >= maxCount) {
        return {
          type: 'error',
          title: '❌ 분할 횟수 초과',
          message: `최대 분할 횟수(${maxCount}회)를 모두 사용했습니다. 더 이상 신청할 수 없습니다.`
        };
      }

      // 일반 정보
      if (currentCount > 0) {
        return {
          type: 'info',
          title: '분할 사용 현황',
          message: `현재 ${currentCount}/${maxCount}회 사용 중 (잔여: ${balance.remaining || 0}일)`
        };
      }

      return null;
    });

    watch(requestType, (newType) => {
      if (newType === 'trip' || newType === 'childcare') {
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
        allPolicies.value = assignedPolicies || [];

        // 잔액 정보 가져오기 (분할 사용 현황 포함)
        const balances = await getMyAllBalances();
        allBalances.value = balances || [];

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
      fetchMyRequests();
    });

    const submitForm = async () => {
      if (!formRef.value) return;
      await formRef.value.validate(async (valid) => {
        if (valid) {
          isSubmitting.value = true;
          try {
            let response;

            // 출장 신청
            if (requestType.value === 'trip') {
              const tripPayload = {
                policyId: form.value.policyId,
                startAt: form.value.dateRange[0],
                endAt: form.value.dateRange[1],
                workLocation: form.value.workLocation,
                reason: form.value.reason,
                requesterComment: form.value.requesterComment || null,
              };
              response = await createTripRequest(tripPayload);
            }
            // 휴가/휴직/연장근무 신청
            else {
              const payload = {
                policyId: form.value.policyId,
                requestUnit: form.value.requestUnit,
                reason: form.value.reason,
                requesterComment: form.value.requesterComment || null,
              };

              // 시간 단위 신청
              if (form.value.requestUnit === 'TIME_OFF' ||
                  requestType.value === 'overtime' ||
                  requestType.value === 'night' ||
                  requestType.value === 'holiday') {
                payload.startDateTime = form.value.dateTimeRange[0];
                payload.endDateTime = form.value.dateTimeRange[1];
              }
              // 일자 단위 신청
              else {
                payload.startAt = form.value.dateRange[0];
                payload.endAt = form.value.dateRange[1];
              }

              response = await createLeaveRequest(payload);
            }

            // 성공 메시지
            if (response.autoApproved && response.status === 'APPROVED') {
              success('자동승인처리되었습니다.');
            } else {
              success('신청이 성공적으로 제출되었습니다.');
            }

            fetchMyRequests();

            // 백엔드에서 자동 매핑한 documentId가 있으면 결재 양식 화면으로 이동
            if (response.documentId) {
              router.push({
                path: `/approval/form/${response.documentId}`,
                query: {
                  requestId: response.requestId
                }
              });
            } else {
              // 자동 승인되었으면 바로 근태 관리 화면으로
              router.push({ name: 'AttendanceManagement' });
            }
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
      allowedWorkLocations,
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
      weeklyOvertimeWarning,
      splitUsageWarning,
      childcarePolicies,
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
