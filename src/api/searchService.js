import axios from 'axios';

const API_URL = `${process.env.VUE_APP_API_BASE_URL}/search-service`;

class SearchService {
  searchEmployees(query, params) {
    const accessToken = localStorage.getItem('accessToken');
    const companyId = localStorage.getItem('companyId');
    return axios.get(`${API_URL}/search/employees`, {
      params: { query, ...params },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-User-CompanyId': companyId,
      },
    });
  }

  searchOrganizations(query) {
    const accessToken = localStorage.getItem('accessToken');
    const companyId = localStorage.getItem('companyId');
    return axios.get(`${API_URL}/search/organization`, {
      params: { query },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-User-CompanyId': companyId,
      },
    });
  }

  searchGlobal(query) {
    const accessToken = localStorage.getItem('accessToken');
    const companyId = localStorage.getItem('companyId');
    return axios.get(`${API_URL}/search/global`, {
      params: { query },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-User-CompanyId': companyId,
      },
    });
  }

  searchApprovals(query, page, size) {
    const accessToken = localStorage.getItem('accessToken');
    const companyId = localStorage.getItem('companyId');
    return axios.get(`${API_URL}/search/approvals`, {
      params: { query, page, size },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-User-CompanyId': companyId,
      },
    });
  }

  getOrganizationTree() {
    const accessToken = localStorage.getItem('accessToken');
    const companyId = localStorage.getItem('companyId');
    return axios.get(`${API_URL}/search/organization`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-User-CompanyId': companyId,
      },
    });
  }

  searchEmployeesByOrganization(organizationId, params) {
    const accessToken = localStorage.getItem('accessToken');
    const companyId = localStorage.getItem('companyId');
    return axios.get(`${API_URL}/search/employees/organization`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-User-CompanyId': companyId,
      },
      params: {
        organizationId,
        ...params,
      },
    });
  }
}

export default new SearchService();
