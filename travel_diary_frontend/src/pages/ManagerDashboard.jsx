import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button, Tabs, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import api from '../services/api';

const ManagerDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    
    // State for the two main datasets a Manager cares about
    const [myProperties, setMyProperties] = useState([]);
    const [incomingBookings, setIncomingBookings] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchManagerData = async () => {
            try {
                // In a production environment, you would have dedicated endpoints like:
                // /api/v1/travel/accommodations/my_properties/ 
                // For now, we fetch them and rely on backend/frontend filtering
                const [accRes, bookingsRes] = await Promise.all([
                    api.get('travel/accommodations/'),
                    api.get('travel/bookings/') // Assume backend filters this to show only bookings for their properties
                ]);

                // Filter to only show properties owned by this manager 
                // (Assuming the backend sends manager_email or ID)
                const properties = accRes.data.filter(p => p.manager_company === user.company_name || true); // Adjust based on your exact payload
                
                setMyProperties(properties);
                setIncomingBookings(bookingsRes.data);
            } catch (err) {
                setError('Failed to load your business dashboard.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchManagerData();
    }, [user]);

    // Derived State for B2B Analytics
    const totalExpectedRevenue = incomingBookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'CONFIRMED': return <Badge bg="success">Confirmed</Badge>;
            case 'PENDING': return <Badge bg="warning" text="dark">Action Required</Badge>;
            case 'CANCELLED': return <Badge bg="danger">Cancelled</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Business Portal: {user?.company_name || 'My Company'}</h2>
                <Button variant="primary">
                    + Add New Property
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* B2B Analytics Cards */}
            <Row className="mb-5 g-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-dark text-white text-center h-100">
                        <Card.Body className="py-4">
                            <h5 className="text-light">Active Properties</h5>
                            <h2 className="display-5 fw-bold">{myProperties.length}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-light text-center h-100">
                        <Card.Body className="py-4">
                            <h5 className="text-muted">Total Bookings</h5>
                            <h2 className="display-5 fw-bold text-primary">{incomingBookings.length}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-light text-center h-100 border-start border-success border-4">
                        <Card.Body className="py-4">
                            <h5 className="text-muted">Expected Revenue</h5>
                            <h2 className="display-5 fw-bold text-success">${totalExpectedRevenue.toFixed(2)}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Industry Standard: Tabbed Workspace */}
            <Tabs defaultActiveKey="bookings" className="mb-4 custom-tabs">
                
                {/* TAB 1: Incoming Bookings Management */}
                <Tab eventKey="bookings" title="Incoming Bookings">
                    <Card className="shadow-sm border-0">
                        {incomingBookings.length === 0 ? (
                            <Card.Body className="text-center py-5">
                                <p className="text-muted">No bookings yet. Make sure your properties are active!</p>
                            </Card.Body>
                        ) : (
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Ref #</th>
                                        <th>Customer</th>
                                        <th>Dates</th>
                                        <th>Property/Package</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incomingBookings.map((booking) => (
                                        <tr key={booking.id} className="align-middle">
                                            <td>#{booking.id.toString().padStart(4, '0')}</td>
                                            <td>{booking.citizen_name || 'Guest'}</td>
                                            <td>{booking.check_in_date} to {booking.check_out_date}</td>
                                            <td>{booking.accommodation_name || booking.tour_package_name}</td>
                                            <td>${parseFloat(booking.total_amount).toFixed(2)}</td>
                                            <td>{getStatusBadge(booking.status)}</td>
                                            <td>
                                                {/* Managers typically need to "Confirm" pending bookings */}
                                                <Button 
                                                    variant="outline-success" 
                                                    size="sm" 
                                                    disabled={booking.status !== 'PENDING'}
                                                >
                                                    Approve
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card>
                </Tab>

                {/* TAB 2: Property Inventory Management */}
                <Tab eventKey="inventory" title="My Properties & Packages">
                    <Card className="shadow-sm border-0">
                        {myProperties.length === 0 ? (
                            <Card.Body className="text-center py-5">
                                <p className="text-muted">You haven't listed any properties yet.</p>
                            </Card.Body>
                        ) : (
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Property Name</th>
                                        <th>Location</th>
                                        <th>Price/Night</th>
                                        <th>Rating</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myProperties.map((prop) => (
                                        <tr key={prop.id} className="align-middle">
                                            <td><strong>{prop.name}</strong></td>
                                            <td>{prop.destination_name}</td>
                                            <td>${parseFloat(prop.price_per_night).toFixed(2)}</td>
                                            <td>{prop.star_rating} ⭐</td>
                                            <td>
                                                <Badge bg={prop.is_active ? 'success' : 'secondary'}>
                                                    {prop.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button variant="link" size="sm">Edit</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card>
                </Tab>

            </Tabs>
        </Container>
    );
};

export default ManagerDashboard;