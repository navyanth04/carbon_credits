// src/pages/TradesPage.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function TradesPage() {
  const [trades,    setTrades]    = useState([])
  const [myEmpId,   setMyEmpId]   = useState<number|null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [filter,    setFilter]    = useState('ALL') // ALL | INCOMING | OUTGOING

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        // 1) fetch current employerId
        const meRes = await axios.get(
          'https://carbon-credits-backend.onrender.com/api/v1/employer/me',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const empId = meRes.data.employerId
        setMyEmpId(empId)

        // 2) fetch all my trades
        const trRes = await axios.get(
          'https://carbon-credits-backend.onrender.com/api/v1/trades/my',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setTrades(trRes.data.trades)
      } catch (err) {
        console.error(err)
        setError('Failed to load trades or employer info.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // accept/reject only incoming trades
  const handleResponse = async (id, action) => {
    try {
      await axios.patch(
        `https://carbon-credits-backend.onrender.com/api/v1/trades/${id}/respond`,
        { action },
        { headers: { Authorization: `Bearer ${localStorage.authToken}` } }
      )
      setTrades(ts => ts.filter(t => t.id !== id))
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Operation failed')
    }
  }

  if (loading) return <div className="p-6 text-center">Loading…</div>
  if (error)   return <div className="p-6 text-center text-red-600">{error}</div>

  // client‑side filter
  const shown = trades.filter(t => {
    if (filter === 'ALL')      return true
    if (filter === 'INCOMING') return t.status === 'PENDING_BUYER' && t.toEmployer.id === myEmpId
    if (filter === 'OUTGOING') return t.fromEmployer.id === myEmpId
  })

  return (
    <div className="p-4 sm:p-6 md:max-w-3xl md:mx-auto">
      <h1 className="text-2xl font-semibold text-center mb-4">My Trades</h1>

      {/* filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { key: 'ALL',      label: 'All' },
          { key: 'INCOMING', label: 'Incoming' },
          { key: 'OUTGOING', label: 'Outgoing' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={
              (filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700') +
              ' px-4 py-2 rounded transition focus:outline-none focus:ring'
            }
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-gray-500">No trades to show.</p>
      ) : (
        <ul className="space-y-4">
          {shown.map(t => {
            const isIncoming =
              t.status === 'PENDING_BUYER' && t.toEmployer.id === myEmpId

            return (
              <li
                key={t.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                <div className="flex-1">
                  {isIncoming ? (
                    <p>
                      <span className="font-medium">From:</span>{' '}
                      {t.fromEmployer.name}
                    </p>
                  ) : (
                    <p>
                      <span className="font-medium">To:</span>{' '}
                      {t.toEmployer.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    {t.credits} credits @ ${t.pricePerCredit.toFixed(2)}
                  </p>
                </div>

                {isIncoming ? (
                  <div className="mt-4 flex space-x-2 sm:mt-0">
                    <button
                      onClick={() => handleResponse(t.id, 'accept')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponse(t.id, 'reject')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span
                    className={
                      'inline-block px-3 py-1 rounded-full text-sm font-semibold ' +
                      (t.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : t.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800')
                    }
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
