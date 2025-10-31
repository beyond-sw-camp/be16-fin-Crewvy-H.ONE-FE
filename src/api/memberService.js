import apiClient from './index';
import { getAuthHeadersFromToken } from '../utils/authUtils';

export default {
  async getMyPage() {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.get('/member-service/member/mypage', { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching mypage info:", error);
      throw error;
    }
  },

  async updateMyInfo(data) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.put('/member-service/member/mypage/update', data, { headers });
      return response.data;
    } catch (error) {
      console.error("Error updating mypage info:", error);
      throw error;
    }
  },

  async getMemberDetail(memberId) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.get(`/member-service/member/${memberId}`, { headers });
      return response.data.data; // Assuming data is nested under 'data'
    } catch (error) {
      console.error(`Error fetching member detail for ${memberId}:`, error);
      throw error;
    }
  },

  async updateMember(memberId, data) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.put(`/member-service/member/${memberId}`, data, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error updating member ${memberId}:`, error);
      throw error;
    }
  },

  async getMyPermissions() {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.get('/member-service/member/my-permissions', { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw error;
    }
  },
};
