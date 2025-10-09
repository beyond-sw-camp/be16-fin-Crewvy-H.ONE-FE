import { ref } from 'vue';
import axios from 'axios';

// 간단한 클라이언트 사이드 캐시
const permissionCache = new Map();

export function usePermissions() {
  const checkedPermissions = ref({});

  const checkPermission = async (resource, action) => {
    const key = `${resource}:${action}`;

    // 클라이언트 캐시 확인
    if (permissionCache.has(key)) {
      return permissionCache.get(key);
    }

    try {
      const response = await axios.get('/api/member-service/member/check-permission', {
        params: { resource, action },
      });

      const hasPermission = response.data?.data || false;
      permissionCache.set(key, hasPermission); // 캐시에 저장
      return hasPermission;
    } catch (error) {
      console.error(`Permission check failed for ${key}:`, error);
      permissionCache.set(key, false); // 오류 발생 시 false로 캐시하여 반복 요청 방지
      return false;
    }
  };

  // 여러 권한을 한번에 확인하는 헬퍼 함수
  const checkPermissions = async (permissionsToCheck) => {
    const results = {};
    for (const p of permissionsToCheck) {
      results[`${p.resource}_${p.action}`] = await checkPermission(p.resource, p.action);
    }
    checkedPermissions.value = results;
  };

  return {
    checkedPermissions,
    checkPermission,
    checkPermissions,
  };
}
