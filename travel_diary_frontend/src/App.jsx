import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Login from './pages/Login';
import Destinations from './pages/Destinations';

// Placeholder Pages
const Home = () => <h2>Welcome to Travel Diary</h2>;
const Dashboard = () => <h2>User Dashboard</h2>;

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            {/* The Layout component provides the Navbar globally */}
            <Layout>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/destinations" element={<Destinations />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Routes */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;