import { ref } from 'vue';
import axios from 'axios';
import { getAuthHeadersFromToken } from '../utils/authUtils';

export function usePermissions() {
  const checkedPermissions = ref({});

  const checkPermission = async (resource, action, range = 'COMPANY') => {
    const key = `${resource}:${action}:${range}`;

    try {
      const headers = getAuthHeadersFromToken();
      if (!headers) {
        // Handle case where token is missing or invalid
        return false;
      }

      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/check-permission`, {
        params: { resource, action, range },
        headers: headers
      });

      const hasPermission = response.data?.data || false;
      return hasPermission;
    } catch (error) {
      console.error(`Permission check failed for ${key}:`, error);
      return false;
    }
  };

  // 여러 권한을 한번에 확인하는 헬퍼 함수
  const checkPermissions = async (permissionsToCheck) => {
    const results = {};
    for (const p of permissionsToCheck) {
      const range = p.range || 'COMPANY';
      results[`${p.resource}_${p.action}_${range}`] = await checkPermission(p.resource, p.action, range);
    }
    checkedPermissions.value = results;
  };

  return {
    checkedPermissions,
    checkPermission,
    checkPermissions,
  };
}
