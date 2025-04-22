// src/pages/employer/EmployeeTripsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EmployerSidebar from '../../components/sidebar/EmployerSidebar';

export default function EmployeeTripsPage() {
  const { id } = useParams();            // employeeId from URL
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(
          `https://carbon-credits-backend.onrender.com/api/v1/trips/employees/${id}/trips`,
          {
            headers: {
              'Content-Type':  'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setTrips(data.trips);
      } catch (err) {
        console.error(err);
        setError('Could not load trips.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <EmployerSidebar />
      <p className="text-gray-600">Loading trips…</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <EmployerSidebar />
      <p className="text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* sidebar */}
      <EmployerSidebar />

      {/* main */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Employee #{id} Trips</h1>

        {trips.length === 0 ? (
          <p className="text-center text-gray-600">No trips found for this employee.</p>
        ) : (
          <ul className="space-y-4 max-w-3xl mx-auto">
            {trips.map(trip => {
              const dateStr = new Date(trip.date).toLocaleString();
              const miles   = (trip.distance / 1609.34).toFixed(2);
              const maxMPH  = trip.maxSpeed ? (trip.maxSpeed * 2.23694).toFixed(1) : 'N/A';
              const avgMPH  = trip.averageSpeed ? (trip.averageSpeed * 2.23694).toFixed(1) : 'N/A';

              return (
                <details
                  key={trip.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <summary className="cursor-pointer font-medium flex justify-between">
                    <span>{dateStr}</span>
                    <span className="text-blue-600">{miles} mi</span>
                  </summary>
                  <div className="mt-3 space-y-2 text-gray-700 text-sm">
                    <p><strong>Route:</strong> {trip.startLocation} → {trip.endLocation}</p>
                    <p><strong>Transport:</strong> {trip.transportMode.replace('_',' ')}</p>
                    <p><strong>Credits:</strong> {trip.credits.toFixed(2)}</p>
                    <p><strong>Miles Saved:</strong> {trip.milesSaved.toFixed(2)}</p>
                    <p><strong>Max Speed:</strong> {maxMPH} mph</p>
                    <p><strong>Avg Speed:</strong> {avgMPH} mph</p>
                    <p><strong>Duration:</strong> {trip.duration} s</p>
                  </div>
                </details>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
