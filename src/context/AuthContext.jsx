// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import api from '../services/api';
import { useHistory } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const history = useHistory();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Extract permissions and roles from saved user
        const userPermissions = extractPermissions(parsedUser);
        const userRoles = extractRoles(parsedUser);
        
        setPermissions(userPermissions);
        setRoles(userRoles);
        
        console.log('Loaded from storage - Permissions:', userPermissions);
        console.log('Loaded from storage - Roles:', userRoles);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        // Clear invalid data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Helper function to extract permissions from user object
  const extractPermissions = (userData) => {
    let extractedPermissions = [];
    
    // Check if user has direct permissions
    if (userData.permissions && Array.isArray(userData.permissions)) {
      extractedPermissions = [...extractedPermissions, ...userData.permissions.map(p => p.name)];
    }
    
    // Check if user has roles with permissions
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
    
    // Remove duplicates
    return [...new Set(extractedPermissions)];
  };

  // Helper function to extract roles
  const extractRoles = (userData) => {
    if (userData.roles && Array.isArray(userData.roles)) {
      return userData.roles.map(r => r.name);
    }
    return [];
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', { email, password });
      
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);
      
      if (response.data && response.data.success === true) {
        const { user, access_token } = response.data;
        
        // Store in localStorage
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Extract permissions and roles
        const userPermissions = extractPermissions(user);
        const userRoles = extractRoles(user);
        
        console.log('Extracted permissions:', userPermissions);
        console.log('Extracted roles:', userRoles);
        
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
        console.log('Error response data:', err.response.data);
        console.log('Error response status:', err.response.status);
        
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.errors) {
          const errors = err.response.data.errors;
          errorMessage = Object.values(errors).flat().join(', ');
        } else if (err.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err.response.status === 403) {
          errorMessage = 'Your account is not active';
        } else if (err.response.status === 422) {
          errorMessage = 'Validation error. Please check your input.';
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
        console.log('Error request:', err.request);
      } else {
        errorMessage = err.message;
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
      console.log('Register response:', response.data);
      
      if (response.data && response.data.success === true) {
        const { user, access_token } = response.data;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Extract permissions and roles
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

  // Helper function to check if user has a specific permission
  const hasPermission = (permission) => {
    if (!permission) return true;
    
    // Super-admin has all permissions
    if (roles.includes('super-admin')) {
      return true;
    }
    
    const hasIt = permissions.includes(permission);
    console.log(`Checking permission "${permission}": ${hasIt ? 'GRANTED' : 'DENIED'}`, permissions);
    return hasIt;
  };

  // Helper function to check if user has any of the given permissions
  const hasAnyPermission = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true;
    
    // Super-admin has all permissions
    if (roles.includes('super-admin')) {
      return true;
    }
    
    return permissionList.some(permission => permissions.includes(permission));
  };

  // Helper function to check if user has all of the given permissions
  const hasAllPermissions = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true;
    
    // Super-admin has all permissions
    if (roles.includes('super-admin')) {
      return true;
    }
    
    return permissionList.every(permission => permissions.includes(permission));
  };

  // Helper function to check if user has a specific role
  const hasRole = (role) => {
    if (!role) return true;
    return roles.includes(role);
  };

  // Helper function to check if user has any of the given roles
  const hasAnyRole = (roleList) => {
    if (!roleList || roleList.length === 0) return true;
    return roleList.some(role => roles.includes(role));
  };

  // Helper function to refresh user permissions (call after permission updates)
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

  // Get all permissions including those from roles
  const getAllPermissions = () => {
    return permissions;
  };

  const value = {
    user,
    loading,
    error,
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