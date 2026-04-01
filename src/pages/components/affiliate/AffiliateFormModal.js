// components/affiliate/AffiliateFormModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Tabs, Tab, Spinner, Alert } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUserPlus, faEye, faEyeSlash, faKey } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../../context/ToastContext';


const AffiliateFormModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  selectedAffiliate,
  loading 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [affiliateForm, setAffiliateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    status: 'active',
    address: '',
    balance: 0,
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
    default_affiliate_commission_1: 0,
    default_affiliate_commission_2: 0,
    default_affiliate_commission_3: 0,
    sale_hide: 0,
  });

  useEffect(() => {
    if (selectedAffiliate) {
      setAffiliateForm({
        first_name: selectedAffiliate.first_name || '',
        last_name: selectedAffiliate.last_name || '',
        email: selectedAffiliate.email || '',
        password: '',
        password_confirmation: '',
        status: selectedAffiliate.status || 'active',
        address: selectedAffiliate.address || '',
        balance: selectedAffiliate.balance || 0,
        pay_method: selectedAffiliate.pay_method || '',
        account_email: selectedAffiliate.account_email || '',
        skype: selectedAffiliate.skype || '',
        company: selectedAffiliate.company || '',
        website: selectedAffiliate.website || '',
        promotion_description: selectedAffiliate.promotion_description || '',
        payoneer: selectedAffiliate.payoneer || '',
        paypal: selectedAffiliate.paypal || '',
        binance: selectedAffiliate.binance || '',
        bank_details: selectedAffiliate.bank_details || '',
        other_payment_method_description: selectedAffiliate.other_payment_method_description || '',
        default_affiliate_commission_1: selectedAffiliate.default_affiliate_commission_1 || 0,
        default_affiliate_commission_2: selectedAffiliate.default_affiliate_commission_2 || 0,
        default_affiliate_commission_3: selectedAffiliate.default_affiliate_commission_3 || 0,
        sale_hide: selectedAffiliate.sale_hide || 0,
      });
    } else {
      setAffiliateForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        status: 'active',
        address: '',
        balance: 0,
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
        default_affiliate_commission_1: 0,
        default_affiliate_commission_2: 0,
        default_affiliate_commission_3: 0,
        sale_hide: 0,
      });
    }
  }, [selectedAffiliate, show]);
