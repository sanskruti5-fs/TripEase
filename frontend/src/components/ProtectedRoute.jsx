import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    
    // If not authenticated, redirect to login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the child component
    return children;
};

export default ProtectedRoute;
