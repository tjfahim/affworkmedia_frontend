// pages/affiliate/AffiliateOffers.js

import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Spinner, Alert,
    Badge, Image
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFutbol, faEye, faGamepad, faStream, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import affiliateOfferAPI from '../../services/affiliateOfferService';

const AffiliateOffers = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const response = await affiliateOfferAPI.getGames();
            if (response.data && response.data.success) {
                setGames(response.data.games);
                setError('');
            } else {
                setError('Failed to load games');
            }
        } catch (err) {
            console.error('Error fetching games:', err);
            setError(err.response?.data?.message || 'Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const getGameIcon = (gameName) => {
        const name = gameName.toLowerCase();
        if (name.includes('soccer')) return faFutbol;
        if (name.includes('nba') || name.includes('basketball')) return faFutbol;
        if (name.includes('mlb') || name.includes('baseball')) return faFutbol;
        if (name.includes('tennis')) return faFutbol;
        if (name.includes('nfl') || name.includes('football')) return faFutbol;
        return faGamepad;
    };

    const getImageUrl = (path) => {
        return path ? `http://127.0.0.1:8000/storage/${path}` : null;
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading games...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="px-4 py-4">
            <div className="mb-4">
                <h2 className="mb-2">Affiliate Offers</h2>
                <p className="text-muted">Browse available games and create tracking links</p>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}

            <Row>
                <Col lg={8} className="mx-auto">
                    {games.map(game => (
                        <Link 
                            to={`/affiliate/offers/${game.id}/events`} 
                            key={game.id} 
                            style={{ textDecoration: 'none' }}
                        >
                            <Card className="border-0 shadow-sm mb-3 game-card-horizontal">
                                <Card.Body className="p-3">
                                    <div className="d-flex align-items-center">
                                        {/* Image Section */}
                                        <div className="flex-shrink-0">
                                            {game.image ? (
                                                <Image
                                                    src={getImageUrl(game.image)}
                                                    style={{ 
                                                        width: '70px', 
                                                        height: '70px', 
                                                        objectFit: 'cover',
                                                        borderRadius: '10px'
                                                    }}
                                                />
                                            ) : (
                                                <div className="game-icon-placeholder-horizontal">
                                                    <FontAwesomeIcon icon={getGameIcon(game.name)} size="2x" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Content Section */}
                                        <div className="flex-grow-1 ms-3">
                                            <h5 className="mb-1 text-dark">{game.name}</h5>
                                            <div className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faStream} className="text-muted me-2" size="sm" />
                                                <span className="text-muted small">Streaming</span>
                                            </div>
                                        </div>
                                        
                                        {/* Button Section */}
                                        <div className="flex-shrink-0">
                                            <Button variant="primary" size="sm">
                                                View Details <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Link>
                    ))}
                </Col>
            </Row>

            <style jsx>{`
                .game-card-horizontal {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .game-card-horizontal:hover {
                    transform: translateX(5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                .game-icon-placeholder-horizontal {
                    width: 70px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                    color: white;
                }
            `}</style>
        </Container>
    );
};

export default AffiliateOffers;