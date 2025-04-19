// src/pages/LandingPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const LandingPage = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-6">
      <div className="text-center bg-white bg-opacity-90 p-10 rounded-lg shadow-lg transform transition-transform hover:scale-105">
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
          <button
            onClick={() => setShowSignupModal(true)}
            className=""
          >
            <Button className="bg-green-600 text-white hover:bg-green-700 shadow-md">
              Signup
            </Button>
          </button>
        </div>
      </div>

      {showSignupModal && (
        // modal overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* modal box */}
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full relative">
            {/* close button */}
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

export default LandingPage;
