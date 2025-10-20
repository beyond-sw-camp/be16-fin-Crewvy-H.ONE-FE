import apiClient from './index';

/**
 * 근태 이벤트 기록 (출근, 퇴근 등)
 * @param {object} params - { memberId, companyId }
 * @param {object} data - EventRequest DTO
 * @returns {Promise<object>}
 */
export const recordEvent = (params, data) => {
  return apiClient.post('/attendance/events', data, { params });
};

/**
 * 새 근태 정책 생성
 * @param {object} params - { companyId }
 * @param {object} data - PolicyCreateRequest DTO
 * @returns {Promise<object>}
 */
export const createPolicy = (params, data) => {
  return apiClient.post('/policies', data, { params });
};

/**
 * 특정 회사의 모든 정책 목록 조회
 * @param {object} params - { companyId, page, size, sort }
 * @returns {Promise<object>} - 정책 목록 페이지 데이터
 */
export const getPolicies = (params) => {
  return apiClient.get('/policies', { params });
};

/**
 * ID로 특정 정책 상세 정보 조회
 * @param {string} policyId - 정책 ID
 * @returns {Promise<object>} - 정책 상세 데이터
 */
export const getPolicyById = (policyId) => {
  return apiClient.get(`/policies/${policyId}`);
};

/**
 * 기존 정책 수정
 * @param {string} policyId - 수정할 정책 ID
 * @param {object} data - 수정할 정책 데이터
 * @returns {Promise<object>} - 수정된 정책 정보
 */
export const updatePolicy = (policyId, data) => {
  return apiClient.put(`/policies/${policyId}`, data);
};

/**
 * 정책 삭제
 * @param {string} policyId - 삭제할 정책 ID
 * @returns {Promise<void>}
 */
export const deletePolicy = (policyId) => {
  return apiClient.delete(`/policies/${policyId}`);
};

/**
 * 정책 활성화
 * @param {string} policyId - 활성화할 정책 ID
 * @returns {Promise<object>} - 활성화된 정책 정보
 */
export const activatePolicy = (policyId) => {
  return apiClient.patch(`/policies/${policyId}/activate`);
};

/**
 * 특정 회사의 모든 정책 유형 목록 조회
 * @param {object} params - { companyId }
 * @returns {Promise<Array>} - 정책 유형 목록 데이터
 */
export const getPolicyTypes = (params) => {
  return apiClient.get('/policies/types', { params });
};