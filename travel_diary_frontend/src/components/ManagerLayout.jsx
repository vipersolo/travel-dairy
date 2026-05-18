import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const ManagerLayout = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Helper to highlight the active sidebar link
    const isActive = (path) => location.pathname === path ? "bg-primary text-white" : "text-dark";

    return (
        <Container fluid className="vh-100 d-flex flex-column p-0">
            {/* Top Navbar specifically for Manager Portal */}
            <header className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                <h4 className="mb-0">🏢 Travel Diary | Business Portal</h4>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
            </header>

            <Row className="flex-grow-1 m-0">
                {/* Sidebar Navigation */}
                <Col md={2} className="bg-light border-end p-3">
                    <Nav className="flex-column gap-2">
                        <Nav.Link as={Link} to="/manager/dashboard" className={`rounded ${isActive('/manager/dashboard')}`}>
                            📊 Overview
                        </Nav.Link>
                        <Nav.Link as={Link} to="/manager/accommodations" className={`rounded ${isActive('/manager/accommodations')}`}>
                            🏨 My Hotels
                        </Nav.Link>
                        <Nav.Link as={Link} to="/manager/packages" className={`rounded ${isActive('/manager/packages')}`}>
                            🗺️ Tour Packages
                        </Nav.Link>
                    </Nav>
                </Col>

                {/* Main Content Area */}
                <Col md={10} className="p-4 bg-white overflow-auto">
                    {children}
                </Col>
            </Row>
        </Container>
    );
};

export default ManagerLayout;