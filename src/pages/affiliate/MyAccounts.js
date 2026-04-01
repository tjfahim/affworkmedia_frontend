// pages/affiliate/MyAccounts.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faSave, faTimes, faCreditCard, faSync, 
  faUniversity, faCoins, faEllipsisH, faInfoCircle,
  faCheckCircle, faClock, faLock, faTimesCircle, faEdit,
  faPercent
} from "@fortawesome/free-solid-svg-icons";
import { 
  Row, Col, Card, Form, Button, Alert, Badge, Spinner
} from '@themesberg/react-bootstrap';
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";

export default function MyAccounts() {
  const { user, updateUser, fetchUserProfile } = useAuth();
  const toast = useToast();

  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [requestingPayment, setRequestingPayment] = useState(false);
  const [requestingPaymentType, setRequestingPaymentType] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    pay_method: '',
    account_email: '',
    paypal: '',
    payoneer: '',
    binance: '',
    bank_details: '',
    other_payment_method_description: '',
  });

  // Payment method status states
  const [paymentStatuses, setPaymentStatuses] = useState({
    edit_paypal_mail_status: 'deactive',
    edit_payoneer_mail_status: 'deactive',
    edit_bank_details_status: 'deactive',
    edit_binance_mail_status: 'deactive',
    edit_other_payment_method_description_status: 'deactive',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        pay_method: user.pay_method || '',
        account_email: user.account_email || '',
        paypal: user.paypal || '',
        payoneer: user.payoneer || '',
        binance: user.binance || '',
        bank_details: user.bank_details || '',
        other_payment_method_description: user.other_payment_method_description || '',
      });

      setPaymentStatuses({
        edit_paypal_mail_status: user.edit_paypal_mail_status || 'deactive',
        edit_payoneer_mail_status: user.edit_payoneer_mail_status || 'deactive',
        edit_bank_details_status: user.edit_bank_details_status || 'deactive',
        edit_binance_mail_status: user.edit_binance_mail_status || 'deactive',
        edit_other_payment_method_description_status: user.edit_other_payment_method_description_status || 'deactive',
      });
    }
  }, [user]);

  // Refresh user data from API
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (fetchUserProfile) {
        const freshUser = await fetchUserProfile();
        if (freshUser) {
          toast.success('Account details refreshed successfully!');
        } else {
          toast.error('Failed to refresh account details');
        }
      } else {
        const response = await userAPI.getProfile();
        if (response.data && response.data.success) {
          updateUser(response.data.user);
          toast.success('Account details refreshed successfully!');
        } else {
          toast.error('Failed to refresh account details');
        }
      }
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh account details');
    } finally {
      setRefreshing(false);
    }
  };

  // Check if a specific payment method can be edited
  const canEditPaymentMethod = (status) => {
    return status === 'active';
  };

  // Check if a payment method can be requested (only when deactive)
  const canRequestPaymentMethod = (status) => {
    return status === 'deactive';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await userAPI.updateProfile(formData);
      if (response.data.success) {
        toast.success('Account details updated successfully!');
        setEditMode(false);
        updateUser(response.data.user);
      } else {
        toast.error(response.data.message || 'Failed to update account');
      }
    } catch (err) {
      console.error('Update error:', err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(err.response?.data?.message || 'Failed to update account');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPaymentChange = async (paymentType, value) => {
    // Check if status is deactive before allowing request
    let currentStatus;
    switch(paymentType) {
      case 'paypal':
        currentStatus = paymentStatuses.edit_paypal_mail_status;
        break;
      case 'payoneer':
        currentStatus = paymentStatuses.edit_payoneer_mail_status;
        break;
      case 'bank':
        currentStatus = paymentStatuses.edit_bank_details_status;
        break;
      case 'binance':
        currentStatus = paymentStatuses.edit_binance_mail_status;
        break;
      case 'other':
        currentStatus = paymentStatuses.edit_other_payment_method_description_status;
        break;
      default:
        currentStatus = 'deactive';
    }

    if (currentStatus !== 'deactive') {
      toast.error(`Cannot request activation - Payment method is ${currentStatus === 'active' ? 'already active' : 'pending approval'}`);
      return;
    }

    setRequestingPayment(true);
    setRequestingPaymentType(paymentType);

    try {
      // Get the current value from formData
      let currentValue;
      switch(paymentType) {
        case 'paypal':
          currentValue = formData.paypal;
          break;
        case 'payoneer':
          currentValue = formData.payoneer;
          break;
        case 'bank':
          currentValue = formData.bank_details;
          break;
        case 'binance':
          currentValue = formData.binance;
          break;
        case 'other':
          currentValue = formData.other_payment_method_description;
          break;
        default:
          currentValue = '';
      }

      const response = await api.post('/affiliate/request-payment-change', {
        payment_type: paymentType,
        value: currentValue || ''
      });

      if (response.data.success) {
        toast.success('Payment method activation request submitted successfully!');
        
        // Update local status to show it's pending
        if (paymentType === 'bank') {
          setPaymentStatuses(prev => ({ ...prev, edit_bank_details_status: 'requested' }));
        } else if (paymentType === 'other') {
          setPaymentStatuses(prev => ({ ...prev, edit_other_payment_method_description_status: 'requested' }));
        } else {
          setPaymentStatuses(prev => ({ ...prev, [`edit_${paymentType}_mail_status`]: 'requested' }));
        }
        
        // Update user data from response
        if (response.data.user) {
          updateUser(response.data.user);
        } else {
          const profileResponse = await userAPI.getProfile();
          if (profileResponse.data.success) {
            updateUser(profileResponse.data.user);
          }
        }
      } else {
        toast.error(response.data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Request payment change error:', err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit request');
      }
    } finally {
      setRequestingPayment(false);
      setRequestingPaymentType(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Active</Badge>;
      case 'deactive':
        return <Badge bg="secondary"><FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Inactive</Badge>;
      case 'requested':
        return <Badge bg="warning"><FontAwesomeIcon icon={faClock} className="me-1" /> Pending Approval</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const paymentMethods = [
    {
      key: 'paypal',
      title: 'PayPal',
      icon: faCreditCard,
      value: formData.paypal,
      status: paymentStatuses.edit_paypal_mail_status,
      field: 'paypal'
    },
    {
      key: 'payoneer',
      title: 'Payoneer',
      icon: faCreditCard,
      value: formData.payoneer,
      status: paymentStatuses.edit_payoneer_mail_status,
      field: 'payoneer'
    },
    {
      key: 'bank',
      title: 'Bank Transfer',
      icon: faUniversity,
      value: formData.bank_details,
      status: paymentStatuses.edit_bank_details_status,
      field: 'bank_details'
    },
    {
      key: 'binance',
      title: 'Binance',
      icon: faCoins,
      value: formData.binance,
      status: paymentStatuses.edit_binance_mail_status,
      field: 'binance'
    },
    {
      key: 'other',
      title: 'Other Payment Method',
      icon: faEllipsisH,
      value: formData.other_payment_method_description,
      status: paymentStatuses.edit_other_payment_method_description_status,
      field: 'other_payment_method_description'
    }
  ];

  const hasEditablePaymentMethod = () => {
    return paymentMethods.some(m => m.status === 'active');
  };

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-md-0">
          <h4>My Account</h4>
          <p className="mb-0">Manage your payment methods and account settings</p>
        </div>
        <div className="d-flex gap-2">
          {/* Refresh Button */}
          <Button 
            variant="outline-info" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh account data"
          >
            {refreshing ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Refreshing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSync} className="me-1" />
                Refresh
              </>
            )}
          </Button>
          
          {!editMode ? (
            <Button variant="primary" size="sm" onClick={() => setEditMode(true)}>
              <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit Account
            </Button>
          ) : (
            <div>
              <Button variant="success" size="sm" onClick={handleSubmit} disabled={saving} className="me-2">
                {saving ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => setEditMode(false)}>
                <FontAwesomeIcon icon={faTimes} className="me-2" /> Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <Row>
        {/* Account Summary */}
        <Col xs={12} xl={4} className="mb-4">
          <Card border="light" className="text-center p-0">
            <Card.Body className="pb-5">
              <div className="xl-avatar">
                <FontAwesomeIcon icon={faUser} size="3x" className="text-gray" />
              </div>
              <div className="mt-3">
                <h5>{user.first_name} {user.last_name}</h5>
                <p className="text-gray mb-2">{user.email}</p>
                <div className="mt-2">
                  {user.roles?.map(role => (
                    <Badge 
                      key={role.id} 
                      bg={role.name === 'super-admin' ? 'danger' : role.name === 'admin' ? 'warning' : 'info'}
                      className="me-1"
                    >
                      {role.name}
                    </Badge>
                  ))}
                </div>
                <Badge bg={user.status === 'active' ? 'success' : 'secondary'} className="text-uppercase mt-2">
                  {user.status}
                </Badge>
              </div>
            </Card.Body>
          </Card>

          <Card border="light" className="mt-4">
            <Card.Body>
              <h5 className="mb-3">Account Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Balance:</span>
                <strong className="text-success">${user.balance || '0.00'}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Member Since:</span>
                <strong>{new Date(user.created_at).toLocaleDateString()}</strong>
              </div>
              <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                <span className="text-muted small">Last Updated:</span>
                <small className="text-muted">
                  {new Date().toLocaleTimeString()}
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Commission Settings */}
          <Card border="light" className="mt-4">
            <Card.Body>
              <h5 className="mb-3">
                <FontAwesomeIcon icon={faPercent} className="me-2 text-primary" />
                Commission Settings
              </h5>
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="text-muted">Level 1 Commission</span>
                    <div className="fw-bold text-primary h4 mb-0">
                      {user.default_affiliate_commission_1 || 0}%
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-muted">Level 2 Commission</span>
                    <div className="fw-bold text-info h4 mb-0">
                      {user.default_affiliate_commission_2 || 0}%
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                  <div>
                    <span className="text-muted">Level 3 Commission</span>
                    <div className="fw-bold text-warning h4 mb-0">
                      {user.default_affiliate_commission_3 || 0}%
                    </div>
                  </div>
                </div>
              
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Payment Details */}
        <Col xs={12} xl={8}>
          <Card border="light">
            <Card.Body>
              <h5 className="mb-3">
                <FontAwesomeIcon icon={faCreditCard} className="me-2 text-primary" />
                Payment Methods
              </h5>

              <Form.Group className="mb-3">
                <Form.Label>Preferred Payment Method</Form.Label>
                <Form.Select
                  name="pay_method"
                  value={formData.pay_method}
                  onChange={handleInputChange}
                  disabled={!editMode}
                >
                  <option value="">Select Payment Method</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="payoneer">Payoneer</option>
                  <option value="binance">Binance</option>
                  <option value="other">Other</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Choose your preferred payment method for receiving commissions
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Account Email</Form.Label>
                <Form.Control
                  type="email"
                  name="account_email"
                  value={formData.account_email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="Email for payment notifications"
                />
              </Form.Group>

              {/* All Payment Methods */}
              {paymentMethods.map(method => (
                <div className="border rounded p-3 mb-3" key={method.key}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <FontAwesomeIcon icon={method.icon} className="me-2 text-primary" />
                      <strong>{method.title}</strong>
                    </div>
                    {getStatusBadge(method.status)}
                  </div>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>{method.title} Details</Form.Label>
                    <Form.Control
                      type={method.title === 'Bank Transfer' ? 'textarea' : 'text'}
                      as={method.title === 'Bank Transfer' ? 'textarea' : 'input'}
                      rows={method.title === 'Bank Transfer' ? 3 : 1}
                      name={method.field}
                      value={method.value || ''}
                      onChange={(e) => handleFormFieldChange(method.field, e.target.value)}
                      disabled={!editMode || !canEditPaymentMethod(method.status)}
                      placeholder={`Enter your ${method.title.toLowerCase()} details`}
                    />
                    {!canEditPaymentMethod(method.status) && editMode && (
                      <Form.Text className="text-warning">
                        <FontAwesomeIcon icon={faLock} className="me-1" />
                        Cannot edit - Payment method is {method.status === 'requested' ? 'pending approval' : 'inactive'}. 
                        {method.status === 'deactive' && ' Request activation to enable editing.'}
                      </Form.Text>
                    )}
                  </Form.Group>
                  
                  {/* Request button for deactive status */}
                  {!editMode && method.status === 'deactive' && canRequestPaymentMethod(method.status) && (
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => handleRequestPaymentChange(method.key, method.value)}
                      disabled={requestingPayment && requestingPaymentType === method.key}
                      className="mt-2"
                    >
                      {requestingPayment && requestingPaymentType === method.key ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          Submitting...
                        </>
                      ) : (
                        'Request Activation'
                      )}
                    </Button>
                  )}
                  
                  {/* Status messages */}
                  {!editMode && method.status === 'active' && (
                    <Alert variant="success" className="mb-0 p-2 small mt-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                      This payment method is active and ready to use.
                    </Alert>
                  )}
                  
                  {!editMode && method.status === 'requested' && (
                    <Alert variant="info" className="mb-0 p-2 small mt-2">
                      <FontAwesomeIcon icon={faClock} className="me-1" />
                      Your request is pending admin approval.
                    </Alert>
                  )}
                </div>
              ))}

              {!editMode && (
                <Alert variant="info" className="mt-3">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  To activate a payment method, enter your details and click "Request Activation". 
                  Once approved by admin, you'll be able to edit the details.
                </Alert>
              )}
              
              {editMode && !hasEditablePaymentMethod() && (
                <Alert variant="warning" className="mt-3">
                  <FontAwesomeIcon icon={faLock} className="me-2" />
                  No active payment methods. You need to request activation for a payment method first before you can edit it.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}