// src/components/NewTrade.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function NewTrade() {
  const [employers, setEmployers] = useState([])
  const [balance,   setBalance]   = useState(0)
  const [toId,      setToId]      = useState('')
  const [credits,   setCredits]   = useState(0)
  const [price,     setPrice]     = useState(0)

  // 1) Fetch approved employers
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          'https://carbon-credits-backend.onrender.com/api/v1/admin/employers/approved',
          { headers: { Authorization: `Bearer ${localStorage.authToken}` } }
        )
        setEmployers(data.employers)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  // 2) Fetch my employer’s current credit balance
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          'https://carbon-credits-backend.onrender.com/api/v1/employer/summary',
          { headers: { Authorization: `Bearer ${localStorage.authToken}` } }
        )
        setBalance(data.totalCredits)
      } catch (err) {
        console.error('Failed loading my balance', err)
      }
    })()
  }, [])

  const submit = async (e) => {
    e.preventDefault()

    if (credits > balance) {
      alert(`You only have ${balance} credits to sell.`)
      return
    }

    try {
      await axios.post(
        'https://carbon-credits-backend.onrender.com/api/v1/trades',
        {
          toEmployerId: Number(toId),
          credits,
          pricePerCredit: price,
        },
        { headers: { Authorization: `Bearer ${localStorage.authToken}` } }
      )
      alert('Trade proposed!')
      // refresh your balance:
      setBalance((b) => b - credits)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Could not propose trade.')
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded shadow p-4 space-y-4
                 sm:p-6 sm:space-y-6
                 md:grid md:grid-cols-2 md:gap-4 md:space-y-0
                 lg:max-w-2xl lg:mx-auto"
    >
      <h2 className="col-span-full text-xl font-semibold">Propose Trade</h2>

      <p className="col-span-full text-sm text-gray-600">
        Your available credits: <strong>{balance}</strong>
      </p>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Sell to…</label>
        <select
          value={toId}
          onChange={(e) => setToId(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        >
          <option value="">– Select Employer –</option>
          {employers.map((o) => (
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
          max={balance}
          value={credits}
          onChange={(e) => setCredits(Number(e.target.value))}
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
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="USD"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
      </div>

      <button
        type="submit"
        className="col-span-full md:col-span-2
                   bg-blue-600 hover:bg-blue-700 text-white font-semibold
                   rounded px-4 py-2 text-center
                   transition disabled:opacity-50"
        disabled={!toId || credits <= 0 || credits > balance || price <= 0}
      >
        Submit
      </button>
    </form>
  )
}
