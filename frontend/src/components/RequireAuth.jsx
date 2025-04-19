// src/components/RequireAuth.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const location = useLocation();

  if (!token) {
    // Redirect to /login, but save current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
