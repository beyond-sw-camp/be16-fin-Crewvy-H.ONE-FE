import apiClient from './index';

const getOrganizationTree = () => {
  return apiClient.get('/search-service/search/organization');
};

export default {
  getOrganizationTree,
};
