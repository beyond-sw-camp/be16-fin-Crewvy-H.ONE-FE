<template>
  <div class="leave-request-page">
    <el-row :gutter="20" class="content-row">
      <!-- 신청서 섹션 -->
      <el-col :span="12" class="card-col">
        <el-card class="full-height-card">
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
                <el-radio-button label="extraWork">추가근무</el-radio-button>
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

            <!-- 추가근무: 정책 선택 -->
            <el-form-item v-if="requestType === 'extraWork'" label="추가근무 정책" prop="policyId" :rules="{ required: true, message: '추가근무 정책을 선택하세요', trigger: 'change' }">
              <el-select v-model="form.policyId" placeholder="추가근무 정책을 선택하세요">
                <el-option
                  v-for="policy in extraWorkPolicies"
                  :key="policy.policyId"
                  :label="`[${getExtraWorkTypeName(policy.typeCode)}] ${policy.name}`"
                  :value="policy.policyId"
                />
              </el-select>
            </el-form-item>

            <!-- 추가근무: 기간 + 1일 시간 입력 방식 -->
            <el-form-item v-if="requestType === 'extraWork'" label="신청 기간" prop="dateRange" :rules="{ required: true, message: '기간을 선택하세요', trigger: 'change' }">
              <el-popover
                placement="bottom-start"
                :width="350"
                trigger="click"
                v-model:visible="dateRangePopoverVisible"
              >
                <template #reference>
                  <el-input
                    :model-value="formatDateRange(form.dateRange)"
                    placeholder="기간을 선택하세요"
                    readonly
                    style="cursor: pointer; width: 100%;"
                  >
                    <template #suffix>
                      <el-icon><Calendar /></el-icon>
                    </template>
                  </el-input>
                </template>
                <div class="date-range-calendar-popup">
                  <div class="calendar-header">
                    <el-button size="small" @click="previousMonth" :icon="ArrowLeft" circle />
                    <span class="current-month">{{ formatCalendarMonth(calendarDate) }}</span>
                    <el-button size="small" @click="nextMonth" :icon="ArrowRight" circle />
                  </div>
                  <el-calendar v-model="calendarDate" style="width: 100%;">
                    <template #date-cell="{ data }">
                      <div
                        :class="[
                          'calendar-day-cell',
                          getCalendarCellClass(data),
                          isDateInRange(data.day) ? 'in-range' : '',
                          isRangeStart(data.day) ? 'range-start' : '',
                          isRangeEnd(data.day) ? 'range-end' : '',
                          isDateDisabled(data.day) ? 'disabled' : ''
                        ]"
                        @click="handleDateClick(data.day)"
                      >
                        {{ data.day.split('-').slice(2).join('-') }}
                      </div>
                    </template>
                  </el-calendar>
                  <div class="calendar-legend">
                    <span class="legend-item"><span class="legend-dot weekend"></span>주말</span>
                    <span class="legend-item"><span class="legend-dot holiday"></span>공휴일</span>
                  </div>
                  <div class="calendar-actions">
                    <el-button size="small" @click="clearDateRange">초기화</el-button>
                    <el-button size="small" type="primary" @click="confirmDateRange">확인</el-button>
                  </div>
                </div>
              </el-popover>
              <span class="form-description">
                * 선택한 기간의 각 날짜마다 1일 연장시간이 적용됩니다.
              </span>
              <span v-if="deadlineHelpText" class="form-description">
                {{ deadlineHelpText }}
              </span>
            </el-form-item>

            <el-form-item v-if="requestType === 'extraWork'" label="1일 시간" prop="dailyOvertimeHours" :rules="{ required: true, message: '1일 시간을 입력하세요', trigger: 'change' }">
              <el-time-picker
                v-model="form.dailyOvertimeHours"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="예: 03:00"
                style="width: 200px;"
              />
              <span class="form-description">
                * 선택한 기간의 각 날짜마다 적용할 시간을 입력하세요.
              </span>
              <el-alert
                v-if="extraWorkWarning"
                :type="extraWorkWarning.type"
                :closable="false"
                style="margin-top: 8px;"
                :title="extraWorkWarning.title"
              >
                {{ extraWorkWarning.message }}
              </el-alert>
            </el-form-item>

            <el-form-item v-if="requestType === 'leave'" label="신청 단위" prop="requestUnit">
              <el-radio-group v-model="form.requestUnit">
                <el-radio-button label="DAY" :disabled="!isRequestUnitAllowed('DAY')">종일</el-radio-button>
                <el-radio-button label="HALF_DAY_AM" :disabled="!isRequestUnitAllowed('HALF_DAY_AM')">오전 반차</el-radio-button>
                <el-radio-button label="HALF_DAY_PM" :disabled="!isRequestUnitAllowed('HALF_DAY_PM')">오후 반차</el-radio-button>
                <el-radio-button label="TIME_OFF" :disabled="!isRequestUnitAllowed('TIME_OFF')">시간 단위</el-radio-button>
              </el-radio-group>
              <span v-if="selectedPolicy && selectedPolicy.typeCode !== 'PTC001'" class="form-description">
                * 이 정책은 종일 신청만 가능합니다.
              </span>
              <span v-else-if="selectedPolicy && selectedPolicy.typeCode === 'PTC001' && selectedPolicy.allowedRequestUnits && selectedPolicy.allowedRequestUnits.length > 0" class="form-description">
                * 이 정책은 {{ formatAllowedUnits(selectedPolicy.allowedRequestUnits) }} 신청만 가능합니다.
              </span>
              <span v-else-if="selectedPolicy && selectedPolicy.typeCode === 'PTC001' && selectedPolicy.ruleDetails?.leaveRule?.minimumRequestUnit" class="form-description">
                * 최소 신청 단위: {{ formatMinimumUnit(selectedPolicy.ruleDetails.leaveRule.minimumRequestUnit) }}
              </span>
              <span v-else-if="selectedPolicy && selectedPolicy.typeCode === 'PTC001'" class="form-description">
                * 모든 신청 단위가 허용됩니다.
              </span>
              <span v-else class="form-description form-help">
                * 휴가 종류를 먼저 선택하세요.
              </span>
            </el-form-item>

            <el-form-item v-if="form.requestUnit !== 'TIME_OFF' && requestType !== 'extraWork'" label="기간" prop="dateRange" :rules="{ required: true, message: '기간을 선택하세요', trigger: 'change' }">
              <el-popover
                placement="bottom-start"
                :width="350"
                trigger="click"
                v-model:visible="dateRangePopoverVisible"
              >
                <template #reference>
                  <el-input
                    :model-value="formatDateRange(form.dateRange)"
                    placeholder="기간을 선택하세요"
                    readonly
                    style="cursor: pointer; width: 100%;"
                  >
                    <template #suffix>
                      <el-icon><Calendar /></el-icon>
                    </template>
                  </el-input>
                </template>
                <div class="date-range-calendar-popup">
                  <div class="calendar-header">
                    <el-button size="small" @click="previousMonth" :icon="ArrowLeft" circle />
                    <span class="current-month">{{ formatCalendarMonth(calendarDate) }}</span>
                    <el-button size="small" @click="nextMonth" :icon="ArrowRight" circle />
                  </div>
                  <el-calendar v-model="calendarDate" style="width: 100%;">
                    <template #date-cell="{ data }">
                      <div
                        :class="[
                          'calendar-day-cell',
                          getCalendarCellClass(data),
                          isDateInRange(data.day) ? 'in-range' : '',
                          isRangeStart(data.day) ? 'range-start' : '',
                          isRangeEnd(data.day) ? 'range-end' : '',
                          isDateDisabled(data.day) ? 'disabled' : ''
                        ]"
                        @click="handleDateClick(data.day)"
                      >
                        {{ data.day.split('-').slice(2).join('-') }}
                      </div>
                    </template>
                  </el-calendar>
                  <div class="calendar-legend">
                    <span class="legend-item"><span class="legend-dot weekend"></span>주말</span>
                    <span class="legend-item"><span class="legend-dot holiday"></span>공휴일</span>
                  </div>
                  <div class="calendar-actions">
                    <el-button size="small" @click="clearDateRange">초기화</el-button>
                    <el-button size="small" type="primary" @click="confirmDateRange">확인</el-button>
                  </div>
                </div>
              </el-popover>
              <span v-if="deadlineHelpText" class="form-description">
                {{ deadlineHelpText }}
              </span>
              <el-alert
                v-if="balanceShortageWarning"
                :type="balanceShortageWarning.type"
                :closable="false"
                style="margin-top: 8px;"
                :title="balanceShortageWarning.title"
              >
                {{ balanceShortageWarning.message }}
              </el-alert>
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
                :disabled-date="getDisabledDate"
                :cell-class-name="getCellClassName"
              />
              <span v-if="deadlineHelpText" class="form-description">
                {{ deadlineHelpText }}
              </span>
              <el-alert
                v-if="balanceShortageWarning"
                :type="balanceShortageWarning.type"
                :closable="false"
                style="margin-top: 8px;"
                :title="balanceShortageWarning.title"
              >
                {{ balanceShortageWarning.message }}
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
      <el-col :span="12" class="card-col">
        <el-card class="full-height-card">
          <template #header>
            <div class="card-header">
              <h2>신청 현황</h2>
              <el-button class="button" text @click="fetchMyRequests" :icon="Refresh">새로고침</el-button>
            </div>
          </template>
          <el-table :data="myRequests" v-loading="tableLoading" stripe height="600">
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
import { useRouter, useRoute } from 'vue-router';
import { useSnackbar } from '@/composables/useSnackbar';
import { createLeaveRequest, createTripRequest, getMyAssignedPolicies, getActiveWorkLocations, getMyLeaveRequests, getMyAllBalances, getHolidays } from '@/api/attendance';
import { Refresh, Calendar, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

export default {
  name: 'LeaveRequest',
  components: { }, // Refresh 아이콘 컴포넌트 등록
  setup() {
    const router = useRouter();
    const route = useRoute();
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
      dailyOvertimeHours: null, // 추가근무: 1일 연장시간 (HH:mm 형식)
      reason: '',
      requesterComment: '',
      workLocation: null,
    });

    // --- 신청 현황 테이블용 상태 변수 ---
    const myRequests = ref([]);
    const pagination = ref({ page: 1, size: 10, total: 0 });
    const tableLoading = ref(false);

    // --- 공휴일 데이터 ---
    const holidays = ref([]);
    const calendarDate = ref(new Date());
    const dateRangePopoverVisible = ref(false);
    const tempDateRange = ref([]);

    const leavePolicies = computed(() =>
      allPolicies.value.filter(p =>
        p && p.typeCode && p.isActive &&
        (p.typeCode.includes('LEAVE') || p.typeCode.startsWith('PTC00')) &&
        p.typeCode !== 'PTC004' &&  // 육아휴직 제외
        p.typeCode !== 'PTC005'     // 가족돌봄휴가 제외
      )
    );
    const childcarePolicies = computed(() => {
      return allPolicies.value.filter(p =>
        p && p.isActive &&
        (p.typeCode === 'PTC004' ||  // 육아휴직
        p.typeCode === 'PTC005')     // 가족돌봄휴가
      );
    });
    const tripPolicies = computed(() =>
      allPolicies.value.filter(p => p && p.typeCode && p.isActive && p.typeCode === 'PTC102')
    );
    const overtimePolicies = computed(() =>
      allPolicies.value.filter(p => p && p.typeCode && p.isActive && p.typeCode === 'PTC103')
    );
    const nightWorkPolicies = computed(() =>
      allPolicies.value.filter(p => p && p.typeCode && p.isActive && p.typeCode === 'PTC104')
    );
    const holidayWorkPolicies = computed(() =>
      allPolicies.value.filter(p => p && p.typeCode && p.isActive && p.typeCode === 'PTC105')
    );
    // 추가근무 정책 (연장/야간/휴일 모두 포함)
    const extraWorkPolicies = computed(() =>
      allPolicies.value.filter(p =>
        p && p.typeCode && p.isActive &&
        (p.typeCode === 'PTC103' || p.typeCode === 'PTC104' || p.typeCode === 'PTC105')
      )
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

      // 연차(PTC001)가 아닌 경우, 종일(DAY)만 허용
      if (selectedPolicy.value.typeCode !== 'PTC001') {
        return unit === 'DAY';
      }

      // 연차인 경우, allowedRequestUnits 우선 체크 (정책별 설정 준수)
      if (selectedPolicy.value.allowedRequestUnits && selectedPolicy.value.allowedRequestUnits.length > 0) {
        return selectedPolicy.value.allowedRequestUnits.includes(unit);
      }

      // allowedRequestUnits가 없으면 minimumRequestUnit 체크 (deprecated but fallback)
      const leaveRule = selectedPolicy.value.ruleDetails?.leaveRule;
      if (leaveRule?.minimumRequestUnit) {
        const minUnit = leaveRule.minimumRequestUnit;
        // minimumRequestUnit에 따라 허용 범위 결정
        const unitHierarchy = {
          'HOUR': ['TIME_OFF', 'HALF_DAY_AM', 'HALF_DAY_PM', 'DAY'], // 시간 단위 이상 모두 허용
          'HALF_DAY': ['HALF_DAY_AM', 'HALF_DAY_PM', 'DAY'], // 반차 이상 허용
          'DAY': ['DAY'] // 종일만 허용
        };
        return unitHierarchy[minUnit]?.includes(unit) || false;
      }

      // 둘 다 없으면 모두 허용
      return true;
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

    // 최소 신청 단위 포맷팅
    const formatMinimumUnit = (minUnit) => {
      const unitMap = {
        'HOUR': '시간 단위',
        'HALF_DAY': '반차',
        'DAY': '종일'
      };
      return unitMap[minUnit] || minUnit;
    };

    // 주말 여부 확인
    const isWeekend = (date) => {
      const day = date.getDay();
      return day === 0 || day === 6; // 0: 일요일, 6: 토요일
    };

    // 공휴일 체크 함수
    const isHoliday = (date) => {
      // toISOString() 대신 로컬 날짜를 YYYY-MM-DD 형식으로 변환
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // holidays.value의 date 필드와 비교
      return holidays.value.some(h => {
        // h.date가 문자열이거나 배열 형태일 수 있으므로 안전하게 비교
        const holidayDate = Array.isArray(h.date)
          ? `${h.date[0]}-${String(h.date[1]).padStart(2, '0')}-${String(h.date[2]).padStart(2, '0')}`
          : h.date;
        return holidayDate === dateStr;
      });
    };

    // 캘린더 셀 클래스 설정 (주말: 빨간 숫자, 공휴일: 빨간 원)
    const getCellClassName = (date) => {
      const targetDate = new Date(date);
      if (isWeekend(targetDate)) {
        return 'weekend-cell'; // 주말 (숫자만 빨간색)
      }
      if (isHoliday(targetDate)) {
        return 'holiday-cell'; // 공휴일 (선택 시 빨간 원)
      }
      return '';
    };

    // el-calendar용 셀 클래스 설정
    const getCalendarCellClass = (data) => {
      // data.day format: 'YYYY-MM-DD'
      const targetDate = new Date(data.day);

      if (isHoliday(targetDate)) {
        return 'holiday'; // 공휴일
      }
      if (isWeekend(targetDate)) {
        return 'weekend'; // 주말
      }
      return '';
    };

    // 날짜 범위 포맷팅 (input 표시용)
    const formatDateRange = (range) => {
      if (!range || range.length !== 2) return '';
      return `${range[0]} ~ ${range[1]}`;
    };

    // 캘린더 월 표시 포맷
    const formatCalendarMonth = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    };

    // 이전 월로 이동
    const previousMonth = () => {
      const d = new Date(calendarDate.value);
      d.setMonth(d.getMonth() - 1);
      calendarDate.value = d;
    };

    // 다음 월로 이동
    const nextMonth = () => {
      const d = new Date(calendarDate.value);
      d.setMonth(d.getMonth() + 1);
      calendarDate.value = d;
    };

    // 날짜가 범위 내에 있는지 확인
    const isDateInRange = (dateStr) => {
      if (!tempDateRange.value || tempDateRange.value.length !== 2) return false;
      const date = new Date(dateStr);
      const start = new Date(tempDateRange.value[0]);
      const end = new Date(tempDateRange.value[1]);
      return date >= start && date <= end;
    };

    // 시작일인지 확인
    const isRangeStart = (dateStr) => {
      return tempDateRange.value && tempDateRange.value[0] === dateStr;
    };

    // 종료일인지 확인
    const isRangeEnd = (dateStr) => {
      return tempDateRange.value && tempDateRange.value[1] === dateStr;
    };

    // 날짜가 비활성화되었는지 확인
    const isDateDisabled = (dateStr) => {
      const targetDate = new Date(dateStr);
      return getDisabledDate(targetDate);
    };

    // 날짜 클릭 처리 (범위 선택)
    const handleDateClick = (dateStr) => {
      // getDisabledDate 체크 - 선택 불가능한 날짜면 무시
      const targetDate = new Date(dateStr);
      if (getDisabledDate(targetDate)) {
        return;
      }

      if (!tempDateRange.value || tempDateRange.value.length === 0) {
        // 첫 번째 클릭: 시작일 설정
        tempDateRange.value = [dateStr];
      } else if (tempDateRange.value.length === 1) {
        // 두 번째 클릭: 종료일 설정
        const startDate = new Date(tempDateRange.value[0]);
        const endDate = new Date(dateStr);

        if (endDate < startDate) {
          // 종료일이 시작일보다 이전이면 시작일로 재설정
          tempDateRange.value = [dateStr];
        } else {
          // 정상 범위 설정
          tempDateRange.value = [tempDateRange.value[0], dateStr];
        }
      } else {
        // 세 번째 클릭: 범위 초기화하고 새로 시작
        tempDateRange.value = [dateStr];
      }
    };

    // 날짜 범위 초기화
    const clearDateRange = () => {
      tempDateRange.value = [];
      form.value.dateRange = [];
      dateRangePopoverVisible.value = false;
    };

    // 날짜 범위 확인 (form에 반영)
    const confirmDateRange = () => {
      if (tempDateRange.value && tempDateRange.value.length === 2) {
        form.value.dateRange = [...tempDateRange.value];
      }
      dateRangePopoverVisible.value = false;
    };

    // 팝오버가 열릴 때 tempDateRange 초기화
    watch(dateRangePopoverVisible, (visible) => {
      if (visible) {
        // 팝오버가 열릴 때 현재 선택된 날짜로 초기화
        if (form.value.dateRange && form.value.dateRange.length === 2) {
          tempDateRange.value = [...form.value.dateRange];
          // 선택된 날짜의 월로 캘린더 이동
          calendarDate.value = new Date(form.value.dateRange[0]);
        } else {
          tempDateRange.value = [];
          calendarDate.value = new Date();
        }
      }
    });

    // 날짜 선택 제한 함수 (requestDeadlineDays 및 사후 신청 규칙 적용 + 공휴일/주말 제한)
    const getDisabledDate = (date) => {
      if (!selectedPolicy.value) return false;

      const leaveRule = selectedPolicy.value.ruleDetails?.leaveRule;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      // 0. 연장근무/휴일근무/야간근무가 아닌 경우: 주말/공휴일 선택 불가
      const isExtraWorkPolicy = requestType.value === 'extraWork' ||
                                selectedPolicy.value.typeCode === 'PTC103' ||  // 연장근무
                                selectedPolicy.value.typeCode === 'PTC104' ||  // 야간근무
                                selectedPolicy.value.typeCode === 'PTC105';    // 휴일근무

      if (!isExtraWorkPolicy) {
        // 반차/시차: 해당 날짜가 주말/공휴일이면 선택 불가
        if (form.value.requestUnit === 'HALF_DAY_AM' ||
            form.value.requestUnit === 'HALF_DAY_PM' ||
            form.value.requestUnit === 'TIME_OFF') {
          if (isWeekend(targetDate) || isHoliday(targetDate)) {
            return true; // 선택 불가
          }
        }
        // 종일 휴가: 주말/공휴일도 선택 가능하지만 일수 계산에서는 제외됨
      }

      if (!leaveRule) return false;

      // 1. requestDeadlineDays: 휴가 시작일로부터 N일 전까지 신청 가능
      const requestDeadlineDays = leaveRule.requestDeadlineDays || 0;
      const minAllowedDate = new Date(today);
      minAllowedDate.setDate(today.getDate() + requestDeadlineDays);

      // 2. 사후 신청 규칙
      const allowRetrospective = leaveRule.allowRetrospectiveRequest || false;
      const retrospectiveDays = leaveRule.retrospectiveRequestDays || 0;

      if (allowRetrospective && retrospectiveDays > 0) {
        // 사후 신청 허용: 오늘부터 과거 N일까지 신청 가능
        const maxPastDate = new Date(today);
        maxPastDate.setDate(today.getDate() - retrospectiveDays);

        // 과거: maxPastDate ~ today-1, 미래: minAllowedDate ~
        if (targetDate < maxPastDate) return true; // 너무 과거
        if (targetDate > today && targetDate < minAllowedDate) return true; // 마감일 이전
        return false;
      } else {
        // 사후 신청 불허: minAllowedDate 이후만 가능
        return targetDate < minAllowedDate;
      }
    };

    // 신청 마감일 안내 텍스트
    const deadlineHelpText = computed(() => {
      if (!selectedPolicy.value) return null;

      const leaveRule = selectedPolicy.value.ruleDetails?.leaveRule;
      if (!leaveRule) return null;

      const requestDeadlineDays = leaveRule.requestDeadlineDays || 0;
      const allowRetrospective = leaveRule.allowRetrospectiveRequest || false;
      const retrospectiveDays = leaveRule.retrospectiveRequestDays || 0;

      if (requestDeadlineDays === 0 && !allowRetrospective) {
        return '* 당일 신청 가능';
      }

      let text = '';
      if (requestDeadlineDays > 0) {
        text += `* 휴가 시작일 ${requestDeadlineDays}일 전까지 신청`;
      } else {
        text += '* 당일 신청 가능';
      }

      if (allowRetrospective && retrospectiveDays > 0) {
        text += `, 사후 신청 ${retrospectiveDays}일 이내 가능`;
      }

      return text;
    });

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

    // 추가근무 경고 (방식 A: 기간 + 1일 연장시간)
    const extraWorkWarning = computed(() => {
      if (requestType.value !== 'extraWork') return null;
      if (!form.value.dateRange?.length || !form.value.dailyOvertimeHours) return null;

      // 선택한 기간의 날짜 수 계산
      const startDate = new Date(form.value.dateRange[0]);
      const endDate = new Date(form.value.dateRange[1]);
      const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // 1일 연장시간 파싱 (HH:mm)
      const [hours, minutes] = form.value.dailyOvertimeHours.split(':').map(Number);
      const dailyMinutes = hours * 60 + minutes;
      const totalMinutes = dayCount * dailyMinutes;

      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;

      if (totalMinutes > 720) {
        return {
          type: 'error',
          title: '⚠️ 주간 한도 초과',
          message: `총 ${h}h ${m}m (${dayCount}일 × ${hours}h ${minutes}m) / 주간 최대 12h (근로기준법 제53조 위반)`
        };
      } else if (totalMinutes > 600) {
        return {
          type: 'warning',
          title: '주간 한도 임박',
          message: `총 ${h}h ${m}m (${dayCount}일 × ${hours}h ${minutes}m) / 주간 최대 12h`
        };
      } else if (totalMinutes > 0) {
        return {
          type: 'info',
          title: '추가근무 신청 정보',
          message: `총 ${h}h ${m}m (${dayCount}일 × ${hours}h ${minutes}m) - 휴일/야간 여부는 자동 분류됩니다.`
        };
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

    // 주말/공휴일 제외한 실제 근무일 계산
    const calculateWorkingDays = (startDate, endDate) => {
      let workingDays = 0;
      const current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
        if (!isWeekend(current) && !isHoliday(current)) {
          workingDays++;
        }
        current.setDate(current.getDate() + 1);
      }

      return workingDays;
    };

    // 잔액 부족 경고
    const balanceShortageWarning = computed(() => {
      if (!selectedPolicy.value || !form.value.policyId) return null;
      if (requestType.value !== 'leave' && requestType.value !== 'childcare') return null;

      // 선택된 정책의 잔액 정보 찾기
      const balance = allBalances.value.find(b =>
        b.balanceTypeCode?.codeValue === selectedPolicy.value.typeCode
      );

      if (!balance) return null;

      const remaining = balance.remaining || 0;

      // 예상 차감 일수 계산
      let estimatedDays = 0;

      if (form.value.requestUnit === 'TIME_OFF' && form.value.dateTimeRange?.length === 2) {
        // 시간 단위: 시간을 일수로 환산 (8시간 = 1일)
        const start = new Date(form.value.dateTimeRange[0]);
        const end = new Date(form.value.dateTimeRange[1]);
        const hours = (end - start) / (1000 * 60 * 60);
        estimatedDays = hours / 8;
      } else if (form.value.requestUnit === 'HALF_DAY_AM' || form.value.requestUnit === 'HALF_DAY_PM') {
        // 반차: 주말 제외한 일수 × 0.5
        if (form.value.dateRange?.length === 2) {
          const start = new Date(form.value.dateRange[0]);
          const end = new Date(form.value.dateRange[1]);
          const workingDays = calculateWorkingDays(start, end);
          estimatedDays = workingDays * 0.5;
        }
      } else if (form.value.requestUnit === 'DAY' && form.value.dateRange?.length === 2) {
        // 종일: 주말 제외한 실제 근무일 계산
        const start = new Date(form.value.dateRange[0]);
        const end = new Date(form.value.dateRange[1]);
        estimatedDays = calculateWorkingDays(start, end);
      }

      // 예상 차감이 없으면 경고 없음
      if (estimatedDays === 0) return null;

      // 잔액 부족 체크
      if (estimatedDays > remaining) {
        return {
          type: 'error',
          title: '❌ 잔액 부족',
          message: `예상 차감: ${estimatedDays.toFixed(1)}일 / 잔여: ${remaining.toFixed(1)}일 (부족: ${(estimatedDays - remaining).toFixed(1)}일)`
        };
      } else if (estimatedDays === remaining) {
        return {
          type: 'warning',
          title: '⚠️ 잔액 전부 사용',
          message: `예상 차감: ${estimatedDays.toFixed(1)}일 / 잔여: ${remaining.toFixed(1)}일 (신청 후 잔액: 0일)`
        };
      } else if (remaining - estimatedDays < 1) {
        return {
          type: 'warning',
          title: '잔액 거의 소진',
          message: `예상 차감: ${estimatedDays.toFixed(1)}일 / 잔여: ${remaining.toFixed(1)}일 (신청 후 잔액: ${(remaining - estimatedDays).toFixed(1)}일)`
        };
      } else {
        return {
          type: 'info',
          title: '잔액 확인',
          message: `예상 차감: ${estimatedDays.toFixed(1)}일 / 잔여: ${remaining.toFixed(1)}일 (신청 후 잔액: ${(remaining - estimatedDays).toFixed(1)}일)`
        };
      }
    });

    watch(requestType, (newType) => {
      if (newType === 'trip' || newType === 'childcare') {
        form.value.requestUnit = 'DAY';
      } else if (newType === 'overtime' || newType === 'night' || newType === 'holiday') {
        form.value.requestUnit = 'TIME_OFF';
      } else if (newType === 'extraWork') {
        form.value.requestUnit = 'DAY'; // 추가근무는 날짜 기준
      }
    });

    // 정책 선택 시 신청 단위 자동 조정
    watch(() => form.value.policyId, (newPolicyId) => {
      if (newPolicyId && selectedPolicy.value) {
        // 연차가 아닌 경우 무조건 종일(DAY)로 설정
        if (selectedPolicy.value.typeCode !== 'PTC001') {
          form.value.requestUnit = 'DAY';
        } else {
          // 연차인 경우, 현재 선택된 신청 단위가 허용되지 않으면 첫 번째 허용된 단위로 변경
          if (selectedPolicy.value.allowedRequestUnits && !isRequestUnitAllowed(form.value.requestUnit)) {
            form.value.requestUnit = selectedPolicy.value.allowedRequestUnits[0] || 'DAY';
          }
        }
      }
    });

    // 날짜 범위 검증 (시작일 > 종료일 체크)
    watch(() => form.value.dateRange, (newRange) => {
      if (newRange && newRange.length === 2 && newRange[0] && newRange[1]) {
        if (new Date(newRange[0]) > new Date(newRange[1])) {
          error('시작일은 종료일보다 이후일 수 없습니다.');
          form.value.dateRange = [];
        }
      }
    });

    // 시간 범위 검증 (시작 시각 > 종료 시각 체크 및 같은 날짜 검증)
    watch(() => form.value.dateTimeRange, (newRange) => {
      if (newRange && newRange.length === 2 && newRange[0] && newRange[1]) {
        const startDateTime = new Date(newRange[0]);
        const endDateTime = new Date(newRange[1]);

        if (startDateTime >= endDateTime) {
          error('시작 시각은 종료 시각보다 이전이어야 합니다.');
          form.value.dateTimeRange = [];
          return;
        }

        // 시간 단위 휴가는 같은 날짜 내에서만 가능
        if (requestType.value === 'leave' && form.value.requestUnit === 'TIME_OFF') {
          if (startDateTime.toDateString() !== endDateTime.toDateString()) {
            error('시간 단위 휴가는 같은 날짜 내에서만 신청 가능합니다.');
            form.value.dateTimeRange = [];
          }
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

    // 공휴일 조회 (특정 년도)
    const fetchHolidays = async (year) => {
      try {
        const targetYear = year || new Date().getFullYear();
        const startDate = new Date(targetYear, 0, 1); // 해당 년도 1월 1일
        const endDate = new Date(targetYear, 11, 31); // 해당 년도 12월 31일

        const params = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };

        const response = await getHolidays(params);

        // 기존 공휴일 데이터와 병합 (중복 제거)
        const newHolidays = response || [];
        const existingDates = new Set(holidays.value.map(h => {
          if (Array.isArray(h.date)) {
            return `${h.date[0]}-${String(h.date[1]).padStart(2, '0')}-${String(h.date[2]).padStart(2, '0')}`;
          }
          return h.date;
        }));

        newHolidays.forEach(holiday => {
          let dateStr;
          if (Array.isArray(holiday.date)) {
            dateStr = `${holiday.date[0]}-${String(holiday.date[1]).padStart(2, '0')}-${String(holiday.date[2]).padStart(2, '0')}`;
          } else {
            dateStr = holiday.date;
          }

          if (!existingDates.has(dateStr)) {
            holidays.value.push(holiday);
          }
        });

        console.log(`${targetYear}년 공휴일 데이터 로드 완료:`, newHolidays.length, '개');
      } catch (err) {
        console.error('공휴일 조회 실패:', err);
        // 공휴일 조회 실패해도 계속 진행
      }
    };

    // calendarDate의 년도가 바뀌면 해당 년도 공휴일 로드
    watch(calendarDate, (newDate, oldDate) => {
      const newYear = newDate.getFullYear();
      const oldYear = oldDate ? oldDate.getFullYear() : null;

      if (newYear !== oldYear) {
        // 해당 년도 공휴일이 아직 로드되지 않았으면 로드
        const hasYearData = holidays.value.some(h => {
          if (Array.isArray(h.date)) {
            return h.date[0] === newYear;
          }
          return h.date && h.date.startsWith(String(newYear));
        });

        if (!hasYearData) {
          fetchHolidays(newYear);
        }
      }
    });

    onMounted(() => {
      fetchInitialData();
      fetchMyRequests();
      fetchHolidays();

      // query parameter로 정책 타입이 전달된 경우 자동 선택
      const policyTypeCode = route.query.policyType;
      if (policyTypeCode) {
        // PolicyTypeCode codeValue에 따라 requestType 결정
        const policyTypeMapping = {
          // 휴가 유형
          'PTC001': 'leave',    // ANNUAL_LEAVE
          // 휴직 유형
          'PTC004': 'childcare', // CHILDCARE_LEAVE
          'PTC002': 'childcare', // MATERNITY_LEAVE
          'PTC003': 'childcare', // PATERNITY_LEAVE
          'PTC005': 'childcare', // FAMILY_CARE_LEAVE
          'PTC006': 'childcare', // MENSTRUAL_LEAVE
          // 출장
          'PTC102': 'trip',      // BUSINESS_TRIP
          // 추가근무
          'PTC103': 'extraWork', // OVERTIME
          'PTC104': 'extraWork', // NIGHT_WORK
          'PTC105': 'extraWork'  // HOLIDAY_WORK
        };

        const targetRequestType = policyTypeMapping[policyTypeCode];
        if (targetRequestType) {
          requestType.value = targetRequestType;

          // 정책 데이터 로드 후 해당 정책 자동 선택
          setTimeout(() => {
            const targetPolicy = allPolicies.value.find(p =>
              p.policyTypeCode === policyTypeCode
            );
            if (targetPolicy) {
              form.value.policyId = targetPolicy.policyId;
            }
          }, 500);
        }
      }
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
            // 추가근무 신청 (방식 A: 기간 + 1일 연장시간)
            else if (requestType.value === 'extraWork') {
              const payload = {
                startAt: form.value.dateRange[0],
                endAt: form.value.dateRange[1],
                dailyOvertimeHours: form.value.dailyOvertimeHours, // "HH:mm" 형식
                reason: form.value.reason,
                requesterComment: form.value.requesterComment || null,
              };
              response = await createLeaveRequest(payload);
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

            fetchMyRequests();

            // 자동 승인 여부 확인 (status가 APPROVED면 자동 승인)
            const isAutoApproved = response.status === 'APPROVED';

            if (isAutoApproved) {
              // 자동 승인: 완료 메시지만 표시하고 결재 화면으로 이동하지 않음
              success('신청이 자동 승인되었습니다. 근태 현황에 즉시 반영됩니다.');
            } else {
              // 수동 승인: 결재 화면으로 이동
              success('신청이 성공적으로 제출되었습니다.');

              if (response.documentId) {
                router.push({
                  path: `/approval/form/${response.documentId}`,
                  query: {
                    requestId: response.requestId
                  }
                });
              }
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
      form.value.dailyOvertimeHours = null;
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
    const getExtraWorkTypeName = (typeCode) => ({ 'PTC103': '연장근무', 'PTC104': '야간근무', 'PTC105': '휴일근무' }[typeCode] || '추가근무');
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
      extraWorkPolicies,
      workLocations,
      allowedWorkLocations,
      submitForm,
      resetForm,
      getExtraWorkTypeName,
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
      formatMinimumUnit,
      weeklyOvertimeWarning,
      extraWorkWarning,
      splitUsageWarning,
      balanceShortageWarning,
      childcarePolicies,
      getDisabledDate,
      getCellClassName,
      getCalendarCellClass,
      calendarDate,
      dateRangePopoverVisible,
      tempDateRange,
      formatDateRange,
      formatCalendarMonth,
      previousMonth,
      nextMonth,
      isDateInRange,
      isRangeStart,
      isRangeEnd,
      isDateDisabled,
      handleDateClick,
      clearDateRange,
      confirmDateRange,
      deadlineHelpText,
      Calendar,
      ArrowLeft,
      ArrowRight,
    };
  },
};
</script>

<style scoped>
.leave-request-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
}
.content-row {
  width: 100%;
  display: flex;
  align-items: stretch;
}
.card-col {
  display: flex;
  flex-direction: column;
}
.full-height-card {
  display: flex;
  flex-direction: column;
  height: 700px;
}
.full-height-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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
.form-help {
  color: #409EFF;
  font-style: italic;
}

/* Element Plus DatePicker 주말 스타일 */
:deep(.el-date-table td.weekend) {
  color: #f56c6c !important;
}

:deep(.el-date-table td.weekend .el-date-table-cell__text) {
  color: #f56c6c !important;
}

/* 캘린더 주말 스타일 (숫자만 빨간색) */
:deep(.weekend-cell) {
  color: #f56c6c !important;
}

:deep(.weekend-cell .el-date-table-cell__text) {
  color: #f56c6c !important;
}

/* 캘린더 공휴일 스타일 */
:deep(.holiday-cell) {
  color: #f56c6c !important;
}

:deep(.holiday-cell .el-date-table-cell__text) {
  color: #f56c6c !important;
}

:deep(.holiday-cell.in-range),
:deep(.holiday-cell.start-date),
:deep(.holiday-cell.end-date) {
  background-color: #f56c6c !important;
  color: #fff !important;
}

/* 날짜 범위 캘린더 팝업 */
.date-range-calendar-popup {
  padding: 8px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 4px;
}

.current-month {
  font-size: 14px;
  font-weight: bold;
}

:deep(.el-calendar__body) {
  padding: 0;
}

:deep(.el-calendar-table) {
  table-layout: fixed;
}

:deep(.el-calendar-table thead th) {
  padding: 4px 0;
  font-size: 11px;
}

:deep(.el-calendar-table .el-calendar-day) {
  height: 32px;
  padding: 0;
}

:deep(.el-calendar__header) {
  display: none;
}

/* 캘린더 셀 스타일 */
.calendar-day-cell {
  padding: 4px;
  text-align: center;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day-cell:hover {
  background-color: #f5f7fa;
}

.calendar-day-cell.weekend {
  color: #f56c6c;
}

.calendar-day-cell.holiday {
  background-color: #fef0f0;
  color: #f56c6c;
  font-weight: bold;
}

/* 비활성화된 날짜 */
.calendar-day-cell.disabled {
  color: #c0c4cc !important;
  background-color: #f5f7fa !important;
  cursor: not-allowed !important;
  text-decoration: line-through;
}

.calendar-day-cell.disabled:hover {
  background-color: #f5f7fa !important;
}

/* 선택된 범위 스타일 */
.calendar-day-cell.in-range {
  background-color: #ecf5ff !important;
  color: #409eff !important;
}

.calendar-day-cell.range-start,
.calendar-day-cell.range-end {
  background-color: #409eff !important;
  color: white !important;
  font-weight: bold;
}

/* 캘린더 범례 */
.calendar-legend {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e4e7ed;
  font-size: 11px;
  align-items: center;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.weekend {
  background-color: transparent;
  border: 2px solid #f56c6c;
}

.legend-dot.holiday {
  background-color: #f56c6c;
}

/* 캘린더 액션 버튼 */
.calendar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e4e7ed;
}
</style>
