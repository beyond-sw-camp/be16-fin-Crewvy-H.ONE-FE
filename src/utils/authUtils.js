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
