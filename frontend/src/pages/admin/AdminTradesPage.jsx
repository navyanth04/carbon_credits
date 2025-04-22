// src/pages/AdminTradesPage.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminTradesPage() {
  const [trades,  setTrades]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [filter,  setFilter]  = useState('ALL') // ALL | PENDING_BUYER | PENDING_ADMIN | REJECTED

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        const { data } = await axios.get(
          'https://carbon-credits-backend.onrender.com/api/v1/trades/all',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setTrades(data.trades)
      } catch (err) {
        console.error(err)
        setError('Failed to load trades.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleAdminAction = async (id, verb) => {
    const token = localStorage.getItem('authToken')
    try {
      await axios.patch(
        `https://carbon-credits-backend.onrender.com/api/v1/trades/${id}/${verb}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // remove or update the trade locally
      setTrades(ts => ts.filter(t => t.id !== id))
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Operation failed')
    }
  }

  if (loading) return <div className="p-6 text-center">Loading trades…</div>
  if (error)   return <div className="p-6 text-center text-red-600">{error}</div>

  // apply client‑side filter
  const shown = trades.filter(t => {
    if (filter === 'ALL')           return true
    if (filter === 'PENDING_BUYER') return t.status === 'PENDING_BUYER'
    if (filter === 'PENDING_ADMIN') return t.status === 'PENDING_ADMIN'
    if (filter === 'REJECTED')      return t.status === 'REJECTED'
    return false
  })

  return (
    <div className="min-h-screen flex bg-gray-100 md:pb-0 pb-16">

      <main className="flex-1 p-4 sm:p-6 md:max-w-4xl md:mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-6">All Carbon‑Credit Trades</h1>

        {/* filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { key: 'ALL',           label: 'All'            },
            { key: 'PENDING_BUYER', label: 'Awaiting Buyer' },
            { key: 'PENDING_ADMIN', label: 'Awaiting Admin' },
            { key: 'REJECTED',      label: 'Rejected'       },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                ${filter === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}
                px-4 py-2 rounded transition focus:outline-none focus:ring
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="text-center text-gray-500">No trades match this filter.</p>
        ) : (
          <ul className="space-y-4">
            {shown.map(t => (
              <li
                key={t.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                {/* trade parties & amount */}
                <div className="flex-1">
                  <p>
                    <span className="font-medium">{t.fromEmployer.name}</span>
                    {' → '}
                    <span className="font-medium">{t.toEmployer.name}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t.credits} credits @ ${t.pricePerCredit.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(t.tradeDate).toLocaleString()}
                  </p>
                </div>

                {/* admin actions or status badge */}
                {t.status === 'PENDING_ADMIN' ? (
                  <div className="mt-4 flex space-x-2 sm:mt-0">
                    <button
                      onClick={() => handleAdminAction(t.id, 'approve')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAdminAction(t.id, 'reject')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span
                    className={`
                      inline-block px-3 py-1 rounded-full text-sm font-semibold mt-4 sm:mt-0
                      ${
                        t.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                        : t.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }
                    `}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
