import apiClient from './index';

// 직원 ID로 상세 정보 조회 (수정 페이지용)
const getEmployee = (employeeId) => {
  return apiClient.get(`/member-service/member/${employeeId}/editpage`);
};

// 직원 정보 업데이트
const updateEmployee = (memberId, memberPositionId, employeeData) => {
  return apiClient.put(`/member-service/member/${memberId}/update`, employeeData, {
    headers: {
      'X-User-MemberPositionId': memberPositionId
    }
  });
};

export default {
  getEmployee,
  updateEmployee,
};
