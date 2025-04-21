// src/components/RedirectIfAuthenticated.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import axios from 'axios';

export default function RedirectIfAuthenticated() {
  const [status, setStatus] = useState('checking')
  const [to, setTo]         = useState('/')

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setStatus('public');       // no token → show login/signup
        return;
      }
      try {
        const res = await axios.get('http://localhost:3000/api/v1/auth/auth', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { level } = res.data;
        // map levels → dashboards
        if (level === 0) setTo('/employee-dashboard');
        else if (level === 1) setTo('/employer-dashboard');
        else if (level === 2) setTo('/admin');
        else setTo('/');
        setStatus('redirect');
      } catch {
        // 401/404 → not logged in, allow public forms
        setStatus('public');
      }
    })();
  }, []);

  if (status === 'checking') {
    return <div className="p-6 text-center">Checking authentication…</div>;
  }
  if (status === 'redirect') {
    return <Navigate to={to} replace />;
  }
  // status === 'public'
  return <Outlet />;
}
