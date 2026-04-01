// components/affiliate/PaymentMethodStatusManager.js
import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Tabs, Tab, Spinner, Alert, Modal } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCreditCard, 
  faUniversity, 
  faCoins, 
  faEllipsisH,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faEdit,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../../context/ToastContext';
import affiliateAPI from '../../../services/affiliateService';

const PaymentMethodStatusManager = ({ onRefresh }) => {
  const toast = useToast();
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchAllAffiliates();
  }, []);

  const fetchAllAffiliates = async () => {
    try {
      setLoading(true);
      const response = await affiliateAPI.getAffiliates(1, 1000);
      if (response.data && response.data.success === true && response.data.affiliates) {
        setAffiliates(response.data.affiliates.data);
      }
    } catch (error) {
      console.error('Failed to fetch affiliates:', error);
      toast.error('Failed to fetch affiliates');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Active</Badge>;
      case 'deactive':
        return <Badge bg="secondary"><FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Inactive</Badge>;
      case 'requested':
        return <Badge bg="warning"><FontAwesomeIcon icon={faClock} className="me-1" /> Requested</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'paypal':
        return faCreditCard;
      case 'payoneer':
        return faCreditCard;
      case 'bank':
        return faUniversity;
      case 'binance':
        return faCoins;
      default:
        return faEllipsisH;
    }
  };

  const getPaymentMethodValue = (affiliate, method) => {
    switch(method) {
      case 'paypal':
        return affiliate.paypal || 'Not provided';
      case 'payoneer':
        return affiliate.payoneer || 'Not provided';
      case 'bank':
        return affiliate.bank_details || 'Not provided';
      case 'binance':
        return affiliate.binance || 'Not provided';
      case 'other':
        return affiliate.other_payment_method_description || 'Not provided';
      default:
        return 'Not provided';
    }
  };

  const getPaymentStatus = (affiliate, method) => {
    switch(method) {
      case 'paypal':
        return affiliate.edit_paypal_mail_status;
      case 'payoneer':
        return affiliate.edit_payoneer_mail_status;
      case 'bank':
        return affiliate.edit_bank_details_status;
      case 'binance':
        return affiliate.edit_binance_mail_status;
      case 'other':
        return affiliate.edit_other_payment_method_description_status;
      default:
        return 'deactive';
    }
  };

  const getAffiliatesWithStatus = (status) => {
    return affiliates.filter(affiliate => {
      return affiliate.edit_paypal_mail_status === status ||
             affiliate.edit_payoneer_mail_status === status ||
             affiliate.edit_bank_details_status === status ||
             affiliate.edit_binance_mail_status === status ||
             affiliate.edit_other_payment_method_description_status === status;
    });
  };

  const getPaymentMethodsWithStatus = (affiliate, status) => {
    const methods = [];
    const paymentMethods = ['paypal', 'payoneer', 'bank', 'binance', 'other'];
    
    paymentMethods.forEach(method => {
      if (getPaymentStatus(affiliate, method) === status) {
        methods.push(method);
      }
    });
    
    return methods;
  };

  const handleUpdateStatus = async (affiliateId, paymentMethod, newStatus) => {
    setUpdating(true);
    try {
      const updateData = {};
      switch(paymentMethod) {
        case 'paypal':
          updateData.edit_paypal_mail_status = newStatus;
          break;
        case 'payoneer':
          updateData.edit_payoneer_mail_status = newStatus;
          break;
        case 'bank':
          updateData.edit_bank_details_status = newStatus;
          break;
        case 'binance':
          updateData.edit_binance_mail_status = newStatus;
          break;
        case 'other':
          updateData.edit_other_payment_method_description_status = newStatus;
          break;
      }
      
      const response = await affiliateAPI.updatePaymentStatus(affiliateId, updateData);
      
      if (response.data && response.data.success === true) {
        toast.success(`${paymentMethod.toUpperCase()} status updated to ${newStatus}`);
        fetchAllAffiliates();
        setShowStatusModal(false);
      } else {
        toast.error(response.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowStatusModal(true);
  };

  const filteredAffiliates = () => {
    if (activeTab === 'pending') {
      return getAffiliatesWithStatus('requested');
    } else if (activeTab === 'active') {
      return getAffiliatesWithStatus('active');
    } else {
      return getAffiliatesWithStatus('deactive');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading payment requests...</p>
      </div>
    );
  }

  const pendingCount = getAffiliatesWithStatus('requested').length;
  const activeCount = getAffiliatesWithStatus('active').length;
  const inactiveCount = getAffiliatesWithStatus('deactive').length;

  return (
    <div>
      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h6 className="text-muted">Pending Requests</h6>
              <h3 className="mb-0 text-warning">{pendingCount}</h3>
              <small className="text-muted">Awaiting approval</small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h6 className="text-muted">Active Methods</h6>
              <h3 className="mb-0 text-success">{activeCount}</h3>
              <small className="text-muted">Approved and active</small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h6 className="text-muted">Inactive Methods</h6>
              <h3 className="mb-0 text-secondary">{inactiveCount}</h3>
              <small className="text-muted">Not active</small>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={setActiveTab}
        className="mb-4"
      >
        <Tab 
          eventKey="pending" 
          title={
            <span>
              <FontAwesomeIcon icon={faClock} className="me-2" />
              Pending Requests ({pendingCount})
            </span>
          } 
        />
        <Tab 
          eventKey="active" 
          title={
            <span>
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Active ({activeCount})
            </span>
          } 
        />
        <Tab 
          eventKey="inactive" 
          title={
            <span>
              <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
              Inactive ({inactiveCount})
            </span>
          } 
        />
      </Tabs>

      {/* Affiliates Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Affiliate</th>
                <th>Email</th>
                <th>Payment Methods with Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAffiliates().length > 0 ? (
                filteredAffiliates().map(affiliate => {
                  const paymentMethods = getPaymentMethodsWithStatus(affiliate, activeTab === 'pending' ? 'requested' : activeTab === 'active' ? 'active' : 'deactive');
                  
                  return (
                    <tr key={affiliate.id}>
                      <td>
                        <div className="fw-bold">{affiliate.first_name} {affiliate.last_name}</div>
                        <small className="text-muted">ID: {affiliate.id}</small>
                      </td>
                      <td>{affiliate.email}</td>
                      <td>
                        {paymentMethods.map(method => (
                          <div key={method} className="mb-2">
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon 
                                icon={getPaymentMethodIcon(method)} 
                                className="me-2 text-primary" 
                              />
                              <strong className="me-2">{method.toUpperCase()}:</strong>
                              <span className="text-muted me-2">
                                {getPaymentMethodValue(affiliate, method)}
                              </span>
                              {getStatusBadge(getPaymentStatus(affiliate, method))}
                            </div>
                          </div>
                        ))}
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openStatusModal(affiliate)}
                        >
                          <FontAwesomeIcon icon={faEdit} className="me-1" />
                          Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <h5>No affiliates found</h5>
                    <p className="text-muted">No affiliates with {activeTab} payment methods</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Status Management Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faSync} className="me-2 text-primary" />
            Manage Payment Methods - {selectedAffiliate?.first_name} {selectedAffiliate?.last_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAffiliate && (
            <>
              <div className="mb-3">
                <h6>Affiliate Information</h6>
                <p className="text-muted">Email: {selectedAffiliate.email}</p>
              </div>
              
              <h6 className="mb-3">Payment Method Statuses</h6>
              
              {/* PayPal Status */}
              <div className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <FontAwesomeIcon icon={faCreditCard} className="me-2 text-primary" />
                    <strong>PayPal</strong>
                  </div>
                  {getStatusBadge(selectedAffiliate.edit_paypal_mail_status)}
                </div>
                <p className="text-muted small mb-2">
                  {selectedAffiliate.paypal || 'No PayPal email provided'}
                </p>
                <div className="d-flex gap-2">
                  <Button 
                    size="sm" 
                    variant="success"
                    onClick={() => handleUpdateStatus(selectedAffiliate.id, 'paypal', 'active')}
                    disabled={selectedAffiliate.edit_paypal_mail_status === 'active'}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    Activate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleUpdateStatus(selectedAffiliate.id, 'paypal', 'deactive')}
                    disabled={selectedAffiliate.edit_paypal_mail_status === 'deactive'}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                    Deactivate
                  </Button>
                </div>
              </div>
              
              {/* Payoneer Status */}
              <div className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <FontAwesomeIcon icon={faCreditCard} className="me-2 text-primary" />
                    <strong>Payoneer</strong>
                  </div>
                  {getStatusBadge(selectedAffiliate.edit_payoneer_mail_status)}
                </div>
                <p className="text-muted small mb-2">
                  {selectedAffiliate.payoneer || 'No Payoneer account provided'}
                </p>
                <div className="d-flex gap-2">
                  <Button 
                    size="sm" 
                    variant="success"
                    onClick={() => handleUpdateStatus(selectedAffiliate.id, 'payoneer', 'active')}
                    disabled={selectedAffiliate.edit_payoneer_mail_status === 'active'}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    Activate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleUpdateStatus(selectedAffiliate.id, 'payoneer', 'deactive')}
                    disabled={selectedAffiliate.edit_payoneer_mail_status === 'deactive'}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                    Deactivate
                  </Button>
                </div>
              </div>
              
              {/* Bank Details Status */}
              <div className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <FontAwesomeIcon icon={faUniversity} className="me-2 text-primary" />
                    <strong>Bank Transfer</strong>
                  </div>
                  {getStatusBadge(selectedAffiliate.edit_bank_details_status)}
                </div>
                <p className="text-muted small mb-2">
                  {selectedAffiliate.bank_details || 'No bank details provided'}
                </p>
                <div className="d-flex gap-2">
                  <Button 
                    size="sm" 
                    variant="success"
                    onClick={() => handleUpdateStatus(selectedAffiliate.id, 'bank', 'active')}
                    disabled={selectedAffiliate.edit_bank_details_status === 'active'}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    Activate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleUpdateStatus(selectedAffiliate.id, 'bank', 'deactive')}
                    disabled={selectedAffiliate.edit_bank_details_status === 'deactive'}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                    Deactivate
                  </Button>
                </div>
              </div>
              
              {/* Binance Status */}
              <div className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <FontAwesomeIcon icon={faCoins} className="me-2 text-primary" />
                    <strong>Binance</strong>
                  </div>
                  {getStatusBadge(selectedAffiliate.edit_binance_mail_status)}
                </div>
                <p className="text-muted small mb-2">
                  {selectedAffiliate.binance || 'No Binance account provided'}
                </p>
                <div className="d-flex gap-2">
                  <Button 
                    size="sm" 
                    variant="success"
                    onClick={() => handleUpdateStatus(selectedAffiliate.id, 'binance', 'active')}
                    disabled={selectedAffiliate.edit_binance_mail_status === 'active'}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    Activate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleUpdateStatus(selectedAffiliate.id, 'binance', 'deactive')}
                    disabled={selectedAffiliate.edit_binance_mail_status === 'deactive'}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                    Deactivate
                  </Button>
                </div>
              </div>
              
              {/* Other Payment Method Status */}
              <div className="border rounded p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <FontAwesomeIcon icon={faEllipsisH} className="me-2 text-primary" />
                    <strong>Other Payment Method</strong>
                  </div>
                  {getStatusBadge(selectedAffiliate.edit_other_payment_method_description_status)}
                </div>
                <p className="text-muted small mb-2">
                  {selectedAffiliate.other_payment_method_description || 'No other payment method provided'}
                </p>
                <div className="d-flex gap-2">
                  <Button 
                    size="sm" 
                    variant="success"
                    onClick={() => handleUpdateStatus(selectedAffiliate.id, 'other', 'active')}
                    disabled={selectedAffiliate.edit_other_payment_method_description_status === 'active'}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    Activate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleUpdateStatus(selectedAffiliate.id, 'other', 'deactive')}
                    disabled={selectedAffiliate.edit_other_payment_method_description_status === 'deactive'}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                    Deactivate
                  </Button>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {updating && (
        <div className="position-fixed top-50 start-50 translate-middle" style={{ zIndex: 9999 }}>
          <Spinner animation="border" variant="primary" />
        </div>
      )}
    </div>
  );
};

export default PaymentMethodStatusManager;