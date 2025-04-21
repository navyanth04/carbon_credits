// src/pages/admin/EmployerDetailPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function EmployerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`https://carbon-credits-backend.onrender.com/api/v1/admin/employers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
        `/api/v1/admin/employers/${id}/${approve ? 'approve' : 'reject'}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/admin/employers');
    } catch (err) {
      console.error(err);
      setError('Action failed.');
    }
  };

  if (!org) return <div className="p-6">{error || 'Loading…'}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{org.name}</h2>
      <p><strong>Email:</strong> {org.email}</p>
      <p><strong>Joined:</strong> {new Date(org.createdAt).toLocaleDateString()}</p>
      {/* add other fields like address, phone, contactName if you have them */}
      <div className="space-x-2">
        {!org.approved ? (
          <>
            <button
              onClick={() => toggleApproval(true)}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >Approve</button>
            <button
              onClick={() => toggleApproval(false)}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >Reject</button>
          </>
        ) : (
          <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded">
            Approved
          </span>
        )}
      </div>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
