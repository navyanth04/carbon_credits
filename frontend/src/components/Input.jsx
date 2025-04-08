// src/components/Input.jsx
import React from 'react';

const Input = ({ type = "text", placeholder = "", value, onChange, className = "", ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full border border-gray-300 rounded-md px-4 py-3 placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    />
  );
};

export default Input;
