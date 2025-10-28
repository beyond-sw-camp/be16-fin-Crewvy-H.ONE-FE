import apiClient from './index';
import { getAuthHeadersFromToken } from '../utils/authUtils';

export default {
  async getTitle() {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.get('/member-service/member/title', { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching title:", error);
      throw error;
    }
  },

  async createTitle(titleData) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.post('/member-service/member/create-title', titleData, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error creating title:", error);
      throw error;
    }
  },

  async updateTitle(titleId, titleData) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.put(`/member-service/member/title/${titleId}`, titleData, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error updating title:", error);
      throw error;
    }
  },

  async deleteTitle(titleId) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.delete(`/member-service/member/title/${titleId}`, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error deleting title:", error);
      throw error;
    }
  },

  async restoreTitle(titleId) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.patch(`/member-service/member/title/${titleId}/restore`, {}, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error restoring title:", error);
      throw error;
    }
  },

  async reorderTitle(memberPositionId, titleIds) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      headers['X-User-MemberPositionId'] = memberPositionId; // 헤더에 memberPositionId 추가
      const response = await apiClient.put('/member-service/member/title/reorder', { idList: titleIds }, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error reordering title:", error);
      throw error;
    }
  },};
