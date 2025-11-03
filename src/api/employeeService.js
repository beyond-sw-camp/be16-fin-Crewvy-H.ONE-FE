import apiClient from './index';


// 모든 직원 정보 조회
const getAllEmployees = () => {
  return apiClient.get('/member-service/member/list');
};

// 직원 검색
const searchEmployees = (query) => {
  return apiClient.get(`/search-service/search/employees?query=${query}`);
};

// 직원 ID로 상세 정보 조회 (수정 페이지용)
const getEmployeeForEdit = (employeeId) => {
  return apiClient.get(`/member-service/member/${employeeId}/editpage`);
};

// 직원 ID로 상세 정보 조회 (상세 페이지용)
const getEmployeeDetails = (employeeId) => {
  return apiClient.get(`/member-service/member/detail/${employeeId}`);
};

// 직원 정보 업데이트
const updateEmployee = (memberId, memberPositionId, employeeData) => {
  return apiClient.put(`/member-service/member/${memberId}/update`, employeeData, {
    headers: {
      'X-User-MemberPositionId': memberPositionId
    }
  });
};

// 직원 삭제
const deleteEmployee = (employeeId) => {
  return apiClient.delete(`/member-service/member/${employeeId}/delete`);
};

// 직원 복원
const restoreEmployee = (employeeId) => {
  return apiClient.patch(`/member-service/member/${employeeId}/restore`);
};

const searchEmployeesByOrganizationId = (organizationId) => {
  return apiClient.get(`/search-service/search/employees/organization?organizationId=${organizationId}`);
};

const hardDeleteMemberPosition = (memberPositionId) => {
  return apiClient.delete(`/member-service/member/position/${memberPositionId}/delete`);
};

const resetPassword = (email) => {
  return apiClient.get(`/member-service/member/reset-password?email=${email}`);
};

const generateRandomPassword = () => {
  return apiClient.get(`/member-service/member/generate-password`);
};

export default {
  getAllEmployees,
  searchEmployees,
  getEmployeeForEdit,
  getEmployeeDetails,
  updateEmployee,
  deleteEmployee,
  restoreEmployee,
  searchEmployeesByOrganizationId,
  hardDeleteMemberPosition,
  resetPassword,
  generateRandomPassword,
};
