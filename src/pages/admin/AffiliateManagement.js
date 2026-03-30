// pages/admin/AffiliateManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Badge, Modal, Form, Alert, Spinner, 
  Pagination, Card, Row, Col, Tabs, Tab
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faSync, faUserPlus, 
  faEnvelope, faPhone, faDollarSign, faChartLine, 
  faEye, faEyeSlash, faKey, faUsers, faCheckCircle,
  faTimesCircle, faPauseCircle, faBuilding, faGlobe,
  faSkype, faPaypal, faCreditCard, faPercentage, faInfoCircle,
  faEye as faView
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import affiliateAPI from '../../services/affiliateService';

const AffiliateManagement = () => {
  const { hasPermission } = useAuth();
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [viewingAffiliate, setViewingAffiliate] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Pagination states
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15
  });

  // Form states
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
    sale_hide: 0 // Changed to integer (0 = visible, 1 = hidden)
  });

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async (page = 1) => {
    try {
      setLoading(true);
      const response = await affiliateAPI.getAffiliates(page, pagination.per_page);
      console.log('Affiliates response:', response.data);
      
      if (response.data && response.data.success === true && response.data.affiliates) {
        if (Array.isArray(response.data.affiliates.data)) {
          setAffiliates(response.data.affiliates.data);
          setPagination({
            current_page: response.data.affiliates.current_page,
            last_page: response.data.affiliates.last_page,
            total: response.data.affiliates.total,
            per_page: response.data.affiliates.per_page
          });
          setError('');
        } else {
          console.error('Affiliates data is not an array:', response.data.affiliates);
          setAffiliates([]);
          setError('Invalid affiliate data format');
        }
      } else {
        console.error('Unexpected response structure:', response.data);
        setAffiliates([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Failed to fetch affiliates:', error);
      setError(error.response?.data?.message || 'Failed to fetch affiliates');
      setAffiliates([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchAffiliates(page);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateAffiliate = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Validate password
      if (affiliateForm.password !== affiliateForm.password_confirmation) {
        setError('Passwords do not match');
        return;
      }

      if (affiliateForm.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      const response = await affiliateAPI.createAffiliate(affiliateForm);
      if (response.data && response.data.success === true) {
        setSuccess('Affiliate created successfully');
        setShowModal(false);
        fetchAffiliates(pagination.current_page);
        resetAffiliateForm();
      } else {
        setError(response.data?.message || 'Failed to create affiliate');
      }
    } catch (error) {
      console.error('Create affiliate error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to create affiliate');
      }
    }
  };

  const handleUpdateAffiliate = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const updateData = {
        first_name: affiliateForm.first_name,
        last_name: affiliateForm.last_name,
        email: affiliateForm.email,
        status: affiliateForm.status,
        address: affiliateForm.address,
        balance: affiliateForm.balance,
        pay_method: affiliateForm.pay_method,
        account_email: affiliateForm.account_email,
        skype: affiliateForm.skype,
        company: affiliateForm.company,
        website: affiliateForm.website,
        promotion_description: affiliateForm.promotion_description,
        payoneer: affiliateForm.payoneer,
        paypal: affiliateForm.paypal,
        sale_hide: affiliateForm.sale_hide
      };

      // Only include password if it's provided
      if (affiliateForm.password) {
        if (affiliateForm.password !== affiliateForm.password_confirmation) {
          setError('Passwords do not match');
          return;
        }
        if (affiliateForm.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        updateData.password = affiliateForm.password;
      }

      const response = await affiliateAPI.updateAffiliate(selectedAffiliate.id, updateData);
      if (response.data && response.data.success === true) {
        setSuccess('Affiliate updated successfully');
        setShowModal(false);
        fetchAffiliates(pagination.current_page);
        resetAffiliateForm();
      } else {
        setError(response.data?.message || 'Failed to update affiliate');
      }
    } catch (error) {
      console.error('Update affiliate error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to update affiliate');
      }
    }
  };

  const handleDeleteAffiliate = async (affiliateId) => {
    if (window.confirm('Are you sure you want to delete this affiliate? This action cannot be undone.')) {
      try {
        const response = await affiliateAPI.deleteAffiliate(affiliateId);
        if (response.data && response.data.success === true) {
          setSuccess('Affiliate deleted successfully');
          fetchAffiliates(pagination.current_page);
        } else {
          setError(response.data?.message || 'Failed to delete affiliate');
        }
      } catch (error) {
        console.error('Delete affiliate error:', error);
        setError(error.response?.data?.message || 'Failed to delete affiliate');
      }
    }
  };

  const handleStatusToggle = async (affiliate) => {
    setTogglingStatus(affiliate.id);
    try {
      const newStatus = affiliate.status === 'active' ? 'inactive' : 
                        affiliate.status === 'inactive' ? 'suspended' : 'active';
      const response = await affiliateAPI.updateStatus(affiliate.id, newStatus);
      
      if (response.data && response.data.success === true) {
        setSuccess(`Affiliate status changed to ${newStatus}`);
        setAffiliates(affiliates.map(u => 
          u.id === affiliate.id ? { ...u, status: newStatus } : u
        ));
      } else {
        setError(response.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status toggle error:', error);
      setError(error.response?.data?.message || 'Failed to update status');
    } finally {
      setTogglingStatus(null);
    }
  };

  const resetAffiliateForm = () => {
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
      sale_hide: 0
    });
    setSelectedAffiliate(null);
    setShowPassword(false);
  };

  const openEditModal = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setAffiliateForm({
      first_name: affiliate.first_name || '',
      last_name: affiliate.last_name || '',
      email: affiliate.email || '',
      password: '',
      password_confirmation: '',
      status: affiliate.status || 'active',
      address: affiliate.address || '',
      balance: affiliate.balance || 0,
      pay_method: affiliate.pay_method || '',
      account_email: affiliate.account_email || '',
      skype: affiliate.skype || '',
      company: affiliate.company || '',
      website: affiliate.website || '',
      promotion_description: affiliate.promotion_description || '',
      payoneer: affiliate.payoneer || '',
      paypal: affiliate.paypal || '',
      sale_hide: parseInt(affiliate.sale_hide) || 0
    });
    setShowModal(true);
  };

  const openViewModal = (affiliate) => {
    setViewingAffiliate(affiliate);
    setShowViewModal(true);
  };

  const openCreateModal = () => {
    resetAffiliateForm();
    setShowModal(true);
  };

  // Filter users based on active tab
  const getFilteredAffiliates = () => {
    if (activeTab === 'all') return affiliates;
    return affiliates.filter(affiliate => affiliate.status === activeTab);
  };

  const filteredAffiliates = getFilteredAffiliates();

  // Generate pagination items
  const paginationItems = [];
  for (let page = 1; page <= pagination.last_page; page++) {
    paginationItems.push(
      <Pagination.Item 
        key={page} 
        active={page === pagination.current_page}
        onClick={() => handlePageChange(page)}
      >
        {page}
      </Pagination.Item>
    );
  }

  // Get status badge
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading affiliates...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-2">
            <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
            Affiliate Management
          </h2>
          <p className="text-muted">Manage affiliate users, commissions, and settings</p>
        </div>
        {hasPermission('create affiliates') && (
          <Button variant="primary" onClick={openCreateModal}>
            <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Add Affiliate
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible className="mb-4">
          <Alert.Heading>Success</Alert.Heading>
          <p>{success}</p>
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h6 className="text-muted">Total Affiliates</h6>
              <h3 className="mb-0">{pagination.total}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h6 className="text-muted">Active Affiliates</h6>
              <h3 className="mb-0 text-success">
                {affiliates.filter(a => a.status === 'active').length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h6 className="text-muted">Total Balance</h6>
              <h3 className="mb-0 text-info">
                ${affiliates.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0).toFixed(2)}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        className="mb-4"
      >
        <Tab eventKey="all" title="All Affiliates" />
        <Tab eventKey="active" title="Active" />
        <Tab eventKey="inactive" title="Inactive" />
        <Tab eventKey="suspended" title="Suspended" />
      </Tabs>

      {/* Affiliates Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAffiliates && filteredAffiliates.length > 0 ? (
                filteredAffiliates.map(affiliate => (
                  <tr key={affiliate.id}>
                    <td>{affiliate.id}</td>
                    <td>
                      <div className="fw-bold">{affiliate.first_name} {affiliate.last_name}</div>
                      <small className="text-muted">{affiliate.company || 'No company'}</small>
                    </td>
                    <td>
                      <div><FontAwesomeIcon icon={faEnvelope} className="me-1 text-muted" /> {affiliate.email}</div>
                      {affiliate.phone && <small><FontAwesomeIcon icon={faPhone} className="me-1 text-muted" /> {affiliate.phone}</small>}
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
                          {affiliate.website}
                        </small>
                      )}
                    </td>
                    <td>
                      <span className="fw-bold text-success">
                        ${parseFloat(affiliate.balance || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleStatusToggle(affiliate)}
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
                        onClick={() => openViewModal(affiliate)}
                        title="View Affiliate"
                      >
                        <FontAwesomeIcon icon={faView} />
                      </Button>
                      {hasPermission('edit affiliates') && (
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditModal(affiliate)}
                          title="Edit Affiliate"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                      )}
                      {hasPermission('delete affiliates') && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteAffiliate(affiliate.id)}
                          title="Delete Affiliate"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <h5>No affiliates found</h5>
                    <p className="text-muted">Click the "Add Affiliate" button to create one.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  disabled={pagination.current_page === 1}
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                />
                {paginationItems}
                <Pagination.Next 
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Affiliate Create/Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetAffiliateForm(); }} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={selectedAffiliate ? faEdit : faUserPlus} className="me-2" />
            {selectedAffiliate ? 'Edit Affiliate' : 'Create New Affiliate'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={selectedAffiliate ? handleUpdateAffiliate : handleCreateAffiliate}>
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
                        onChange={(e) => setAffiliateForm({...affiliateForm, first_name: e.target.value})}
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
                        onChange={(e) => setAffiliateForm({...affiliateForm, last_name: e.target.value})}
                        required
                        placeholder="Enter last name"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        value={affiliateForm.email}
                        onChange={(e) => setAffiliateForm({...affiliateForm, email: e.target.value})}
                        required
                        placeholder="affiliate@example.com"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        value={affiliateForm.phone}
                        onChange={(e) => setAffiliateForm({...affiliateForm, phone: e.target.value})}
                        placeholder="+1234567890"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={affiliateForm.address}
                    onChange={(e) => setAffiliateForm({...affiliateForm, address: e.target.value})}
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
                        onChange={(e) => setAffiliateForm({...affiliateForm, company: e.target.value})}
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
                        onChange={(e) => setAffiliateForm({...affiliateForm, website: e.target.value})}
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
                    onChange={(e) => setAffiliateForm({...affiliateForm, skype: e.target.value})}
                    placeholder="Skype username"
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="financial" title="Financial Info">
                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Initial Balance</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={affiliateForm.balance}
                        onChange={(e) => setAffiliateForm({...affiliateForm, balance: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select
                        value={affiliateForm.pay_method}
                        onChange={(e) => setAffiliateForm({...affiliateForm, pay_method: e.target.value})}
                      >
                        <option value="">Select Payment Method</option>
                        <option value="paypal">PayPal</option>
                        <option value="payoneer">Payoneer</option>
                        <option value="bank">Bank Transfer</option>
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
                      onChange={(e) => setAffiliateForm({...affiliateForm, paypal: e.target.value})}
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
                      onChange={(e) => setAffiliateForm({...affiliateForm, payoneer: e.target.value})}
                      placeholder="Payoneer account email or ID"
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Account Email (for payments)</Form.Label>
                  <Form.Control
                    type="email"
                    value={affiliateForm.account_email}
                    onChange={(e) => setAffiliateForm({...affiliateForm, account_email: e.target.value})}
                    placeholder="account@example.com"
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="settings" title="Affiliate Settings">
                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={affiliateForm.status}
                        onChange={(e) => setAffiliateForm({...affiliateForm, status: e.target.value})}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
            
                </Row>

                <Row>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Hide Sales</Form.Label>
                      <Form.Control
                        type="number"
                        value={affiliateForm.sale_hide}
                        onChange={(e) => setAffiliateForm({...affiliateForm, sale_hide: parseInt(e.target.value) || 0})}
                        min="0"
                        max="100"
                        placeholder="0-100"
                      />
                      <Form.Text className="text-muted">
                        Hide sales when count reaches this threshold (0 = show all, max 100)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Promotion Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={affiliateForm.promotion_description}
                    onChange={(e) => setAffiliateForm({...affiliateForm, promotion_description: e.target.value})}
                    placeholder="Describe how this affiliate promotes your products..."
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="security" title="Security">
                <div className="mt-3">
                  <h6 className="mb-3">
                    <FontAwesomeIcon icon={faKey} className="me-2 text-warning" />
                    Account Security
                  </h6>

                  {!selectedAffiliate ? (
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                            <div className="position-relative">
                              <Form.Control
                                type={showPassword ? "text" : "password"}
                                value={affiliateForm.password}
                                onChange={(e) => setAffiliateForm({...affiliateForm, password: e.target.value})}
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
                              onChange={(e) => setAffiliateForm({...affiliateForm, password_confirmation: e.target.value})}
                              required
                              placeholder="Confirm password"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password (leave blank to keep current)</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            value={affiliateForm.password}
                            onChange={(e) => setAffiliateForm({...affiliateForm, password: e.target.value})}
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
                        <Form.Text className="text-muted">
                          Leave blank to keep current password. Minimum 6 characters if changing.
                        </Form.Text>
                      </Form.Group>
                      
                      {affiliateForm.password && (
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            value={affiliateForm.password_confirmation}
                            onChange={(e) => setAffiliateForm({...affiliateForm, password_confirmation: e.target.value})}
                            placeholder="Confirm new password"
                          />
                        </Form.Group>
                      )}
                    </>
                  )}
                </div>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetAffiliateForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FontAwesomeIcon icon={selectedAffiliate ? faEdit : faPlus} className="me-2" />
              {selectedAffiliate ? 'Update' : 'Create'} Affiliate
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Affiliate Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
            Affiliate Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingAffiliate && (
            <>
              <Row className="mb-4">
                <Col md={12}>
                  <div className="text-center mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                      <FontAwesomeIcon icon={faUsers} size="3x" className="text-primary" />
                    </div>
                    <h3>{viewingAffiliate.first_name} {viewingAffiliate.last_name}</h3>
                    <Badge bg={viewingAffiliate.status === 'active' ? 'success' : 
                               viewingAffiliate.status === 'inactive' ? 'warning' : 'danger'} 
                           className="px-3 py-2">
                      {viewingAffiliate.status?.toUpperCase()}
                    </Badge>
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
                          <p className="fw-bold">{viewingAffiliate.first_name} {viewingAffiliate.last_name}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-muted small">Email Address</label>
                          <p className="fw-bold">{viewingAffiliate.email}</p>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-muted small">Phone Number</label>
                          <p className="fw-bold">{viewingAffiliate.phone || 'Not provided'}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-muted small">Skype</label>
                          <p className="fw-bold">{viewingAffiliate.skype || 'Not provided'}</p>
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <label className="text-muted small">Address</label>
                      <p className="fw-bold">{viewingAffiliate.address || 'Not provided'}</p>
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="professional" title="Professional Info">
                  <div className="mt-3">
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-muted small">Company</label>
                          <p className="fw-bold">{viewingAffiliate.company || 'Not provided'}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-muted small">Website</label>
                          <p className="fw-bold">
                            {viewingAffiliate.website ? (
                              <a href={viewingAffiliate.website} target="_blank" rel="noopener noreferrer">
                                {viewingAffiliate.website}
                              </a>
                            ) : 'Not provided'}
                          </p>
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <label className="text-muted small">Promotion Description</label>
                      <p className="fw-bold">{viewingAffiliate.promotion_description || 'Not provided'}</p>
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="financial" title="Financial Info">
                  <div className="mt-3">
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-muted small">Balance</label>
                          <p className="fw-bold text-success">${parseFloat(viewingAffiliate.balance || 0).toFixed(2)}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-muted small">Payment Method</label>
                          <p className="fw-bold">{viewingAffiliate.pay_method?.toUpperCase() || 'Not set'}</p>
                        </div>
                      </Col>
                    </Row>

                    {viewingAffiliate.paypal && (
                      <div className="mb-3">
                        <label className="text-muted small">PayPal Email</label>
                        <p className="fw-bold">{viewingAffiliate.paypal}</p>
                      </div>
                    )}

                    {viewingAffiliate.payoneer && (
                      <div className="mb-3">
                        <label className="text-muted small">Payoneer ID/Email</label>
                        <p className="fw-bold">{viewingAffiliate.payoneer}</p>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="text-muted small">Account Email</label>
                      <p className="fw-bold">{viewingAffiliate.account_email || 'Not provided'}</p>
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="settings" title="Settings">
                  <div className="mt-3">
                   
                    <div className="mb-3">
                      <label className="text-muted small">Hide Sales Threshold</label>
                      <p className="fw-bold">
                        {viewingAffiliate.sale_hide > 0 ? `${viewingAffiliate.sale_hide} sales` : 'Show all sales'}
                      </p>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {hasPermission('edit affiliates') && viewingAffiliate && (
            <Button 
              variant="primary" 
              onClick={() => {
                setShowViewModal(false);
                openEditModal(viewingAffiliate);
              }}
            >
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              Edit Affiliate
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <style jsx="true">{`
        .status-badge {
          transition: all 0.3s ease;
          display: inline-block;
          cursor: pointer;
        }
        .status-badge:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
};

export default AffiliateManagement;