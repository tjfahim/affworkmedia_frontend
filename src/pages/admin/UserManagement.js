// pages/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Alert, Spinner, Pagination, Tabs, Tab } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const UserManagement = () => {
  const { hasPermission, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Status toggle loading state
  const [togglingStatus, setTogglingStatus] = useState(null);

  // Pagination states
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15
  });

  // Role colors mapping
  const roleColors = {
    'super-admin': 'danger',
    'admin': 'warning',
    'affiliate': 'info',
    'default': 'secondary'
  };

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
    status: 'active'
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
      console.log('Users response:', response.data);
      
      if (response.data && response.data.success === true && response.data.users) {
        if (Array.isArray(response.data.users.data)) {
          setUsers(response.data.users.data);
          setPagination({
            current_page: response.data.users.current_page,
            last_page: response.data.users.last_page,
            total: response.data.users.total,
            per_page: response.data.users.per_page
          });
          setError('');
        } else {
          console.error('Users data is not an array:', response.data.users);
          setUsers([]);
          setError('Invalid user data format');
        }
      } else {
        console.error('Unexpected response structure:', response.data);
        setUsers([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      console.log('Roles response:', response.data);
      if (response.data && response.data.success === true && Array.isArray(response.data.roles)) {
        setRoles(response.data.roles.filter(role => role.name !== 'super-admin')); // Exclude super-admin from selectable roles
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      // Prevent creating super-admin
      if (userForm.role === 'super-admin') {
        setError('Cannot create super-admin user');
        return;
      }

      const response = await api.post('/users', userForm);
      if (response.data && response.data.success === true) {
        setSuccess('User created successfully');
        setShowModal(false);
        fetchUsers(pagination.current_page);
        resetUserForm();
      } else {
        setError(response.data?.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      setError(error.response?.data?.message || error.response?.data?.errors || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      // Prevent updating to super-admin
      if (userForm.role === 'super-admin') {
        setError('Cannot assign super-admin role');
        return;
      }

      // Prevent changing super-admin user
      if (selectedUser?.roles?.some(r => r.name === 'super-admin')) {
        setError('Cannot modify super-admin user');
        return;
      }

      const response = await api.put(`/users/${selectedUser.id}`, userForm);
      if (response.data && response.data.success === true) {
        setSuccess('User updated successfully');
        setShowModal(false);
        fetchUsers(pagination.current_page);
        resetUserForm();
      } else {
        setError(response.data?.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      setError(error.response?.data?.message || error.response?.data?.errors || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await api.delete(`/users/${userId}`);
        if (response.data && response.data.success === true) {
          setSuccess('User deleted successfully');
          fetchUsers(pagination.current_page);
        } else {
          setError(response.data?.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Delete user error:', error);
        setError(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleStatusToggle = async (user) => {
    // Prevent toggling status for super-admin
    if (user.roles?.some(r => r.name === 'super-admin')) {
      setError('Cannot change super-admin status');
      return;
    }

    setTogglingStatus(user.id);
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const response = await api.put(`/users/${user.id}`, { 
        status: newStatus 
      });
      
      if (response.data && response.data.success === true) {
        setSuccess(`User status changed to ${newStatus}`);
        // Update the user in the local state
        setUsers(users.map(u => 
          u.id === user.id ? { ...u, status: newStatus } : u
        ));
      } else {
        setError(response.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status toggle error:', error);
      setError(error.response?.data?.message || 'Failed to update status');
    } finally {
      setTogglingStatus(null);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: '',
      status: 'active'
    });
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    // Prevent editing super-admin
    if (user.roles?.some(r => r.name === 'super-admin') && !hasRole('super-admin')) {
      setError('Cannot edit super-admin user');
      return;
    }

    setSelectedUser(user);
    setUserForm({
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '',
      email: user.email || '',
      password: '',
      password_confirmation: '',
      role: (user.roles && user.roles[0]?.name) || '',
      status: user.status || 'active'
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetUserForm();
    setShowModal(true);
  };

  // Filter users based on active tab
  const getFilteredUsers = () => {
    if (activeTab === 'all') return users;
    return users.filter(user => 
      user.roles?.some(role => role.name === activeTab)
    );
  };

  const filteredUsers = getFilteredUsers();

  // Generate pagination items
  const paginationItems = [];
  for (let page = 1; page <= pagination.last_page; page++) {
    paginationItems.push(
      <Pagination.Item 
        key={page} 
        active={page === pagination.current_page}
        onClick={() => handlePageChange(page)}
      >
        {page}
      </Pagination.Item>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        {hasPermission('create users') && (
          <Button variant="primary" onClick={openCreateModal}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Add User
          </Button>
        )}
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        className="mb-4"
        mountOnEnter={false}
        unmountOnExit={false}
      >
        <Tab eventKey="all" title="All Users" />
        <Tab eventKey="super-admin" title="Super Admins" />
        <Tab eventKey="admin" title="Admins" />
        <Tab eventKey="affiliate" title="Affiliates" />
      </Tabs>

      {/* Users Table */}
      <Table responsive striped hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map(user => {
              const displayName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
              const isSuperAdmin = user.roles?.some(r => r.name === 'super-admin');
              
              return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{displayName || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.roles && user.roles.map(role => (
                      <Badge 
                        key={role.id} 
                        bg={roleColors[role.name] || roleColors.default} 
                        className="me-1"
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </td>
                  <td>
                    <Badge 
                      bg={user.status === 'active' ? 'success' : 'danger'}
                      style={{ cursor: !isSuperAdmin ? 'pointer' : 'default' }}
                      onClick={() => !isSuperAdmin && handleStatusToggle(user)}
                      className="status-badge"
                      title={!isSuperAdmin ? 'Click to toggle status' : 'Cannot change super-admin status'}
                    >
                      {togglingStatus === user.id ? (
                        <FontAwesomeIcon icon={faSync} spin className="me-1" />
                      ) : null}
                      {user.status || 'inactive'}
                    </Badge>
                  </td>
                  <td>
                    {hasPermission('edit users') && !isSuperAdmin && (
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => openEditModal(user)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                    )}
                    
                    {hasPermission('delete users') && !isSuperAdmin && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    )}

                    {isSuperAdmin && (
                      <Badge bg="secondary" className="p-2">Protected</Badge>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev 
              disabled={pagination.current_page === 1}
              onClick={() => handlePageChange(pagination.current_page - 1)}
            />
            {paginationItems}
            <Pagination.Next 
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => handlePageChange(pagination.current_page + 1)}
            />
          </Pagination>
        </div>
      )}

      {/* User Create/Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetUserForm(); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedUser ? 'Edit User' : 'Create New User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                required
              />
            </Form.Group>

            {!selectedUser && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    required
                    minLength="8"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={userForm.password_confirmation}
                    onChange={(e) => setUserForm({...userForm, password_confirmation: e.target.value})}
                    required
                  />
                </Form.Group>
              </>
            )}

            {hasRole('super-admin') && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                    required={!selectedUser}
                  >
                    <option value="">Select Role</option>
                    {roles && roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Super-admin role cannot be assigned
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={userForm.status}
                    onChange={(e) => setUserForm({...userForm, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetUserForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedUser ? 'Update' : 'Create'} User
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style jsx="true">{`
        .status-badge {
          transition: all 0.3s ease;
          display: inline-block;
        }
        .status-badge:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
};

export default UserManagement;