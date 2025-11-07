import axios from 'axios';
import store from '@/store';

// workforce-service 전용 API 클라이언트 생성
const workforceClient = axios.create({
  baseURL: `${process.env.VUE_APP_API_BASE_URL}/workforce-service`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios 요청 인터셉터: 모든 요청에 헤더 추가
workforceClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    const companyId = store.getters.companyId || localStorage.getItem('companyId');
    if (companyId) {
      config.headers['X-User-CompanyId'] = companyId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios 응답 인터셉터: 공통 응답 구조 처리
workforceClient.interceptors.response.use(
  (response) => {
    // success가 true이면 data를 반환, 아니면 Promise.reject
    if (response.data && response.data.success) {
      return response.data.data ?? response.data;
    }
    // 백엔드에서 success: false로 응답한 경우
    return Promise.reject(new Error(response.data.message || 'API 요청에 실패했습니다.'));
  },
  (error) => {
    // HTTP 상태 코드가 2xx가 아닌 경우
    const message = error.response?.data?.message || error.message || '네트워크 오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  }
);


// --- 정책 (Policy) ---

export const getPolicies = (params) => workforceClient.get('/policies', { params });
export const getPolicyById = (policyId) => workforceClient.get(`/policies/${policyId}`);
export const createPolicy = (data) => workforceClient.post('/policies', data);
export const updatePolicy = (policyId, data) => workforceClient.put(`/policies/${policyId}`, data);
export const deletePolicy = (policyId) => workforceClient.delete(`/policies/${policyId}`);
export const activatePolicies = (policyIds) => workforceClient.patch('/policies/activate', { policyIds });
export const deactivatePolicies = (policyIds) => workforceClient.patch('/policies/deactivate', { policyIds });
export const getPolicyTypes = () => workforceClient.get('/policies/types');
export const getMyEffectivePolicy = () => workforceClient.get('/policies/my-effective-policy');
export const getApplicablePolicies = () => workforceClient.get('/policies/applicable-to-me');

// --- 정책 할당 (Policy Assignment) ---

export const getPolicyAssignments = (params) => workforceClient.get('/policy-assignments', { params });
export const createAssignment = (data) => workforceClient.post('/policy-assignments', data);
export const deleteAssignment = (assignmentId) => workforceClient.delete(`/policy-assignments/${assignmentId}`);
export const deleteAssignments = (assignmentIds) => workforceClient.delete('/policy-assignments', { data: { assignmentIds } });
export const revokeAssignments = (assignmentIds) => workforceClient.patch('/policy-assignments/revoke', { assignmentIds });
export const reactivateAssignments = (assignmentIds) => workforceClient.patch('/policy-assignments/reactivate', { assignmentIds });

// --- 휴가/근태 신청 (Request) ---

export const createLeaveRequest = (data) => workforceClient.post('/requests/leave', data);
export const createTripRequest = (data) => workforceClient.post('/requests/trip', data);
export const getMyRequests = (params) => workforceClient.get('/requests/my', { params });
export const getMyLeaveRequests = (params) => workforceClient.get('/requests/my-leaves', { params });
export const getRequestById = (requestId) => workforceClient.get(`/requests/${requestId}`);
export const cancelRequest = (requestId) => workforceClient.delete(`/requests/${requestId}/cancel`);

// 문서 목록 조회 API 추가 (결재 문서 연동용)
export const getDocumentList = () => workforceClient.get('/approval/get-document-list');

// --- 근무지 관리 (Work Location) ---

export const getWorkLocations = (params) => workforceClient.get('/work-locations', { params });
export const getActiveWorkLocations = () => workforceClient.get('/work-locations/active');
export const getWorkLocationById = (workLocationId) => workforceClient.get(`/work-locations/${workLocationId}`);
export const createWorkLocation = (data) => workforceClient.post('/work-locations', data);
export const updateWorkLocation = (workLocationId, data) => workforceClient.put(`/work-locations/${workLocationId}`, data);
export const toggleWorkLocationActive = (workLocationId) => workforceClient.patch(`/work-locations/${workLocationId}/toggle-active`);
export const deleteWorkLocation = (workLocationId) => workforceClient.delete(`/work-locations/${workLocationId}`);

// ... (기존 함수들) ...

// --- 내 근태 현황 조회 ---

/**
 * 월별 내 출퇴근 현황 조회
 * @param {object} params - { year, month }
 * @returns {Promise<Array<object>>}
 */
export const getMyMonthlyAttendance = (params) => workforceClient.get('/attendance/my/monthly', { params });

/**
 * 내 휴가 신청 목록 조회 (페이징)
 * @param {object} params - { page, size, sort? }
 * @returns {Promise<object>} // Page 객체 반환
 */
// getMyRequests는 이미 휴가/근태 신청 섹션에 정의되어 있으므로 중복 제거

export const recordAttendanceEvent = (data) => workforceClient.post('/attendance/events', data);
export const getMyTodayAttendance = () => workforceClient.get('/attendance/my/today');
export const getMyBalance = () => workforceClient.get('/attendance/my/balance');

/**
 * 내 모든 휴가 정책 잔액 조회 (연차, 병가, 육아휴직 등)
 * @returns {Promise<Array<object>>}
 */
export const getMyAllBalances = () => workforceClient.get('/attendance/my/balances');

/**
 * 내게 할당된 모든 정책 조회 (휴가 신청 시 사용)
 * @returns {Promise<Array<object>>}
 */
export const getMyAssignedPolicies = () => workforceClient.get('/attendance/my/assigned-policies');

/**
 * 팀원 근태 현황 조회
 * @param {object} params - { startDate?: 'yyyy-MM-dd', endDate?: 'yyyy-MM-dd' } (날짜 미지정 시 오늘 날짜)
 * @returns {Promise<Array<object>>}
 */
export const getTeamAttendanceStatus = (params) => workforceClient.get('/attendance/team/status', { params });

/**
 * 연차 현황 조회 (권한에 따라 조회 범위 자동 결정)
 * - COMPANY 권한: 전사 직원 연차 현황
 * - TEAM 권한: 본인 조직 및 하위 조직 직원 연차 현황
 * @param {object} params - { year?: number }
 * @returns {Promise<Array<object>>}
 */
export const getLeaveBalanceStatus = (params) => workforceClient.get('/attendance/leave-balance/status', { params });

// --- 급여 정산용 조회 (Admin/COMPANY Level) ---

/**
 * 기간별 전체 직원 일일 근태 조회 (COMPANY 레벨 권한 필요)
 * @param {object} params - { startDate: 'yyyy-MM-dd', endDate: 'yyyy-MM-dd' }
 * @returns {Promise<Array<object>>}
 */
export const getDailyAttendanceSummary = (params) => workforceClient.get('/attendance/summary/daily', { params });

/**
 * 연도별 전체 직원 잔여 일수 조회 (COMPANY 레벨 권한 필요)
 * @param {object} params - { year: number }
 * @returns {Promise<Array<object>>}
 */
export const getMemberBalanceSummary = (params) => workforceClient.get('/attendance/summary/balance', { params });

// --- 디바이스 관리 (Device Management) ---

export const registerDevice = (data) => workforceClient.post('/requests/devices/register', data);
export const getMyDevices = (params) => workforceClient.get('/requests/devices/my', { params });
export const getPendingDevices = (params) => workforceClient.get('/requests/devices/pending', { params });
export const approveDevice = (requestId) => workforceClient.post(`/requests/devices/${requestId}/approve`);
export const rejectDevice = (requestId) => workforceClient.post(`/requests/devices/${requestId}/reject`);

export const runAnnualLeaveAccrualBatch = () => workforceClient.post('/batch/attendance/annual-leave-accrual');

/**
 * 근태 기록 수정 (관리자 전용)
 * @param {string} dailyAttendanceId - 수정할 근태 기록 ID
 * @param {object} data - UpdateDailyAttendanceReq
 * @returns {Promise<void>}
 */
export const updateDailyAttendance = (dailyAttendanceId, data) =>
  workforceClient.put(`/attendance/daily/${dailyAttendanceId}`, data);
