import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, ProgressBar, Badge } from 'react-bootstrap';
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

    // Improved Empty/Loading States
    if (isLoading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-3" />
            <h5 className="text-muted fw-normal">Gathering platform insights...</h5>
        </div>
    );

    if (error) return (
        <Container fluid className="px-4 mt-4">
            <Alert variant="danger" className="border-0 border-start border-danger border-4 shadow-sm rounded-3">
                <div className="d-flex align-items-center">
                    <div>
                        <h6 className="mb-1 fw-bold">Unable to load dashboard</h6>
                        <p className="mb-0 text-muted">{error}</p>
                    </div>
                </div>
            </Alert>
        </Container>
    );

    if (!analytics) return null;

    // Calculate percentages for the user demographic progress bar
    const travelerPct = (analytics.users.travelers / analytics.users.total) * 100 || 0;
    const businessPct = (analytics.users.businesses / analytics.users.total) * 100 || 0;

    return (
        <Container fluid className="px-4 py-4">
            {/* Header Section */}
            <div className="mb-5">
                <h2 className="fw-bold text-dark mb-1">Platform Overview</h2>
                <p className="text-muted fs-6">
                    Real-time aggregated metrics for the Travel Diary ecosystem.
                </p>
            </div>

            {/* Top Level Financials */}
            <Row className="mb-4">
                <Col md={12}>
                    <Card 
                        className="border-0 shadow text-white overflow-hidden" 
                        style={{ 
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            borderRadius: '1.25rem' 
                        }}
                    >
                        <Card.Body className="p-5 text-center position-relative">
                            <Badge 
                                bg="light" 
                                text="dark" 
                                className="mb-4 px-3 py-2 rounded-pill text-uppercase" 
                                style={{ letterSpacing: '1.5px', fontSize: '0.75rem' }}
                            >
                                Total Gross Marketplace Volume (GMV)
                            </Badge>
                            
                            <h1 className="display-4 fw-bolder mb-2" style={{ color: '#10b981' }}>
                                ${parseFloat(analytics.financials.total_platform_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h1>
                            
                            <p className="text-secondary mb-0 fs-6">
                                Total revenue generated across all verified business accounts.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                {/* Bookings Analytics */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-2 px-4">
                            <h5 className="fw-bold text-dark mb-0">Booking Activity</h5>
                        </Card.Header>
                        <Card.Body className="px-4 pb-4">
                            
                            <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom border-light">
                                <div>
                                    <h6 className="text-muted mb-1 fw-normal">Lifetime Bookings</h6>
                                </div>
                                <h2 className="mb-0 fw-bolder text-dark">{analytics.bookings.total_volume}</h2>
                            </div>

                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border-start border-danger border-4">
                                <div>
                                    <h6 className="text-danger mb-1 fw-bold">Action Required</h6>
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                        Orders waiting for Manager approval
                                    </span>
                                </div>
                                <h3 className="mb-0 text-danger fw-bold">{analytics.bookings.action_required}</h3>
                            </div>
                            
                        </Card.Body>
                    </Card>
                </Col>

                {/* User Demographics */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-2 px-4">
                            <h5 className="fw-bold text-dark mb-0">User Demographics</h5>
                        </Card.Header>
                        <Card.Body className="px-4 pb-4 d-flex flex-column justify-content-between">
                            
                            <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom border-light">
                                <div>
                                    <h6 className="text-muted mb-1 fw-normal">Registered Users</h6>
                                </div>
                                <h2 className="mb-0 fw-bolder text-dark">{analytics.users.total}</h2>
                            </div>
                            
                            <div className="mt-auto">
                                <div className="mb-3 d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.9rem' }}>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary rounded-circle me-2" style={{ width: '10px', height: '10px' }}></div>
                                        <span className="fw-semibold">Travelers</span>
                                        <span className="ms-2">({analytics.users.travelers})</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-warning rounded-circle me-2" style={{ width: '10px', height: '10px' }}></div>
                                        <span className="fw-semibold text-dark">Businesses</span>
                                        <span className="ms-2">({analytics.users.businesses})</span>
                                    </div>
                                </div>
                                
                                <ProgressBar style={{ height: '16px', borderRadius: '8px' }} className="shadow-sm">
                                    <ProgressBar variant="primary" now={travelerPct} key={1} />
                                    <ProgressBar variant="warning" now={businessPct} key={2} />
                                </ProgressBar>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ModeratorDashboard;