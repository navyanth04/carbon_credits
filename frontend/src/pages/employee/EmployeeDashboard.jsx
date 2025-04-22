import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EmployeeNavbar from '../../components/EmployeeNavbar';

const EmployeeDashboard = () => {
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(
          'https://carbon-credits-backend.onrender.com/api/v1/trip/trips',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTrips(res.data.trips);
      } catch (err) {
        console.error(err);
        setError('Failed to load your trips.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // compute totals
  const totalCredits = trips.reduce(
    (sum, t) => sum + (t.credits ?? t.points ?? 0),
    0
  );
  const totalMiles   = trips.reduce(
    (sum, t) => sum + (t.milesSaved ?? 0),
    0
  );

  const recentTrips = trips.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-6 text-center">Loading your data…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-6 text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <EmployeeNavbar/>
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Employee Dashboard</h1>

        {/* Summary Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">My Carbon Credits</h2>
          <div className="flex space-x-12">
            <div>
              <p className="text-sm text-gray-500">Total Credits</p>
              <p className="text-2xl font-bold">{totalCredits.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Miles Saved</p>
              <p className="text-2xl font-bold">{totalMiles.toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* Recent Trips */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Trips</h2>
          {recentTrips.length === 0 ? (
            <p className="text-gray-600">You have no trips yet.</p>
          ) : (
            <div className="space-y-4">
              {recentTrips.map((t) => (
                <div key={t.id} className="border rounded-lg p-4">
                  <p className="font-medium">
                    {new Date(t.date).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t.startLocation} → {t.endLocation}
                  </p>
                  <p className="text-sm text-gray-600">
                    Credits: {(t.credits ?? t.points ?? 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Miles Saved: {t.milesSaved.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/my-trips"
            className="inline-block mt-4 text-green-600 hover:underline"
          >
            View All Trips →
          </Link>
        </section>

        {/* Quick Actions */}
        <section className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <Link
            to="/journey-tracker"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg shadow"
          >
            Start New Journey
          </Link>
          <Link
            to="/settings"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg shadow"
          >
            Settings
          </Link>
        </section>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
