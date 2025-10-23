import axios from './index';

const API_URL = '/member-service/organization';

export default {
  getOrganizationList(uuid) {
    return axios.get(`${API_URL}/list`, { headers: { 'X-User-UUID': uuid } });
  },

  getOrganizationTreeWithMembers() {
    const memberId = localStorage.getItem('memberId');
    const headers = {};
    if (memberId) {
      headers['X-User-UUID'] = memberId;
    }
    return axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/organization/tree-with-members`, { headers });
  }
};