import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { routeLogger } from '../utils/logger';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Log route access attempt
  routeLogger.protectedRouteAccess(location.pathname, isAuthenticated);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Log access denied
    routeLogger.accessDenied(location.pathname);
    
    // Save the attempted location for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Log access granted and render protected content
  routeLogger.accessGranted(location.pathname);
  return children;
};

export default ProtectedRoute;