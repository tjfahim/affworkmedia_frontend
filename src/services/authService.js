import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const authService = {
    // Login
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            if (response.data.access_token) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('token', response.data.access_token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Register
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            if (response.data.access_token) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('token', response.data.access_token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Forgot Password
    forgotPassword: async (email) => {
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Reset Password
    resetPassword: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/reset-password`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Verify Reset Token
    verifyResetToken: async (email, token) => {
        try {
            const response = await axios.post(`${API_URL}/verify-reset-token`, { email, token });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Logout
    logout: async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                await axios.post(`${API_URL}/logout`);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    },

    // Get Current User
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    // Get Auth Token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Check if Authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    }
};

// Set up axios interceptor for token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default authService;