import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ButtonGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('CITIZEN'); // Default to traveler
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        company_name: '',
        // REPLACED address with these two fields:
        business_registration_number: '',
        contact_phone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Send the merged payload + the selected role to Django
            await api.post('users/register/', { ...formData, role });
            
            setSuccess(true);
            // Redirect to login after a short delay
            setTimeout(() => navigate('/login'), 3000);
            
        } catch (err) {
            // Extract the first error message from the DRF response object
            const errorData = err.response?.data;
            let errorMessage = "Registration failed. Please check your inputs.";
            if (errorData) {
                const firstKey = Object.keys(errorData)[0];
                errorMessage = errorData[firstKey][0];
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '600px' }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Create an Account</h2>
                        <p className="text-muted">Join the Travel Diary community today.</p>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    {success ? (
                        <Alert variant="success" className="text-center py-4">
                            <h4>Registration Successful!</h4>
                            <p>Redirecting you to the login page...</p>
                            {role === 'MANAGER' && (
                                <small className="d-block mt-2">
                                    Note: Your business account will need to be verified by an administrator before you can post inventory.
                                </small>
                            )}
                        </Alert>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            {/* Role Toggle */}
                            <div className="d-flex justify-content-center mb-4">
                                <ButtonGroup>
                                    <Button 
                                        variant={role === 'CITIZEN' ? 'primary' : 'outline-primary'}
                                        onClick={() => setRole('CITIZEN')}
                                    >
                                        I am a Traveler
                                    </Button>
                                    <Button 
                                        variant={role === 'MANAGER' ? 'primary' : 'outline-primary'}
                                        onClick={() => setRole('MANAGER')}
                                    >
                                        I am a Business
                                    </Button>
                                </ButtonGroup>
                            </div>

                            {/* Core Fields (Shared) */}
                            <Form.Group className="mb-3">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required minLength="8" />
                            </Form.Group>

                            {/* Dynamic Fields: Citizen */}
                            {role === 'CITIZEN' && (
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}

                            {/* Dynamic Fields: Manager */}
                            {role === 'MANAGER' && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Company Name</Form.Label>
                                        <Form.Control type="text" name="company_name" value={formData.company_name} onChange={handleChange} required />
                                    </Form.Group>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Registration Number</Form.Label>
                                                <Form.Control type="text" name="business_registration_number" value={formData.business_registration_number} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Contact Phone</Form.Label>
                                                <Form.Control type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            <Button variant="primary" type="submit" className="w-100 py-2 mt-3" disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Register'}
                            </Button>
                        </Form>
                    )}

                    <div className="text-center mt-4">
                        <span className="text-muted">Already have an account? </span>
                        <Link to="/login" className="text-decoration-none fw-bold">Sign In</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Register;