const toast = useToast();

  const validateForm = () => {
    // Validate required fields
    if (!affiliateForm.first_name.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!affiliateForm.last_name.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!affiliateForm.email.trim()) {
      toast.error('Email is required');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(affiliateForm.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Password validation for create mode
    if (!selectedAffiliate) {
      if (!affiliateForm.password) {
        toast.error('Password is required');
        return false;
      }
      if (affiliateForm.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
      if (affiliateForm.password !== affiliateForm.password_confirmation) {
        toast.error('Passwords do not match');
        return false;
      }
    } else {
      // Password validation for edit mode (only if password is provided)
      if (affiliateForm.password && affiliateForm.password.trim() !== '') {
        if (affiliateForm.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return false;
        }
        if (affiliateForm.password !== affiliateForm.password_confirmation) {
          toast.error('Passwords do not match');
          return false;
        }
      }
    }

    // Validate website URL if provided
    if (affiliateForm.website && affiliateForm.website.trim() !== '') {
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlRegex.test(affiliateForm.website)) {
        toast.error('Please enter a valid website URL');
        return false;
      }
    }

    // Validate numeric fields
    if (affiliateForm.balance < 0) {
      toast.error('Balance cannot be negative');
      return false;
    }

    if (affiliateForm.default_affiliate_commission_1 < 0 || affiliateForm.default_affiliate_commission_1 > 100) {
      toast.error('Level 1 commission must be between 0 and 100');
      return false;
    }

    if (affiliateForm.default_affiliate_commission_2 < 0 || affiliateForm.default_affiliate_commission_2 > 100) {
      toast.error('Level 2 commission must be between 0 and 100');
      return false;
    }

    if (affiliateForm.default_affiliate_commission_3 < 0 || affiliateForm.default_affiliate_commission_3 > 100) {
      toast.error('Level 3 commission must be between 0 and 100');
      return false;
    }

    if (affiliateForm.sale_hide < 0 || affiliateForm.sale_hide > 100) {
      toast.error('Sale hide must be between 0 and 10');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (validateForm()) {
      onSubmit(affiliateForm);
    }
  };

  const updateForm = (field, value) => {
    setAffiliateForm({ ...affiliateForm, [field]: value });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={selectedAffiliate ? faEdit : faUserPlus} className="me-2" />
          {selectedAffiliate ? 'Edit Affiliate' : 'Create New Affiliate'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Tabs defaultActiveKey="personal" className="mb-3">
            <Tab eventKey="personal" title="Personal Info">
              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={affiliateForm.first_name}
                      onChange={(e) => updateForm('first_name', e.target.value)}
                      required
                      placeholder="Enter first name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={affiliateForm.last_name}
                      onChange={(e) => updateForm('last_name', e.target.value)}
                      required
                      placeholder="Enter last name"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  value={affiliateForm.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  required
                  placeholder="affiliate@example.com"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={affiliateForm.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  placeholder="Enter affiliate address"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company</Form.Label>
                    <Form.Control
                      type="text"
                      value={affiliateForm.company}
                      onChange={(e) => updateForm('company', e.target.value)}
                      placeholder="Company name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                      type="url"
                      value={affiliateForm.website}
                      onChange={(e) => updateForm('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Skype</Form.Label>
                <Form.Control
                  type="text"
                  value={affiliateForm.skype}
                  onChange={(e) => updateForm('skype', e.target.value)}
                  placeholder="Skype username"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Promotion Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={affiliateForm.promotion_description}
                  onChange={(e) => updateForm('promotion_description', e.target.value)}
                  placeholder="Describe how this affiliate promotes your products..."
                />
              </Form.Group>
            </Tab>

            <Tab eventKey="financial" title="Financial & Payment">
              <div className="mt-3">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Balance</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={affiliateForm.balance}
                        onChange={(e) => updateForm('balance', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select
                        value={affiliateForm.pay_method}
                        onChange={(e) => updateForm('pay_method', e.target.value)}
                      >
                        <option value="">Select Payment Method</option>
                        <option value="paypal">PayPal</option>
                        <option value="payoneer">Payoneer</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="binance">Binance</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {affiliateForm.pay_method === 'paypal' && (
                  <Form.Group className="mb-3">
                    <Form.Label>PayPal Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={affiliateForm.paypal}
                      onChange={(e) => updateForm('paypal', e.target.value)}
                      placeholder="paypal@example.com"
                    />
                  </Form.Group>
                )}

                {affiliateForm.pay_method === 'payoneer' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Payoneer Email/ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={affiliateForm.payoneer}
                      onChange={(e) => updateForm('payoneer', e.target.value)}
                      placeholder="Payoneer account email or ID"
                    />
                  </Form.Group>
                )}

                {affiliateForm.pay_method === 'bank' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Bank Details</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={affiliateForm.bank_details}
                      onChange={(e) => updateForm('bank_details', e.target.value)}
                      placeholder="Bank name, account number, routing number, etc."
                    />
                  </Form.Group>
                )}

                {affiliateForm.pay_method === 'binance' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Binance ID/Email</Form.Label>
                    <Form.Control
                      type="text"
                      value={affiliateForm.binance}
                      onChange={(e) => updateForm('binance', e.target.value)}
                      placeholder="Binance account ID or email"
                    />
                  </Form.Group>
                )}

                {affiliateForm.pay_method === 'other' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Other Payment Method Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={affiliateForm.other_payment_method_description}
                      onChange={(e) => updateForm('other_payment_method_description', e.target.value)}
                      placeholder="Describe other payment method details..."
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Account Email (for payments)</Form.Label>
                  <Form.Control
                    type="email"
                    value={affiliateForm.account_email}
                    onChange={(e) => updateForm('account_email', e.target.value)}
                    placeholder="account@example.com"
                  />
                </Form.Group>
              </div>
            </Tab>

            <Tab eventKey="commission" title="Commission Settings">
              <div className="mt-3">
                <Alert variant="info" className="mb-3">
                  <small>Set commission rates for this affiliate. Levels 2 and 3 are for multi-level marketing.</small>
                </Alert>
                
                <h6 className="mt-3 mb-3">Multi-Level Commission Settings</h6>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Level 1 Commission (%)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={affiliateForm.default_affiliate_commission_1}
                        onChange={(e) => updateForm('default_affiliate_commission_1', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        placeholder="0-100"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Level 2 Commission (%)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={affiliateForm.default_affiliate_commission_2}
                        onChange={(e) => updateForm('default_affiliate_commission_2', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        placeholder="0-100"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Level 3 Commission (%)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={affiliateForm.default_affiliate_commission_3}
                        onChange={(e) => updateForm('default_affiliate_commission_3', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        placeholder="0-100"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Tab>

            <Tab eventKey="settings" title="Settings">
              <div className="mt-3">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={affiliateForm.status}
                        onChange={(e) => updateForm('status', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Hide Sales</Form.Label>
                      <Form.Control
                        type="number"
                        value={affiliateForm.sale_hide}
                        onChange={(e) => updateForm('sale_hide', parseInt(e.target.value) || 0)}
                        min="0"
                        max="100"
                        placeholder="0-100"
                      />
                      <Form.Text className="text-muted">
                        Hide sales 
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Tab>

            <Tab eventKey="security" title="Security">
              <div className="mt-3">
                <h6 className="mb-3">
                  <FontAwesomeIcon icon={faKey} className="me-2 text-warning" />
                  Account Security
                </h6>

                {!selectedAffiliate ? (
                  // Create mode - password is required
                  <>
                    <Alert variant="warning" className="mb-3">
                      <small>Password is required for new accounts. Make sure to use a strong password.</small>
                    </Alert>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              value={affiliateForm.password}
                              onChange={(e) => updateForm('password', e.target.value)}
                              required
                              minLength="6"
                              placeholder="Enter password"
                            />
                            <Button
                              variant="link"
                              className="position-absolute end-0 top-50 translate-middle-y"
                              onClick={() => setShowPassword(!showPassword)}
                              style={{ textDecoration: 'none' }}
                            >
                              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </Button>
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            value={affiliateForm.password_confirmation}
                            onChange={(e) => updateForm('password_confirmation', e.target.value)}
                            required
                            placeholder="Confirm password"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                ) : (
                  // Edit mode - password is optional
                  <>
                    <Alert variant="info" className="mb-3">
                      <small>Leave password fields blank to keep the current password unchanged.</small>
                    </Alert>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>New Password (optional)</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          value={affiliateForm.password}
                          onChange={(e) => {
                            updateForm('password', e.target.value);
                            if (e.target.value === '') {
                              updateForm('password_confirmation', '');
                            }
                          }}
                          minLength="6"
                          placeholder="Enter new password (optional)"
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ textDecoration: 'none' }}
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </Button>
                      </div>
                    </Form.Group>
                    
                    {affiliateForm.password && affiliateForm.password.length > 0 && (
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          value={affiliateForm.password_confirmation}
                          onChange={(e) => updateForm('password_confirmation', e.target.value)}
                          placeholder="Confirm new password"
                        />
                        {affiliateForm.password !== affiliateForm.password_confirmation && affiliateForm.password_confirmation && (
                          <Form.Text className="text-danger">
                            Passwords do not match
                          </Form.Text>
                        )}
                      </Form.Group>
                    )}
                  </>
                )}
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {selectedAffiliate ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={selectedAffiliate ? faEdit : faUserPlus} className="me-2" />
                {selectedAffiliate ? 'Update Affiliate' : 'Create Affiliate'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AffiliateFormModal;