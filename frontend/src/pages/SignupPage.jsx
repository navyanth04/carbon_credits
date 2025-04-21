// src/pages/SignupPage.jsx
import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [employers, setEmployers]   = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employerId, setEmployerId] = useState('');
  const [err, setErr]               = useState('');
  const navigate                    = useNavigate();

  // Fetch approved employers on mount
  useEffect(() => {
    axios.get('https://carbon-credits-backend.onrender.com/api/v1/employer/list')
      .then(res => {
        setEmployers(res.data.employers);
      })
      .catch(console.error);
  }, []);

  // Filtered list based on searchTerm
  const filtered = employers.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employerId) {
      setErr('Please select your company.');
      return;
    }

    try {
      await axios.post('https://carbon-credits-backend.onrender.com/api/v1/auth/signup', {
        firstName,
        lastName,
        email,
        password,
        employerId: Number(employerId),
      });

      setErr('');
      navigate('/login');
    } catch (error) {
      console.error(error);
      setErr('Signup failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Sign Up as Employee
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {/* Company Search & Select */}
          <div>
            <Input
              placeholder="Search company..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              className="w-full border border-gray-300 rounded-md px-4 py-2 mt-2"
              value={employerId}
              onChange={e => setEmployerId(e.target.value)}
              required
            >
              <option value="">Pick your company</option>
              {filtered.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full bg-green-600 text-white hover:bg-green-700">
            Sign Up
          </Button>

          {err && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {err}
            </div>
          )}
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or sign up as an{' '}
          <Link to="/employer-signup" className="text-indigo-600 hover:underline">
            Employer
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
