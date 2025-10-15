import axios from 'axios';

// workforce-service 직접 호출 URL (포트 8082)
const apiClient = axios.create({
  baseURL: 'http://localhost:8082', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 응답 공통 처리
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success) {
      return response.data.data;
    }
    if (response.data && response.data.success === false && response.data.error) {
        return Promise.reject(new Error(response.data.error.message));
    }
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;