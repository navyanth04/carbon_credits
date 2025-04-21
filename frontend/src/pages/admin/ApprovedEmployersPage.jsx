// src/pages/admin/ApprovedEmployersPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ApprovedEmployersPage() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('http://localhost:3000/api/v1/admin/employers/approved', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployers(res.data.employers || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load approved employers.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading…</div>;
  if (error)   return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl mb-4">Approved Employers</h2>
      <div className="overflow-x-auto bg-white rounded shadow">
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
            {employers.map(org => (
              <tr key={org.id}>
                <td className="px-6 py-4">{org.id}</td>
                <td className="px-6 py-4">{org.name}</td>
                <td className="px-6 py-4">{org.email}</td>
                <td className="px-6 py-4">
                  {new Date(org.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/admin/employers/${org.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
            {employers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No approved employers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
