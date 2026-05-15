// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container } from 'react-bootstrap';

// Placeholder Pages (We will build these out in Phase 4)
const Home = () => <h2>Welcome to Travel Diary</h2>;
const Login = () => <h2>Login Page</h2>;
const Dashboard = () => <h2>User Dashboard</h2>;

// Industry Standard: Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            {/* We will add a global Navbar component here later */}
            <Container className="mt-4">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Routes (Requires JWT Token) */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;