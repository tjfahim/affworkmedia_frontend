// components/affiliate/AffiliateViewModal.js
import React from 'react';
import { Modal, Button, Row, Col, Tabs, Tab, Badge } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faInfoCircle, faUsers, faEnvelope, faBuilding, faGlobe, faDollarSign, faPercentage } from '@fortawesome/free-solid-svg-icons';

const AffiliateViewModal = ({ show, onHide, affiliate, onEdit }) => {
  if (!affiliate) return null;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <Badge bg="success">ACTIVE</Badge>;
      case 'inactive':
        return <Badge bg="warning">INACTIVE</Badge>;
      case 'suspended':
        return <Badge bg="danger">SUSPENDED</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
          Affiliate Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col md={12}>
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FontAwesomeIcon icon={faUsers} size="3x" className="text-primary" />
              </div>
              <h3>{affiliate.first_name} {affiliate.last_name}</h3>
              <div className="mt-2">{getStatusBadge(affiliate.status)}</div>
            </div>
          </Col>
        </Row>

        <Tabs defaultActiveKey="personal" className="mb-3">
          <Tab eventKey="personal" title="Personal Information">
            <div className="mt-3">
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Full Name</label>
                    <p className="fw-bold">{affiliate.first_name} {affiliate.last_name}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Email Address</label>
                    <p className="fw-bold">{affiliate.email}</p>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Skype</label>
                    <p className="fw-bold">{affiliate.skype || 'Not provided'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Joined Date</label>
                    <p className="fw-bold">{new Date(affiliate.created_at).toLocaleDateString()}</p>
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <label className="text-muted small">Address</label>
                <p className="fw-bold">{affiliate.address || 'Not provided'}</p>
              </div>
            </div>
          </Tab>

          <Tab eventKey="professional" title="Professional Info">
            <div className="mt-3">
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Company</label>
                    <p className="fw-bold">{affiliate.company || 'Not provided'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Website</label>
                    <p className="fw-bold">
                      {affiliate.website ? (
                        <a href={affiliate.website} target="_blank" rel="noopener noreferrer">
                          {affiliate.website}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <label className="text-muted small">Promotion Description</label>
                <p className="fw-bold">{affiliate.promotion_description || 'Not provided'}</p>
              </div>
            </div>
          </Tab>

          <Tab eventKey="financial" title="Financial Info">
            <div className="mt-3">
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Balance</label>
                    <p className="fw-bold text-success">${parseFloat(affiliate.balance || 0).toFixed(2)}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Payment Method</label>
                    <p className="fw-bold">{affiliate.pay_method?.toUpperCase() || 'Not set'}</p>
                  </div>
                </Col>
              </Row>

              {affiliate.paypal && (
                <div className="mb-3">
                  <label className="text-muted small">PayPal Email</label>
                  <p className="fw-bold">{affiliate.paypal}</p>
                </div>
              )}

              {affiliate.payoneer && (
                <div className="mb-3">
                  <label className="text-muted small">Payoneer ID/Email</label>
                  <p className="fw-bold">{affiliate.payoneer}</p>
                </div>
              )}

              {affiliate.bank_details && (
                <div className="mb-3">
                  <label className="text-muted small">Bank Details</label>
                  <p className="fw-bold">{affiliate.bank_details}</p>
                </div>
              )}

              {affiliate.binance && (
                <div className="mb-3">
                  <label className="text-muted small">Binance ID/Email</label>
                  <p className="fw-bold">{affiliate.binance}</p>
                </div>
              )}

              {affiliate.other_payment_method_description && (
                <div className="mb-3">
                  <label className="text-muted small">Other Payment Method</label>
                  <p className="fw-bold">{affiliate.other_payment_method_description}</p>
                </div>
              )}

              <div className="mb-3">
                <label className="text-muted small">Account Email</label>
                <p className="fw-bold">{affiliate.account_email || 'Not provided'}</p>
              </div>
            </div>
          </Tab>

          <Tab eventKey="commission" title="Commission Settings">
            <div className="mt-3">
              <h6 className="mt-3">Multi-Level Commissions</h6>
              <Row className="mt-2">
                <Col md={4}>
                  <div className="border rounded p-3 text-center bg-light">
                    <label className="text-muted small">Level 1</label>
                    <p className="fw-bold h4 text-primary">{affiliate.default_affiliate_commission_1 || 0}%</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="border rounded p-3 text-center bg-light">
                    <label className="text-muted small">Level 2</label>
                    <p className="fw-bold h4 text-primary">{affiliate.default_affiliate_commission_2 || 0}%</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="border rounded p-3 text-center bg-light">
                    <label className="text-muted small">Level 3</label>
                    <p className="fw-bold h4 text-primary">{affiliate.default_affiliate_commission_3 || 0}%</p>
                  </div>
                </Col>
              </Row>
 
              <div className="mt-3">
                <label className="text-muted small"> Sale Hide</label>
                <p className="fw-bold">
                  {affiliate.sale_hide  }
                </p>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={() => {
            onHide();
            onEdit(affiliate);
          }}
        >
          <FontAwesomeIcon icon={faEdit} className="me-2" />
          Edit Affiliate
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AffiliateViewModal;