import api from './api';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

const authService = {
    // Login
    login: async (credentials) => {
        try {
            const response = await api.post('/login', credentials);

            if (response.data.access_token) {
                localStorage.setItem(TOKEN_KEY, response.data.access_token);
                localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Register
    register: async (userData) => {
        try {
            const response = await api.post('/register', userData);

            if (response.data.access_token) {
                localStorage.setItem(TOKEN_KEY, response.data.access_token);
                localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Forgot Password
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Reset Password
    resetPassword: async (data) => {
        try {
            const response = await api.post('/reset-password', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Verify Reset Token
    verifyResetToken: async (email, token) => {
        try {
            const response = await api.post('/verify-reset-token', {
                email,
                token
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Logout
    logout: async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
    },

    // Get Current User
    getCurrentUser: () => {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Get Token
    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    // Check Authentication
    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    // Save Updated User After Profile Update
    updateStoredUser: (user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

export default authService;