import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
    // Access global auth state to personalize the dashboard
    const { user } = useSelector((state) => state.auth);
    
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserBookings = async () => {
            try {
                // Thanks to our backend permissions, this endpoint ONLY returns 
                // the bookings belonging to the currently authenticated user.
                const response = await api.get('travel/bookings/');
                setBookings(response.data);
            } catch (err) {
                setError('Failed to load your travel history. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserBookings();
    }, []);

    // 2. Derived State: Calculate total spent on all CONFIRMED or COMPLETED trips
    const totalSpent = bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);

    // Helper function to color-code statuses
    const getStatusBadge = (status) => {
        switch (status) {
            case 'CONFIRMED': return <Badge bg="success">Confirmed</Badge>;
            case 'PENDING': return <Badge bg="warning" text="dark">Pending</Badge>;
            case 'CANCELLED': return <Badge bg="danger">Cancelled</Badge>;
            case 'COMPLETED': return <Badge bg="info">Completed</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Welcome, {user?.email}</h2>
                <Button as={Link} to="/destinations" variant="outline-primary">
                    Plan a New Trip
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Top Summary Cards */}
            <Row className="mb-5 g-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-light text-center h-100">
                        <Card.Body className="py-4">
                            <h5 className="text-muted">Total Trips</h5>
                            <h2 className="display-5 fw-bold">{bookings.length}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-light text-center h-100">
                        <Card.Body className="py-4">
                            <h5 className="text-muted">Active Bookings</h5>
                            <h2 className="display-5 fw-bold text-primary">
                                {bookings.filter(b => b.status === 'CONFIRMED').length}
                            </h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-light text-center h-100">
                        <Card.Body className="py-4">
                            <h5 className="text-muted">Total Spent</h5>
                            <h2 className="display-5 fw-bold text-success">${totalSpent.toFixed(2)}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Booking History Table */}
            <h4 className="mb-3">Your Travel History</h4>
            
            {bookings.length === 0 ? (
                // 1. Industry Standard Empty State
                <Card className="text-center py-5 shadow-sm border-0 bg-light">
                    <Card.Body>
                        <h4 className="text-muted mb-3">You haven't booked any trips yet.</h4>
                        <p className="text-muted mb-4">Your travel diary is empty. Start exploring the world today!</p>
                        <Button as={Link} to="/destinations" variant="primary" size="lg">
                            Explore Destinations
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="shadow-sm border-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Booking Ref #</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Total Cost</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="align-middle">
                                    <td><strong>#{booking.id.toString().padStart(4, '0')}</strong></td>
                                    <td>{booking.check_in_date}</td>
                                    <td>{booking.check_out_date}</td>
                                    <td>${parseFloat(booking.total_amount).toFixed(2)}</td>
                                    <td>{getStatusBadge(booking.status)}</td>
                                    <td>
                                        <Button variant="link" size="sm" className="text-decoration-none">
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}
        </Container>
    );
};

export default Dashboard;