// pages/admin/LandingManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Badge, Modal, Form, Alert, Spinner, 
  Image, Row, Col, Card, OverlayTrigger, Tooltip 
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faToggleOn, faToggleOff, 
  faImage, faGamepad
} from '@fortawesome/free-solid-svg-icons';
import landingAPI from '../../services/landingService';
import gameAPI from '../../services/gameService';

const LandingManagement = () => {
  const [landings, setLandings] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLanding, setSelectedLanding] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [landingForm, setLandingForm] = useState({
    game_manage_id: '',
    name: '',
    status: true,
    image: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both landings and games
      const [landingsRes, gamesRes] = await Promise.all([
        landingAPI.getLandings(),
        gameAPI.getGames()
      ]);
      
      console.log('Landings response:', landingsRes.data);
      console.log('Games response:', gamesRes.data);
      
      if (landingsRes.data && landingsRes.data.success === true) {
        setLandings(landingsRes.data.landings);
      }
      
      if (gamesRes.data && gamesRes.data.success === true) {
        setGames(gamesRes.data.games);
      }
      
      setError('');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLanding = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('game_manage_id', landingForm.game_manage_id);
    formData.append('name', landingForm.name || '');
    formData.append('status', landingForm.status ? '1' : '0');
    
    if (landingForm.image) {
      formData.append('image', landingForm.image);
    }

    try {
      setError('');
      const response = await landingAPI.createLanding(formData);
      
      if (response.data && response.data.success === true) {
        setSuccess('Landing item created successfully');
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        setError(response.data?.message || 'Failed to create landing');
      }
    } catch (error) {
      console.error('Create error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to create landing');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLanding = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('_method', 'PUT');
    
    if (landingForm.game_manage_id !== selectedLanding.game_manage_id) {
      formData.append('game_manage_id', landingForm.game_manage_id);
    }
    
    if (landingForm.name !== selectedLanding.name) {
      formData.append('name', landingForm.name);
    }
    
    if (landingForm.status !== selectedLanding.status) {
      formData.append('status', landingForm.status ? '1' : '0');
    }
    
    if (landingForm.image) {
      formData.append('image', landingForm.image);
    }

    try {
      setError('');
      const response = await landingAPI.updateLanding(selectedLanding.id, formData);
      
      if (response.data && response.data.success === true) {
        setSuccess('Landing item updated successfully');
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        setError(response.data?.message || 'Failed to update landing');
      }
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to update landing');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLanding = async (id) => {
    if (window.confirm('Are you sure you want to delete this landing item?')) {
      try {
        const response = await landingAPI.deleteLanding(id);
        if (response.data && response.data.success === true) {
          setSuccess('Landing item deleted successfully');
          fetchData();
        } else {
          setError(response.data?.message || 'Failed to delete landing');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError(error.response?.data?.message || 'Failed to delete landing');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await landingAPI.toggleStatus(id);
      if (response.data && response.data.success === true) {
        setSuccess(`Status changed to ${response.data.status ? 'active' : 'inactive'}`);
        fetchData();
      } else {
        setError(response.data?.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      setError(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, JPG, and GIF images are allowed');
        return;
      }

      setLandingForm({ ...landingForm, image: file });
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const resetForm = () => {
    setLandingForm({
      game_manage_id: '',
      name: '',
      status: true,
      image: null
    });
    setSelectedLanding(null);
    setImagePreview(null);
    setError('');
  };

  const openEditModal = (landing) => {
    setSelectedLanding(landing);
    setLandingForm({
      game_manage_id: landing.game_manage_id,
      name: landing.name || '',
      status: landing.status,
      image: null
    });
    setImagePreview(landing.image ? `http://127.0.0.1:8000/storage/${landing.image}` : null);
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getImageUrl = (path) => {
    return path ? `http://127.0.0.1:8000/storage/${path}` : null;
  };

  const getGameName = (gameId) => {
    const game = games.find(g => g.id === gameId);
    return game ? game.name : 'Unknown Game';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading landing items...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Landing Management</h2>
        <Button variant="primary" onClick={openCreateModal}>
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Landing Item
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
                <th>Image</th>
                <th>Name</th>
                <th>Game</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {landings && landings.length > 0 ? (
                landings.map(landing => (
                  <tr key={landing.id}>
                    <td>{landing.id}</td>
                    <td>
                      {landing.image ? (
                        <Image 
                          src={getImageUrl(landing.image)} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          rounded
                          thumbnail
                        />
                      ) : (
                        <Badge bg="secondary">No Image</Badge>
                      )}
                    </td>
                    <td className="fw-bold">{landing.name || 'Unnamed'}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faGamepad} className="me-2 text-primary" />
                        {getGameName(landing.game_manage_id)}
                      </div>
                    </td>
                    <td>
                      <Badge 
                        bg={landing.status ? 'success' : 'danger'}
                        style={{ cursor: 'pointer', padding: '8px 12px' }}
                        onClick={() => handleToggleStatus(landing.id, landing.status)}
                      >
                        <FontAwesomeIcon 
                          icon={landing.status ? faToggleOn : faToggleOff} 
                          className="me-2" 
                        />
                        {landing.status ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit Landing</Tooltip>}
                      >
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditModal(landing)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Landing</Tooltip>}
                      >
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteLanding(landing.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <h5>No landing items found</h5>
                    <p className="text-muted">Click the "Add Landing Item" button to create one.</p>
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
            <FontAwesomeIcon icon={selectedLanding ? faEdit : faPlus} className="me-2" />
            {selectedLanding ? 'Edit Landing Item' : 'Add New Landing Item'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={selectedLanding ? handleUpdateLanding : handleCreateLanding}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Game <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={landingForm.game_manage_id}
                    onChange={(e) => setLandingForm({...landingForm, game_manage_id: e.target.value})}
                    required
                  >
                    <option value="">Select Game</option>
                    {games.filter(game => game.status).map(game => (
                      <option key={game.id} value={game.id}>{game.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter landing name (optional)"
                    value={landingForm.name}
                    onChange={(e) => setLandingForm({...landingForm, name: e.target.value})}
                  />
                  <Form.Text className="text-muted">
                    Optional display name for the landing item
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Status</Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      id="active"
                      label="Active"
                      name="status"
                      checked={landingForm.status === true}
                      onChange={() => setLandingForm({...landingForm, status: true})}
                      inline
                    />
                    <Form.Check
                      type="radio"
                      id="inactive"
                      label="Inactive"
                      name="status"
                      checked={landingForm.status === false}
                      onChange={() => setLandingForm({...landingForm, status: false})}
                      inline
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    onChange={handleImageChange}
                  />
                  <Form.Text className="text-muted">
                    Allowed: JPEG, PNG, JPG, GIF (Max: 2MB)
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                {imagePreview && (
                  <div className="text-center border rounded p-3 bg-light">
                    <h6 className="fw-bold mb-3">Preview:</h6>
                    <Image 
                      src={imagePreview} 
                      style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }}
                      rounded
                      thumbnail
                    />
                    {landingForm.image && (
                      <Button 
                        variant="link" 
                        className="text-danger mt-2 p-0"
                        onClick={() => {
                          setLandingForm({...landingForm, image: null});
                          setImagePreview(selectedLanding?.image ? getImageUrl(selectedLanding.image) : null);
                        }}
                      >
                        Remove new image
                      </Button>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
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
                  {selectedLanding ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={selectedLanding ? faEdit : faPlus} className="me-2" />
                  {selectedLanding ? 'Update' : 'Create'} Landing
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default LandingManagement;