import axios from './index';

const API_URL = '/member-service/organization';

export default {
  getOrganizationList(uuid) {
    return axios.get(`${API_URL}/list`, { headers: { 'X-User-UUID': uuid } });
  },
  getOrganizationTreeWithMembers(uuid) {
    return axios.get(`${API_URL}/tree-with-members`, { headers: { 'X-User-UUID': uuid } });
  },
};