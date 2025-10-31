import apiClient from './index';


const API_URL = '/member-service/organization';

export default {
  getOrganizationList(uuid) {
    return apiClient.get(`${API_URL}/list`, { headers: { 'X-User-UUID': uuid } });
  },
  getOrganizationTreeWithMembers(uuid) {
    return apiClient.get(`${API_URL}/tree-with-members`, { headers: { 'X-User-UUID': uuid } });
  },
  getOrganizationTree() {
    return apiClient.get('/search-service/search/organization');
  },
  getOrganizationTreeForCreation() {
    const uuid = localStorage.getItem('memberId');
    if (!uuid) {
      return Promise.reject(new Error('User UUID not found in localStorage.'));
    }
    return apiClient.get(`${API_URL}/tree-with-members`, { headers: { 'X-User-UUID': uuid } });
  }
};