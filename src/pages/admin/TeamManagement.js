// pages/admin/TeamManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Badge, Modal, Form, Alert, Spinner, 
  Image, Row, Col, Card 
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import teamAPI from '../../services/teamService';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [teamForm, setTeamForm] = useState({
    name: '',
    status: true,
    image: null
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getTeams();
      console.log('Teams response:', response.data);
      
      if (response.data && response.data.success === true) {
        setTeams(response.data.teams);
        setError('');
      } else {
        setTeams([]);
        setError('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      setError(error.response?.data?.message || 'Failed to fetch teams');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', teamForm.name);
    formData.append('status', teamForm.status ? '1' : '0');
    
    if (teamForm.image) {
      formData.append('image', teamForm.image);
    }

    try {
      setError('');
      const response = await teamAPI.createTeam(formData);
      
      if (response.data && response.data.success === true) {
        setSuccess('Team created successfully');
        setShowModal(false);
        resetForm();
        fetchTeams();
      } else {
        setError(response.data?.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Create error:', error);
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to create team');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('_method', 'PUT');
    
    if (teamForm.name !== selectedTeam.name) {
      formData.append('name', teamForm.name);
    }
    
    if (teamForm.status !== selectedTeam.status) {
      formData.append('status', teamForm.status ? '1' : '0');
    }
    
    if (teamForm.image) {
      formData.append('image', teamForm.image);
    }

    try {
      setError('');
      const response = await teamAPI.updateTeam(selectedTeam.id, formData);
      
      if (response.data && response.data.success === true) {
        setSuccess('Team updated successfully');
        setShowModal(false);
        resetForm();
        fetchTeams();
      } else {
        setError(response.data?.message || 'Failed to update team');
      }
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to update team');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        const response = await teamAPI.deleteTeam(id);
        if (response.data && response.data.success === true) {
          setSuccess('Team deleted successfully');
          fetchTeams();
        } else {
          setError(response.data?.message || 'Failed to delete team');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError(error.response?.data?.message || 'Failed to delete team');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await teamAPI.toggleStatus(id);
      if (response.data && response.data.success === true) {
        setSuccess(`Status changed to ${response.data.status ? 'active' : 'inactive'}`);
        fetchTeams();
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

      setTeamForm({ ...teamForm, image: file });
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const resetForm = () => {
    setTeamForm({ name: '', status: true, image: null });
    setSelectedTeam(null);
    setImagePreview(null);
    setError('');
  };

  const openEditModal = (team) => {
    setSelectedTeam(team);
    setTeamForm({
      name: team.name,
      status: team.status,
      image: null
    });
    setImagePreview(team.image ? `http://127.0.0.1:8000/storage/${team.image}` : null);
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getImageUrl = (path) => {
    return path ? `http://127.0.0.1:8000/storage/${path}` : null;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Team Management</h2>
        <Button variant="primary" onClick={openCreateModal}>
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Team Member
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
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams && teams.length > 0 ? (
                teams.map(team => (
                  <tr key={team.id}>
                    <td>{team.id}</td>
                    <td>
                      {team.image ? (
                        <Image 
                          src={getImageUrl(team.image)} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          rounded
                          thumbnail
                        />
                      ) : (
                        <Badge bg="secondary">No Image</Badge>
                      )}
                    </td>
                    <td className="fw-bold">{team.name}</td>
                    <td><Badge bg="info">{team.slug}</Badge></td>
                    <td>
                      <Badge 
                        bg={team.status ? 'success' : 'danger'}
                        style={{ cursor: 'pointer', padding: '8px 12px' }}
                        onClick={() => handleToggleStatus(team.id, team.status)}
                      >
                        <FontAwesomeIcon 
                          icon={team.status ? faToggleOn : faToggleOff} 
                          className="me-2" 
                        />
                        {team.status ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => openEditModal(team)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <h5>No teams found</h5>
                    <p className="text-muted">Click the "Add Team Member" button to create one.</p>
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
            <FontAwesomeIcon icon={selectedTeam ? faEdit : faPlus} className="me-2" />
            {selectedTeam ? 'Edit Team Member' : 'Add New Team Member'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={selectedTeam ? handleUpdateTeam : handleCreateTeam}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter team member name"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                    required
                  />
                  <Form.Text className="text-muted">
                    This will be used to generate the slug automatically.
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
                      checked={teamForm.status === true}
                      onChange={() => setTeamForm({...teamForm, status: true})}
                      inline
                    />
                    <Form.Check
                      type="radio"
                      id="inactive"
                      label="Inactive"
                      name="status"
                      checked={teamForm.status === false}
                      onChange={() => setTeamForm({...teamForm, status: false})}
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
                    {teamForm.image && (
                      <Button 
                        variant="link" 
                        className="text-danger mt-2 p-0"
                        onClick={() => {
                          setTeamForm({...teamForm, image: null});
                          setImagePreview(selectedTeam?.image ? getImageUrl(selectedTeam.image) : null);
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
                  {selectedTeam ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={selectedTeam ? faEdit : faPlus} className="me-2" />
                  {selectedTeam ? 'Update' : 'Create'} Team Member
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamManagement;