import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MyTrades() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    axios.get('https://carbon-credits-backend.onrender.com/api/v1/trades/my', {
      headers:{ Authorization:`Bearer ${localStorage.authToken}` }
    }).then(r => setTrades(r.data.trades));
  }, []);

  return (
    <div className="p-4 space-y-4
                    sm:p-6
                    md:max-w-3xl md:mx-auto">
      <h2 className="text-2xl font-semibold">My Trades</h2>
      {trades.length === 0 && (
        <p className="text-gray-500">No trades to show.</p>
      )}
      <div className="space-y-4">
        {trades.map(t => (
          <div
            key={t.id}
            className="bg-white rounded shadow p-4
                       sm:flex sm:justify-between sm:items-center sm:p-6"
          >
            <div>
              <p><span className="font-medium">To:</span> {t.toEmployer.name}</p>
              <p className="text-sm text-gray-600">
                Credits: {t.credits} @ ${t.pricePerCredit}
              </p>
            </div>
            <div className="mt-2 sm:mt-0">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  t.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : t.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {t.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
