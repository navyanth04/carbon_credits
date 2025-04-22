// src/components/NewTrade.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployerSidebar from '../../components/sidebar/EmployerSidebar';

export default function NewTrade() {
  const [employers,      setEmployers]      = useState([]);
  const [carbonBalance,  setCarbonBalance]  = useState(0);
  const [cashBalance,    setCashBalance]    = useState(0);
  const [toId,           setToId]           = useState('');
  const [credits,        setCredits]        = useState('');
  const [price,          setPrice]          = useState('');

  // 1) fetch other employers
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          'https://carbon-credits-backend.onrender.com/api/v1/employer/others',
          { headers: { Authorization: `Bearer ${localStorage.authToken}` } }
        );
        setEmployers(data.employers);
      } catch (err) {
        console.error('Failed loading other employers', err);
      }
    })();
  }, []);

  // 2) fetch my balances
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          'https://carbon-credits-backend.onrender.com/api/v1/employer/summary',
          { headers: { Authorization: `Bearer ${localStorage.authToken}` } }
        );
        setCarbonBalance(data.totalCredits);
        setCashBalance(data.cashBalance);
      } catch (err) {
        console.error('Failed loading my summary', err);
      }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const numCredits = Number(credits);
    const numPrice   = Number(price);

    if (!toId) {
      return alert('Please select a buyer');
    }
    if (!numCredits || numCredits < 1) {
      return alert('Enter a valid number of credits');
    }
    if (numCredits > carbonBalance) {
      return alert(`Insufficient carbon credits: you have ${carbonBalance}`);
    }
    if (!numPrice || numPrice <= 0) {
      return alert('Enter a valid price per credit');
    }

    try {
      await axios.post(
        'https://carbon-credits-backend.onrender.com/api/v1/trades',
        { toEmployerId: Number(toId), credits: numCredits, pricePerCredit: numPrice },
        { headers: { Authorization: `Bearer ${localStorage.authToken}` } }
      );
      alert('Trade proposed!');
      // update displayed balances immediately
      setCarbonBalance(c => c - numCredits);
      setCashBalance(c => c + numCredits * numPrice);
      setToId('');
      setCredits('');
      setPrice('');
    } catch (err) {
      console.error('Trade submission failed', err);
      alert(err.response?.data?.message || 'Could not propose trade.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar / bottom bar */}
      <EmployerSidebar />

      {/* Main form area */}
      <main className="flex-1 p-6 overflow-auto">
        <form
          onSubmit={submit}
          className="bg-white rounded shadow p-4 space-y-4
                     sm:p-6 sm:space-y-6
                     md:grid md:grid-cols-2 md:gap-4 md:space-y-0
                     lg:max-w-2xl lg:mx-auto"
        >
          <h2 className="col-span-full text-xl font-semibold">Propose Trade</h2>

          <p className="col-span-full text-sm text-gray-600">
            Carbon Credits: <strong>{carbonBalance.toFixed(2)}</strong>{' '}
            • Cash Balance: <strong>${cashBalance.toFixed(2)}</strong>
          </p>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Sell to…</label>
            <select
              value={toId}
              onChange={e => setToId(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            >
              <option value="">– Select Employer –</option>
              {employers.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Credits to Sell</label>
            <input
              type="number"
              min="1"
              max={carbonBalance}
              value={credits}
              onChange={e => setCredits(e.target.value)}
              placeholder="Amount"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Price per Credit</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="USD"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <button
            type="submit"
            disabled={
              !toId ||
              !credits ||
              Number(credits) < 1 ||
              Number(credits) > carbonBalance ||
              Number(price) <= 0
            }
            className="col-span-full md:col-span-2
                       bg-blue-600 hover:bg-blue-700 text-white font-semibold
                       rounded px-4 py-2 text-center
                       transition disabled:opacity-50"
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
}
