// src/components/JoinRide.jsx
import React, { useState } from "react";
import axios from "axios";

export default function JoinRide() {
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const join = async () => {
    try {
      await axios.post(`/api/v1/rides/${code}/join`);
      setJoined(true);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Could not join ride");
    }
  };

  if (joined) {
    return (
      <p className="p-6 text-green-700">Successfully joined ride {code}!</p>
    );
  }

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded shadow">
      <label className="block mb-2">Enter Ride Code</label>
      <input
        className="w-full border rounded px-3 py-2 mb-4"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
      />
      <button
        onClick={join}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Join Ride
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
