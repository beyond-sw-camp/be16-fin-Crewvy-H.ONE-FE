import axios from './index'; // Assuming index.js exports an axios instance

const API_URL = 'member-service/member'; // Base URL for member-service

export default {
  fetchRole(roleId) {
    return axios.get(`${API_URL}/role/${roleId}`);
  },
  updateRole(roleId, roleData) {
    return axios.put(`${API_URL}/role/${roleId}`, roleData);
  },
};
