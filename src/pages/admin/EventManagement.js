// pages/admin/EventManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Badge, Modal, Form, Alert, Spinner, 
  Row, Col, Card 
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faCalendarAlt, faClock,
  faGamepad, faUsers
} from '@fortawesome/free-solid-svg-icons';
import eventAPI from '../../services/eventService';
import gameAPI from '../../services/gameService';
import teamAPI from '../../services/teamService';

// Helper function to format date without date-fns
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${month} ${day}, ${year} ${hours}:${minutes}`;
};

// Helper to get current datetime for input default
const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper to get future datetime (for end time default)
const getFutureDateTime = (hoursToAdd = 1) => {
  const now = new Date();
  now.setHours(now.getHours() + hoursToAdd);
  
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [eventForm, setEventForm] = useState({
    game_manage_id: '',
    first_team_id: '',
    second_team_id: '',
    start_datetime: '',
    end_datetime: '',
    status: 'upcoming'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [eventsRes, gamesRes, teamsRes] = await Promise.all([
        eventAPI.getEvents(),
        gameAPI.getGames(),
        teamAPI.getTeams()
      ]);
      
      console.log('Events response:', eventsRes.data);
      console.log('Games response:', gamesRes.data);
      console.log('Teams response:', teamsRes.data);
      
      if (eventsRes.data && eventsRes.data.success === true) {
        setEvents(eventsRes.data.events);
      }
      
      if (gamesRes.data && gamesRes.data.success === true) {
        setGames(gamesRes.data.games);
      }
      
      if (teamsRes.data && teamsRes.data.success === true) {
        setTeams(teamsRes.data.teams);
      }
      
      setError('');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      setError('');
      const response = await eventAPI.createEvent(eventForm);
      
      if (response.data && response.data.success === true) {
        setSuccess('Event created successfully');
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        setError(response.data?.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Create error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to create event');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      setError('');
      const response = await eventAPI.updateEvent(selectedEvent.id, eventForm);
      
      if (response.data && response.data.success === true) {
        setSuccess('Event updated successfully');
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        setError(response.data?.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to update event');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await eventAPI.deleteEvent(id);
        if (response.data && response.data.success === true) {
          setSuccess('Event deleted successfully');
          fetchData();
        } else {
          setError(response.data?.message || 'Failed to delete event');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const resetForm = () => {
    setEventForm({
      game_manage_id: '',
      first_team_id: '',
      second_team_id: '',
      start_datetime: '',
      end_datetime: '',
      status: 'upcoming'
    });
    setSelectedEvent(null);
    setError('');
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setEventForm({
      game_manage_id: event.game_manage_id,
      first_team_id: event.first_team_id,
      second_team_id: event.second_team_id,
      start_datetime: event.start_datetime ? event.start_datetime.slice(0, 16) : '',
      end_datetime: event.end_datetime ? event.end_datetime.slice(0, 16) : '',
      status: event.status
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setEventForm({
      ...eventForm,
      start_datetime: getCurrentDateTime(),
      end_datetime: getFutureDateTime(1)
    });
    setShowModal(true);
  };

  const getGameName = (gameId) => {
    const game = games.find(g => g.id === gameId);
    return game ? game.name : 'Unknown Game';
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      upcoming: 'warning',
      running: 'success',
      finished: 'secondary'
    };
    
    return (
      <Badge bg={statusColors[status] || 'primary'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Event Management</h2>
        <Button variant="primary" onClick={openCreateModal}>
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Event
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
                <th>Game</th>
                <th>Teams</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events && events.length > 0 ? (
                events.map(event => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faGamepad} className="me-2 text-primary" />
                        {getGameName(event.game_manage_id)}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faUsers} className="me-2 text-info" />
                        <div>
                          <div>{getTeamName(event.first_team_id)}</div>
                          <div className="text-muted small">vs</div>
                          <div>{getTeamName(event.second_team_id)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                        {formatDate(event.start_datetime)}
                      </div>
                    </td>
                    <td>
                      {event.end_datetime ? (
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faClock} className="me-2 text-warning" />
                          {formatDate(event.end_datetime)}
                        </div>
                      ) : (
                        <Badge bg="secondary">Not set</Badge>
                      )}
                    </td>
                    <td>{getStatusBadge(event.status)}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => openEditModal(event)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <h5>No events found</h5>
                    <p className="text-muted">Click the "Add Event" button to create one.</p>
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
            <FontAwesomeIcon icon={selectedEvent ? faEdit : faPlus} className="me-2" />
            {selectedEvent ? 'Edit Event' : 'Add New Event'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Game <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={eventForm.game_manage_id}
                    onChange={(e) => setEventForm({...eventForm, game_manage_id: e.target.value})}
                    required
                  >
                    <option value="">Select Game</option>
                    {games.filter(game => game.status).map(game => (
                      <option key={game.id} value={game.id}>{game.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">First Team <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={eventForm.first_team_id}
                    onChange={(e) => setEventForm({...eventForm, first_team_id: e.target.value})}
                    required
                  >
                    <option value="">Select First Team</option>
                    {teams.filter(team => team.status).map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Second Team <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={eventForm.second_team_id}
                    onChange={(e) => setEventForm({...eventForm, second_team_id: e.target.value})}
                    required
                  >
                    <option value="">Select Second Team</option>
                    {teams.filter(team => team.status).map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </Form.Select>
                  {eventForm.first_team_id && eventForm.second_team_id === eventForm.first_team_id && (
                    <Form.Text className="text-danger">
                      First and Second teams must be different
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Start Date & Time <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={eventForm.start_datetime}
                    onChange={(e) => setEventForm({...eventForm, start_datetime: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">End Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={eventForm.end_datetime}
                    onChange={(e) => setEventForm({...eventForm, end_datetime: e.target.value})}
                  />
                  <Form.Text className="text-muted">
                    Leave empty if duration is unknown
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Status</Form.Label>
                  <Form.Select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({...eventForm, status: e.target.value})}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="running">Running</option>
                    <option value="finished">Finished</option>
                  </Form.Select>
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
              disabled={submitting || (
                eventForm.first_team_id && 
                eventForm.second_team_id && 
                eventForm.first_team_id === eventForm.second_team_id
              )}
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
                  {selectedEvent ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={selectedEvent ? faEdit : faPlus} className="me-2" />
                  {selectedEvent ? 'Update' : 'Create'} Event
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default EventManagement;