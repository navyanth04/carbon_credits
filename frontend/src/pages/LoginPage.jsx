// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr]=useState(false)
  const navigate=useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const response=await axios.post('http://localhost:3000/api/v1/user/login',{
        email,password
      })

      const token = response.data.token;
      localStorage.setItem('authToken', token);
      setErr(false);
      navigate('/employee-dashboard');
    } catch (error) {
      console.log(error);
      setErr(true);
    }
    console.log({ email, password });
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
          {err ? (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">Enter valid credentials.</span>
            </div>
          ) : null}
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
