import apiClient from './index';

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

export default {
  getEmployeeForEdit,
  getEmployeeDetails,
  updateEmployee,
  deleteEmployee,
  restoreEmployee,
};
