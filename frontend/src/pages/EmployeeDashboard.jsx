// src/pages/EmployeeDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen p-6 bg-gray-100 relative">
      <h1 className="text-3xl font-bold mb-4">Employee Dashboard</h1>
      
      {/* Summary Section */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold">My Carbon Credits</h2>
        <p className="mt-2">
          Total Credits Earned: <span className="font-bold">500</span>
        </p>
        <p className="mt-1">
          Miles Saved: <span className="font-bold">150</span> miles
        </p>
      </div>

      {/* Trip History Section */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Trips</h2>
        {/* You could map over an array of trips here */}
        <div className="border p-4 rounded mb-2">
          <p>Trip from Home to Office</p>
          <p>Miles Saved: 5</p>
          <p>Mode: Carpool</p>
        </div>
        {/* More trip entries... */}
      </div>
      
      {/* Circular Profile Button in the Top-Right Corner */}
      <div className="fixed top-2 right-6">
        <Link to="/profile">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
            {/* Replace this content with an icon if desired */}
            <span className="text-white text-2xl">👤</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
