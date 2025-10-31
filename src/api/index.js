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




apiClient.interceptors.response.use(
    response => response,
    async error => {
        if (error.response && error.response.status === 401) {
            showErrorSnackbar('토큰이 만료되었습니다. 다시 로그인해주세요.');
            localStorage.clear();
            window.location.href = "/login";
            return Promise.reject(error);
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
