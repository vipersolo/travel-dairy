import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux'; // NEW: To check if user is logged in
import api from '../services/api';

const DestinationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Check global state to see if the user is a Citizen
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const isCitizen = isAuthenticated && user?.role === 'CITIZEN';

    const [destination, setDestination] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    
    // --- NEW: Review State ---
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDestinationData = async () => {
            setIsLoading(true);
            try {
                // Fetch destination, ML recommendations, AND reviews concurrently!
                const [destRes, recRes, reviewRes] = await Promise.all([
                    api.get(`travel/destinations/${id}/`),
                    api.get(`travel/destinations/${id}/recommendations/`).catch(() => ({ data: [] })),
                    api.get(`travel/destinations/${id}/reviews/`).catch(() => ({ data: [] }))
                ]);

                setDestination(destRes.data);
                setRecommendations(recRes.data);
                setReviews(reviewRes.data);
            } catch (err) {
                setError('Failed to load destination details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDestinationData();
    }, [id]);

    // --- NEW: Review Submission Handler ---
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        setReviewError(null);

        try {
            const response = await api.post(`travel/destinations/${id}/add_review/`, newReview);
            // Optimistically add the new review to the top of the list
            setReviews([response.data, ...reviews]);
            // Clear the form
            setNewReview({ rating: 5, comment: '' });
        } catch (err) {
            setReviewError(err.response?.data?.error || "Failed to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!destination) return null;

    return (
        <Container>
            <Button
                variant="primary"
                onClick={() => navigate(-1)}
                className="mb-3 d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2"
            >
                <span>&larr;</span>
                <span>Back</span>
            </Button>

            {/* --- Main Destination Card (Unchanged) --- */}
            <Card className="mb-5 shadow-sm border-0">
                <div style={{ height: '400px', overflow: 'hidden', borderRadius: '4px 4px 0 0' }}>
                    <Card.Img 
                        variant="top" 
                        src={destination.image} 
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                </div>
                <Card.Body className="p-4">
                    <Row>
                        <Col md={8}>
                            <h1 className="display-5 fw-bold">{destination.name}</h1>
                            <h4 className="text-muted mb-4">{destination.country}</h4>
                            <h5>About this destination</h5>
                            <p className="lead" style={{ fontSize: '1.1rem' }}>{destination.description}</p>
                        </Col>
                        <Col md={4} className="border-start ps-4">
                            <div className="mb-4">
                                <h5>Best Time to Visit</h5>
                                <Badge bg="success" className="p-2 fs-6">{destination.best_time_to_visit}</Badge>
                            </div>
                            <div className="d-grid gap-2 mt-4">
                                <Button as={Link} to={`/destinations/${destination.id}/book`} variant="primary" size="lg">
                                    Plan a Trip Here
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Row>
                <Col md={8}>
                    {/* --- NEW: The Reviews Section --- */}
                    <div className="mb-5">
                        <h3 className="mb-4">Traveler Reviews</h3>
                        
                        {/* The Submission Form (Only visible to Citizens) */}
                        {isCitizen && (
                            <Card className="mb-4 bg-light border-0 shadow-sm">
                                <Card.Body>
                                    <h5>Leave a Review</h5>
                                    {reviewError && <Alert variant="danger" className="py-2">{reviewError}</Alert>}
                                    <Form onSubmit={handleReviewSubmit}>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>Rating</Form.Label>
                                                    <Form.Select 
                                                        value={newReview.rating} 
                                                        onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
                                                    >
                                                        <option value="5">5 - Excellent</option>
                                                        <option value="4">4 - Very Good</option>
                                                        <option value="3">3 - Average</option>
                                                        <option value="2">2 - Poor</option>
                                                        <option value="1">1 - Terrible</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Your Experience</Form.Label>
                                            <Form.Control 
                                                as="textarea" 
                                                rows={3} 
                                                required
                                                placeholder="Tell others about your trip..."
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                            />
                                        </Form.Group>
                                        <Button variant="primary" type="submit" disabled={isSubmittingReview}>
                                            {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        )}

                        {/* The Reviews List */}
                        {reviews.length === 0 ? (
                            <p className="text-muted">No reviews yet. Be the first to share your experience!</p>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {reviews.map(review => (
                                    <Card key={review.id} className="border-0 shadow-sm">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between mb-2">
                                                <strong>{review.author_email.split('@')[0]}</strong>
                                                <span className="text-warning">{'⭐'.repeat(review.rating)}</span>
                                            </div>
                                            <p className="mb-1">{review.comment}</p>
                                            <small className="text-muted">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </small>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </Col>

                <Col md={4}>
                    {/* --- Machine Learning Recommendations Section (Unchanged) --- */}
                    {recommendations.length > 0 && (
                        <div className="mb-5 sticky-top" style={{ top: '20px' }}>
                            <h4 className="mb-4">You might also like</h4>
                            <div className="d-flex flex-column gap-3">
                                {recommendations.map((rec) => (
                                    <Card key={rec.id} className="shadow-sm transition-hover border-0">
                                        <Card.Img variant="top" src={rec.image} style={{ height: '120px', objectFit: 'cover' }} />
                                        <Card.Body className="py-2">
                                            <Card.Title className="h6 mb-0">{rec.name}</Card.Title>
                                            <Card.Text className="text-muted small">{rec.country}</Card.Text>
                                            <Button
                                                as={Link}
                                                to={`/destinations/${rec.id}`}
                                                variant="primary"
                                                size="sm"
                                                className="rounded-pill px-3"
                                            >
                                                Explore &rarr;
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default DestinationDetails;