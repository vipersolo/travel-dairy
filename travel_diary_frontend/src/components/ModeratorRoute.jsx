import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ModeratorRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // If not logged in at all, go to login
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If logged in, but NOT a moderator, kick them to the default dashboard
    if (user?.role !== 'MODERATOR') {
        return <Navigate to="/dashboard" />;
    }

    // If they pass both checks, render the admin/moderator component
    return children;
};

export default ModeratorRoute;