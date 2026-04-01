// pages/Profile.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faSave, faEdit, faTimes, faKey, faCheckCircle, faClock, faLock,
  faSync, faRefresh
} from "@fortawesome/free-solid-svg-icons";
import { 
  Row, Col, Card, Form, Button, Alert, Nav as BSNav, Badge, Spinner 
} from '@themesberg/react-bootstrap';
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

// Import components
import ProfileInfoSection from "./components/profile/ProfileInfoSection";
import AffiliatePaymentSection from "./components/profile/AffiliatePaymentSection";
import AffiliateCommissionSection from "./components/profile/AffiliateCommissionSection";

export default function Profile() {
  const { user, updateUser, fetchUserProfile } = useAuth();
  const toast = useToast();
  
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [requestingPayment, setRequestingPayment] = useState(false);
  const [requestingPaymentType, setRequestingPaymentType] = useState(null);

  // Check if user is affiliate
  const isAffiliate = user?.roles?.some(role => 
    role.name === 'affiliate' || role.name === 'Affiliate'
  );

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    pay_method: '',
    account_email: '',
    skype: '',
    company: '',
    website: '',
    promotion_description: '',
    payoneer: '',
    paypal: '',
    binance: '',
    bank_details: '',
    other_payment_method_description: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
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
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        address: user.address || '',
        pay_method: user.pay_method || '',
        account_email: user.account_email || '',
        skype: user.skype || '',
        company: user.company || '',
        website: user.website || '',
        promotion_description: user.promotion_description || '',
        payoneer: user.payoneer || '',
        paypal: user.paypal || '',
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
          toast.success('Profile refreshed successfully!');
        } else {
          toast.error('Failed to refresh profile');
        }
      } else {
        // Fallback if fetchUserProfile is not available
        const response = await userAPI.getProfile();
        if (response.data && response.data.success) {
          updateUser(response.data.user);
          toast.success('Profile refreshed successfully!');
        } else {
          toast.error('Failed to refresh profile');
        }
      }
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh profile');
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await userAPI.updateProfile(formData);
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setEditMode(false);
        updateUser(response.data.user);
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(err.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);

    try {
      const response = await userAPI.changePassword(passwordData);
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Change password error:', err);
      toast.error(err.response?.data?.message || 'Failed to change password');
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
        value: currentValue || '' // Send empty string if no value
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

  const getRoleBadge = () => {
    if (!user?.roles) return null;
    
    return user.roles.map(role => (
      <Badge 
        key={role.id} 
        bg={role.name === 'super-admin' ? 'danger' : role.name === 'admin' ? 'warning' : 'info'}
        className="me-2 text-uppercase"
      >
        {role.name}
      </Badge>
    ));
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-md-0">
          <h4>Profile Settings</h4>
          <p className="mb-0">Manage your account settings and preferences</p>
        </div>
        <div className="d-flex gap-2">
          {/* Refresh Button */}
          <Button 
            variant="outline-info" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh profile data"
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
              <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit Profile
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
        <Col xs={12} xl={4} className="mb-4">
          <Card border="light" className="text-center p-0">
            <Card.Body className="pb-5">
              <div className="xl-avatar">
                <FontAwesomeIcon icon={faUser} size="3x" className="text-gray" />
              </div>
              <div className="mt-3">
                <h5>{user.first_name} {user.last_name}</h5>
                <p className="text-gray mb-2">{user.email}</p>
                <div className="p-3">
                  {getRoleBadge()}
                </div>
                <Badge bg={user.status === 'active' ? 'success' : 'secondary'} className="text-uppercase">
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
        </Col>

        <Col xs={12} xl={8}>
          <Card border="light" className="mb-4">
            <Card.Body>
              <BSNav variant="tabs" className="mb-4">
                <BSNav.Item>
                  <BSNav.Link 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile Information
                  </BSNav.Link>
                </BSNav.Item>
                {isAffiliate && (
                  <BSNav.Item>
                    <BSNav.Link 
                      active={activeTab === 'payment'} 
                      onClick={() => setActiveTab('payment')}
                    >
                      Payment Details
                    </BSNav.Link>
                  </BSNav.Item>
                )}
                {isAffiliate && (
                  <BSNav.Item>
                    <BSNav.Link 
                      active={activeTab === 'affiliate'} 
                      onClick={() => setActiveTab('affiliate')}
                    >
                      Affiliate Settings
                    </BSNav.Link>
                  </BSNav.Item>
                )}
                <BSNav.Item>
                  <BSNav.Link 
                    active={activeTab === 'password'} 
                    onClick={() => setActiveTab('password')}
                  >
                    Change Password
                  </BSNav.Link>
                </BSNav.Item>
              </BSNav>

              {activeTab === 'profile' && (
                <ProfileInfoSection 
                  formData={formData}
                  editMode={editMode}
                  onInputChange={handleInputChange}
                />
              )}

              {activeTab === 'payment' && isAffiliate && (
                <AffiliatePaymentSection
                  formData={formData}
                  paymentStatuses={paymentStatuses}
                  editMode={editMode}
                  requestingPayment={requestingPayment}
                  requestingPaymentType={requestingPaymentType}
                  onFormChange={handleFormFieldChange}
                  onRequestActivation={handleRequestPaymentChange}
                  canEditPaymentMethod={canEditPaymentMethod}
                  canRequestPaymentMethod={canRequestPaymentMethod}
                />
              )}

              {activeTab === 'affiliate' && isAffiliate && (
                <AffiliateCommissionSection user={user} />
              )}

              {activeTab === 'password' && (
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="new_password_confirmation"
                      value={passwordData.new_password_confirmation}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faKey} className="me-2" />}
                    Change Password
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}