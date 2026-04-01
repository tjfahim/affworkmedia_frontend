// pages/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import { Button, Tabs, Tab } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

// Import sub-components
import UserStats from '../components/user/UserStats';
import UserTable from '../components/user/UserTable';
import UserFormModal from '../components/user/UserFormModal';
import UserViewModal from '../components/user/UserViewModal';
import UserPagination from '../components/user/UserPagination';

const UserManagement = () => {
  const { hasPermission, hasRole } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formLoading, setFormLoading] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(null);

  // Pagination states
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15
  });

  useEffect(() => {
    fetchUsers();
    if (hasRole('super-admin')) {
      fetchRoles();
    }
  }, [hasRole]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/users?page=${page}`);
      
      // Fix: Check if response.data.users exists directly (no nested data property)
      if (response.data && response.data.success === true && response.data.users) {
        if (Array.isArray(response.data.users.data)) {
          setUsers(response.data.users.data);
          setPagination({
            current_page: response.data.users.current_page,
            last_page: response.data.users.last_page,
            total: response.data.users.total,
            per_page: response.data.users.per_page
          });
        } else if (Array.isArray(response.data.users)) {
          // Handle case where users is directly an array
          setUsers(response.data.users);
          setPagination({
            current_page: page,
            last_page: 1,
            total: response.data.users.length,
            per_page: response.data.users.length
          });
        } else {
          setUsers([]);
          toast.error('Invalid user data format');
        }
      } else {
        setUsers([]);
        toast.error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      if (response.data && response.data.success === true && Array.isArray(response.data.roles)) {
        setRoles(response.data.roles.filter(role => role.name !== 'super-admin'));
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateUser = async (formData) => {
    setFormLoading(true);
    
    try {
      // Validate password
      if (formData.password !== formData.password_confirmation) {
        toast.error('Passwords do not match');
        setFormLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        setFormLoading(false);
        return;
      }

      // Prevent creating super-admin
      if (formData.role === 'super-admin') {
        toast.error('Cannot create super-admin user');
        setFormLoading(false);
        return;
      }

      const response = await api.post('/users', formData);
      if (response.data && response.data.success === true) {
        toast.success('User created successfully!');
        setShowFormModal(false);
        fetchUsers(pagination.current_page);
      } else {
        toast.error(response.data?.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(error.response?.data?.message || 'Failed to create user');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (formData) => {
    setFormLoading(true);
    
    try {
      // Prevent updating to super-admin
      if (formData.role === 'super-admin') {
        toast.error('Cannot assign super-admin role');
        setFormLoading(false);
        return;
      }

      // Prevent changing super-admin user
      if (selectedUser?.roles?.some(r => r.name === 'super-admin')) {
        toast.error('Cannot modify super-admin user');
        setFormLoading(false);
        return;
      }

      const updateData = { ...formData };
      
      // Remove password if not provided
      if (!updateData.password || updateData.password === '') {
        delete updateData.password;
        delete updateData.password_confirmation;
      } else {
        // Validate password if provided
        if (updateData.password !== updateData.password_confirmation) {
          toast.error('Passwords do not match');
          setFormLoading(false);
          return;
        }
        if (updateData.password.length < 8) {
          toast.error('Password must be at least 8 characters');
          setFormLoading(false);
          return;
        }
      }

      const response = await api.put(`/users/${selectedUser.id}`, updateData);
      if (response.data && response.data.success === true) {
        toast.success('User updated successfully!');
        setShowFormModal(false);
        fetchUsers(pagination.current_page);
      } else {
        toast.error(response.data?.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(error.response?.data?.message || 'Failed to update user');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/users/${userId}`);
        if (response.data && response.data.success === true) {
          toast.success('User deleted successfully!');
          fetchUsers(pagination.current_page);
        } else {
          toast.error(response.data?.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Delete user error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleStatusToggle = async (user) => {
    // Prevent toggling status for super-admin
    if (user.roles?.some(r => r.name === 'super-admin')) {
      toast.error('Cannot change super-admin status');
      return;
    }

    setTogglingStatus(user.id);
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const response = await api.put(`/users/${user.id}`, { status: newStatus });
      
      if (response.data && response.data.success === true) {
        toast.success(`User status changed to ${newStatus}`);
        setUsers(users.map(u => 
          u.id === user.id ? { ...u, status: newStatus } : u
        ));
      } else {
        toast.error(response.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status toggle error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setTogglingStatus(null);
    }
  };

  const openEditModal = (user) => {
    // Prevent editing super-admin
    if (user.roles?.some(r => r.name === 'super-admin') && !hasRole('super-admin')) {
      toast.error('Cannot edit super-admin user');
      return;
    }

    setSelectedUser(user);
    setShowFormModal(true);
  };

  const openViewModal = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setShowFormModal(true);
  };

  const closeModals = () => {
    setShowFormModal(false);
    setShowViewModal(false);
    setSelectedUser(null);
    setViewingUser(null);
  };

  // Filter users based on active tab
  const getFilteredUsers = () => {
    if (activeTab === 'all') return users;
    return users.filter(user => 
      user.roles?.some(role => role.name === activeTab)
    );
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-2">
            <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
            User Management
          </h2>
          <p className="text-muted">Manage users, roles, and permissions</p>
        </div>
        {hasPermission('create users') && (
          <Button variant="primary" onClick={openCreateModal}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Add User
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <UserStats users={users} />

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        className="mb-4"
      >
        <Tab eventKey="all" title="All Users" />
        <Tab eventKey="super-admin" title="Super Admins" />
        <Tab eventKey="admin" title="Admins" />
        <Tab eventKey="affiliate" title="Affiliates" />
      </Tabs>

      {/* Users Table */}
      <div className="border-0 shadow-sm rounded bg-white">
        <UserTable 
          users={filteredUsers}
          loading={loading}
          togglingStatus={togglingStatus}
          onView={openViewModal}
          onEdit={openEditModal}
          onDelete={handleDeleteUser}
          onStatusToggle={handleStatusToggle}
          hasPermission={hasPermission}
        />
      </div>

      {/* Pagination */}
      <UserPagination pagination={pagination} onPageChange={handlePageChange} />

      {/* User Form Modal */}
      <UserFormModal
        show={showFormModal}
        onHide={closeModals}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        selectedUser={selectedUser}
        roles={roles}
        loading={formLoading}
      />

      {/* User View Modal */}
      <UserViewModal
        show={showViewModal}
        onHide={closeModals}
        user={viewingUser}
        onEdit={openEditModal}
        hasPermission={hasPermission}
      />
    </div>
  );
};

export default UserManagement;