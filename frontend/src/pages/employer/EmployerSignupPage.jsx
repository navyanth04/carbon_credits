// src/pages/EmployerSignupPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '../../components/Input';
import Button from '../../components/Button';

const EmployerSignupPage = () => {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr]         = useState('');
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await axios.post(
        'https://carbon-credits-backend.onrender.com/api/v1/employer/signup',
        { name, email, password }
      );
      navigate('/login');
    } catch (error) {
      console.error('Employer signup error:', error);
      if (axios.isAxiosError(error) && error.response) {
        setErr(error.response.data.message || 'Signup failed');
      } else {
        setErr('Signup failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Employer Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Company Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Input
            type="email"
            placeholder="Company Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {err && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm"
              role="alert"
            >
              {err}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 text-white hover:bg-green-700 py-2 rounded shadow-md transition"
          >
            Sign Up as Employer
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an employer account?{' '}
          <Link to="/employer-login" className="text-blue-600 hover:underline">
            Log in here
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or sign up as an{' '}
          <Link to="/signup" className="text-green-600 hover:underline">
            Employee
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EmployerSignupPage;
