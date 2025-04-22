// src/pages/admin/EmployerDetailPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function EmployerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg]       = useState(null);
  const [error, setError]   = useState('');

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(
          `https://carbon-credits-backend.onrender.com/api/v1/admin/employers/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrg(res.data.employer);
      } catch (err) {
        console.error(err);
        setError('Unable to load employer.');
      }
    }
    load();
  }, [id]);

  const toggleApproval = async (approve) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `https://carbon-credits-backend.onrender.com/api/v1/admin/employers/${id}/${approve ? 'approve' : 'reject'}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/admin/employers');
    } catch (err) {
      console.error(err);
      setError('Action failed.');
    }
  };

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-gray-600">{error || 'Loading…'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800">{org.name}</h1>
        </div>

        {/* Details Grid */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-500">Email</p>
            <p className="text-gray-700 truncate">{org.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Joined</p>
            <p className="text-gray-700">
              {new Date(org.createdAt).toLocaleDateString()}
            </p>
          </div>
          {org.address && (
            <div>
              <p className="text-sm font-semibold text-gray-500">Address</p>
              <p className="text-gray-700">{org.address}</p>
            </div>
          )}
          {org.phone && (
            <div>
              <p className="text-sm font-semibold text-gray-500">Phone</p>
              <p className="text-gray-700">{org.phone}</p>
            </div>
          )}
          {org.contactName && (
            <div>
              <p className="text-sm font-semibold text-gray-500">Contact Person</p>
              <p className="text-gray-700">{org.contactName}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t">
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            {!org.approved ? (
              <>
                <button
                  onClick={() => toggleApproval(true)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => toggleApproval(false)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </>
            ) : (
              <span className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
                Already Approved
              </span>
            )}
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
