import axios from 'axios';
import useCustomerAuthStore from '../store/customerAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const customerApi = axios.create({
    baseURL: `${API_URL}/portal`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
customerApi.interceptors.request.use(
    (config) => {
        const { accessToken } = useCustomerAuthStore.getState();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
customerApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { refreshToken, updateAccessToken, logout } = useCustomerAuthStore.getState();

                if (!refreshToken) {
                    logout();
                    window.location.href = '/portal/login';
                    return Promise.reject(error);
                }

                const response = await axios.post(`${API_URL}/portal/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken: newAccessToken } = response.data.data;
                updateAccessToken(newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return customerApi(originalRequest);
            } catch (refreshError) {
                useCustomerAuthStore.getState().logout();
                window.location.href = '/portal/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth services
export const authService = {
    login: async (email, password) => {
        const response = await customerApi.post('/auth/login', { email, password });
        return response.data;
    },

    logout: async (refreshToken) => {
        const response = await customerApi.post('/auth/logout', { refreshToken });
        return response.data;
    },

    getProfile: async () => {
        const response = await customerApi.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await customerApi.put('/auth/profile', data);
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await customerApi.post('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },
};

// Dashboard service
export const dashboardService = {
    getDashboard: async () => {
        const response = await customerApi.get('/dashboard');
        return response.data;
    },
};

// Projects service
export const projectsService = {
    getAll: async (params = {}) => {
        const response = await customerApi.get('/projects', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await customerApi.get(`/projects/${id}`);
        return response.data;
    },
};

// Quotations service
export const quotationsService = {
    getAll: async (params = {}) => {
        const response = await customerApi.get('/quotations', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await customerApi.get(`/quotations/${id}`);
        return response.data;
    },

    respond: async (id, response, rejectionReason = null) => {
        const res = await customerApi.post(`/quotations/${id}/respond`, {
            response,
            rejectionReason,
        });
        return res.data;
    },
};

// Invoices service
export const invoicesService = {
    getAll: async (params = {}) => {
        const response = await customerApi.get('/invoices', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await customerApi.get(`/invoices/${id}`);
        return response.data;
    },
};

// Documents service
export const documentsService = {
    getAll: async (params = {}) => {
        const response = await customerApi.get('/documents', { params });
        return response.data;
    },

    getDownloadUrl: async (id) => {
        const response = await customerApi.get(`/documents/${id}/download`);
        return response.data;
    },

    acknowledge: async (id) => {
        const response = await customerApi.post(`/documents/${id}/acknowledge`);
        return response.data;
    },
};

export default customerApi;
