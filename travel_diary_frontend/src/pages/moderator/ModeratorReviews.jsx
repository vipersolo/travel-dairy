import { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import api from '../../services/api';

const ModeratorReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    // Modal State for reading long reviews
    const [showModal, setShowModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get('travel/moderator/reviews/');
                setReviews(response.data);
            } catch (err) {
                setError('Failed to load the moderation queue.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const handleToggleVisibility = async (reviewId) => {
        setProcessingId(reviewId);
        try {
            const response = await api.post(`travel/moderator/reviews/${reviewId}/toggle_visibility/`);
            
            // Optimistic UI Update
            setReviews(reviews.map(review => 
                review.id === reviewId 
                    ? { ...review, is_visible: response.data.is_visible } 
                    : review
            ));
        } catch (err) {
            alert('Failed to update review status.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewFullReview = (review) => {
        setSelectedReview(review);
        setShowModal(true);
    };

    if (isLoading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <Container fluid className="px-0">
            <h2 className="mb-4">Content Moderation Queue</h2>
            <p className="text-muted mb-4">
                Monitor platform sentiment and remove abusive or inappropriate content. 
                Removed reviews are hidden from the public but retained in the database.
            </p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Date</th>
                            <th>Author</th>
                            <th>Target Listing</th>
                            <th>Rating</th>
                            <th>Snippet</th>
                            <th>Visibility</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review.id} className="align-middle">
                                <td><small>{new Date(review.created_at).toLocaleDateString()}</small></td>
                                <td>{review.author_email}</td>
                                <td><strong>{review.target_name}</strong></td>
                                <td>{review.rating} ⭐</td>
                                
                                {/* CSS Truncation to keep the table clean */}
                                <td style={{ maxWidth: '250px' }}>
                                    <div className="text-truncate" style={{ cursor: 'pointer' }} onClick={() => handleViewFullReview(review)}>
                                        {review.comment}
                                    </div>
                                </td>

                                <td>
                                    {review.is_visible ? (
                                        <Badge bg="success">Public</Badge>
                                    ) : (
                                        <Badge bg="danger">Hidden</Badge>
                                    )}
                                </td>
                                
                                <td className="text-end">
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        className="me-2"
                                        onClick={() => handleViewFullReview(review)}
                                    >
                                        Read
                                    </Button>
                                    <Button 
                                        variant={review.is_visible ? "outline-danger" : "outline-success"} 
                                        size="sm"
                                        onClick={() => handleToggleVisibility(review.id)}
                                        disabled={processingId === review.id}
                                    >
                                        {processingId === review.id ? (
                                            <Spinner size="sm" animation="border" />
                                        ) : review.is_visible ? (
                                            'Take Down'
                                        ) : (
                                            'Restore'
                                        )}
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {reviews.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center py-5 text-muted">
                                    No reviews have been posted yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Read Full Review Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Review Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && (
                        <>
                            <div className="d-flex justify-content-between mb-3">
                                <strong>Target: {selectedReview.target_name}</strong>
                                <span>{selectedReview.rating} ⭐</span>
                            </div>
                            <p className="text-muted small border-bottom pb-2">
                                By {selectedReview.author_email} on {new Date(selectedReview.created_at).toLocaleDateString()}
                            </p>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedReview.comment}</p>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ModeratorReviews;