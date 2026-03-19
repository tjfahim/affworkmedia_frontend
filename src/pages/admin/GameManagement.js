// pages/admin/GameManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Badge, Modal, Form, Alert, Spinner, 
  Image, Row, Col, Card, OverlayTrigger, Tooltip 
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faToggleOn, faToggleOff, 
  faArrowUp, faArrowDown, faSave, faTimes, faSort 
} from '@fortawesome/free-solid-svg-icons';
import gameAPI from '../../services/gameService';

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderedGames, setOrderedGames] = useState([]);
  const [orderChanged, setOrderChanged] = useState(false);

  // Form states
  const [gameForm, setGameForm] = useState({
    name: '',
    order_number: 0,
    status: true,
    image: null
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gameAPI.getGames();
      console.log('Games response:', response.data);
      
      if (response.data && response.data.success === true) {
        setGames(response.data.games);
        setError('');
      } else {
        setGames([]);
        setError('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setError(error.response?.data?.message || 'Failed to fetch games');
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', gameForm.name);
    formData.append('order_number', gameForm.order_number);
    formData.append('status', gameForm.status ? '1' : '0');
    
    if (gameForm.image) {
      formData.append('image', gameForm.image);
    }

    try {
      setError('');
      const response = await gameAPI.createGame(formData);
      
      if (response.data && response.data.success === true) {
        setSuccess('Game created successfully');
        setShowModal(false);
        resetForm();
        fetchGames();
      } else {
        setError(response.data?.message || 'Failed to create game');
      }
    } catch (error) {
      console.error('Create error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to create game');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('_method', 'PUT');
    
    if (gameForm.name !== selectedGame.name) {
      formData.append('name', gameForm.name);
    }
    
    if (gameForm.order_number !== selectedGame.order_number) {
      formData.append('order_number', gameForm.order_number);
    }
    
    if (gameForm.status !== selectedGame.status) {
      formData.append('status', gameForm.status ? '1' : '0');
    }
    
    if (gameForm.image) {
      formData.append('image', gameForm.image);
    }

    try {
      setError('');
      const response = await gameAPI.updateGame(selectedGame.id, formData);
      
      if (response.data && response.data.success === true) {
        setSuccess('Game updated successfully');
        setShowModal(false);
        resetForm();
        fetchGames();
      } else {
        setError(response.data?.message || 'Failed to update game');
      }
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to update game');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGame = async (id) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        const response = await gameAPI.deleteGame(id);
        if (response.data && response.data.success === true) {
          setSuccess('Game deleted successfully');
          fetchGames();
        } else {
          setError(response.data?.message || 'Failed to delete game');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError(error.response?.data?.message || 'Failed to delete game');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await gameAPI.toggleStatus(id);
      if (response.data && response.data.success === true) {
        setSuccess(`Status changed to ${response.data.status ? 'active' : 'inactive'}`);
        fetchGames();
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

      setGameForm({ ...gameForm, image: file });
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const resetForm = () => {
    setGameForm({ 
      name: '', 
      order_number: 0, 
      status: true, 
      image: null 
    });
    setSelectedGame(null);
    setImagePreview(null);
    setError('');
  };

  const openEditModal = (game) => {
    setSelectedGame(game);
    setGameForm({
      name: game.name,
      order_number: game.order_number,
      status: game.status,
      image: null
    });
    setImagePreview(game.image ? getImageUrl(game.image) : null);
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    // Get next order number
    const maxOrder = games.length > 0 
      ? Math.max(...games.map(g => g.order_number)) + 1 
      : 1;
    setGameForm(prev => ({ ...prev, order_number: maxOrder }));
    setShowModal(true);
  };

  const openOrderModal = () => {
    // Sort games by order_number
    const sorted = [...games].sort((a, b) => a.order_number - b.order_number);
    setOrderedGames(sorted);
    setShowOrderModal(true);
    setOrderChanged(false);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    
    const newOrderedGames = [...orderedGames];
    // Swap order numbers
    const tempOrder = newOrderedGames[index].order_number;
    newOrderedGames[index].order_number = newOrderedGames[index - 1].order_number;
    newOrderedGames[index - 1].order_number = tempOrder;
    
    // Swap positions in array
    [newOrderedGames[index - 1], newOrderedGames[index]] = [newOrderedGames[index], newOrderedGames[index - 1]];
    
    setOrderedGames(newOrderedGames);
    setOrderChanged(true);
  };

  const handleMoveDown = (index) => {
    if (index === orderedGames.length - 1) return;
    
    const newOrderedGames = [...orderedGames];
    // Swap order numbers
    const tempOrder = newOrderedGames[index].order_number;
    newOrderedGames[index].order_number = newOrderedGames[index + 1].order_number;
    newOrderedGames[index + 1].order_number = tempOrder;
    
    // Swap positions in array
    [newOrderedGames[index], newOrderedGames[index + 1]] = [newOrderedGames[index + 1], newOrderedGames[index]];
    
    setOrderedGames(newOrderedGames);
    setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    setSubmitting(true);
    try {
      const orderData = orderedGames.map(game => ({
        id: game.id,
        order_number: game.order_number
      }));

      const response = await gameAPI.updateOrder(orderData);
      
      if (response.data && response.data.success === true) {
        setSuccess('Game order updated successfully');
        setShowOrderModal(false);
        fetchGames();
      } else {
        setError(response.data?.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Order update error:', error);
      setError(error.response?.data?.message || 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (path) => {
    return path ? `http://127.0.0.1:8000/storage/${path}` : null;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading games...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Game Management</h2>
        <div>
          <Button 
            variant="info" 
            className="me-2"
            onClick={openOrderModal}
          >
            <FontAwesomeIcon icon={faSort} className="me-2" /> Reorder Games
          </Button>
          <Button variant="primary" onClick={openCreateModal}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Game
          </Button>
        </div>
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
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {games && games.length > 0 ? (
                games.map(game => (
                  <tr key={game.id}>
                    <td>{game.id}</td>
                    <td>
                      {game.image ? (
                        <Image 
                          src={getImageUrl(game.image)} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          rounded
                          thumbnail
                        />
                      ) : (
                        <Badge bg="secondary">No Image</Badge>
                      )}
                    </td>
                    <td className="fw-bold">{game.name}</td>
                    <td>
                      <Badge bg="primary">#{game.order_number}</Badge>
                    </td>
                    <td>
                      <Badge 
                        bg={game.status ? 'success' : 'danger'}
                        style={{ cursor: 'pointer', padding: '8px 12px' }}
                        onClick={() => handleToggleStatus(game.id, game.status)}
                      >
                        <FontAwesomeIcon 
                          icon={game.status ? faToggleOn : faToggleOff} 
                          className="me-2" 
                        />
                        {game.status ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit Game</Tooltip>}
                      >
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditModal(game)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Game</Tooltip>}
                      >
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteGame(game.id)}
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
                    <h5>No games found</h5>
                    <p className="text-muted">Click the "Add Game" button to create one.</p>
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
            <FontAwesomeIcon icon={selectedGame ? faEdit : faPlus} className="me-2" />
            {selectedGame ? 'Edit Game' : 'Add New Game'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={selectedGame ? handleUpdateGame : handleCreateGame}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter game name"
                    value={gameForm.name}
                    onChange={(e) => setGameForm({...gameForm, name: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Order Number</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={gameForm.order_number}
                    onChange={(e) => setGameForm({...gameForm, order_number: parseInt(e.target.value) || 0})}
                  />
                  <Form.Text className="text-muted">
                    Determines the display order (lower numbers appear first)
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
                      checked={gameForm.status === true}
                      onChange={() => setGameForm({...gameForm, status: true})}
                      inline
                    />
                    <Form.Check
                      type="radio"
                      id="inactive"
                      label="Inactive"
                      name="status"
                      checked={gameForm.status === false}
                      onChange={() => setGameForm({...gameForm, status: false})}
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
                    {gameForm.image && (
                      <Button 
                        variant="link" 
                        className="text-danger mt-2 p-0"
                        onClick={() => {
                          setGameForm({...gameForm, image: null});
                          setImagePreview(selectedGame?.image ? getImageUrl(selectedGame.image) : null);
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
                  {selectedGame ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={selectedGame ? faEdit : faPlus} className="me-2" />
                  {selectedGame ? 'Update' : 'Create'} Game
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Order Management Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faSort} className="me-2" />
            Reorder Games
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Use the up and down buttons to reorder games. Click "Save Order" when done.
          </p>
          
          <div className="border rounded p-3">
            {orderedGames.map((game, index) => (
              <div
                key={game.id}
                className="d-flex align-items-center justify-content-between p-2 mb-2 border rounded bg-light"
              >
                <div className="d-flex align-items-center">
                  <Badge bg="primary" className="me-3">#{index + 1}</Badge>
                  <div className="d-flex align-items-center">
                    {game.image && (
                      <Image 
                        src={getImageUrl(game.image)} 
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        rounded
                        className="me-2"
                      />
                    )}
                    <span className="fw-bold">{game.name}</span>
                    <Badge bg="info" className="ms-2">Order: {game.order_number}</Badge>
                  </div>
                </div>
                <div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-1"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <FontAwesomeIcon icon={faArrowUp} />
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === orderedGames.length - 1}
                  >
                    <FontAwesomeIcon icon={faArrowDown} />
                  </Button>
                </div>
              </div>
            ))}
            
            {orderedGames.length === 0 && (
              <p className="text-center text-muted py-3">No games to reorder</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            <FontAwesomeIcon icon={faTimes} className="me-2" /> Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveOrder}
            disabled={!orderChanged || submitting || orderedGames.length === 0}
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
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" /> Save Order
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GameManagement;