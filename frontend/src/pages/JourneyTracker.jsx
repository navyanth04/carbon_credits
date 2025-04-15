// JourneyTracker.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const JourneyTracker = () => {
  const [tracking, setTracking] = useState(false);
  const [journeyEnded, setJourneyEnded] = useState(false);
  const [positions, setPositions] = useState([]); // Array of { lat, lng, timestamp }
  const [speed, setSpeed] = useState(0); // Current speed (in m/s); converted to MPH for display
  const [totalDistance, setTotalDistance] = useState(0); // In meters
  const [watchId, setWatchId] = useState(null);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [maxSpeed, setMaxSpeed] = useState(0); // In m/s
  const [startTime, setStartTime] = useState(null); // Start time in milliseconds
  const [submissionStatus, setSubmissionStatus] = useState(''); // To display submit status
  
  // Conversion functions
  const mpsToMph = (mps) => mps * 2.23694;
  const metersToMiles = (meters) => meters / 1609.34;

  // Haversine formula to calculate distance (in meters)
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);
    const deltaLat = toRad(lat2 - lat1);
    const deltaLon = toRad(lon2 - lon1);
    const a = Math.sin(deltaLat / 2) ** 2 +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Reverse geocode function using Nominatim
  const getAddress = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.display_name || 'Address not found';
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return 'Error retrieving address';
    }
  };

  // Start journey tracking
  const startJourney = () => {
    if (navigator.geolocation) {
      // Reset previous journey info
      setPositions([]);
      setTotalDistance(0);
      setJourneyEnded(false);
      setStartAddress('');
      setEndAddress('');
      setMaxSpeed(0);
      setSubmissionStatus('');
      setStartTime(Date.now());
      
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed: currentSpeed } = position.coords;
          const newPosition = { lat: latitude, lng: longitude, timestamp: position.timestamp };
          const measuredSpeed = currentSpeed || 0;
          setSpeed(measuredSpeed);
          // Update maxSpeed if current speed is higher
          setMaxSpeed(prevMax => measuredSpeed > prevMax ? measuredSpeed : prevMax);
          
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

  // End journey tracking, fetch addresses, and compute duration and average speed
  const endJourney = async () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setTracking(false);
      setJourneyEnded(true);
      
      let computedDuration = 0;
      let computedAvgSpeed = 0;
      if (startTime) {
        computedDuration = (Date.now() - startTime) / 1000; // duration in seconds
        if (computedDuration > 0) {
          computedAvgSpeed = totalDistance / computedDuration; // in m/s
        }
      }
      
      if (positions.length > 0) {
        const startPos = positions[0];
        const endPos = positions[positions.length - 1];

        // Fetch human-readable addresses for start and end coordinates
        const fetchedStartAddress = await getAddress(startPos.lat, startPos.lng);
        const fetchedEndAddress = await getAddress(endPos.lat, endPos.lng);
        setStartAddress(fetchedStartAddress);
        setEndAddress(fetchedEndAddress);

        // Optionally, you could automatically submit the trip data here
        // or display a separate "Submit Trip" button.
      }
      
      // You might want to save computed duration and average speed in state if needed
      setDuration(computedDuration);
      setAverageSpeed(computedAvgSpeed);
    }
  };

  // Additional state for computed duration and average speed
  const [duration, setDuration] = useState(0); // in seconds
  const [averageSpeed, setAverageSpeed] = useState(0); // in m/s

  // Define markers for start and current positions
  const startMarker = positions.length > 0 ? positions[0] : null;
  const currentMarker = positions.length > 0 ? positions[positions.length - 1] : null;

  // Function to submit trip data to the backend
  const submitTrip = async () => {
    // Prepare the trip data object
    if (!startMarker || !currentMarker) {
      alert("Insufficient position data to submit trip.");
      return;
    }
    const tripData = {
      startLocation: startAddress,
      endLocation: endAddress,
      startLatitude: startMarker.lat,
      startLongitude: startMarker.lng,
      endLatitude: currentMarker.lat,
      endLongitude: currentMarker.lng,
      distance: totalDistance,
      milesSaved: 0, // Set as 0 or compute accordingly if you have that data
      method: "CARPOOLING", // Default method; you can modify or allow user selection
      // Date can be omitted since backend defaults to now
      points: 0, // Set as 0 or compute based on your logic
      maxSpeed: maxSpeed,
      duration: duration,
      averageSpeed: averageSpeed,
    };

    try {
      const response = await fetch('http://localhost:3000/api/v1/user/trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(tripData),
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissionStatus("Trip submitted successfully!");
        console.log("Trip submitted:", data.trip);
      } else {
        setSubmissionStatus("Failed to submit trip.");
        console.error("Submission error:", response.statusText);
      }
    } catch (error) {
      setSubmissionStatus("Error submitting trip.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800">
        Journey Tracker
      </h1>

      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={startJourney}
          disabled={tracking}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 transition-colors text-white rounded-lg shadow-md disabled:opacity-50"
        >
          Start Journey
        </button>
        <button
          onClick={endJourney}
          disabled={!tracking}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-lg shadow-md disabled:opacity-50"
        >
          End Journey
        </button>
      </div>

      {/* Live Metrics or Trip Summary */}
      {!journeyEnded ? (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Live Metrics</h2>
          <p className="text-lg text-gray-600">
            <span className="font-semibold">Speed:</span> {speed ? mpsToMph(speed).toFixed(2) : 0} MPH
          </p>
          <p className="text-lg text-gray-600">
            <span className="font-semibold">Distance:</span> {metersToMiles(totalDistance).toFixed(2)} miles
          </p>
          {currentMarker && (
            <p className="text-lg text-gray-600">
              <span className="font-semibold">Current Position:</span> {currentMarker.lat.toFixed(4)}, {currentMarker.lng.toFixed(4)}
            </p>
          )}
          <p className="text-lg text-gray-600">
            <span className="font-semibold">Max Speed:</span> {maxSpeed ? mpsToMph(maxSpeed).toFixed(2) : 0} MPH
          </p>
        </div>
      ) : (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Trip Summary</h2>
          <p className="text-lg text-gray-600">
            <span className="font-semibold">Total Distance Traveled:</span> {metersToMiles(totalDistance).toFixed(2)} miles
          </p>
          <p className="text-lg text-gray-600">
            <span className="font-semibold">Last Recorded Speed:</span> {speed ? mpsToMph(speed).toFixed(2) : 0} MPH
          </p>
          <p className="text-lg text-gray-600">
            <span className="font-semibold">Max Speed:</span> {maxSpeed ? mpsToMph(maxSpeed).toFixed(2) : 0} MPH
          </p>
          <p className="text-lg text-gray-600">
            <span className="font-semibold">Duration:</span> {duration.toFixed(2)} seconds
          </p>
          <p className="text-lg text-gray-600">
            <span className="font-semibold">Average Speed:</span> {averageSpeed ? mpsToMph(averageSpeed).toFixed(2) : 0} MPH
          </p>
          <p className="text-lg text-gray-600">
            <span className="font-semibold">Start Location:</span> {startAddress || 'Loading...'}
          </p>
          <p className="text-lg text-gray-600">
            <span className="font-semibold">End Location:</span> {endAddress || 'Loading...'}
          </p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={submitTrip}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded-lg shadow-md"
            >
              Submit Trip
            </button>
          </div>
          {submissionStatus && (
            <p className="text-center text-lg text-gray-700 mt-4">{submissionStatus}</p>
          )}
        </div>
      )}

      {/* Map Container */}
      {positions.length > 0 && (
        <div className="max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg">
          <MapContainer
            center={[currentMarker.lat, currentMarker.lng]}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {startMarker && <Marker position={[startMarker.lat, startMarker.lng]} />}
            {currentMarker && <Marker position={[currentMarker.lat, currentMarker.lng]} />}
            <Polyline positions={positions.map((p) => [p.lat, p.lng])} color="blue" />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default JourneyTracker;
