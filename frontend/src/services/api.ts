import axios from 'axios'

// Production backend URL: https://vertexwalletbackend.vercel.app
// Development: http://localhost:8000
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://vertexwalletbackend.vercel.app' 
    : 'http://localhost:8000')

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    })
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        error.userMessage = 'Request timeout. Backend is not responding. Please check if backend is running on http://localhost:8000'
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        error.userMessage = 'Cannot connect to server. Please check your internet connection or if the backend is running.'
      } else if (error.code === 'ECONNREFUSED') {
        error.userMessage = 'Server refused connection. Backend might not be running.'
      } else {
        error.userMessage = `Network error: ${error.message || 'Unknown error'}. Please try again.`
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

