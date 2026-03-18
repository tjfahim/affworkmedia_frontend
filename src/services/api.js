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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - please check if your backend server is running');
    }
    if (error.response && error.response.status === 401) {
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

export const userAPI = {
  getProfile: () => {
    return api.get('/user/profile');
  },
  
  updateProfile: (userData) => {
    return api.put('/user/profile', userData);
  },
  
  changePassword: (passwordData) => {
    return api.post('/user/change-password', passwordData);
  },
  
  uploadAvatar: (formData) => {
    return api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getUserStats: () => {
    return api.get('/user/stats');
  },
  
  updateNotificationSettings: (settings) => {
    return api.put('/user/notifications', settings);
  },
  
  getActivityLog: (params) => {
    return api.get('/user/activity', { params });
  },
};

export const adminAPI = {
  getUsers: (params) => {
    return api.get('/admin/users', { params });
  },
  
  getUserById: (id) => {
    return api.get(`/admin/users/${id}`);
  },
  
  updateUser: (id, userData) => {
    return api.put(`/admin/users/${id}`, userData);
  },
  
  deleteUser: (id) => {
    return api.delete(`/admin/users/${id}`);
  },
  
  getRoles: () => {
    return api.get('/admin/roles');
  },
  
  assignRole: (userId, roleId) => {
    return api.post(`/admin/users/${userId}/assign-role`, { role_id: roleId });
  },
};

export default api;