// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [pendingTrades,    setPendingTrades]    = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [empRes, tradeRes] = await Promise.all([
          fetch('https://carbon-credits-backend.onrender.com/api/v1/admin/employers/pending', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('https://carbon-credits-backend.onrender.com/api/v1/admin/trades/pending', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!empRes.ok || !tradeRes.ok) throw new Error('Failed to load data');
        const { employers } = await empRes.json();
        const { trades }    = await tradeRes.json();
        setPendingEmployers(employers);
        setPendingTrades(trades);
      } catch (e) {
        console.error(e);
        setError('Error loading admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEmployer = async (id, action) => {
    const token = localStorage.getItem('authToken');
    await fetch(`https://carbon-credits-backend.onrender.com/api/v1/admin/employers/${id}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setPendingEmployers(emp => emp.filter(e => e.id !== id));
  };

  const handleTrade = async (id, action) => {
    const token = localStorage.getItem('authToken');
    await fetch(`https://carbon-credits-backend.onrender.com/api/v1/admin/trades/${id}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setPendingTrades(tx => tx.filter(t => t.id !== id));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error)   return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-100 md:pb-0 pb-16">

      {/* Main content area */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <h1 className="text-4xl font-extrabold text-gray-800">Admin Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">Pending Employers</h2>
            <p className="text-4xl font-bold">{pendingEmployers.length}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">Pending Trades</h2>
            <p className="text-4xl font-bold">{pendingTrades.length}</p>
          </div>
        </div>

        {/* Pending Employers Table */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <h3 className="text-xl font-semibold p-4 border-b">Pending Employers</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID','Name','Email','Joined','Actions'].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingEmployers.map(emp => (
                <tr key={emp.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">{emp.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{emp.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{emp.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(emp.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleEmployer(emp.id, 'approve')}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleEmployer(emp.id, 'reject')}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {pendingEmployers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No pending employer registrations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pending Trades Table */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <h3 className="text-xl font-semibold p-4 border-b">Pending Trades</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID','From','To','Credits','Price/Credit','Date','Actions'].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingTrades.map(trade => (
                <tr key={trade.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">{trade.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{trade.fromEmployer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{trade.toEmployer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{trade.credits}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    ${trade.pricePerCredit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(trade.tradeDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleTrade(trade.id, 'approve')}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleTrade(trade.id, 'reject')}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {pendingTrades.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No pending trades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
