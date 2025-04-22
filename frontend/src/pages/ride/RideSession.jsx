// src/components/RideSession.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function RideSession() {
  const { sessionId } = useParams();
  const [tracking, setTracking] = useState(false);
  const [ended, setEnded] = useState(false);
  const [results, setResults] = useState([]);
  const watchIdRef = (useRef < number) | (null > null);

  // start GPS watch
  const start = () => {
    if (!navigator.geolocation) {
      return alert("Geolocation not supported");
    }
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        axios.patch(`/api/v1/rides/${sessionId}/location`, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: new Date(pos.timestamp).toISOString(),
        });
      },
      console.error,
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  // end session
  const end = async () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setTracking(false);
    const { data } = await axios.patch(`/api/v1/rides/${sessionId}/end`);
    setResults(data.results);
    setEnded(true);
  };

  if (ended) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Ride Validation</h2>
        <ul className="space-y-2">
          {results.map((r) => (
            <li key={r.userId}>
              User {r.userId}: {(r.overlap * 100).toFixed(1)}% overlap
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow space-y-4">
      <button
        onClick={start}
        disabled={tracking}
        className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded"
      >
        {tracking ? "Tracking…" : "Start Tracking"}
      </button>
      <button
        onClick={end}
        disabled={!tracking}
        className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded"
      >
        End & Validate
      </button>
    </div>
  );
}
