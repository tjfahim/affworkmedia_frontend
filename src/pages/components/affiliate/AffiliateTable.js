// components/affiliate/AffiliateTable.js
import React from 'react';
import { Table, Badge, Button, Spinner } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faEnvelope, faBuilding, 
  faGlobe, faEye, faCheckCircle, faTimesCircle, 
  faPauseCircle 
} from '@fortawesome/free-solid-svg-icons';

const getStatusBadge = (status) => {
  switch(status) {
    case 'active':
      return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Active</Badge>;
    case 'inactive':
      return <Badge bg="warning"><FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Inactive</Badge>;
    case 'suspended':
      return <Badge bg="danger"><FontAwesomeIcon icon={faPauseCircle} className="me-1" /> Suspended</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

const AffiliateTable = ({ 
  affiliates, 
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
        <p className="mt-2">Loading affiliates...</p>
      </div>
    );
  }

  if (!affiliates || affiliates.length === 0) {
    return (
      <div className="text-center py-5">
        <h5>No affiliates found</h5>
        <p className="text-muted">Click the "Add Affiliate" button to create one.</p>
      </div>
    );
  }

  return (
    <Table responsive striped hover>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Contact</th>
          <th>Company</th>
          <th>Balance</th>
          <th>Commission</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {affiliates.map(affiliate => (
          <tr key={affiliate.id}>
            <td>{affiliate.id}</td>
            <td>
              <div className="fw-bold">{affiliate.first_name} {affiliate.last_name}</div>
              <small className="text-muted">Joined: {new Date(affiliate.created_at).toLocaleDateString()}</small>
            </td>
            <td>
              <div><FontAwesomeIcon icon={faEnvelope} className="me-1 text-muted" /> {affiliate.email}</div>
              {affiliate.skype && <small><FontAwesomeIcon icon={faEnvelope} className="me-1 text-muted" /> {affiliate.skype}</small>}
            </td>
            <td>
              {affiliate.company && (
                <div>
                  <FontAwesomeIcon icon={faBuilding} className="me-1 text-muted" />
                  {affiliate.company}
                </div>
              )}
              {affiliate.website && (
                <small>
                  <FontAwesomeIcon icon={faGlobe} className="me-1 text-muted" />
                  <a href={affiliate.website} target="_blank" rel="noopener noreferrer">
                    {affiliate.website}
                  </a>
                </small>
              )}
            </td>
            <td>
              <span className="fw-bold text-success">
                ${parseFloat(affiliate.balance || 0).toFixed(2)}
              </span>
            </td>
            <td>
              {affiliate.default_affiliate_commission_1 > 0 && (
                <small className="d-block text-muted">
                  L1: {affiliate.default_affiliate_commission_1}% | 
                  L2: {affiliate.default_affiliate_commission_2}% | 
                  L3: {affiliate.default_affiliate_commission_3}%
                </small>
              )}
            </td>
            <td>
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => onStatusToggle(affiliate)}
              >
                {togglingStatus === affiliate.id ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  getStatusBadge(affiliate.status)
                )}
              </div>
            </td>
            <td>
              <Button
                variant="info"
                size="sm"
                className="me-2"
                onClick={() => onView(affiliate)}
                title="View Affiliate"
              >
                <FontAwesomeIcon icon={faEye} />
              </Button>
              {hasPermission('edit affiliates') && (
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(affiliate)}
                  title="Edit Affiliate"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
              )}
              {hasPermission('delete affiliates') && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(affiliate.id)}
                  title="Delete Affiliate"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AffiliateTable;