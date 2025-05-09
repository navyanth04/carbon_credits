// src/pages/EmployerDashboard.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useSearchParams } from 'react-router-dom'
import ProtectedLayout from '../../components/ProtectedLayout'
import Input from '../../components/Input'
import EmployerSidebar from '../../components/sidebar/EmployerSidebar'

export default function EmployerDashboard() {
  const [searchParams] = useSearchParams()
  const filter         = searchParams.get('filter') || 'ALL'

  const [summary, setSummary]     = useState({ totalCredits: 0, activeCount: 0, pendingCount: 0 })
  const [employees, setEmployees] = useState([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const [sumRes, empRes] = await Promise.all([
        axios.get('https://carbon-credits-backend.onrender.com/api/v1/employer/summary',   { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://carbon-credits-backend.onrender.com/api/v1/employer/employees', { headers: { Authorization: `Bearer ${token}` } })
      ])
      setSummary(sumRes.data)
      setEmployees(empRes.data.employees || [])
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleApprove = async (id) => {
    const token = localStorage.getItem('authToken')
    await axios.post(
      `https://carbon-credits-backend.onrender.com/api/v1/employer/employees/${id}/approve`,
      {}, { headers: { Authorization: `Bearer ${token}` } }
    )
    fetchData()
  }

  const handleReject = async (id) => {
    const token = localStorage.getItem('authToken')
    await axios.post(
      `https://carbon-credits-backend.onrender.com/api/v1/employer/employees/${id}/reject`,
      {}, { headers: { Authorization: `Bearer ${token}` } }
    )
    fetchData()
  }

  // loading / error
  if (loading || error) {
    return (
      <ProtectedLayout>
        <div className="flex flex-col md:flex-row min-h-screen pb-16 md:pb-0">
          <EmployerSidebar />
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            {loading ? <p>Loading…</p> : <p className="text-red-600">{error}</p>}
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  // filter + search
  const displayed = employees
    .filter(e => filter === 'ALL' || e.status === filter)
    .filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <ProtectedLayout>
      <div className="flex flex-col md:flex-row min-h-screen pb-16 md:pb-0">
        <EmployerSidebar />

        <div className="flex-1 p-6 bg-gray-100 space-y-6">
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Credits',     value: summary.totalCredits, filterKey: 'ALL' },
              { label: 'Active Employees',  value: summary.activeCount,   filterKey: 'ACTIVE' },
              { label: 'Pending Approvals', value: summary.pendingCount,  filterKey: 'PENDING' },
            ].map(({ label, value, filterKey }) => (
              <Link to={`?filter=${filterKey}`} key={filterKey}>
                <div className={`p-6 bg-white rounded-lg shadow cursor-pointer ${
                  filter === filterKey ? 'ring-2 ring-green-400' : ''
                }`}>
                  <h2 className="font-semibold">{label}</h2>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <Link to="/trades/new">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
                Propose Trade
              </button>
            </Link>
            <Link to="/my-trips">
              <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700">
                View Employee Trips
              </button>
            </Link>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow">
            <Input
              placeholder="Search employees…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Employee Table */}
          <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-gray-600">
                  {['Name','Email','Credits','Status','Actions'].map(c => (
                    <th key={c} className="px-4 py-2">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(emp => (
                  <tr key={emp.id} className="border-t">
                    <td className="px-4 py-2">{emp.firstName} {emp.lastName}</td>
                    <td className="px-4 py-2">{emp.email}</td>
                    <td className="px-4 py-2">{emp.credits.toFixed(2)}</td>
                    <td className="px-4 py-2">{emp.status}</td>
                    <td className="px-4 py-2 space-x-2">
                      {emp.status === 'PENDING' && (
                        <>
                          <button onClick={()=>handleApprove(emp.id)} className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                            Approve
                          </button>
                          <button onClick={()=>handleReject(emp.id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
