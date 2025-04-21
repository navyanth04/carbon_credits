// src/components/RequireAuth.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const roleHierarchy = {
  EMPLOYEE: 0,
  EMPLOYER: 1,
  ADMIN:    2,
};

export default function RequireAuth({ children, requiredRole }) {
  const [checking, setChecking]   = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function verify() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No token');

        const res = await fetch('https://carbon-credits-backend.vercel.app/api/v1/auth/auth', {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Invalid token');

        const data = await res.json();
        // expect { role: "EMPLOYEE"|"EMPLOYER"|"ADMIN", level: number }
        if (requiredRole) {
          // user.level >= requiredRole level?
          const userLevel = data.level;
          const needLevel = roleHierarchy[requiredRole];
          if (userLevel >= needLevel) {
            setHasAccess(true);
          }
        } else {
          // no specific role needed, just logged in
          setHasAccess(true);
        }
      } catch (err) {
        console.warn('Auth check failed:', err);
      } finally {
        setChecking(false);
      }
    }
    verify();
  }, [requiredRole]);

  if (checking) {
    // simple spinner; you can replace with any animation
    return (
      <div className="flex items-center justify-center h-screen">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }

  if (!hasAccess) {
    // not logged in or insufficient role → send to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // everything’s good
  return children;
}
