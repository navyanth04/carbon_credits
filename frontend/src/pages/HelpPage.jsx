// src/pages/HelpPage.jsx
import React from 'react';

const HelpPage = () => {
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold mb-4">Help & FAQ</h1>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">How does the Carbon Credits system work?</h2>
          <p className="mt-2">Explanation of the system...</p>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">How do I log a new trip?</h2>
          <p className="mt-2">Instructions on logging trips...</p>
        </div>
        {/* More Q&A sections */}
        <div>
          <h2 className="text-2xl font-semibold">Contact Support</h2>
          <p className="mt-2">Email us at support@carboncreditsplatform.com</p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
