import api from './api';

const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data.data.stats;
  },

  async getLeadsByStatus() {
    const response = await api.get('/dashboard/leads-by-status');
    return response.data.data.leadsByStatus;
  },

  async getLeadsTrend(days = 30) {
    const response = await api.get('/dashboard/leads-trend', { params: { days } });
    return response.data.data.trend;
  },

  async getUpcomingFollowups(days = 7) {
    const response = await api.get('/dashboard/upcoming-followups', { params: { days } });
    return response.data.data.followups;
  },

  async getRecentActivities(limit = 10) {
    const response = await api.get('/dashboard/recent-activities', { params: { limit } });
    return response.data.data.activities;
  },

  async getTopLeads(limit = 5) {
    const response = await api.get('/dashboard/top-leads', { params: { limit } });
    return response.data.data.leads;
  },
};

export default dashboardService;
