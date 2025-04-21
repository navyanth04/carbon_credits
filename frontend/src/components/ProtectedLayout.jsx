// src/components/ProtectedLayout.jsx
import React from 'react';
import Navbar from './Navbar';

export default function ProtectedLayout({ children }) {
  return (
    <>
      {/* <Navbar /> */}
      <div className="m">{children}</div>
    </>
  );
}

//dummy was made for employer but not using now
