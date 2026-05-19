import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import api from '../services/api';

const Destinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                // Fetching from Django API
                const response = await api.get('travel/destinations/');
                setDestinations(response.data);
            } catch (err) {
                setError('Failed to load destinations. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div>
            <h2 className="mb-4">Explore Destinations</h2>
            <Row xs={1} md={2} lg={3} className="g-4">
                {destinations.map((dest) => (
                    <Col key={dest.id}>
                        <Card className="h-100 shadow-sm">
                            {/* Placeholder image, we can add real image uploads later */}
                            <Card.Img variant="top" src={dest?.image} />
                            <Card.Body>
                                <Card.Title>{dest.name}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{dest.country}</Card.Subtitle>
                                <Card.Text className="text-truncate">
                                    {dest.description}
                                </Card.Text>
                                <Button as={Link} to={`/destinations/${dest.id}`} variant="outline-primary" size="sm">
                                    View Details
                                </Button>
                            </Card.Body>
                            <Card.Footer>
                                <small className="text-muted">Best time to visit: {dest.best_time_to_visit}</small>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Destinations;