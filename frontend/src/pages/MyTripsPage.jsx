// src/pages/MyTripsPage.jsx
import React, { useState, useEffect } from "react";
import EmployerSidebar from "../components/sidebar/EmployerSidebar";

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          "https://carbon-credits-backend.onrender.com/api/v1/trip/trips",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        setTrips(data.trips);
      } catch (err) {
        console.error(err);
        setError("Could not load trips.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading trips…
      </div>
    );
  if (error)
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar (desktop) / bottom bar (mobile) */}
      <EmployerSidebar />

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-center md:text-left">
          My Trips
        </h1>

        {trips.length === 0 ? (
          <p className="text-center text-gray-600">No trips found.</p>
        ) : (
          <div className="space-y-4 max-w-xl mx-auto">
            {trips.map((trip) => {
              const dateStr = new Date(trip.date).toLocaleString();
              const miles = (trip.distance / 1609.34).toFixed(2);
              const maxMPH = trip.maxSpeed
                ? (trip.maxSpeed * 2.23694).toFixed(1)
                : "N/A";
              const avgMPH = trip.averageSpeed
                ? (trip.averageSpeed * 2.23694).toFixed(1)
                : "N/A";
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
                    <p>
                      <strong>Route:</strong> {trip.startLocation} →{" "}
                      {trip.endLocation}
                    </p>
                    <p>
                      <strong>Max Speed:</strong> {maxMPH} mph
                    </p>
                    <p>
                      <strong>Avg Speed:</strong> {avgMPH} mph
                    </p>
                    <p>
                      <strong>Duration:</strong> {trip.duration ?? "N/A"} s
                    </p>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
