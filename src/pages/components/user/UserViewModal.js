// components/user/UserViewModal.js
import React from 'react';
import { Modal, Button, Row, Col, Tabs, Tab, Badge } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUser, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

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

const UserViewModal = ({ show, onHide, user, onEdit, hasPermission }) => {
  if (!user) return null;

  const isSuperAdmin = user.roles?.some(r => r.name === 'super-admin');

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
          User Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
            <FontAwesomeIcon icon={faUser} size="3x" className="text-primary" />
          </div>
          <h3>{user.first_name} {user.last_name}</h3>
          <div className="mt-2">
            {user.roles && user.roles.map(role => (
              <Badge key={role.id} bg={roleColors[role.name] || roleColors.default} className="me-2">
                {role.name}
              </Badge>
            ))}
            {getStatusBadge(user.status)}
          </div>
        </div>

        <Tabs defaultActiveKey="personal" className="mb-3">
          <Tab eventKey="personal" title="Personal Info">
            <div className="mt-3">
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Full Name</label>
                    <p className="fw-bold">{user.first_name} {user.last_name}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Email</label>
                    <p className="fw-bold">{user.email}</p>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Company</label>
                    <p className="fw-bold">{user.company || 'Not provided'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Website</label>
                    <p className="fw-bold">
                      {user.website ? (
                        <a href={user.website} target="_blank" rel="noopener noreferrer">
                          {user.website}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Skype</label>
                    <p className="fw-bold">{user.skype || 'Not provided'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Address</label>
                    <p className="fw-bold">{user.address || 'Not provided'}</p>
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <label className="text-muted small">Promotion Description</label>
                <p className="fw-bold">{user.promotion_description || 'Not provided'}</p>
              </div>
            </div>
          </Tab>

          <Tab eventKey="financial" title="Financial Info">
            <div className="mt-3">
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Balance</label>
                    <p className="fw-bold text-success">${parseFloat(user.balance || 0).toFixed(2)}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Payment Method</label>
                    <p className="fw-bold">{user.pay_method?.toUpperCase() || 'Not set'}</p>
                  </div>
                </Col>
              </Row>

              {user.paypal && (
                <div className="mb-3">
                  <label className="text-muted small">PayPal Email</label>
                  <p className="fw-bold">{user.paypal}</p>
                </div>
              )}

              {user.payoneer && (
                <div className="mb-3">
                  <label className="text-muted small">Payoneer ID/Email</label>
                  <p className="fw-bold">{user.payoneer}</p>
                </div>
              )}

              {user.bank_details && (
                <div className="mb-3">
                  <label className="text-muted small">Bank Details</label>
                  <p className="fw-bold">{user.bank_details}</p>
                </div>
              )}

              {user.binance && (
                <div className="mb-3">
                  <label className="text-muted small">Binance ID/Email</label>
                  <p className="fw-bold">{user.binance}</p>
                </div>
              )}

              {user.other_payment_method_description && (
                <div className="mb-3">
                  <label className="text-muted small">Other Payment Method</label>
                  <p className="fw-bold">{user.other_payment_method_description}</p>
                </div>
              )}

              <div className="mb-3">
                <label className="text-muted small">Account Email</label>
                <p className="fw-bold">{user.account_email || 'Not provided'}</p>
              </div>
            </div>
          </Tab>

          {user.roles?.some(r => r.name === 'affiliate') && (
            <Tab eventKey="affiliate" title="Affiliate Settings">
              <div className="mt-3">
              

                <h6 className="mt-3">Multi-Level Commissions</h6>
                <Row className="mt-2">
                  <Col md={4}>
                    <div className="border rounded p-2 text-center bg-light">
                      <label className="text-muted small">Level 1</label>
                      <p className="fw-bold h5 text-primary">{user.default_affiliate_commission_1 || 0}%</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="border rounded p-2 text-center bg-light">
                      <label className="text-muted small">Level 2</label>
                      <p className="fw-bold h5 text-primary">{user.default_affiliate_commission_2 || 0}%</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="border rounded p-2 text-center bg-light">
                      <label className="text-muted small">Level 3</label>
                      <p className="fw-bold h5 text-primary">{user.default_affiliate_commission_3 || 0}%</p>
                    </div>
                  </Col>
                </Row>

               
                <div className="mt-2">
                  <label className="text-muted small">Sale Hide </label>
                  <p className="fw-bold">{user.sale_hide}</p>
                </div>
              </div>
            </Tab>
          )}
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {hasPermission('edit users') && !isSuperAdmin && (
          <Button 
            variant="primary" 
            onClick={() => {
              onHide();
              onEdit(user);
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Edit User
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default UserViewModal;