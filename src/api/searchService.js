import axios from 'axios';

const API_URL = `${process.env.VUE_APP_API_BASE_URL}/search-service`;

class SearchService {
  searchEmployees(query) {
    const accessToken = localStorage.getItem('accessToken');
    const companyId = localStorage.getItem('companyId');
    return axios.get(`${API_URL}/search/employees`, {
      params: { query },
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
}

export default new SearchService();
