// src/pages/EmployerDashboard.jsx
import React from 'react';

const EmployerDashboard = () => {
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Employer Dashboard</h1>
      {/* Organization Summary */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold">Organization Carbon Credits</h2>
        <p className="mt-2">Total Credits Accumulated: <span className="font-bold">2000</span></p>
        <p className="mt-1">Active Employees: <span className="font-bold">25</span></p>
      </div>

      {/* Employee Management */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Employee Overview</h2>
        {/* Table or list of employees */}
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Credits</th>
              <th className="py-2 px-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b">John Doe</td>
              <td className="py-2 px-4 border-b">120</td>
              <td className="py-2 px-4 border-b">Active</td>
            </tr>
            {/* More employees ... */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployerDashboard;
