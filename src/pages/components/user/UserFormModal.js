// components/user/UserFormModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner, Alert } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../../context/ToastContext';

const UserFormModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  selectedUser,
  roles,
  loading 
}) => {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
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
    auto_renew: false,
    sale_add: false
  });

  useEffect(() => {
    if (selectedUser) {
      setUserForm({
        first_name: selectedUser.first_name || '',
        last_name: selectedUser.last_name || '',
        email: selectedUser.email || '',
        password: '',
        password_confirmation: '',
        role: (selectedUser.roles && selectedUser.roles[0]?.name) || '',
        status: selectedUser.status || 'active',
        address: selectedUser.address || '',
        balance: selectedUser.balance || 0,
        pay_method: selectedUser.pay_method || '',
        account_email: selectedUser.account_email || '',
        skype: selectedUser.skype || '',
        company: selectedUser.company || '',
        website: selectedUser.website || '',
        promotion_description: selectedUser.promotion_description || '',
        payoneer: selectedUser.payoneer || '',
        paypal: selectedUser.paypal || '',
        binance: selectedUser.binance || '',
        bank_details: selectedUser.bank_details || '',
        other_payment_method_description: selectedUser.other_payment_method_description || '',
        default_affiliate_commission_1: selectedUser.default_affiliate_commission_1 || 0,
        default_affiliate_commission_2: selectedUser.default_affiliate_commission_2 || 0,
        default_affiliate_commission_3: selectedUser.default_affiliate_commission_3 || 0,
        sale_hide: selectedUser.sale_hide || 0,
        auto_renew: selectedUser.auto_renew || false,
        sale_add: selectedUser.sale_add || false
      });
    } else {
      setUserForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
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
        auto_renew: false,
        sale_add: false
      });
    }
  }, [selectedUser, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(userForm);
  };

  const updateForm = (field, value) => {
    setUserForm({ ...userForm, [field]: value });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={selectedUser ? faEdit : faPlus} className="me-2" />
          {selectedUser ? 'Edit User' : 'Create New User'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={userForm.first_name}
                  onChange={(e) => updateForm('first_name', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={userForm.last_name}
                  onChange={(e) => updateForm('last_name', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              value={userForm.email}
              onChange={(e) => updateForm('email', e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={userForm.address}
              onChange={(e) => updateForm('address', e.target.value)}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Company</Form.Label>
                <Form.Control
                  type="text"
                  value={userForm.company}
                  onChange={(e) => updateForm('company', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="url"
                  value={userForm.website}
                  onChange={(e) => updateForm('website', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Skype</Form.Label>
            <Form.Control
              type="text"
              value={userForm.skype}
              onChange={(e) => updateForm('skype', e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Promotion Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={userForm.promotion_description}
              onChange={(e) => updateForm('promotion_description', e.target.value)}
            />
          </Form.Group>

          <hr />
          <h6>Financial Information</h6>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Balance</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={userForm.balance}
                  onChange={(e) => updateForm('balance', parseFloat(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={userForm.pay_method}
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

          <Form.Group className="mb-3">
            <Form.Label>Account Email</Form.Label>
            <Form.Control
              type="email"
              value={userForm.account_email}
              onChange={(e) => updateForm('account_email', e.target.value)}
            />
          </Form.Group>

          {userForm.pay_method === 'paypal' && (
            <Form.Group className="mb-3">
              <Form.Label>PayPal Email</Form.Label>
              <Form.Control
                type="email"
                value={userForm.paypal}
                onChange={(e) => updateForm('paypal', e.target.value)}
              />
            </Form.Group>
          )}

          {userForm.pay_method === 'payoneer' && (
            <Form.Group className="mb-3">
              <Form.Label>Payoneer Email/ID</Form.Label>
              <Form.Control
                type="text"
                value={userForm.payoneer}
                onChange={(e) => updateForm('payoneer', e.target.value)}
              />
            </Form.Group>
          )}

          {userForm.pay_method === 'bank' && (
            <Form.Group className="mb-3">
              <Form.Label>Bank Details</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={userForm.bank_details}
                onChange={(e) => updateForm('bank_details', e.target.value)}
                placeholder="Bank name, account number, routing number, etc."
              />
            </Form.Group>
          )}

          {userForm.pay_method === 'binance' && (
            <Form.Group className="mb-3">
              <Form.Label>Binance ID/Email</Form.Label>
              <Form.Control
                type="text"
                value={userForm.binance}
                onChange={(e) => updateForm('binance', e.target.value)}
              />
            </Form.Group>
          )}

          {userForm.pay_method === 'other' && (
            <Form.Group className="mb-3">
              <Form.Label>Other Payment Method Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={userForm.other_payment_method_description}
                onChange={(e) => updateForm('other_payment_method_description', e.target.value)}
              />
            </Form.Group>
          )}

          {userForm.role === 'affiliate' && (
            <>
              <hr />
              <h6>Affiliate Commission Settings</h6>
              <Row>
               
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Level 1 Commission (%)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={userForm.default_affiliate_commission_1}
                      onChange={(e) => updateForm('default_affiliate_commission_1', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Level 2 Commission (%)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={userForm.default_affiliate_commission_2}
                      onChange={(e) => updateForm('default_affiliate_commission_2', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Level 3 Commission (%)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={userForm.default_affiliate_commission_3}
                      onChange={(e) => updateForm('default_affiliate_commission_3', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sale Hide Threshold</Form.Label>
                    <Form.Control
                      type="number"
                      value={userForm.sale_hide}
                      onChange={(e) => updateForm('sale_hide', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                    />
                    <Form.Text className="text-muted">Hide sales when count reaches this threshold (0 = show all)</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          <hr />
          <h6>Account Settings</h6>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={userForm.role}
                  onChange={(e) => updateForm('role', e.target.value)}
                  required={!selectedUser}
                >
                  <option value="">Select Role</option>
                  {roles && roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">Super-admin role cannot be assigned</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={userForm.status}
                  onChange={(e) => updateForm('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h6>Security</h6>

          {!selectedUser ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={userForm.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    required
                    minLength="8"
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

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={userForm.password_confirmation}
                  onChange={(e) => updateForm('password_confirmation', e.target.value)}
                  required
                  placeholder="Confirm password"
                />
              </Form.Group>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>New Password (optional)</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={userForm.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    placeholder="Leave blank to keep current password"
                    minLength="8"
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

              {userForm.password && (
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={userForm.password_confirmation}
                    onChange={(e) => updateForm('password_confirmation', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {selectedUser ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={selectedUser ? faEdit : faPlus} className="me-2" />
                {selectedUser ? 'Update' : 'Create'} User
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserFormModal;