import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { loginSuccess } from '../store/authSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Hitting the Django JWT endpoint
            const response = await api.post('auth/login/', { email, password });
            
            // Dispatching to Redux to update global state
            dispatch(loginSuccess({
                access: response.data.access,
                refresh: response.data.refresh,
                user: { 
                    email: response.data.email,
                    role: response.data.role 
                }
            }));
            
            // NEW: Intelligent Redirect based on role
            if (response.data.role === 'MANAGER') {
                navigate('/manager/dashboard');
            } else if (response.data.role === 'MODERATOR') {
                navigate('/moderator/dashboard');
            } else {
                navigate('/dashboard'); // Standard Citizen
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Card style={{ width: '400px' }} className="shadow-sm">
                <Card.Body>
                    <h3 className="text-center mb-4">Welcome Back</h3>
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                            {isLoading ? <Spinner animation="border" size="sm" /> : 'Login'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Login;