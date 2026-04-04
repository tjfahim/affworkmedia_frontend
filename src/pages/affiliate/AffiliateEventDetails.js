// pages/affiliate/AffiliateEventDetails.js

import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Spinner, Alert,
    Badge, Image, Form, InputGroup, ListGroup
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faCopy, faCheck, faCalendarAlt, 
    faClock, faLink, faShare, faSync
} from '@fortawesome/free-solid-svg-icons';
import { useParams, useHistory } from 'react-router-dom';
import affiliateOfferAPI from '../../services/affiliateOfferService';

const AffiliateEventDetails = () => {
    const { gameId } = useParams();
    const history = useHistory();
    const [game, setGame] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [subParams, setSubParams] = useState({
        sub1: '',
        sub2: '',
        sub3: '',
        sub4: '',
        sub5: '',
        sub6: ''
    });
    const [trackingLink, setTrackingLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [landerpageDomain, setLanderpageDomain] = useState('');
    const [affiliateId, setAffiliateId] = useState(null);
    const [noEventSelected, setNoEventSelected] = useState(true);

    useEffect(() => {
        console.log('GameId from params:', gameId);
        if (gameId) {
            fetchEvents();
        } else {
            setError('No game ID provided');
            setLoading(false);
        }
    }, [gameId]);

    useEffect(() => {
        generateTrackingLinkPreview();
    }, [selectedEvent, subParams, landerpageDomain, affiliateId, game]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            console.log('Fetching events for game:', gameId);
            const response = await affiliateOfferAPI.getGameEventsWithTracking(gameId);
            console.log('API Response:', response.data);
            
            if (response.data && response.data.success) {
                setGame(response.data.game);
                setEvents(response.data.events);
                setLanderpageDomain(response.data.landerpage_domain);
                setAffiliateId(response.data.affiliate_id);
                setSelectedEvent(null);
                setNoEventSelected(true);
                setError('');
            } else {
                setError(response.data?.message || 'Failed to load events');
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const generateTrackingLinkPreview = () => {
        if (!landerpageDomain || !affiliateId || !game) {
            return;
        }

        let link = rtrimDomain(landerpageDomain);
        link += `/id=${affiliateId}&offer_id=${game.id}`;
        
        if (selectedEvent && !noEventSelected) {
            link += `&event_id=${selectedEvent.id}`;
        }
        
        if (subParams.sub1 && subParams.sub1.trim() !== '') link += `&sub1=${encodeURIComponent(subParams.sub1)}`;
        if (subParams.sub2 && subParams.sub2.trim() !== '') link += `&sub2=${encodeURIComponent(subParams.sub2)}`;
        if (subParams.sub3 && subParams.sub3.trim() !== '') link += `&sub3=${encodeURIComponent(subParams.sub3)}`;
        if (subParams.sub4 && subParams.sub4.trim() !== '') link += `&sub4=${encodeURIComponent(subParams.sub4)}`;
        if (subParams.sub5 && subParams.sub5.trim() !== '') link += `&sub5=${encodeURIComponent(subParams.sub5)}`;
        if (subParams.sub6 && subParams.sub6.trim() !== '') link += `&sub6=${encodeURIComponent(subParams.sub6)}`;
        
        setTrackingLink(link);
    };

    const rtrimDomain = (domain) => {
        return domain.endsWith('/') ? domain.slice(0, -1) : domain;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(trackingLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDateTime = (datetime) => {
        if (!datetime) return 'N/A';
        const date = new Date(datetime);
        return date.toLocaleString();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'running':
                return <Badge bg="success" className="p-2"><FontAwesomeIcon icon={faClock} className="me-1" /> Live</Badge>;
            case 'upcoming':
                return <Badge bg="warning" className="p-2"><FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> Upcoming</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const handleSubChange = (field, value) => {
        setSubParams({ ...subParams, [field]: value });
    };

    const handleEventSelection = (event) => {
        if (event === null) {
            setSelectedEvent(null);
            setNoEventSelected(true);
        } else {
            setSelectedEvent(event);
            setNoEventSelected(false);
        }
    };

    const resetAll = () => {
        setSelectedEvent(null);
        setNoEventSelected(true);
        setSubParams({
            sub1: '',
            sub2: '',
            sub3: '',
            sub4: '',
            sub5: '',
            sub6: ''
        });
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading events...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="px-4 py-4">
            <Button 
                variant="link" 
                className="mb-3 p-0"
                onClick={() => history.push('/affiliate/offers')}
            >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Back to Games
            </Button>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}

            {/* Game Info */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            {game?.image && (
                                <Image
                                    src={`http://127.0.0.1:8000/storage/${game.image}`}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    rounded
                                    className="me-3"
                                />
                            )}
                            <div>
                                <h3 className="mb-1">{game?.name || 'Game'}</h3>
                                <p className="text-muted mb-0">Generate your tracking link</p>
                            </div>
                        </div>
                        <Button variant="outline-secondary" size="sm" onClick={resetAll}>
                            <FontAwesomeIcon icon={faSync} className="me-2" />
                            Reset
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Tracking Link Generator - Full Width Section */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 pt-4">
                    <h5 className="mb-0">Generated Tracking Link</h5>
                    <p className="text-muted small mt-1">The link updates automatically as you make selections below</p>
                </Card.Header>
                <Card.Body>
                    <Form.Group className="mb-0">
                        <InputGroup>
                            <InputGroup.Text className="bg-primary text-white">
                                <FontAwesomeIcon icon={faLink} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                value={trackingLink}
                                readOnly
                                disabled
                                className="bg-light font-monospace"
                                style={{ fontSize: '14px' }}
                            />
                            <Button 
                                variant={copied ? "success" : "primary"}
                                onClick={copyToClipboard}
                                disabled={!trackingLink}
                            >
                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                                <span className="ms-2">{copied ? 'Copied!' : 'Copy'}</span>
                            </Button>
                        </InputGroup>
                        <Form.Text className="text-muted mt-2 d-block">
                            <FontAwesomeIcon icon={faShare} className="me-1" />
                            Use this link to promote your offers
                        </Form.Text>
                    </Form.Group>
                </Card.Body>
            </Card>

            <Row>
                {/* Optional Events Selection - Left Side */}
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-0 pt-4">
                            <h5 className="mb-0">Select Event</h5>
                            <p className="text-muted small mt-1">Choose an event to add event_id to your link</p>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ListGroup variant="flush">
                                <ListGroup.Item 
                                    action
                                    active={noEventSelected}
                                    onClick={() => handleEventSelection(null)}
                                    style={{ cursor: 'pointer' }}
                                    className="border-0 border-bottom"
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <Form.Check
                                                type="radio"
                                                name="event"
                                                id="no-event"
                                                checked={noEventSelected}
                                                onChange={() => handleEventSelection(null)}
                                            />
                                        </div>
                                        <div>
                                            <strong>No Event Selected</strong>
                                            <div className="small text-muted mt-1">
                                                Event ID will not be included in the tracking link
                                            </div>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                                
                                {events.map(event => (
                                    <ListGroup.Item 
                                        key={event.id}
                                        action
                                        active={selectedEvent?.id === event.id}
                                        onClick={() => handleEventSelection(event)}
                                        style={{ cursor: 'pointer' }}
                                        className="border-0 border-bottom"
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-start">
                                                    <div className="me-3">
                                                        <Form.Check
                                                            type="radio"
                                                            name="event"
                                                            id={`event-${event.id}`}
                                                            checked={selectedEvent?.id === event.id}
                                                            onChange={() => handleEventSelection(event)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <strong>{event.first_team?.name} vs {event.second_team?.name}</strong>
                                                        <div className="small text-muted mt-1">
                                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                            {formatDateTime(event.start_datetime)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {getStatusBadge(event.status)}
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Optional Sub Parameters - Right Side */}
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-0 pt-4">
                            <h5 className="mb-0">Sub Parameters</h5>
                            <p className="text-muted small mt-1">Add custom tracking parameters to your link</p>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sub 1</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter sub 1 value"
                                            value={subParams.sub1}
                                            onChange={(e) => handleSubChange('sub1', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sub 2</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter sub 2 value"
                                            value={subParams.sub2}
                                            onChange={(e) => handleSubChange('sub2', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sub 3</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter sub 3 value"
                                            value={subParams.sub3}
                                            onChange={(e) => handleSubChange('sub3', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sub 4</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter sub 4 value"
                                            value={subParams.sub4}
                                            onChange={(e) => handleSubChange('sub4', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sub 5</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter sub 5 value"
                                            value={subParams.sub5}
                                            onChange={(e) => handleSubChange('sub5', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sub 6</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter sub 6 value"
                                            value={subParams.sub6}
                                            onChange={(e) => handleSubChange('sub6', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

     
        </Container>
    );
};

export default AffiliateEventDetails;