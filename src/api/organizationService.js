import apiClient from './index';
import { jwtDecode } from 'jwt-decode';

const API_URL = '/member-service/organization';

export default {
  getOrganizationList(uuid) {
    return apiClient.get(`${API_URL}/list`, { headers: { 'X-User-UUID': uuid } });
  },
  getOrganizationTreeWithMembers(uuid) {
    return apiClient.get(`${API_URL}/tree-with-members`, { headers: { 'X-User-UUID': uuid } });
  },
  getOrganizationTree() {
    const token = localStorage.getItem('accessToken');
    const decodedToken = jwtDecode(token);
    const companyId = decodedToken.companyId;

    return apiClient.get('/search-service/organization', {
      headers: {
        'X-User-CompanyId': companyId
      }
    });
  }
};