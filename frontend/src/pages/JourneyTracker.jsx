// src/pages/JourneyTracker.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { inferMode, computeEmissions, computeCredits } from '../utils/carbonCalculator';
import EmployeeNavbar from '../components/EmployeeNavbar';

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

  // Additional state for computed duration and average speed
  const [duration, setDuration] = useState(0); // in seconds
  const [averageSpeed, setAverageSpeed] = useState(0); // in m/s

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
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) ** 2;
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
      console.error('Reverse geocoding error:', error);
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
          setMaxSpeed((prevMax) => (measuredSpeed > prevMax ? measuredSpeed : prevMax));

          // Update positions array and calculate added distance
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
      }

      setDuration(computedDuration);
      setAverageSpeed(computedAvgSpeed);
    }
  };

  // Define markers for start and current positions
  const startMarker = positions.length > 0 ? positions[0] : null;
  const currentMarker = positions.length > 0 ? positions[positions.length - 1] : null;

  // Function to submit trip data to the backend
  const submitTrip = async () => {
    if (!startMarker || !currentMarker) {
      alert('Insufficient position data to submit trip.');
      return;
    }

    // infer transport mode and compute emissions & credits
    const transportMode = inferMode(maxSpeed);
    const emissions = computeEmissions(totalDistance, transportMode);
    const credits = computeCredits(totalDistance, transportMode);

    const tripData = {
      startLocation: startAddress,
      endLocation: endAddress,
      startLatitude: startMarker.lat,
      startLongitude: startMarker.lng,
      endLatitude: currentMarker.lat,
      endLongitude: currentMarker.lng,
      distance: totalDistance,
      milesSaved: 0, // Set as 0 or compute accordingly
      credits: credits,
      maxSpeed: maxSpeed,
      duration: Math.round(duration),
      averageSpeed: averageSpeed,
      transportMode: transportMode,
      emissions: emissions,
    };

    try {
      const response = await fetch('https://carbon-credits-backend.onrender.com/api/v1/trip/trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(tripData),
      });
      if (response.ok) {
        setSubmissionStatus('Trip submitted successfully!');
      } else {
        setSubmissionStatus('Failed to submit trip.');
        console.error('Submission error:', response.statusText);
      }
    } catch (error) {
      setSubmissionStatus('Error submitting trip.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <EmployeeNavbar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          Journey Tracker
        </h1>

        {/* controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <button
            onClick={startJourney}
            disabled={tracking}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            Start Journey
          </button>
          <button
            onClick={endJourney}
            disabled={!tracking}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            End Journey
          </button>
        </div>

        {/* metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl mx-auto mb-6">
          {!journeyEnded ? (
            <>
              <section className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold mb-2">Live Metrics</h2>
                <p>Speed: {(mpsToMph(speed)).toFixed(1)} MPH</p>
                <p>Distance: {metersToMiles(totalDistance).toFixed(2)} mi</p>
                {currentMarker && (
                  <p>
                    Pos: {currentMarker.lat.toFixed(4)}, {currentMarker.lng.toFixed(4)}
                  </p>
                )}
                <p>Max Speed: {mpsToMph(maxSpeed).toFixed(1)} MPH</p>
              </section>
            </>
          ) : (
            <>
              <section className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold mb-2">Trip Summary</h2>
                <p>Total Distance: {metersToMiles(totalDistance).toFixed(2)} mi</p>
                <p>Duration: {duration.toFixed(1)} s</p>
                <p>Avg Speed: {mpsToMph(averageSpeed).toFixed(1)} MPH</p>
                <p>Start: {startAddress}</p>
                <p>End: {endAddress}</p>
              </section>
            </>
          )}
        </div>

        {journeyEnded && (
          <div className="text-center mb-6">
            <button
              onClick={submitTrip}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Submit Trip
            </button>
            {submissionStatus && (
              <p className="mt-2 text-sm text-gray-700">{submissionStatus}</p>
            )}
          </div>
        )}

        {/* map */}
        {positions.length > 0 && (
          <div className="w-full h-64 sm:h-80 md:h-96 rounded overflow-hidden shadow">
            <MapContainer
              center={[currentMarker.lat, currentMarker.lng]}
              zoom={13}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; OSM'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {startMarker && <Marker position={[startMarker.lat, startMarker.lng]} />}
              {currentMarker && (
                <Marker position={[currentMarker.lat, currentMarker.lng]} />
              )}
              <Polyline
                positions={positions.map(p => [p.lat, p.lng])}
                color="blue"
              />
            </MapContainer>
          </div>
        )}
      </main>
    </div>
  );
};

export default JourneyTracker;
