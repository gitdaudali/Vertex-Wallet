import api from './api'

export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export const authService = {
  register: async (name: string, email: string, password: string): Promise<User> => {
    const response = await api.post('/api/auth/register', { name, email, password })
    return response.data
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },
}

