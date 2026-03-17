import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - please check if your backend server is running');
    }
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      // Make sure credentials are in the correct format
      const response = await api.post('/login', {
        email: credentials.email,
        password: credentials.password
      });
      return response;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
  
  register: (userData) => api.post('/register', userData),
};

// User Profile API methods
export const userAPI = {
  // Get user profile
  getProfile: () => {
    return api.get('/user/profile');
  },
  
  // Update user profile
  updateProfile: (userData) => {
    return api.put('/user/profile', userData);
  },
  
  // Change password
  changePassword: (passwordData) => {
    return api.post('/user/change-password', passwordData);
  },
  
  // Upload avatar (if you want to add avatar functionality later)
  uploadAvatar: (formData) => {
    return api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get user statistics (for dashboard)
  getUserStats: () => {
    return api.get('/user/stats');
  },
  
  // Update notification settings
  updateNotificationSettings: (settings) => {
    return api.put('/user/notifications', settings);
  },
  
  // Get user activity log
  getActivityLog: (params) => {
    return api.get('/user/activity', { params });
  },
};

// Admin only methods (if needed)
export const adminAPI = {
  // Get all users
  getUsers: (params) => {
    return api.get('/admin/users', { params });
  },
  
  // Get user by ID
  getUserById: (id) => {
    return api.get(`/admin/users/${id}`);
  },
  
  // Update user by ID
  updateUser: (id, userData) => {
    return api.put(`/admin/users/${id}`, userData);
  },
  
  // Delete user
  deleteUser: (id) => {
    return api.delete(`/admin/users/${id}`);
  },
  
  // Get user roles
  getRoles: () => {
    return api.get('/admin/roles');
  },
  
  // Assign role to user
  assignRole: (userId, roleId) => {
    return api.post(`/admin/users/${userId}/assign-role`, { role_id: roleId });
  },
};

// Export the api instance as default
export default api;