import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import api from '../../services/api';

const ModeratorDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('travel/moderator/analytics/');
                setAnalytics(response.data);
            } catch (err) {
                setError('Failed to load platform analytics.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;
    if (!analytics) return null;

    // Calculate percentages for the user demographic progress bar
    const travelerPct = (analytics.users.travelers / analytics.users.total) * 100 || 0;
    const businessPct = (analytics.users.businesses / analytics.users.total) * 100 || 0;

    return (
        <Container fluid className="px-0">
            <h2 className="mb-4">Platform Overview</h2>
            <p className="text-muted mb-5">
                Real-time aggregated metrics for the Travel Diary ecosystem.
            </p>

            {/* Top Level Financials */}
            <Row className="mb-4">
                <Col md={12}>
                    <Card className="border-0 shadow-sm bg-dark text-white">
                        <Card.Body className="p-5 text-center">
                            <h5 className="text-uppercase text-muted fw-bold mb-3" style={{ letterSpacing: '2px' }}>
                                Total Gross Marketplace Volume (GMV)
                            </h5>
                            <h1 className="display-3 fw-bold text-success">
                                ${parseFloat(analytics.financials.total_platform_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h1>
                            <p className="text-light mt-3">
                                Total revenue generated across all verified business accounts.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                {/* Bookings Analytics */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                            <h5 className="fw-bold">Booking Activity</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className="text-muted mb-0">Total Lifetime Bookings</h6>
                                <h3 className="mb-0 fw-bold">{analytics.bookings.total_volume}</h3>
                            </div>
                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                <div>
                                    <h6 className="text-danger mb-1 fw-bold">Action Required</h6>
                                    <small className="text-muted">Orders waiting for Manager approval</small>
                                </div>
                                <h3 className="mb-0 text-danger fw-bold">{analytics.bookings.action_required}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* User Demographics */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                            <h5 className="fw-bold">User Demographics</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-muted mb-0">Total Registered Users</h6>
                                <h3 className="mb-0 fw-bold">{analytics.users.total}</h3>
                            </div>
                            
                            <div className="mb-2 d-flex justify-content-between small fw-bold">
                                <span>Travelers ({analytics.users.travelers})</span>
                                <span>Businesses ({analytics.users.businesses})</span>
                            </div>
                            <ProgressBar style={{ height: '25px' }}>
                                <ProgressBar striped variant="primary" now={travelerPct} key={1} />
                                <ProgressBar variant="warning" now={businessPct} key={2} />
                            </ProgressBar>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ModeratorDashboard;