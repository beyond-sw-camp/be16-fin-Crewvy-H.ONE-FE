import api from './http'

const VC_BASE = '/workspace-service/video-conferences'

// 화상회의 API 서비스
export const createVideoConference = async ({
  immediate = false,
  name,
  description,
  inviteeIdList = [],
  isRecording = false,
  scheduledStartTime
}) => {
  const params = { immediate }
  const body = {
    name,
    description,
    inviteeIdList,
    isRecording,
    scheduledStartTime
  }
  const { data } = await api.post(`${VC_BASE}`, body, { params })
  return data.data
}

export const joinVideoConference = async (videoConferenceId) => {
  const { data } = await api.post(`${VC_BASE}/${videoConferenceId}/join`)
  return data.data
}

export const startVideoConference = async (videoConferenceId) => {
  const { data } = await api.post(`${VC_BASE}/${videoConferenceId}/start`)
  return data.data
}

export const getMyVideoConferences = async (status) => {
  const { data } = await api.get(`${VC_BASE}`, { params: { status } })
  return data.data
}

export const updateVideoConference = async (videoConferenceId, update) => {
  const { data } = await api.put(`${VC_BASE}/${videoConferenceId}`, update)
  return data.data
}

export const deleteVideoConference = async (videoConferenceId) => {
  await api.delete(`${VC_BASE}/${videoConferenceId}`)
}

export const sendChatMessage = async (videoConferenceId, message) => {
  await api.post(`${VC_BASE}/${videoConferenceId}/messages`, message)
}

export const getChatMessages = async (videoConferenceId) => {
  const { data } = await api.get(`${VC_BASE}/${videoConferenceId}/messages`)
  return data.data.content
}

export const getVideoConferenceMinutes = async (videoConferenceId) => {
  const { data } = await api.get(`${VC_BASE}/${videoConferenceId}/minutes`);
  return data;
};

