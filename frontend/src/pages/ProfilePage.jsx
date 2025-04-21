// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePage = () => {
  const [firstName, setFirstName] = useState('john');
  const [lastName, setLastName]=useState('doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // to show feedback to the user

  // Function to fetch profile data from the backend
  const fetchProfile = async () => {
    try {
      const response = await axios.get('https://carbon-credits-backend.onrender.com/api/v1/user/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      // console.log(response.data.userDB);
      setFirstName(response.data.userDB.firstName);
      setLastName(response.data.userDB.lastName);
      setEmail(response.data.userDB.email);
      setPassword(response.data.userDB.password);
      setMessage('');
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage("Error loading profile data");
    }
  };

  // Fetch profile data when the component mounts
  useEffect(() => {
    fetchProfile();
  }, []);

  // Handler to update the profile data via the backend
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        'https://carbon-credits-backend.onrender.com/api/v1/user/update',
        { firstName, lastName, email, password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      setMessage("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold mb-4">My Profile</h1>
        {message && (
          <div className="mb-4 text-center text-sm text-green-600">
            {message}
          </div>
        )}
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Name"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Name"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
