import store from '@/store'; // Vuex 스토어 임포트
import axios from 'axios';

// workforce-service 전용 API 클라이언트 생성
const workforceClient = axios.create({
  baseURL: `${process.env.VUE_APP_API_BASE_URL}/workforce-service`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터 설정 - 토큰 추가
workforceClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 인터셉터에서 모든 요청에 X-User-CompanyId 헤더 자동 추가 (동적으로)
workforceClient.interceptors.request.use(
  (config) => {
    const companyId = store.getters.companyId || localStorage.getItem('companyId');
    if (companyId) {
      config.headers['X-User-CompanyId'] = companyId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 근태 이벤트 기록 (출근, 퇴근 등)
 * @param {object} params - { memberId, companyId }
 * @param {object} data - EventRequest DTO
 * @returns {Promise<object>}
 */
export const recordEvent = (params, data) => {
  return workforceClient.post('/attendance/events', data, { params }).then(res => res.data.data);
};

/**
 * 새 근태 정책 생성
 * @param {object} policyData - PolicyCreateRequest DTO (companyId 포함)
 * @returns {Promise<object>}
 */
export const createPolicy = (policyData) => {
  return workforceClient.post('/policies', policyData).then(res => res.data.data);
};

/**
 * 특정 회사의 모든 정책 목록 조회
 * @param {object} params - { page, size, sort }
 * @returns {Promise<object>} - 정책 목록 페이지 데이터
 */
export const getPolicies = (params) => {
  return workforceClient.get('/policies', { params }).then(res => res.data.data);
};

/**
 * ID로 특정 정책 상세 정보 조회
 * @param {string} policyId - 정책 ID
 * @returns {Promise<object>} - 정책 상세 데이터
 */
export const getPolicyById = (policyId) => {
  return workforceClient.get(`/policies/${policyId}`).then(res => res.data.data);
};

/**
 * 기존 정책 수정
 * @param {string} policyId - 수정할 정책 ID
 * @param {object} data - 수정할 정책 데이터
 * @returns {Promise<object>} - 수정된 정책 정보
 */
export const updatePolicy = (policyId, data) => {
  return workforceClient.put(`/policies/${policyId}`, data).then(res => res.data.data);
};

/**
 * 정책 삭제
 * @param {string} policyId - 삭제할 정책 ID
 * @returns {Promise<void>}
 */
export const deletePolicy = (policyId) => {
  return workforceClient.delete(`/policies/${policyId}`).then(res => res.data.data);
};

/**
 * 정책 활성화
 * @param {Array<string>} policyIds - 활성화할 정책 ID 목록
 * @returns {Promise<object>}
 */
export const activatePolicies = (policyIds) => {
  return workforceClient.patch('/policies/activate', { policyIds }).then(res => res.data.data);
};

/**
 * 정책 비활성화
 * @param {Array<string>} policyIds - 비활성화할 정책 ID 목록
 * @returns {Promise<object>}
 */
export const deactivatePolicies = (policyIds) => {
  return workforceClient.patch('/policies/deactivate', { policyIds }).then(res => res.data.data);
};

/**
 * 특정 회사의 모든 정책 유형 목록 조회
 * @returns {Promise<Array>} - 정책 유형 목록 데이터
 */
export const getPolicyTypes = () => {
  return workforceClient.get('/policies/types').then(res => res.data.data);
};

// ==================== 정책 할당 API ====================

/**
 * 새 정책 할당 생성
 * @param {object} assignmentData - { policyId, targetId, scopeType }
 * @returns {Promise<object>}
 */
export const createAssignment = (assignmentData) => {
  return workforceClient.post('/policy-assignments', assignmentData).then(res => res.data.data);
};

/**
 * 회사의 전체 정책 할당 목록 조회
 * @returns {Promise<Array>} - 정책 할당 목록
 */
export const getPolicyAssignments = () => {
  return workforceClient.get('/policy-assignments').then(res => res.data.data);
};

/**
 * 정책 할당 삭제 (영구)
 * @param {string} assignmentId - 할당 ID
 * @returns {Promise<void>}
 */
export const deleteAssignment = (assignmentId) => {
  return workforceClient.delete(`/policy-assignments/${assignmentId}`).then(res => res.data.data);
};

/**
 * 정책 할당 해지 (비활성화)
 * @param {Array<string>} assignmentIds - 해지할 할당 ID 목록
 * @returns {Promise<void>}
 */
export const revokeAssignments = (assignmentIds) => {
  return workforceClient.patch('/policy-assignments/revoke', { assignmentIds }).then(res => res.data.data);
};

/**
 * 정책 할당 일괄 삭제 (영구)
 * @param {Array<string>} assignmentIds - 삭제할 할당 ID 목록
 * @returns {Promise<void>}
 */
export const deleteAssignments = (assignmentIds) => {
  return workforceClient.delete('/policy-assignments', { data: { assignmentIds } }).then(res => res.data.data);
};

/**
 * 특정 대상의 정책 할당 목록 조회
 * @param {object} params - { targetId, scopeType }
 * @returns {Promise<Array>} - 정책 할당 목록
 */
export const findAssignmentsByTarget = (params) => {
  return workforceClient.get('/policy-assignments/search', { params }).then(res => res.data.data);
};

/**
 * 현재 나의 유효 정책 조회
 * @returns {Promise<object>} - 유효 정책 상세 데이터
 */
export const getMyEffectivePolicy = () => {
  return workforceClient.get('/policies/my-effective-policy').then(res => res.data.data);
};