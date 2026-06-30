import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Row,
    Col,
    Card,
    Spinner,
    Alert,
    Button,
    Badge,
    Container,
} from "react-bootstrap";
import api from "../services/api";

const Destinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await api.get("travel/destinations/");
                setDestinations(response.data);
            } catch (err) {
                setError("Failed to load destinations. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading amazing destinations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="mt-4 shadow-sm">
                {error}
            </Alert>
        );
    }

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <div className="text-center mb-5">
                <h1 className="fw-bold display-5">Explore Destinations</h1>
                <p className="text-muted fs-5">
                    Discover beautiful places and start planning your next
                    unforgettable adventure.
                </p>
            </div>

            {destinations.length === 0 ? (
                <Alert variant="info">
                    No destinations available at the moment.
                </Alert>
            ) : (
                <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                    {destinations.map((dest) => (
                        <Col key={dest.id}>
                            <Card className="destination-card h-100 border-0 shadow-sm">

                                <div className="overflow-hidden">
                                    <Card.Img
                                        variant="top"
                                        src={dest.image}
                                        alt={dest.name}
                                        style={{
                                            height: "240px",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>

                                <Card.Body className="d-flex flex-column">

                                    <div className="mb-2">
                                        <Badge bg="primary">
                                            {dest.country}
                                        </Badge>
                                    </div>

                                    <Card.Title className="fw-bold fs-4">
                                        {dest.name}
                                    </Card.Title>

                                    <Card.Text
                                        className="text-muted mb-4"
                                        style={{
                                            minHeight: "72px",
                                            overflow: "hidden",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: "vertical",
                                        }}
                                    >
                                        {dest.description}
                                    </Card.Text>

                                    <div className="mt-auto">
                                        <Button
                                            as={Link}
                                            to={`/destinations/${dest.id}`}
                                            variant="primary"
                                            className="w-100 rounded-pill"
                                        >
                                            View Details →
                                        </Button>
                                    </div>
                                </Card.Body>

                                <Card.Footer className="bg-white border-top-0">
                                    <small className="text-muted">
                                        🌍 Best time to visit:{" "}
                                        <strong>{dest.best_time_to_visit}</strong>
                                    </small>
                                </Card.Footer>

                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Destinations;