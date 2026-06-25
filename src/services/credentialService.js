import api from './api';

const credentialService = {
  // Get all credentials for a project
  async getProjectCredentials(projectId) {
    const response = await api.get(`/credentials/project/${projectId}`);
    return response.data.data.credentials;
  },

  // Get single credential
  async getCredentialById(id, revealSecrets = false) {
    const response = await api.get(`/credentials/${id}`, {
      params: { reveal: revealSecrets },
    });
    return response.data.data.credential;
  },

  // Create credential
  async createCredential(projectId, data) {
    const response = await api.post(`/credentials/project/${projectId}`, data);
    return response.data.data.credential;
  },

  // Update credential
  async updateCredential(id, data) {
    const response = await api.put(`/credentials/${id}`, data);
    return response.data.data.credential;
  },

  // Delete credential
  async deleteCredential(id) {
    const response = await api.delete(`/credentials/${id}`);
    return response.data;
  },

  // Get access logs
  async getAccessLogs(id) {
    const response = await api.get(`/credentials/${id}/logs`);
    return response.data.data.logs;
  },
};

export default credentialService;
