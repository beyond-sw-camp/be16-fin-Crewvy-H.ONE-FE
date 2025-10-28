import apiClient from './http';

// 내 알림 설정 조회
export const getNotificationSettings = () => {
  return apiClient.get('/workspace-service/notification/find-my-setting');
};

// 알림 설정 수정 (PATCH 요청으로 변경, List<NotificationSettingReqDto>를 RequestBody로 받음)
export const updateNotificationSetting = (payload) => {
  return apiClient.patch('/workspace-service/notification/update-setting', payload);
};

