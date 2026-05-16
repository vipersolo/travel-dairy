import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import api from '../services/api';

const DestinationDetails = () => {
    // 1. Dynamic Routing: Extract the ID from the URL (/destinations/:id)
    const { id } = useParams();
    const navigate = useNavigate();

    // 2. Component State
    const [destination, setDestination] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDestinationData = async () => {
            setIsLoading(true);
            try {
                // 3. Concurrent Fetching: Fire both API calls at the exact same time
                const [destResponse, recResponse] = await Promise.all([
                    api.get(`travel/destinations/${id}/`),
                    api.get(`travel/destinations/${id}/recommendations/`).catch(() => ({ data: [] }))
                    // Note: We catch the recommendations error so a failure in the ML engine 
                    // doesn't stop the main destination page from loading.
                ]);

                setDestination(destResponse.data);
                setRecommendations(recResponse.data);
            } catch (err) {
                setError('Failed to load destination details. It may have been removed.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDestinationData();
    }, [id]); // Re-run this effect if the URL ID changes

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!destination) return null;

    return (
        <Container>
            <Button variant="link" onClick={() => navigate(-1)} className="mb-3 px-0">
                &larr; Back to Destinations
            </Button>

            {/* Main Destination Section */}
            <Card className="mb-5 shadow-sm border-0">
                {/* Real apps will use the image URL from the database, using Unsplash as a placeholder */}
                <div style={{ height: '400px', overflow: 'hidden', borderRadius: '4px 4px 0 0' }}>
                    <Card.Img 
                        variant="top" 
                        src={`https://source.unsplash.com/1200x400/?${destination.name},landscape`} 
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                </div>
                <Card.Body className="p-4">
                    <Row>
                        <Col md={8}>
                            <h1 className="display-5 fw-bold">{destination.name}</h1>
                            <h4 className="text-muted mb-4">{destination.country}</h4>
                            
                            <h5>About this destination</h5>
                            <p className="lead" style={{ fontSize: '1.1rem' }}>
                                {destination.description}
                            </p>
                        </Col>
                        <Col md={4} className="border-start ps-4">
                            <div className="mb-4">
                                <h5>Best Time to Visit</h5>
                                <Badge bg="success" className="p-2 fs-6">{destination.best_time_to_visit}</Badge>
                            </div>
                            
                            <div className="d-grid gap-2 mt-4">
                                {/* Plan trip button */}
                                <Button as={Link} to={`/destinations/${destination.id}/book`} variant="primary" size="lg">
                                    Plan a Trip Here
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Machine Learning Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="mb-5">
                    <h3 className="mb-4">Recommended Based on {destination.name}</h3>
                    <Row xs={1} md={3} className="g-4">
                        {recommendations.map((rec) => (
                            <Col key={rec.id}>
                                <Card className="h-100 shadow-sm transition-hover">
                                    <Card.Img variant="top" src={`https://source.unsplash.com/400x300/?${rec.name},city`} />
                                    <Card.Body>
                                        <Card.Title>{rec.name}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">{rec.country}</Card.Subtitle>
                                        <Button 
                                            as={Link} 
                                            to={`/destinations/${rec.id}`} 
                                            variant="outline-secondary" 
                                            size="sm" 
                                            className="mt-2"
                                        >
                                            Explore
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </Container>
    );
};

export default DestinationDetails;