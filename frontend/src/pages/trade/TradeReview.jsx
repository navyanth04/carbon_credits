import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TradeReview() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    axios.get('https://carbon-credits-backend.onrender.com/api/v1/trades/pending', {
      headers:{ Authorization:`Bearer ${localStorage.authToken}` }
    }).then(r => setTrades(r.data.trades));
  }, []);

  const act = (id, verb) =>
    axios.patch(`https://carbon-credits-backend.onrender.com/api/v1/trades/${id}/${verb}`, {}, {
      headers:{ Authorization:`Bearer ${localStorage.authToken}` }
    }).then(() => setTrades(trades.filter(t => t.id !== id)));

  return (
    <div className="p-4
                    sm:p-6
                    md:max-w-3xl md:mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Pending Trades</h2>
      {trades.length === 0 && (
        <p className="text-gray-500">No pending trades.</p>
      )}
      <ul className="space-y-4">
        {trades.map(t => (
          <li
            key={t.id}
            className="bg-white rounded shadow p-4
                       sm:flex sm:justify-between sm:items-center sm:p-6"
          >
            <div>
              <p>
                <span className="font-medium">{t.fromEmployer.name}</span>
                {' → '}
                <span className="font-medium">{t.toEmployer.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                {t.credits} credits @ ${t.pricePerCredit.toFixed(2)}
              </p>
            </div>
            <div className="mt-4 flex space-x-2 sm:mt-0">
              <button
                onClick={() => act(t.id, 'approve')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => act(t.id, 'reject')}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
