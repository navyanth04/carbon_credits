import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import EmployeeNavbar from "../../components/EmployeeNavbar";

const EmployeeDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          "https://carbon-credits-backend.onrender.com/api/v1/trip/my",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTrips(res.data.trips);
      } catch (err) {
        console.error(err);
        setError("Failed to load your trips.");
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
  const totalMiles = trips.reduce((sum, t) => sum + (t.milesSaved ?? 0), 0);

  const recentTrips = trips.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading your data…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <EmployeeNavbar />

      <main className="flex-1 w-full px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Employee Dashboard
        </h1>

        {/* Summary Section */}
        <section className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            My Carbon Credits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Total Credits</span>
              <span className="text-2xl sm:text-3xl font-bold">
                {totalCredits.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col">
              {/* <span className="text-sm text-gray-500">Miles Saved</span>
              <span className="text-2xl sm:text-3xl font-bold">
                {totalMiles.toFixed(2)}
              </span> */}
            </div>
          </div>
        </section>

        {/* Recent Trips */}
        <section className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Recent Trips
          </h2>

          {recentTrips.length === 0 ? (
            <p className="text-gray-600">You have no trips yet.</p>
          ) : (
            <ul className="space-y-4">
              {recentTrips.map((t) => (
                <li
                  key={t.id}
                  className="border rounded-lg p-4 hover:shadow transition"
                >
                  <p className="font-medium text-gray-800">
                    {new Date(t.date).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t.startLocation} → {t.endLocation}
                  </p>
                  <div className="mt-2 flex flex-col sm:flex-row sm:space-x-6 text-sm text-gray-600">
                    <span>
                      Credits: {(t.credits ?? t.points ?? 0).toFixed(2)}
                    </span>
                    <span>Miles Saved: {t.milesSaved.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/employee/trips"
            className="mt-4 inline-block text-green-600 hover:underline text-sm"
          >
            View All Trips →
          </Link>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/journey-tracker"
            className="block bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg shadow transition"
          >
            Start New Journey
          </Link>
          <Link
            to="/settings"
            className="block bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg shadow transition"
          >
            Settings
          </Link>
        </section>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
