// pages/admin/DomainRedirectManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Badge, Modal, Form, Alert, Spinner, 
  Row, Col, Card, OverlayTrigger, Tooltip 
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faToggleOn, faToggleOff, 
  faLink, faGlobe
} from '@fortawesome/free-solid-svg-icons';
import domainRedirectAPI from '../../services/domainRedirectService';

const DomainRedirectManagement = () => {
  const [domainRedirects, setDomainRedirects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRedirect, setSelectedRedirect] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [redirectForm, setRedirectForm] = useState({
    url: '',
    status: true
  });

  useEffect(() => {
    fetchDomainRedirects();
  }, []);

  const fetchDomainRedirects = async () => {
    try {
      setLoading(true);
      const response = await domainRedirectAPI.getDomainRedirects();
      console.log('Domain redirects response:', response.data);
      
      if (response.data && response.data.success === true) {
        setDomainRedirects(response.data.domain_redirects);
        setError('');
      } else {
        setDomainRedirects([]);
        setError('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch domain redirects:', error);
      setError(error.response?.data?.message || 'Failed to fetch domain redirects');
      setDomainRedirects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRedirect = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      setError('');
      const response = await domainRedirectAPI.createDomainRedirect(redirectForm);
      
      if (response.data && response.data.success === true) {
        setSuccess('Domain redirect created successfully');
        setShowModal(false);
        resetForm();
        fetchDomainRedirects();
      } else {
        setError(response.data?.message || 'Failed to create domain redirect');
      }
    } catch (error) {
      console.error('Create error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to create domain redirect');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRedirect = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      setError('');
      const response = await domainRedirectAPI.updateDomainRedirect(selectedRedirect.id, redirectForm);
      
      if (response.data && response.data.success === true) {
        setSuccess('Domain redirect updated successfully');
        setShowModal(false);
        resetForm();
        fetchDomainRedirects();
      } else {
        setError(response.data?.message || 'Failed to update domain redirect');
      }
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to update domain redirect');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRedirect = async (id) => {
    if (window.confirm('Are you sure you want to delete this domain redirect?')) {
      try {
        const response = await domainRedirectAPI.deleteDomainRedirect(id);
        if (response.data && response.data.success === true) {
          setSuccess('Domain redirect deleted successfully');
          fetchDomainRedirects();
        } else {
          setError(response.data?.message || 'Failed to delete domain redirect');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError(error.response?.data?.message || 'Failed to delete domain redirect');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await domainRedirectAPI.toggleStatus(id);
      if (response.data && response.data.success === true) {
        setSuccess(`Status changed to ${response.data.status ? 'active' : 'inactive'}`);
        fetchDomainRedirects();
      } else {
        setError(response.data?.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      setError(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const resetForm = () => {
    setRedirectForm({
      url: '',
      status: true
    });
    setSelectedRedirect(null);
    setError('');
  };

  const openEditModal = (redirect) => {
    setSelectedRedirect(redirect);
    setRedirectForm({
      url: redirect.url,
      status: redirect.status
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading domain redirects...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Domain Redirect Management</h2>
        <Button variant="primary" onClick={openCreateModal}>
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Domain Redirect
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          <Alert.Heading>Success</Alert.Heading>
          <p>{success}</p>
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>URL</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {domainRedirects && domainRedirects.length > 0 ? (
                domainRedirects.map(redirect => (
                  <tr key={redirect.id}>
                    <td>{redirect.id}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faGlobe} className="me-2 text-primary" />
                        <a href={redirect.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          {redirect.url}
                        </a>
                      </div>
                    </td>
                    <td>
                      <Badge 
                        bg={redirect.status ? 'success' : 'danger'}
                        style={{ cursor: 'pointer', padding: '8px 12px' }}
                        onClick={() => handleToggleStatus(redirect.id, redirect.status)}
                      >
                        <FontAwesomeIcon 
                          icon={redirect.status ? faToggleOn : faToggleOff} 
                          className="me-2" 
                        />
                        {redirect.status ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>{new Date(redirect.created_at).toLocaleDateString()}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit Redirect</Tooltip>}
                      >
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditModal(redirect)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Redirect</Tooltip>}
                      >
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteRedirect(redirect.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <h5>No domain redirects found</h5>
                    <p className="text-muted">Click the "Add Domain Redirect" button to create one.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FontAwesomeIcon icon={selectedRedirect ? faEdit : faPlus} className="me-2" />
            {selectedRedirect ? 'Edit Domain Redirect' : 'Add New Domain Redirect'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={selectedRedirect ? handleUpdateRedirect : handleCreateRedirect}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">URL <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com"
                    value={redirectForm.url}
                    onChange={(e) => setRedirectForm({...redirectForm, url: e.target.value})}
                    required
                    isInvalid={redirectForm.url && !isValidUrl(redirectForm.url)}
                  />
                  <Form.Text className="text-muted">
                    Enter the full URL including http:// or https://
                  </Form.Text>
                  {redirectForm.url && !isValidUrl(redirectForm.url) && (
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid URL
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Status</Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      id="active"
                      label="Active"
                      name="status"
                      checked={redirectForm.status === true}
                      onChange={() => setRedirectForm({...redirectForm, status: true})}
                      inline
                    />
                    <Form.Check
                      type="radio"
                      id="inactive"
                      label="Inactive"
                      name="status"
                      checked={redirectForm.status === false}
                      onChange={() => setRedirectForm({...redirectForm, status: false})}
                      inline
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting || (redirectForm.url && !isValidUrl(redirectForm.url))}
            >
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {selectedRedirect ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={selectedRedirect ? faEdit : faPlus} className="me-2" />
                  {selectedRedirect ? 'Update' : 'Create'} Redirect
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default DomainRedirectManagement;