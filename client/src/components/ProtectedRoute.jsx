import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children, role }) => {
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    if (role && user.role !== role) {
        // Redirect based on their actual role to avoid getting stuck
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'rider') return <Navigate to="/rider" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
