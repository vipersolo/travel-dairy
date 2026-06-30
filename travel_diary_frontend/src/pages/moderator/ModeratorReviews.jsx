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

    // Improved Loading State
    if (isLoading) {
        return (
            <Container fluid className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" className="mb-3" />
                <h5 className="text-muted fw-normal">Loading moderation queue...</h5>
            </Container>
        );
    }

    return (
        <Container fluid className="px-4 py-4">
            {/* Header Section */}
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Content Moderation Queue</h2>
                <p className="text-secondary">
                    Monitor platform sentiment and remove abusive or inappropriate content. 
                    Removed reviews are hidden from the public but retained in the database.
                </p>
            </div>

            {/* Error Handling */}
            {error && (
                <Alert variant="danger" className="shadow-sm rounded-3">
                    <strong>Error:</strong> {error}
                </Alert>
            )}

            {/* Main Content Card */}
            <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
                <Table responsive hover className="mb-0">
                    <thead className="bg-light border-bottom">
                        <tr>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>Date</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>Author</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>Target Listing</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>Rating</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>Snippet</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>Visibility</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3 text-end" style={{ fontSize: '0.85rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review.id} className="align-middle">
                                <td className="py-3">
                                    <span className="text-secondary">
                                        {new Date(review.created_at).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </td>
                                <td className="py-3 text-dark">{review.author_email}</td>
                                <td className="py-3">
                                    <strong className="text-dark">{review.target_name}</strong>
                                </td>
                                <td className="py-3">
                                    <Badge bg="light" text="dark" className="border px-2 py-1">
                                        {review.rating} ⭐
                                    </Badge>
                                </td>
                                
                                {/* Refined Truncation */}
                                <td className="py-3" style={{ maxWidth: '250px' }}>
                                    <div 
                                        className="text-truncate text-secondary" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => handleViewFullReview(review)}
                                        title="Click to read full review"
                                    >
                                        {review.comment}
                                    </div>
                                </td>

                                <td className="py-3">
                                    {review.is_visible ? (
                                        <Badge bg="success" pill className="px-3 py-2 fw-normal">Public</Badge>
                                    ) : (
                                        <Badge bg="secondary" pill className="px-3 py-2 fw-normal">Hidden</Badge>
                                    )}
                                </td>
                                
                                <td className="py-3 text-end">
                                    <Button 
                                        variant="light" 
                                        size="sm" 
                                        className="rounded-pill px-3 me-2 text-primary border"
                                        onClick={() => handleViewFullReview(review)}
                                    >
                                        Read
                                    </Button>
                                    <Button 
                                        variant={review.is_visible ? "outline-danger" : "primary"} 
                                        size="sm"
                                        className="rounded-pill px-3"
                                        style={{ minWidth: '115px' }}
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

                        {/* Improved Empty State */}
                        {reviews.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center py-5">
                                    <div className="d-flex flex-column align-items-center justify-content-center text-muted">
                                        <div className="fs-1 mb-2">💬</div>
                                        <h5 className="fw-normal mb-1">No Reviews Found</h5>
                                        <p className="mb-0 text-secondary">No reviews have been posted to the platform yet.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Read Full Review Modal - Improved UI */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold fs-4">Review Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pb-4 pt-2">
                    {selectedReview && (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-3">
                                <div>
                                    <h6 className="mb-1 text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Target Listing</h6>
                                    <strong className="fs-5">{selectedReview.target_name}</strong>
                                </div>
                                <div className="text-end">
                                    <Badge bg="white" text="dark" className="border shadow-sm px-3 py-2 fs-6 mb-1">
                                        {selectedReview.rating} ⭐
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <span className="text-secondary small fw-medium">
                                    Written by <span className="text-dark">{selectedReview.author_email}</span> on {new Date(selectedReview.created_at).toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            
                            <div className="p-4 border rounded-3 bg-white">
                                <p className="mb-0 fs-6 text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                    {selectedReview.comment}
                                </p>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ModeratorReviews;