import apiClient from './index';
import { getAuthHeadersFromToken } from '../utils/authUtils';

export default {
  async getGrade() {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.get('/member-service/member/grade', { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching grade:", error);
      throw error;
    }
  },

  async createGrade(gradeData) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.post('/member-service/member/create-grade', gradeData, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error creating grade:", error);
      throw error;
    }
  },

  async updateGrade(gradeId, gradeData) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.put(`/member-service/member/grade/${gradeId}`, gradeData, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error updating grade:", error);
      throw error;
    }
  },

  async deleteGrade(gradeId) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      const response = await apiClient.delete(`/member-service/member/grade/${gradeId}`, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error deleting grade:", error);
      throw error;
    }
  },
};
