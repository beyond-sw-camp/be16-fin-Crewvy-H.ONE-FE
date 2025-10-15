import apiClient from './index';
import { jwtDecode } from 'jwt-decode';

const permissionCache = {};

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error("Access token not found.");
  }
  const decodedToken = jwtDecode(accessToken);
  return {
    'X-User-UUID': decodedToken.uuid,
    'X-User-MemberPositionId': decodedToken.memberPositionId,
  };
};

export default {
  async checkPermission(resource, action, range) {
    const cacheKey = `${resource}-${action}-${range}`;
    if (permissionCache[cacheKey] !== undefined) {
      return permissionCache[cacheKey];
    }

    try {
      const headers = getAuthHeaders();
      const response = await apiClient.get('/member-service/member/check-permission', {
        headers,
        params: { resource, action, range }
      });
      const hasPermission = response.data.data === 'TRUE';
      permissionCache[cacheKey] = hasPermission;
      return hasPermission;
    } catch (error) {
      console.error(`Error checking permission for ${resource}-${action}-${range}:`, error);
      permissionCache[cacheKey] = false;
      return false;
    }
  },

  clearPermissionCache() {
    Object.keys(permissionCache).forEach(key => delete permissionCache[key]);
  }
};
