import axios from './index'; // Assuming index.js exports an axios instance
import { getAuthHeadersFromToken } from '../utils/authUtils'; // 임포트 추가

const API_URL = 'member-service/member'; // Base URL for member-service

export default {
  async getRole(memberPositionId) { // memberPositionId 파라미터 추가
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      headers['X-User-MemberPositionId'] = memberPositionId; // 헤더에 memberPositionId 추가
      // 백엔드 getRole은 X-User-UUID도 필요로 할 수 있으므로, authUtils에서 가져온 headers를 사용
      const response = await axios.get(`${API_URL}/role`, { headers });
      return response; // response.data를 그대로 반환
    } catch (error) {
      console.error("Error fetching role:", error);
      throw error;
    }
  },
  fetchRole(roleId) {
    return axios.get(`${API_URL}/role/${roleId}`);
  },
  async deleteRole(memberPositionId, roleId) { // deleteRole 함수 추가
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      headers['X-User-MemberPositionId'] = memberPositionId;
      const response = await axios.delete(`${API_URL}/role/${roleId}/delete`, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  },

  async restoreRole(memberPositionId, roleId) {
    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) throw new Error("Authentication headers not available.");
      headers['X-User-MemberPositionId'] = memberPositionId;
      const response = await axios.patch(`${API_URL}/role/${roleId}/restore`, {}, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error restoring role:", error);
      throw error;
    }
  },
  fetchAllPermissions() {
    return axios.get(`${API_URL}/permission`);
  },
  updateRole(roleId, roleData) {
    return axios.put(`${API_URL}/role/${roleId}/update`, roleData);
  },
  createRole(roleData) {
    return axios.post(`${API_URL}/role-create`, roleData);
  },

  async reorderRole(memberPositionId, roleIds) {
    try {
      const headers = { 'X-User-MemberPositionId': memberPositionId };
      const response = await axios.put(`${API_URL}/role/reorder`, { idList: roleIds }, { headers });
      return response.data.data;
    } catch (error) {
      console.error("Error reordering role:", error);
      throw error;
    }
  },
};
