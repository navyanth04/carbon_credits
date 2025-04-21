// src/components/ProtectedLayout.jsx
import React from 'react';
import Navbar from './Navbar';

export default function ProtectedLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="mt-4">{children}</div>
    </>
  );
}
