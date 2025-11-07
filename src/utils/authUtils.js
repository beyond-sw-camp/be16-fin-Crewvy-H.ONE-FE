import { jwtDecode } from 'jwt-decode';

export const getAuthHeadersFromToken = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return null;
  }
  try {
    const decodedToken = jwtDecode(accessToken);
    return {
      'Authorization': `Bearer ${accessToken}`,
      'X-User-UUID': decodedToken.uuid,
      'X-User-MemberPositionId': decodedToken.memberPositionId,
    };
  } catch (error) {
    console.error("Error decoding access token:", error);
    return null;
  }
};

// UUID와 memberPositionId만 가져오는 헬퍼 함수
export const getUserHeaders = () => {
  const accessToken = localStorage.getItem('accessToken');
  const companyId = localStorage.getItem('companyId');
  
  const headers = {};
  
  if (accessToken) {
    try {
      const decodedToken = jwtDecode(accessToken);
      if (decodedToken.uuid) {
        headers['X-User-UUID'] = decodedToken.uuid;
      }
      if (decodedToken.memberPositionId) {
        headers['X-User-MemberPositionId'] = decodedToken.memberPositionId;
      }
    } catch (error) {
      console.error("Error decoding access token:", error);
    }
  }
  
  if (companyId) {
    headers['X-User-CompanyId'] = companyId;
  }
  
  return headers;
};