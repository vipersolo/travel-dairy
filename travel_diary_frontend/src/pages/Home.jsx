import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-page">
            {/* 1. HERO SECTION */}
            <div 
                className="hero-section text-white text-center d-flex align-items-center justify-content-center"
                style={{
                    // Using a high-quality Unsplash image for the background
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://source.unsplash.com/1600x900/?travel,landscape)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '70vh',
                    borderRadius: '8px',
                    marginTop: '-24px', // Pulls it up flush against the layout padding
                    marginBottom: '4rem'
                }}
            >
                <Container>
                    <h1 className="display-3 fw-bold mb-4">Your Ultimate Travel Companion</h1>
                    <p className="lead mb-5 fs-4 mx-auto" style={{ maxWidth: '700px' }}>
                        Plan, budget, and book your dream vacation all in one place. 
                        Let our intelligent AI guide you to your next great adventure.
                    </p>
                    <Button as={Link} to="/destinations" variant="primary" size="lg" className="px-5 py-3 fw-bold rounded-pill">
                        Start Exploring Destinations
                    </Button>
                </Container>
            </div>

            {/* 2. CORE FEATURES SECTION */}
            <Container className="mb-5 py-5">
                <div className="text-center mb-5">
                    <h2 className="fw-bold">Why Choose Travel Diary?</h2>
                    <p className="text-muted">Everything you need for a seamless journey.</p>
                </div>

                <Row className="g-4 text-center">
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm p-4 hover-effect">
                            <Card.Body>
                                <div className="display-4 mb-3">🤖</div>
                                <Card.Title className="fw-bold">AI Recommendations</Card.Title>
                                <Card.Text className="text-muted">
                                    Our machine learning engine analyzes your preferences and destination details to suggest the perfect spots tailored just for you.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm p-4 hover-effect">
                            <Card.Body>
                                <div className="display-4 mb-3">💰</div>
                                <Card.Title className="fw-bold">Live Budget Estimation</Card.Title>
                                <Card.Text className="text-muted">
                                    No more spreadsheet math. Select your dates and accommodations to see real-time, accurate cost estimations before you book.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm p-4 hover-effect">
                            <Card.Body>
                                <div className="display-4 mb-3">🏨</div>
                                <Card.Title className="fw-bold">Secure Booking</Card.Title>
                                <Card.Text className="text-muted">
                                    Instantly reserve top-rated hotels and curated tour packages directly from verified local managers and operators.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* 3. CALL TO ACTION (BOTTOM) */}
            <div className="bg-light rounded p-5 text-center mb-5 shadow-sm">
                <h3 className="fw-bold mb-3">Ready to pack your bags?</h3>
                <p className="text-muted mb-4 fs-5">
                    Join thousands of travelers who have simplified their travel planning.
                </p>
                <div className="d-flex justify-content-center gap-3">
                    <Button as={Link} to="/destinations" variant="primary" size="lg">
                        Browse Destinations
                    </Button>
                    <Button as={Link} to="/login" variant="outline-dark" size="lg">
                        Sign In to Your Account
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Home;