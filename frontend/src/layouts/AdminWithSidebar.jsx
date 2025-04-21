// src/layouts/AdminWithSidebar.jsx
import React from 'react';
import AdminSidebar from '../components/sidebar/AdminSidebar';

export default function AdminWithSidebar({ children }) {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-gray-100">
        {children}
      </main>
    </div>
  );
}
