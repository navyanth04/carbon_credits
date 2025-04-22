import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import EmployeeNavbar from '../../components/EmployeeNavbar'

export default function EmployeeSettingsPage() {
  const [user, setUser]           = useState({ firstName: '', lastName: '' })
  const [totalCredits, setTotalCredits] = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        // 1) fetch profile
        const [{ data: prof }, { data: tripsRes }] = await Promise.all([
          axios.get('https://carbon-credits-backend.onrender.com/api/v1/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://carbon-credits-backend.onrender.com/api/v1/trip/my', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        setUser({
          firstName: prof.userDB.firstName,
          lastName:  prof.userDB.lastName
        })
        // 2) sum up credits from trips
        const sum = (tripsRes.trips || []).reduce((acc, t) => acc + (t.credits||0), 0)
        setTotalCredits(sum)
      } catch (err) {
        console.error(err)
        setError('Failed to load settings.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <EmployeeNavbar/>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-gray-600">Loading settings…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <EmployeeNavbar/>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <EmployeeNavbar/>
      <main className="max-w-md mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Settings & Profile
        </h2>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <p className="text-gray-700">
            <span className="font-semibold">Name:</span>{' '}
            {user.firstName} {user.lastName}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Carbon Credits Earned:</span>{' '}
            <span className="text-indigo-700">{totalCredits.toFixed(2)}</span>
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <Link
            to="/profile"
            className="flex-1 text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            View / Edit Profile
          </Link>
          <Link
            to="/help"
            className="flex-1 text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Help & FAQ
          </Link>
        </div>
      </main>
    </div>
  )
}
