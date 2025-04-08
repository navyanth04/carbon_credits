// src/pages/TripDetailsPage.jsx
import React, { useState } from 'react';

const TripDetailsPage = () => {
  const [tripData, setTripData] = useState({
    startLocation: '',
    destination: '',
    mode: 'Carpool',
    milesSaved: ''
  });

  const handleTripSubmit = (e) => {
    e.preventDefault();
    // Submit trip details (API call etc.)
    console.log(tripData);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold mb-4">Log New Trip</h1>
        <form onSubmit={handleTripSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Start Location"
              value={tripData.startLocation}
              onChange={(e) => setTripData({ ...tripData, startLocation: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Destination"
              value={tripData.destination}
              onChange={(e) => setTripData({ ...tripData, destination: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <div className="mb-4">
            <select
              value={tripData.mode}
              onChange={(e) => setTripData({ ...tripData, mode: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            >
              <option value="Carpool">Carpool</option>
              <option value="Public Transport">Public Transport</option>
              <option value="Rideshare">Rideshare</option>
              <option value="Working from Home">Working from Home</option>
            </select>
          </div>
          <div className="mb-4">
            <input
              type="number"
              placeholder="Miles Saved"
              value={tripData.milesSaved}
              onChange={(e) => setTripData({ ...tripData, milesSaved: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Log Trip
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripDetailsPage;
