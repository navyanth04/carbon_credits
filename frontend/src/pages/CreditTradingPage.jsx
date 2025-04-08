// src/pages/CreditTradingPage.jsx
import React from 'react';

const CreditTradingPage = () => {
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Carbon Credit Trading</h1>
      {/* Trading Form */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Propose a Trade</h2>
        <form>
          <div className="mb-4">
            <input
              type="number"
              placeholder="Number of Credits"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <div className="mb-4">
            <input
              type="number"
              placeholder="Price per Credit"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Submit Trade
          </button>
        </form>
      </div>

      {/* Active Trades */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Active Trades</h2>
        {/* List or table of active trades */}
        <div className="border p-4 rounded mb-2">
          <p>Trade ID: 12345</p>
          <p>Credits: 100</p>
          <p>Price per Credit: $10</p>
          <p>Status: Open</p>
        </div>
      </div>
    </div>
  );
};

export default CreditTradingPage;
