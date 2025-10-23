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
      return response.data.data;
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

// --- 정책 할당 (Policy Assignment) ---

export const getPolicyAssignments = () => workforceClient.get('/policy-assignments');
export const createAssignment = (data) => workforceClient.post('/policy-assignments', data);
export const deleteAssignment = (assignmentId) => workforceClient.delete(`/policy-assignments/${assignmentId}`);
export const deleteAssignments = (assignmentIds) => workforceClient.delete('/policy-assignments', { data: { assignmentIds } });
export const revokeAssignments = (assignmentIds) => workforceClient.patch('/policy-assignments/revoke', { assignmentIds });
export const reactivateAssignments = (assignmentIds) => workforceClient.patch('/policy-assignments/reactivate', { assignmentIds });
