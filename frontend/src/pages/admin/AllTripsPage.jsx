// src/pages/admin/AllTripsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AllTripsPage() {
  const [trips, setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('http://localhost:3000/api/v1/admin/trips', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrips(res.data.trips || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load trips.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading trips…</div>;
  if (error)   return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <h2 className="text-2xl p-4 border-b">All Trips</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['ID','Employer','Employee','Date','Distance (mi)','Max MPH'].map(col =>
              <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {col}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {trips.map(t => (
            <tr key={t.id}>
              <td className="px-6 py-4">{t.id}</td>
              <td className="px-6 py-4">{t.employerName}</td>
              <td className="px-6 py-4">{t.employeeName}</td>
              <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                {(t.distance / 1609.34).toFixed(2)}
              </td>
              <td className="px-6 py-4">
                {t.maxSpeed ? (t.maxSpeed * 2.23694).toFixed(1) : 'N/A'}
              </td>
            </tr>
          ))}
          {trips.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center p-4 text-gray-500">
                No trips to display.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
