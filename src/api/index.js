import axios from 'axios';
import { useSnackbar } from '@/composables/useSnackbar';

const { error: showErrorSnackbar } = useSnackbar();

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    const companyId = localStorage.getItem('companyId');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (companyId) {
      config.headers['X-User-CompanyId'] = companyId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 토큰 재발급을 위한 새로운 axios 인스턴스
const axiosForRefresh = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const memberPositionId = localStorage.getItem('memberPositionId');

                if (!refreshToken) {
                    showErrorSnackbar('토큰이 만료되었습니다. 다시 로그인해주세요.');
                    localStorage.clear();
                    window.location.href = "/landing";
                    return Promise.reject(error);
                }

                const response = await axiosForRefresh.post(`/member-service/member/generate-at`, { refreshToken, memberPositionId });

                const newAccessToken = response.data.data.accessToken;
                localStorage.setItem("accessToken", newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                console.log("토큰 재발급 완료");
                return apiClient(originalRequest);

            } catch (e) {
                showErrorSnackbar('오류가 발생하였습니다. 다시 로그인해주세요.');
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(e);
            }
        }

        if (error.response) {
            if (error.response.status !== 500 && error.response.data && error.response.data.statusMessage) {
                showErrorSnackbar(error.response.data.statusMessage);
            } else if (error.response.status === 500) {
                showErrorSnackbar('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        }

        return Promise.reject(error);
    }
);


export default apiClient;
