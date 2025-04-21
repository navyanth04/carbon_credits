// src/layouts/AdminWithSidebar.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';

export default function AdminWithSidebar({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-100">
        {children}
      </main>
    </div>
  );
}
