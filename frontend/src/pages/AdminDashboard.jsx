// src/pages/AdminDashboard.jsx
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      {/* Section for Pending Employer Registrations */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Pending Employer Registrations</h2>
        {/* List of pending registrations */}
        <div className="border p-4 rounded mb-2">
          <p>Employer: GreenTech Solutions</p>
          <p>Status: Pending Approval</p>
          <button className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 mt-2">
            Approve
          </button>
        </div>
      </div>
      {/* Additional admin controls, logs, or trade reviews can go here */}
    </div>
  );
};

export default AdminDashboard;
