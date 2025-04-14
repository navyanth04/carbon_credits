// JourneyTracker.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const JourneyTracker = () => {
  // State for tracking journey data
  const [tracking, setTracking] = useState(false);
  const [positions, setPositions] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [watchId, setWatchId] = useState(null);

  // Haversine formula to compute distance between two lat/lng points in meters
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in meters
  };

  // Start journey: begin watching position
  const startJourney = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed: currentSpeed } = position.coords;
          const newPosition = { lat: latitude, lng: longitude, timestamp: position.timestamp };

          // Update speed (if the device provides the speed; otherwise, default to 0)
          setSpeed(currentSpeed || 0);

          // Update positions and calculate added distance
          setPositions((prevPositions) => {
            if (prevPositions.length > 0) {
              const lastPosition = prevPositions[prevPositions.length - 1];
              const addedDistance = haversineDistance(
                lastPosition.lat,
                lastPosition.lng,
                newPosition.lat,
                newPosition.lng
              );
              setTotalDistance((prevDistance) => prevDistance + addedDistance);
            }
            return [...prevPositions, newPosition];
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchId(id);
      setTracking(true);
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // End journey: stop watching position
  const endJourney = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setTracking(false);
    }
  };

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
          {speed ? speed.toFixed(2) : 0} m/s
        </p>
        <p>
          <strong>Total Distance: </strong>
          {(totalDistance / 1000).toFixed(2)} km
        </p>
        {positions.length > 0 && (
          <p>
            <strong>Current Position: </strong>
            {positions[positions.length - 1].lat.toFixed(4)},{' '}
            {positions[positions.length - 1].lng.toFixed(4)}
          </p>
        )}
      </div>

      {/* Render the map if any positions have been captured */}
      {positions.length > 0 && (
        <MapContainer
          center={[positions[positions.length - 1].lat, positions[positions.length - 1].lng]}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[positions[positions.length - 1].lat, positions[positions.length - 1].lng]} />
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
