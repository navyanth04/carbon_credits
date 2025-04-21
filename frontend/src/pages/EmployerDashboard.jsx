// src/pages/EmployerDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import Input from '../components/Input';

const EmployerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'ALL'; // ALL | ACTIVE | PENDING

  const [summary, setSummary]     = useState({ totalCredits: 0, activeCount: 0, pendingCount: 0 });
  const [employees, setEmployees] = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const [sumRes, empRes] = await Promise.all([
        axios.get('/api/v1/employer/summary',   { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/employer/employees', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSummary(sumRes.data);
      setEmployees(empRes.data.employees || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    const token = localStorage.getItem('authToken');
    await axios.post(`/api/v1/employer/employees/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem('authToken');
    await axios.post(`/api/v1/employer/employees/${id}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6 text-center">Loading...</div>
      </ProtectedLayout>
    );
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="p-6 text-center text-red-600">{error}</div>
      </ProtectedLayout>
    );
  }

  const displayed = employees
    .filter(emp => filter === 'ALL' || emp.status === filter)
    .filter(emp => (`${emp.firstName} ${emp.lastName}`)
      .toLowerCase()
      .includes(search.toLowerCase())
    );

  return (
    <ProtectedLayout>
      <div className="min-h-screen p-6 bg-gray-100 space-y-6">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="?filter=ALL">
            <div className={`bg-white p-6 rounded-lg shadow cursor-pointer ${
              filter === 'ALL' ? 'ring-2 ring-blue-400' : ''
            }`}>
              <h2 className="text-xl font-semibold mb-2">Total Credits</h2>
              <p className="text-3xl font-bold">{summary.totalCredits}</p>
            </div>
          </Link>
          <Link to="?filter=ACTIVE">
            <div className={`bg-white p-6 rounded-lg shadow cursor-pointer ${
              filter === 'ACTIVE' ? 'ring-2 ring-blue-400' : ''
            }`}>
              <h2 className="text-xl font-semibold mb-2">Active Employees</h2>
              <p className="text-3xl font-bold">{summary.activeCount}</p>
            </div>
          </Link>
          <Link to="?filter=PENDING">
            <div className={`bg-white p-6 rounded-lg shadow cursor-pointer ${
              filter === 'PENDING' ? 'ring-2 ring-blue-400' : ''
            }`}>
              <h2 className="text-xl font-semibold mb-2">Pending Approvals</h2>
              <p className="text-3xl font-bold">{summary.pendingCount}</p>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="flex space-x-4">
          <Link to="/trading">
            <button className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
              Propose Trade
            </button>
          </Link>
          <Link to="/my-trips">
            <button className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700">
              View Employee Trips
            </button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow">
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Employee Table */}
        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-600">
                {['Name','Email','Credits','Status','Actions'].map(col => (
                  <th key={col} className="px-4 py-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(emp => (
                <tr key={emp.id} className="border-t">
                  <td className="px-4 py-2">{emp.firstName} {emp.lastName}</td>
                  <td className="px-4 py-2">{emp.email}</td>
                  <td className="px-4 py-2">{emp.credits}</td>
                  <td className="px-4 py-2">{emp.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    {emp.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(emp.id)}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(emp.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    No employees match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default EmployerDashboard;
