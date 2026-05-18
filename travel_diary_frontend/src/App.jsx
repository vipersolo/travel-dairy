import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Login from './pages/Login';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import PlanTrip from './pages/PlanTrip';
import Dashboard from './pages/Dashboard'
import ManagerRoute from './components/ManagerRoute';
import ManagerLayout from './components/ManagerLayout';



// Placeholder Pages
const Home = () => <h2>Welcome to Travel Diary</h2>;
const ManagerDashboard = () => <h2>Manager Business Dashboard</h2>;

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

                    {/* Dyanamic Parameter */}
                    <Route path="/destinations/:id" element={<DestinationDetails />} />
                    
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

                    {/*The Booking Route is strictly protected */}
                    <Route 
                        path="/destinations/:id/book" 
                        element={
                            <ProtectedRoute>
                                <PlanTrip />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* --- MANAGER PORTAL ROUTES (Wrapped in Manager Layout) --- */}
                    <Route path="/manager/*" element={
                        <ManagerRoute>
                            <ManagerLayout>
                                <Routes>
                                    {/* Maps to /manager/dashboard */}
                                    <Route path="/dashboard" element={<ManagerDashboard />} />
                                    {/* We will add /accommodations and /packages here next */}
                                </Routes>
                            </ManagerLayout>
                        </ManagerRoute>
                    } />
                    
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;