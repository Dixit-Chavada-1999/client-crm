import api from './api';

const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Silent fail for logout
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  async updateProfile(data) {
    const response = await api.put('/auth/me', data);
    return response.data.data.user;
  },

  async changePassword(newPassword) {
    await api.put('/auth/change-password', { newPassword });
  },
};

export default authService;
