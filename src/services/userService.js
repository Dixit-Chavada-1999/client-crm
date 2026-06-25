import api from './api';

const userService = {
  async getUsers(params = {}) {
    const response = await api.get('/users', { params });
    return response.data.data;
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data.data.user;
  },

  async createUser(data) {
    const response = await api.post('/users', data);
    return response.data.data.user;
  },

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data.user;
  },

  async deleteUser(id) {
    await api.delete(`/users/${id}`);
  },

  async getActiveUsers() {
    const response = await api.get('/users/active');
    return response.data.data.users;
  },
};

export default userService;
