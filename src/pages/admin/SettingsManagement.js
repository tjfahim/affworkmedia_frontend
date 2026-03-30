// pages/admin/SettingsManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Button, Card, Form, Alert, Spinner, 
  Row, Col, Image, Modal
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, faImage, faGlobe, faLock, faEnvelope, 
  faEye, faEyeSlash, faTrash, faChartLine, faKey
} from '@fortawesome/free-solid-svg-icons';
import settingsAPI from '../../services/settingsService';

const SettingsManagement = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRemoveLogoModal, setShowRemoveLogoModal] = useState(false);
  const [showRemoveFaviconModal, setShowRemoveFaviconModal] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  // Form states
  const [landerpageDomain, setLanderpageDomain] = useState('');
  const [defaultSaleHide, setDefaultSaleHide] = useState(0);
  const [defaultMasterPassword, setDefaultMasterPassword] = useState('');
  const [defaultPaymentMail, setDefaultPaymentMail] = useState('');
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
  try {
    setLoading(true);
    const response = await settingsAPI.getSettings();
    
    console.log('Settings response:', response.data);
    
    if (response.data && response.data.success === true) {
      setSettings(response.data.data);
      setLanderpageDomain(response.data.data?.landerpage_domain || '');
      setDefaultSaleHide(response.data.data?.default_sale_hide || 0);
      setDefaultPaymentMail(response.data.data?.default_payment_mail || '');
      
      // Store the actual password if it exists
      if (response.data.data?.default_master_password) {
        setCurrentPassword(response.data.data.default_master_password);
        setHasExistingPassword(true);
      } else {
        setCurrentPassword('');
        setHasExistingPassword(false);
      }
      
      // Set previews if images exist
      if (response.data.data?.logo) {
        setLogoPreview(getImageUrl(response.data.data.logo));
      }
      if (response.data.data?.favicon) {
        setFaviconPreview(getImageUrl(response.data.data.favicon));
      }
      
      setError('');
    } else {
      setError('Invalid response format');
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    setError(error.response?.data?.message || 'Failed to fetch settings');
  } finally {
    setLoading(false);
  }
};
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo size should be less than 2MB');
        e.target.value = '';
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, JPG, GIF, and SVG images are allowed');
        e.target.value = '';
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (1MB max)
      if (file.size > 1 * 1024 * 1024) {
        setError('Favicon size should be less than 1MB');
        e.target.value = '';
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only ICO and PNG images are allowed');
        e.target.value = '';
        return;
      }

      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setDefaultMasterPassword(newPassword);
    setPasswordChanged(newPassword.trim() !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Check if we have any files to upload
      const hasFiles = logoFile !== null || faviconFile !== null;
      
      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        // Append files if they exist
        if (logoFile) {
          formData.append('logo', logoFile);
          console.log('Appending logo file:', logoFile.name, logoFile.type, logoFile.size);
        }
        
        if (faviconFile) {
          formData.append('favicon', faviconFile);
          console.log('Appending favicon file:', faviconFile.name, faviconFile.type, faviconFile.size);
        }
        
        // Append text fields
        if (landerpageDomain) {
          formData.append('landerpage_domain', landerpageDomain);
        }
        
        formData.append('default_sale_hide', String(defaultSaleHide));
        
        if (defaultPaymentMail) {
          formData.append('default_payment_mail', defaultPaymentMail);
        }
        
        // Only append password if it's changed and not empty
        if (passwordChanged && defaultMasterPassword && defaultMasterPassword.trim() !== '') {
          formData.append('default_master_password', defaultMasterPassword);
        }

        // Log the data being sent for debugging
        console.log('Sending FormData with files:');
        for (let pair of formData.entries()) {
          if (pair[0].includes('password')) {
            console.log(`- ${pair[0]}: ***`);
          } else if (pair[1] instanceof File) {
            console.log(`- ${pair[0]}: ${pair[1].name} (${pair[1].type}, ${(pair[1].size / 1024).toFixed(2)}KB)`);
          } else {
            console.log(`- ${pair[0]}: ${pair[1]}`);
          }
        }

        const response = await settingsAPI.updateSettingsWithFiles(formData);
        
        if (response.data && response.data.success === true) {
          setSuccess('Settings updated successfully');
          setSettings(response.data.data);
          
          // Update previews based on response
          if (response.data.data?.logo) {
            setLogoPreview(getImageUrl(response.data.data.logo));
          } else {
            setLogoPreview(null);
          }
          
          if (response.data.data?.favicon) {
            setFaviconPreview(getImageUrl(response.data.data.favicon));
          } else {
            setFaviconPreview(null);
          }
          
          // Reset password states
          setDefaultMasterPassword('');
          setPasswordChanged(false);
          
          // Clear file states and inputs after successful upload
          setLogoFile(null);
          setFaviconFile(null);
          
          // Clear file inputs
          const logoInput = document.getElementById('logo-input');
          const faviconInput = document.getElementById('favicon-input');
          if (logoInput) logoInput.value = '';
          if (faviconInput) faviconInput.value = '';
          
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(response.data?.message || 'Failed to update settings');
        }
      } else {
        // No files, use regular JSON update
        const updateData = {};
        
        if (landerpageDomain) {
          updateData.landerpage_domain = landerpageDomain;
        }
        
        updateData.default_sale_hide = defaultSaleHide;
        
        if (defaultPaymentMail) {
          updateData.default_payment_mail = defaultPaymentMail;
        }
        
        // Only append password if it's changed and not empty
        if (passwordChanged && defaultMasterPassword && defaultMasterPassword.trim() !== '') {
          updateData.default_master_password = defaultMasterPassword;
        }

        console.log('Sending settings data without files:', updateData);

        const response = await settingsAPI.updateSettings(updateData);
        
        if (response.data && response.data.success === true) {
          setSuccess('Settings updated successfully');
          setSettings(response.data.data);
          setDefaultMasterPassword('');
          setPasswordChanged(false);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(response.data?.message || 'Failed to update settings');
        }
      }
    } catch (error) {
      console.error('Update error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to update settings');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const response = await settingsAPI.removeLogo();
      if (response.data && response.data.success === true) {
        setSettings(response.data.data);
        setLogoPreview(null);
        setLogoFile(null);
        setSuccess('Logo removed successfully');
        setShowRemoveLogoModal(false);
        
        // Clear file input
        const logoInput = document.getElementById('logo-input');
        if (logoInput) logoInput.value = '';
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove logo');
    }
  };

  const handleRemoveFavicon = async () => {
    try {
      const response = await settingsAPI.removeFavicon();
      if (response.data && response.data.success === true) {
        setSettings(response.data.data);
        setFaviconPreview(null);
        setFaviconFile(null);
        setSuccess('Favicon removed successfully');
        setShowRemoveFaviconModal(false);
        
        // Clear file input
        const faviconInput = document.getElementById('favicon-input');
        if (faviconInput) faviconInput.value = '';
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove favicon');
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
    return `${baseUrl}/storage/${path}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-2">System Settings</h2>
          <p className="text-muted">Configure your application preferences and settings</p>
        </div>
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

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Left Column */}
          <Col lg={6}>
            {/* Media Settings */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-0 pt-4 pb-2">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faImage} className="me-2 text-primary" />
                  Media Settings
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={7}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Logo</Form.Label>
                      <Form.Control
                        id="logo-input"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                        onChange={handleLogoChange}
                      />
                      <Form.Text className="text-muted">
                        Allowed: JPEG, PNG, JPG, GIF, SVG (Max: 2MB)
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Favicon</Form.Label>
                      <Form.Control
                        id="favicon-input"
                        type="file"
                        accept="image/x-icon,image/png"
                        onChange={handleFaviconChange}
                      />
                      <Form.Text className="text-muted">
                        Allowed: ICO, PNG (Max: 1MB)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={5}>
                    {logoPreview && (
                      <div className="text-center border rounded p-3 bg-light mb-3">
                        <h6 className="fw-bold mb-3">Logo Preview:</h6>
                        <Image 
                          src={logoPreview} 
                          style={{ width: '100%', maxHeight: '100px', objectFit: 'contain' }}
                          rounded
                        />
                        {logoFile && (
                          <Button 
                            variant="link" 
                            className="text-danger mt-2 p-0 d-block"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview(settings?.logo ? getImageUrl(settings.logo) : null);
                              document.getElementById('logo-input').value = '';
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-1" />
                            Remove new logo
                          </Button>
                        )}
                        {settings?.logo && !logoFile && (
                          <Button 
                            variant="link" 
                            className="text-danger mt-2 p-0"
                            onClick={() => setShowRemoveLogoModal(true)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-1" />
                            Remove current logo
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {faviconPreview && (
                      <div className="text-center border rounded p-3 bg-light">
                        <h6 className="fw-bold mb-3">Favicon Preview:</h6>
                        <Image 
                          src={faviconPreview} 
                          style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                          rounded
                        />
                        {faviconFile && (
                          <Button 
                            variant="link" 
                            className="text-danger mt-2 p-0 d-block"
                            onClick={() => {
                              setFaviconFile(null);
                              setFaviconPreview(settings?.favicon ? getImageUrl(settings.favicon) : null);
                              document.getElementById('favicon-input').value = '';
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-1" />
                            Remove new favicon
                          </Button>
                        )}
                        {settings?.favicon && !faviconFile && (
                          <Button 
                            variant="link" 
                            className="text-danger mt-2 p-0"
                            onClick={() => setShowRemoveFaviconModal(true)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-1" />
                            Remove current favicon
                          </Button>
                        )}
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Domain & Payment Settings */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-0 pt-4 pb-2">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faGlobe} className="me-2 text-primary" />
                  Domain & Payment
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Landerpage Domain</Form.Label>
                  <Form.Control
                    type="text"
                    value={landerpageDomain}
                    onChange={(e) => setLanderpageDomain(e.target.value)}
                    placeholder="e.g., example.com"
                  />
                  <Form.Text className="text-muted">Domain used for landing pages</Form.Text>
                </Form.Group>

                <Form.Group>
                  <Form.Label className="fw-bold">Default Payment Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={defaultPaymentMail}
                    onChange={(e) => setDefaultPaymentMail(e.target.value)}
                    placeholder="payments@example.com"
                  />
                  <Form.Text className="text-muted">Email for payment notifications</Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column */}
          <Col lg={6}>
            {/* Security Settings */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-0 pt-4 pb-2">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faLock} className="me-2 text-primary" />
                  Security Settings
                </h5>
              </Card.Header>
              <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <FontAwesomeIcon icon={faKey} className="me-2 text-warning" />
                  Default Master Password
                </Form.Label>
                   {hasExistingPassword && (
    <div className="mb-2 p-2 bg-light rounded border">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <small className="text-muted">Current Password:</small>
          <div className="font-monospace">
            {showCurrentPassword ? (
              <span className="fw-bold text-dark">{currentPassword}</span>
            ) : (
              <span className="text-muted">••••••••</span>
            )}
          </div>
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          className="text-decoration-none"
        >
          <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
          <span className="ms-1">{showCurrentPassword ? 'Hide' : 'Show'}</span>
        </Button>
      </div>
    </div>
  )}
  
  <div className="position-relative">
    <Form.Control
      type={showPassword ? "text" : "password"}
      value={defaultMasterPassword}
      onChange={handlePasswordChange}
      placeholder={hasExistingPassword ? "Enter new password (leave blank to keep current)" : "Enter new password"}
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
    {hasExistingPassword ? (
      <>
        <span className="text-success">✓ Password is set</span>
        <br />
        Enter new password to change it. Minimum 6 characters.
      </>
    ) : (
      "No password set. Enter a new password (minimum 6 characters)."
    )}
  </Form.Text>
  
  {passwordChanged && defaultMasterPassword && defaultMasterPassword.trim() !== '' && (
    <Alert variant="info" className="mt-2 p-2 small">
      <FontAwesomeIcon icon={faKey} className="me-1" />
      Password will be updated when you save.
    </Alert>
  )}
</Form.Group>

                <Form.Group>
                  <Form.Label className="fw-bold">
                    <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
                    Sale Hide Threshold
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={defaultSaleHide}
                    onChange={(e) => setDefaultSaleHide(parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="1"
                    placeholder="Enter number"
                  />
                  <Form.Text className="text-muted d-block mt-2">
                    Automatically hide sales when count reaches this threshold (0 = show all, max 100)
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Submit Button */}
        <div className="position-sticky bottom-0 bg-white py-3 border-top mt-3">
          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              type="submit"
              disabled={saving}
              size="lg"
              className="px-5"
            >
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </Form>

      {/* Remove Logo Modal */}
      <Modal show={showRemoveLogoModal} onHide={() => setShowRemoveLogoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Remove Logo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove the logo? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveLogoModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleRemoveLogo}>Remove</Button>
        </Modal.Footer>
      </Modal>

      {/* Remove Favicon Modal */}
      <Modal show={showRemoveFaviconModal} onHide={() => setShowRemoveFaviconModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Remove Favicon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove the favicon? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveFaviconModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleRemoveFavicon}>Remove</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SettingsManagement;