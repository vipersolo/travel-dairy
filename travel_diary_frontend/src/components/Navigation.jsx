import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Navigation = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
            <Container>
                <Navbar.Brand 
                    as={Link} 
                    to="/" 
                    className="fw-bold d-flex align-items-center gap-2"
                >
                    <span role="img" aria-label="airplane">✈️</span>
                    <span>Travel Diary</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link 
                            as={Link} 
                            to="/destinations"
                            className="rounded px-3"
                        >
                            Destinations
                        </Nav.Link>
                    </Nav>

                    <Nav className="align-items-center gap-1">
                        {isAuthenticated ? (
                            <>
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard"
                                    className="rounded px-3"
                                >
                                    Dashboard
                                </Nav.Link>

                                <Button
                                    variant="outline-light"
                                    onClick={handleLogout}
                                    className="ms-2 rounded-pill px-4"
                                    size="sm"
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link 
                                    as={Link} 
                                    to="/login"
                                    className="rounded px-3"
                                >
                                    Login
                                </Nav.Link>

                                <Button
                                    as={Link}
                                    to="/register"
                                    variant="primary"
                                    className="ms-2 rounded-pill px-4 fw-semibold"
                                    size="sm"
                                >
                                    Register
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;