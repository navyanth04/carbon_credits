// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg]     = useState('');
  const [showSignupModal, setShowSignupModal] = useState(false);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg('');
    try {
      const response = await axios.post('https://carbon-credits-backend.onrender.com/api/v1/auth/login', {
        email, password
      });
      const token = response.data.token;
      localStorage.setItem('authToken', token);
      navigate(
        response.data.role === 'ADMIN'
          ? '/admin'
          : response.data.role === 'EMPLOYER'
            ? '/employer-dashboard'
            : '/employee-dashboard'
      );
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrMsg(error.response.data.message);
      } else {
        setErrMsg('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          >
            Login
          </Button>
          {errMsg && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{errMsg}</span>
            </div>
          )}
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <button
            onClick={() => setShowSignupModal(true)}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Sign up
          </button>
        </p>
      </div>

      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full relative">
            <button
              onClick={() => setShowSignupModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Sign Up As
            </h2>
            <div className="flex flex-col space-y-4">
              <Link to="/signup">
                <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                  Employee
                </Button>
              </Link>
              <Link to="/employer-signup">
                <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                  Employer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
