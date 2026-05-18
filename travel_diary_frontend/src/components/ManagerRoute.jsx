import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ManagerRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // If not logged in at all, go to login
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If logged in, but NOT a manager, kick them to the citizen dashboard
    if (user?.role !== 'MANAGER') {
        return <Navigate to="/dashboard" />;
    }

    // If they pass both checks, render the manager component
    return children;
};

export default ManagerRoute;