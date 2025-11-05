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
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message;

            if (status === 401) {
                window.dispatchEvent(new CustomEvent('session-expired'));
            } else if (status === 500) {
                showErrorSnackbar('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            } else if (message) {
                showErrorSnackbar(message);
            }
        }
        return Promise.reject(error);
    }
);


export default apiClient;
