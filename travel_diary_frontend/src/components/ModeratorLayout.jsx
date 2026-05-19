import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const ModeratorLayout = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Helper to highlight the active sidebar link
    const isActive = (path) => location.pathname === path ? "bg-danger text-white" : "text-dark";

    return (
        <Container fluid className="vh-100 d-flex flex-column p-0">
            {/* Top Navbar specifically for the Admin/Moderator Portal */}
            <header className="bg-dark text-white p-3 d-flex justify-content-between align-items-center border-bottom border-danger border-3">
                <h4 className="mb-0">🛡️ Travel Diary | Admin Control Panel</h4>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
            </header>

            <Row className="flex-grow-1 m-0">
                {/* Sidebar Navigation */}
                <Col md={2} className="bg-light border-end p-3 shadow-sm z-1">
                    <div className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: '0.8rem' }}>
                        System Management
                    </div>
                    <Nav className="flex-column gap-2 mb-4">
                        <Nav.Link as={Link} to="/moderator/dashboard" className={`rounded ${isActive('/moderator/dashboard')}`}>
                            📈 Platform Analytics
                        </Nav.Link>
                        
                        {/* NEW: Manage Destinations Link added here */}
                        <Nav.Link as={Link} to="/moderator/destinations" className={`rounded ${isActive('/moderator/destinations')}`}>
                            🌍 Manage Destinations
                        </Nav.Link>
                    </Nav>

                    <div className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: '0.8rem' }}>
                        Moderation Queues
                    </div>
                    <Nav className="flex-column gap-2">
                        <Nav.Link as={Link} to="/moderator/verification" className={`rounded ${isActive('/moderator/verification')}`}>
                            🏢 Business Verification
                        </Nav.Link>
                        <Nav.Link as={Link} to="/moderator/reviews" className={`rounded ${isActive('/moderator/reviews')}`}>
                            💬 Flagged Reviews
                        </Nav.Link>
                    </Nav>
                </Col>

                {/* Main Content Area */}
                <Col md={10} className="p-4 bg-white overflow-auto" style={{ height: 'calc(100vh - 60px)' }}>
                    {children}
                </Col>
            </Row>
        </Container>
    );
};

export default ModeratorLayout;