import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log('PrivateRoute check:', {
      path: location.pathname,
      token: !!token
    });
  }, [location, token]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;