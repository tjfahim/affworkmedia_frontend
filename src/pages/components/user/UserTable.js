// components/user/UserTable.js
import React from 'react';
import { Table, Badge, Button, Spinner } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faEnvelope, faUser, 
  faCheckCircle, faTimesCircle 
} from '@fortawesome/free-solid-svg-icons';

const roleColors = {
  'super-admin': 'danger',
  'admin': 'warning',
  'affiliate': 'info',
  'default': 'secondary'
};

const getStatusBadge = (status) => {
  switch(status) {
    case 'active':
      return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Active</Badge>;
    case 'inactive':
      return <Badge bg="secondary"><FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Inactive</Badge>;
    case 'suspended':
      return <Badge bg="danger"><FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Suspended</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

const UserTable = ({ 
  users, 
  loading, 
  togglingStatus, 
  onView, 
  onEdit, 
  onDelete, 
  onStatusToggle,
  hasPermission 
}) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading users...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-5">
        <h5>No users found</h5>
        <p className="text-muted">Click the "Add User" button to create one.</p>
      </div>
    );
  }

  return (
    <Table responsive striped hover className="mb-0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Contact</th>
          <th>Role</th>
          <th>Balance</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => {
          const displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
          const isSuperAdmin = user.roles?.some(r => r.name === 'super-admin');
          
          return (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                <div className="fw-bold">{displayName}</div>
                {user.company && <small className="text-muted">{user.company}</small>}
              </td>
              <td>
                <div><FontAwesomeIcon icon={faEnvelope} className="me-1 text-muted" /> {user.email}</div>
                {user.skype && <small><FontAwesomeIcon icon={faEnvelope} className="me-1 text-muted" /> {user.skype}</small>}
              </td>
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
                <span className="fw-bold text-success">
                  ${parseFloat(user.balance || 0).toFixed(2)}
                </span>
              </td>
              <td>
                <div 
                  style={{ cursor: !isSuperAdmin ? 'pointer' : 'default' }}
                  onClick={() => !isSuperAdmin && onStatusToggle(user)}
                  title={!isSuperAdmin ? 'Click to toggle status' : 'Cannot change super-admin status'}
                >
                  {togglingStatus === user.id ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    getStatusBadge(user.status)
                  )}
                </div>
              </td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => onView(user)}
                  title="View User"
                >
                  <FontAwesomeIcon icon={faUser} />
                </Button>
                {hasPermission('edit users') && !isSuperAdmin && (
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(user)}
                    title="Edit User"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                )}
                {hasPermission('delete users') && !isSuperAdmin && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(user.id)}
                    title="Delete User"
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
        })}
      </tbody>
    </Table>
  );
};

export default UserTable;