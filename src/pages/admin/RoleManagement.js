// pages/admin/RoleManagement.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Alert, Spinner } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RoleManagement = () => {
  const { hasRole } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState({});

  const [roleForm, setRoleForm] = useState({
    name: '',
    permissions: []
  });

  useEffect(() => {
    if (hasRole('super-admin')) {
      fetchRoles();
      fetchPermissions();
    }
  }, [hasRole]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles');
      setRoles(response.data.roles);
    } catch (error) {
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/roles/permissions');
      setPermissions(response.data.permissions);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const handleUpdateRolePermissions = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');
    
    try {
      const response = await api.put(`/roles/${selectedRole.id}/permissions`, {
        permissions: roleForm.permissions
      });
      
      if (response.data.success) {
        setSuccess('Role permissions updated successfully');
        setShowModal(false);
        fetchRoles(); // Refresh the roles list
      }
    } catch (error) {
      console.error('Update error:', error);
      
      // Handle different error responses
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else if (error.response.data && error.response.data.errors) {
          // Handle validation errors
          const errors = Object.values(error.response.data.errors).flat();
          setError(errors.join(', '));
        } else {
          setError('Failed to update role permissions');
        }
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const toggleExpand = (roleId) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const getDisplayPermissions = (permissions, roleId) => {
    if (!permissions || permissions.length === 0) {
      return <span className="text-muted">No permissions</span>;
    }

    const displayCount = 5;
    const isExpanded = expandedRoles[roleId];

    if (permissions.length <= displayCount || isExpanded) {
      return permissions.map(perm => (
        <Badge key={perm.id} bg="secondary" className="me-1 mb-1">
          {perm.name}
        </Badge>
      ));
    } else {
      return (
        <>
          {permissions.slice(0, displayCount).map(perm => (
            <Badge key={perm.id} bg="secondary" className="me-1 mb-1">
              {perm.name}
            </Badge>
          ))}
          <Badge 
            bg="info" 
            className="me-1 mb-1" 
            style={{ cursor: 'pointer' }}
            onClick={() => toggleExpand(roleId)}
          >
            +{permissions.length - displayCount} more
          </Badge>
        </>
      );
    }
  };

  if (!hasRole('super-admin')) {
    return (
      <Alert variant="danger">
        You don't have permission to access this page.
      </Alert>
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
        <h2>Role Management</h2>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Table responsive striped hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Role Name</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.filter(role => role.name !== 'super-admin').map(role => (
            <tr key={role.id}>
              <td>{role.id}</td>
              <td>
                <Badge bg="primary">{role.name}</Badge>
              </td>
              <td>
                <div className="d-flex flex-wrap align-items-center">
                  {getDisplayPermissions(role.permissions, role.id)}
                  {role.permissions.length > 5 && expandedRoles[role.id] && (
                    <Badge 
                      bg="info" 
                      className="ms-1" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleExpand(role.id)}
                    >
                      <FontAwesomeIcon icon={faChevronUp} size="xs" /> Show less
                    </Badge>
                  )}
                </div>
              </td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(role);
                    setRoleForm({
                      name: role.name,
                      permissions: role.permissions.map(p => p.name)
                    });
                    setShowModal(true);
                    setError('');
                  }}
                >
                  <FontAwesomeIcon icon={faKey} className="me-2" /> Manage Permissions
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Role Permission Modal */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setError('');
        setSelectedRole(null);
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Manage Permissions for {selectedRole?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateRolePermissions}>
          <Modal.Body>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Select Permissions</Form.Label>
              <div className="border p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {permissions.length === 0 ? (
                  <p className="text-muted text-center">No permissions available</p>
                ) : (
                  permissions.map(permission => (
                    <Form.Check
                      key={permission.id}
                      type="checkbox"
                      id={`perm-${permission.id}`}
                      label={permission.name}
                      checked={roleForm.permissions.includes(permission.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRoleForm({
                            ...roleForm,
                            permissions: [...roleForm.permissions, permission.name]
                          });
                        } else {
                          setRoleForm({
                            ...roleForm,
                            permissions: roleForm.permissions.filter(p => p !== permission.name)
                          });
                        }
                      }}
                      className="mb-2"
                    />
                  ))
                )}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowModal(false);
                setError('');
                setSelectedRole(null);
              }}
              disabled={modalLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={modalLoading}
            >
              {modalLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagement;