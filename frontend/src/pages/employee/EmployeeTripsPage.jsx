import React, { useState, useEffect } from 'react'
import EmployeeNavbar from '../../components/EmployeeNavbar'
import axios from 'axios'

export default function EmployeeMyTripsPage() {
  const [trips,   setTrips]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const fetchMyTrips = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const resp  = await axios.get(
          'https://carbon-credits-backend.onrender.com/api/v1/trip/my',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setTrips(resp.data.trips || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load your trips.')
      } finally {
        setLoading(false)
      }
    }
    fetchMyTrips()
  }, [])

  // loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <EmployeeNavbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-gray-600">Loading your trips…</p>
        </div>
      </div>
    )
  }

  // error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <EmployeeNavbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // empty
  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <EmployeeNavbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-gray-500">You have no trips logged yet.</p>
        </div>
      </div>
    )
  }

  // success
  return (
    <div className="min-h-screen bg-gray-100">
      <EmployeeNavbar />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">My Trips</h1>
        <ul className="space-y-4">
          {trips.map(trip => {
            const dateStr = new Date(trip.date).toLocaleString()
            const miles   = (trip.distance / 1609.34).toFixed(2)
            const maxMPH  = trip.maxSpeed
              ? (trip.maxSpeed * 2.23694).toFixed(1)
              : 'N/A'
            const avgMPH  = trip.averageSpeed
              ? (trip.averageSpeed * 2.23694).toFixed(1)
              : 'N/A'

            return (
              <details
                key={trip.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <summary className="cursor-pointer font-medium flex justify-between">
                  <span>{dateStr}</span>
                  <span className="text-blue-600">{miles} mi</span>
                </summary>
                <div className="mt-3 space-y-2 text-gray-700 text-sm">
                  <p><strong>Route:</strong> {trip.startLocation} → {trip.endLocation}</p>
                  <p><strong>Transport:</strong> {trip.transportMode.replace('_',' ')}</p>
                  <p><strong>Credits Earned:</strong> {trip.credits.toFixed(2)}</p>
                  <p><strong>Miles Saved:</strong> {trip.milesSaved.toFixed(2)}</p>
                  <p><strong>Max Speed:</strong> {maxMPH} mph</p>
                  <p><strong>Avg Speed:</strong> {avgMPH} mph</p>
                  <p><strong>Duration:</strong> {trip.duration}s</p>
                </div>
              </details>
            )
          })}
        </ul>
      </main>
    </div>
  )
}
