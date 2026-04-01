// pages/MyAccounts.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faSave, faTimes, faCreditCard
} from "@fortawesome/free-solid-svg-icons";
import { 
  Row, Col, Card, Form, Button, Alert, Badge, Spinner 
} from '@themesberg/react-bootstrap';
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";

export default function MyAccounts() {
  const { user, updateUser } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    pay_method: '',
    account_email: '',
    paypal: '',
    payoneer: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        pay_method: user.pay_method || 'bank',
        account_email: user.account_email || '',
        paypal: user.paypal || '',
        payoneer: user.payoneer || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await userAPI.updateProfile(formData);
      if (response.data.success) {
        setSuccess('Account details updated successfully!');
        setEditMode(false);
        updateUser(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update account');
    } finally {
      setSaving(false);
    }
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
          <h4>My Account</h4>
          <p className="mb-0">Update your payment details and view account summary</p>
        </div>
        {!editMode ? (
          <Button variant="primary" size="sm" onClick={() => setEditMode(true)}>
            <FontAwesomeIcon icon={faCreditCard} className="me-2" /> Edit Account
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

        {/* Payment Details */}
        <Col xs={12} xl={8}>
          <Card border="light">
            <Card.Body>
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
                  </Form.Select>
                </Form.Group>

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
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}