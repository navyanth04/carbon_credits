// src/components/StartRide.jsx
import React, { useState } from "react";
import axios from "axios";

export default function StartRide() {
  const [code, setCode] = useState(null);
  const [sessionId, setId] = useState(null);
  const [error, setError] = useState("");

  const createSession = async () => {
    try {
      const { data } = await axios.post("/api/v1/rides");
      setCode(data.code);
      setId(data.sessionId);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Could not start ride");
    }
  };

  if (code) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Ride Code</h2>
        <p className="text-3xl font-mono text-center">{code}</p>
        <p className="mt-4 text-center text-gray-600">
          Share this code with your passengers.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded shadow text-center">
      <button
        onClick={createSession}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded"
      >
        Start Group Ride
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
