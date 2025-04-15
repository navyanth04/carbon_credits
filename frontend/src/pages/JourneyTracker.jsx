// JourneyTracker.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const JourneyTracker = () => {
  const [tracking, setTracking] = useState(false);
  const [journeyEnded, setJourneyEnded] = useState(false);
  const [positions, setPositions] = useState([]); // array of { lat, lng, timestamp }
  const [speed, setSpeed] = useState(0); // in m/s, will convert to MPH for display
  const [totalDistance, setTotalDistance] = useState(0); // in meters
  const [watchId, setWatchId] = useState(null);

  // Conversion factors
  const mpsToMph = (mps) => mps * 2.23694;
  const metersToMiles = (meters) => meters / 1609.34;

  // Haversine formula: calculates distance in meters between two lat/lng points
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Start tracking journey
  const startJourney = () => {
    if (navigator.geolocation) {
      // Reset previous journey info
      setPositions([]);
      setTotalDistance(0);
      setJourneyEnded(false);

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed: currentSpeed } = position.coords;
          const newPosition = { lat: latitude, lng: longitude, timestamp: position.timestamp };

          // Update current speed (if provided; else default to 0)
          setSpeed(currentSpeed || 0);

          // Update positions array and calculate added distance
          setPositions((prevPositions) => {
            if (prevPositions.length > 0) {
              const lastPosition = prevPositions[prevPositions.length - 1];
              const addedDistance = haversineDistance(
                lastPosition.lat, lastPosition.lng,
                newPosition.lat, newPosition.lng
              );
              setTotalDistance((prevDistance) => prevDistance + addedDistance);
            }
            return [...prevPositions, newPosition];
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      setWatchId(id);
      setTracking(true);
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // End journey tracking
  const endJourney = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setTracking(false);
      setJourneyEnded(true);
    }
  };

  // Get start and current positions for markers (if available)
  const startMarker = positions.length > 0 ? positions[0] : null;
  const currentMarker = positions.length > 0 ? positions[positions.length - 1] : null;

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Journey Tracker</h1>
      <div className="mb-4">
        <button
          onClick={startJourney}
          disabled={tracking}
          className="bg-green-600 text-white py-2 px-4 rounded mr-2"
        >
          Start Journey
        </button>
        <button
          onClick={endJourney}
          disabled={!tracking}
          className="bg-red-600 text-white py-2 px-4 rounded"
        >
          End Journey
        </button>
      </div>

      <div className="mb-4">
        <p>
          <strong>Current Speed: </strong>
          {speed ? mpsToMph(speed).toFixed(2) : 0} MPH
        </p>
        <p>
          <strong>Total Distance: </strong>
          {metersToMiles(totalDistance).toFixed(2)} miles
        </p>
        {currentMarker && (
          <p>
            <strong>Current Position: </strong>
            {currentMarker.lat.toFixed(4)}, {currentMarker.lng.toFixed(4)}
          </p>
        )}
      </div>

      {/* Display trip summary after journey is ended */}
      {journeyEnded && (
        <div className="mb-4 bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-bold mb-2">Trip Summary</h2>
          <p>
            <strong>Total Distance Traveled: </strong>
            {metersToMiles(totalDistance).toFixed(2)} miles
          </p>
          <p>
            <strong>Last Recorded Speed: </strong>
            {speed ? mpsToMph(speed).toFixed(2) : 0} MPH
          </p>
          {startMarker && (
            <p>
              <strong>Start Location: </strong>
              {startMarker.lat.toFixed(4)}, {startMarker.lng.toFixed(4)}
            </p>
          )}
          {currentMarker && (
            <p>
              <strong>End Location: </strong>
              {currentMarker.lat.toFixed(4)}, {currentMarker.lng.toFixed(4)}
            </p>
          )}
        </div>
      )}

      {/* Render map if at least one position is recorded */}
      {positions.length > 0 && (
        <MapContainer
          center={[currentMarker.lat, currentMarker.lng]}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Start Marker */}
          {startMarker && (
            <Marker position={[startMarker.lat, startMarker.lng]}>
              {/* Optionally add a popup or custom icon for the start marker */}
            </Marker>
          )}
          {/* Current (or End) Marker */}
          {currentMarker && (
            <Marker position={[currentMarker.lat, currentMarker.lng]}>
              {/* Optionally add a popup or custom icon for the current marker */}
            </Marker>
          )}
          <Polyline
            positions={positions.map((p) => [p.lat, p.lng])}
            color="blue"
          />
        </MapContainer>
      )}
    </div>
  );
};

export default JourneyTracker;
