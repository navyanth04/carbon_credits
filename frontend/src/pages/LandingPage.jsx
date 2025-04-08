// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-6">
      <div className="text-center bg-white bg-opacity-90 p-10 rounded-lg shadow-lg">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          Carbon Credits Platform
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Save the planet by tracking your green choices, reducing emissions, and trading carbon credits.
        </p>
        <div className="flex justify-center space-x-6">
          <Link to="/login">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-md">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-green-600 text-white hover:bg-green-700 shadow-md">
              Signup
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
