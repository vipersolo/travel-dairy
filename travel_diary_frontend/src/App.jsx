import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Login from './pages/Login';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import PlanTrip from './pages/PlanTrip';
import Dashboard from './pages/Dashboard'
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerRoute from './components/ManagerRoute';
import ManagerLayout from './components/ManagerLayout';
import ManagerAccommodations from './pages/manager/ManagerAccommodations';
import ManagerPackages from './pages/manager/ManagerPackages';




// Placeholder Pages
const Home = () => <h2>Welcome to Travel Diary</h2>;

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                
                {/* ==========================================
                    B2B MANAGER PORTAL ROUTES
                ========================================== */}
                {/* 
                    React Router v6 matches this specific path first.
                    Everything under /manager/ will ONLY get the ManagerLayout.
                */}
                <Route path="/manager/*" element={
                    <ManagerRoute>
                        <ManagerLayout>
                            <Routes>
                                {/* Note: Nested routes shouldn't have a leading slash */}
                                <Route path="dashboard" element={<ManagerDashboard />} />
                                <Route path="accommodations" element={<ManagerAccommodations />} />
                                <Route path="packages" element={<ManagerPackages />} />
                            </Routes>
                        </ManagerLayout>
                    </ManagerRoute>
                } />

                {/* ==========================================
                    B2C CITIZEN & PUBLIC ROUTES
                ========================================== */}
                {/* 
                    The /* wildcard catches everything else.
                    These pages get the standard public Layout with the top Navbar.
                */}
                <Route path="/*" element={
                    <Layout>
                        <Routes>
                            {/* Public */}
                            <Route path="/" element={<Home />} />
                            <Route path="/destinations" element={<Destinations />} />
                            <Route path="/destinations/:id" element={<DestinationDetails />} />
                            <Route path="/login" element={<Login />} />
                            
                            {/* Protected Citizen */}
                            <Route 
                                path="/dashboard" 
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/destinations/:id/book" 
                                element={
                                    <ProtectedRoute>
                                        <PlanTrip />
                                    </ProtectedRoute>
                                } 
                            />
                        </Routes>
                    </Layout>
                } />

            </Routes>
        </Router>
    );
}

export default App;