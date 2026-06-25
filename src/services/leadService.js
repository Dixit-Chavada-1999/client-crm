import api from './api';

const leadService = {
  async getLeads(params = {}) {
    const response = await api.get('/leads', { params });
    return response.data.data;
  },

  async getLeadById(id) {
    const response = await api.get(`/leads/${id}`);
    return response.data.data.lead;
  },

  async createLead(data) {
    const response = await api.post('/leads', data);
    return response.data.data.lead;
  },

  async updateLead(id, data) {
    const response = await api.put(`/leads/${id}`, data);
    return response.data.data.lead;
  },

  async updateStatus(id, status, reason) {
    const response = await api.put(`/leads/${id}/status`, { status, reason });
    return response.data.data.lead;
  },

  async deleteLead(id) {
    await api.delete(`/leads/${id}`);
  },

  async getStatusHistory(id) {
    const response = await api.get(`/leads/${id}/history`);
    return response.data.data.history;
  },

  async convertToCustomer(leadId, data) {
    const response = await api.post(`/customers/convert/${leadId}`, data);
    return response.data.data;
  },

  async uploadLeadImages(profilePic, websiteLogo) {
    const formData = new FormData();

    if (profilePic) {
      formData.append('profilePic', profilePic);
    }
    if (websiteLogo) {
      formData.append('websiteLogo', websiteLogo);
    }

    const response = await api.post('/leads/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};

export default leadService;
