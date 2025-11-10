import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use((config) => {
  // Add auth header here if available (e.g., from localStorage or Vuex)
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Add memberPositionId header for member-service APIs
  const memberPositionId = localStorage.getItem('memberPositionId')
  if (memberPositionId) {
    config.headers['X-User-MemberPositionId'] = memberPositionId
  }

  // Add UUID header for member-service APIs
  const uuid = localStorage.getItem('uuid')
  if (uuid) {
    config.headers['X-User-UUID'] = uuid
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling hook
    return Promise.reject(error)
  }
)

export default apiClient




