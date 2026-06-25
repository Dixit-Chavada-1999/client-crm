import api from './api';

const activityService = {
  async getActivities(leadId, params = {}) {
    const response = await api.get(`/leads/${leadId}/activities`, { params });
    return response.data.data;
  },

  async createActivity(leadId, data) {
    const response = await api.post(`/leads/${leadId}/activities`, data);
    return response.data.data.activity;
  },

  async updateActivity(id, data) {
    const response = await api.put(`/activities/${id}`, data);
    return response.data.data.activity;
  },

  async deleteActivity(id) {
    await api.delete(`/activities/${id}`);
  },

  async getUpcomingFollowups(days = 7) {
    const response = await api.get('/activities/upcoming', { params: { days } });
    return response.data.data.followups;
  },

  async uploadFiles(activityId, files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post(`/files/activities/${activityId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.files;
  },

  async getFileDownloadUrl(fileId) {
    const response = await api.get(`/files/${fileId}/download`);
    return response.data.data;
  },

  async deleteFile(fileId) {
    await api.delete(`/files/${fileId}`);
  },
};

export default activityService;
