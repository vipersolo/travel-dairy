import { useState } from 'react';
import {
    Form,
    Button,
    Card,
    Alert,
    Spinner,
    InputGroup
} from 'react-bootstrap';
import { EnvelopeFill, LockFill, BoxArrowInRight } from 'react-bootstrap-icons';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { loginSuccess } from '../store/authSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] =useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('users/login/', {
                email,
                password
            });

            dispatch(
                loginSuccess({
                    access: response.data.access,
                    refresh: response.data.refresh,
                    user: {
                        email: response.data.email,
                        role: response.data.role,
                    },
                })
            );

            if (response.data.role === 'MANAGER') {
                navigate('/manager/dashboard');
            } else if (response.data.role === 'MODERATOR') {
                navigate('/moderator/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center py-5 px-3"
            style={{
                minHeight: '100vh',
                background:
                    'linear-gradient(135deg, #eef5ff 0%, #f8fbff 50%, #ffffff 100%)',
            }}
        >
            <Card
                className="border-0 shadow-lg"
                style={{
                    maxWidth: '430px',
                    width: '100%',
                    borderRadius: '20px',
                    overflow: 'hidden',
                }}
            >
                <Card.Body className="p-5">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div
                            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                background:
                                    'linear-gradient(135deg, #0d6efd, #4dabf7)',
                                color: '#fff',
                                fontSize: '28px',
                                boxShadow: '0 10px 25px rgba(13,110,253,.25)',
                            }}
                        >
                            <BoxArrowInRight />
                        </div>

                        <h2 className="fw-bold mb-1">Welcome Back</h2>

                        <p className="text-muted mb-0">
                            Sign in to continue your journey.
                        </p>
                    </div>

                    {error && (
                        <Alert
                            variant="danger"
                            className="rounded-3 border-0 shadow-sm"
                        >
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        {/* Email */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                                Email Address
                            </Form.Label>

                            <InputGroup>
                                <InputGroup.Text
                                    style={{
                                        background: '#f8f9fa',
                                        borderRadius: '12px 0 0 12px',
                                    }}
                                >
                                    <EnvelopeFill />
                                </InputGroup.Text>

                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        borderRadius: '0 12px 12px 0',
                                        padding: '12px',
                                    }}
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Password */}
                        <Form.Group className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <Form.Label className="fw-semibold mb-0">
                                    Password
                                </Form.Label>

                                <small className="text-muted">
                                    Secure Login
                                </small>
                            </div>

                            <InputGroup>
                                <InputGroup.Text
                                    style={{
                                        background: '#f8f9fa',
                                        borderRadius: '12px 0 0 12px',
                                    }}
                                >
                                    <LockFill />
                                </InputGroup.Text>

                                <Form.Control
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        borderRadius: '0 12px 12px 0',
                                        padding: '12px',
                                    }}
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Login Button */}
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isLoading}
                            className="w-100 fw-semibold py-3 rounded-3 shadow-sm"
                            style={{
                                transition: 'all .25s ease',
                                fontSize: '16px',
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                    />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <BoxArrowInRight className="me-2" />
                                    Login
                                </>
                            )}
                        </Button>
                    </Form>

                    {/* Footer */}
                    <div className="text-center mt-4">
                        <small className="text-muted d-block mb-2">
                            Explore destinations, plan trips and create memories.
                        </small>

                        <span className="text-muted">
                            Don't have an account?{" "}
                        </span>

                        <Link
                            to="/register"
                            className="fw-semibold text-decoration-none"
                        >
                            Register
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Login;