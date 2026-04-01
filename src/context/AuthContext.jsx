// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import api from '../services/api';
import { useHistory } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Add this
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const history = useHistory();

  // Helper function to extract permissions from user object
  const extractPermissions = (userData) => {
    let extractedPermissions = [];
    
    if (userData.permissions && Array.isArray(userData.permissions)) {
      extractedPermissions = [...extractedPermissions, ...userData.permissions.map(p => p.name)];
    }
    
    if (userData.roles && Array.isArray(userData.roles)) {
      userData.roles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          extractedPermissions = [
            ...extractedPermissions, 
            ...role.permissions.map(p => p.name)
          ];
        }
      });
    }
    
    return [...new Set(extractedPermissions)];
  };

  const extractRoles = (userData) => {
    if (userData.roles && Array.isArray(userData.roles)) {
      return userData.roles.map(r => r.name);
    }
    return [];
  };

  // Fetch fresh user profile from API
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return null;
      }

      const response = await api.get('/profile');
      if (response.data && response.data.success === true && response.data.user) {
        const userData = response.data.user;
        
        const userPermissions = extractPermissions(userData);
        const userRoles = extractRoles(userData);
        
        setUser(userData);
        setPermissions(userPermissions);
        setRoles(userRoles);
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(userData));
        
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      if (error.response && error.response.status === 401) {
        // Token is invalid, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
      return null;
    }
  };

  // Load user on initial app load - fetch fresh profile from API
  useEffect(() => {
    const loadUser = async () => {
      setInitialLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (token) {
        await fetchUserProfile();
      }
      setInitialLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data && response.data.success === true) {
        const { user, access_token } = response.data;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        const userPermissions = extractPermissions(user);
        const userRoles = extractRoles(user);
        
        setUser(user);
        setPermissions(userPermissions);
        setRoles(userRoles);
        
        history.push('/dashboard/overview');
        return { success: true };
      } else {
        const errorMessage = response.data?.message || 'Login failed. Please try again.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.errors) {
          const errors = err.response.data.errors;
          errorMessage = Object.values(errors).flat().join(', ');
        } else if (err.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err.response.status === 403) {
          errorMessage = 'Your account is not active';
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      
      if (response.data && response.data.success === true) {
        const { user, access_token } = response.data;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        const userPermissions = extractPermissions(user);
        const userRoles = extractRoles(user);
        
        setUser(user);
        setPermissions(userPermissions);
        setRoles(userRoles);
        
        history.push('/dashboard/overview');
        return { success: true };
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        if (err.response.data && err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join(', ');
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setPermissions([]);
    setRoles([]);
    history.push('/');
  };

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (roles.includes('super-admin')) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true;
    if (roles.includes('super-admin')) return true;
    return permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true;
    if (roles.includes('super-admin')) return true;
    return permissionList.every(permission => permissions.includes(permission));
  };

  const hasRole = (role) => {
    if (!role) return true;
    return roles.includes(role);
  };

  const hasAnyRole = (roleList) => {
    if (!roleList || roleList.length === 0) return true;
    return roleList.some(role => roles.includes(role));
  };

  const refreshPermissions = async () => {
    try {
      const response = await api.get('/user/permissions');
      if (response.data && response.data.permissions) {
        setPermissions(response.data.permissions);
      }
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    }
  };

  const getAllPermissions = () => {
    return permissions;
  };
  
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    const userPermissions = extractPermissions(updatedUser);
    const userRoles = extractRoles(updatedUser);
    
    setPermissions(userPermissions);
    setRoles(userRoles);
  };

  const value = {
    user,
    loading,
    initialLoading, // Add this to the value
    error,
    updateUser,
    login,
    register,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    refreshPermissions,
    getAllPermissions,
    permissions,
    roles,
    isAuthenticated: !!user,
    isSuperAdmin: roles.includes('super-admin'),
    isAdmin: roles.includes('admin'),
    isAffiliate: roles.includes('affiliate'),
    fetchUserProfile, // Add this for manual refresh
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};