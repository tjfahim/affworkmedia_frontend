import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faSave,
  faEdit, faTimes, faKey
} from "@fortawesome/free-solid-svg-icons";
import { 
  Row, Col, Card, Form, Button, Alert, Nav as BSNav, Badge, Spinner 
} from '@themesberg/react-bootstrap';
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";

export default function Profile() {
  const { user, updateUser } = useAuth();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

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
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        address: user.address || '',
        pay_method: user.pay_method || 'bank',
        account_email: user.account_email || '',
        skype: user.skype || '',
        company: user.company || '',
        website: user.website || '',
        promotion_description: user.promotion_description || '',
        payoneer: user.payoneer || '',
        paypal: user.paypal || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await userAPI.updateProfile(formData);
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        setEditMode(false);
        // Update local user data
       updateUser(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await userAPI.changePassword(passwordData);
      if (response.data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
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

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

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
                <BSNav.Item>
                  <BSNav.Link 
                    active={activeTab === 'payment'} 
                    onClick={() => setActiveTab('payment')}
                  >
                    Payment Details
                  </BSNav.Link>
                </BSNav.Item>
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
  <Form>
    <Row>
      <Col md={6} className="mb-3">
        <Form.Group>
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            disabled={!editMode}
          />
        </Form.Group>
      </Col>

      <Col md={6} className="mb-3">
        <Form.Group>
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            disabled={!editMode}
          />
        </Form.Group>
      </Col>
    </Row>

    <Form.Group className="mb-3">
      <Form.Label>Email</Form.Label>
      <Form.Control
        type="email"
        name="email"
        value={formData.email}
        disabled
      />
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Address</Form.Label>
      <Form.Control
        type="text"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        disabled={!editMode}
      />
    </Form.Group>

    <>
      <Form.Group className="mb-3">
        <Form.Label>Company</Form.Label>
        <Form.Control
          type="text"
          name="company"
          value={formData.company}
          onChange={handleInputChange}
          disabled={!editMode}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Website</Form.Label>
        <Form.Control
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          disabled={!editMode}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Skype</Form.Label>
        <Form.Control
          type="text"
          name="skype"
          value={formData.skype}
          onChange={handleInputChange}
          disabled={!editMode}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Promotion Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="promotion_description"
          value={formData.promotion_description}
          onChange={handleInputChange}
          disabled={!editMode}
        />
      </Form.Group>
    </>
  </Form>
)}

              {activeTab === 'payment' && (
  <Form>
    <Form.Group className="mb-3">
      <Form.Label>Payment Method</Form.Label>
      <Form.Select
        name="pay_method"
        value={formData.pay_method}
        onChange={handleInputChange}
        disabled={!editMode}
      >
        <option value="bank">Bank Transfer</option>
        <option value="paypal">PayPal</option>
        <option value="payoneer">Payoneer</option>
        <option value="wise">Wise</option>
      </Form.Select>
    </Form.Group>

    <>
      <Form.Group className="mb-3">
        <Form.Label>Account Email</Form.Label>
        <Form.Control
          type="email"
          name="account_email"
          value={formData.account_email}
          onChange={handleInputChange}
          disabled={!editMode}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>PayPal Email</Form.Label>
        <Form.Control
          type="email"
          name="paypal"
          value={formData.paypal}
          onChange={handleInputChange}
          disabled={!editMode}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Payoneer Email</Form.Label>
        <Form.Control
          type="email"
          name="payoneer"
          value={formData.payoneer}
          onChange={handleInputChange}
          disabled={!editMode}
        />
      </Form.Group>
    </>
  </Form>
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