import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function NewTrade() {
  const [employers, setEmployers] = useState([]);
  const [toId, setToId]           = useState('');
  const [credits, setCredits]     = useState(0);
  const [price, setPrice]         = useState(0);

  useEffect(() => {
    axios.get('https://carbon-credits-backend.onrender.com/api/v1/admin/employers/approved')
      .then(r => setEmployers(r.data.employers));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post('/api/v1/trades', {
      toEmployerId: Number(toId),
      credits,
      pricePerCredit: price
    }, {
      headers:{ Authorization:`Bearer ${localStorage.authToken}` }
    });
    alert('Trade proposed!');
  };

  return (
    <form 
      onSubmit={submit}
      className="bg-white rounded shadow p-4 space-y-4
                 sm:p-6 sm:space-y-6
                 md:grid md:grid-cols-2 md:gap-4 md:space-y-0
                 lg:max-w-2xl lg:mx-auto"
    >
      <h2 className="col-span-full text-xl font-semibold">Propose Trade</h2>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Sell to…</label>
        <select
          onChange={e=>setToId(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        >
          <option value="">– Select Employer –</option>
          {employers.map(o=>(
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Credits</label>
        <input
          type="number"
          value={credits}
          onChange={e=>setCredits(Number(e.target.value))}
          placeholder="Amount"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Price per Credit</label>
        <input
          type="number"
          value={price}
          onChange={e=>setPrice(Number(e.target.value))}
          placeholder="USD"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
      </div>

      <button
        type="submit"
        className="col-span-full md:col-span-2
                   bg-blue-600 hover:bg-blue-700 text-white font-semibold
                   rounded px-4 py-2 text-center
                   transition"
      >
        Submit
      </button>
    </form>
  );
}
