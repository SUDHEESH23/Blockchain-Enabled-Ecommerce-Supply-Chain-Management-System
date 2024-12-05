import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate(); // Use the useNavigate hook

  return (
    <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 min-h-screen flex justify-center items-center">
      {/* Main Container */}
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Welcome to Blockchain-Enabled E-Commerce Supply Chain Management System
        </h1>
        <p className="text-lg text-gray-600 mb-4 text-center">
          Select your dashboard to proceed.
        </p>

        {/* MetaMask Note */}
        <div className="bg-yellow-100 p-4 mb-6 rounded-lg shadow-sm">
          <p className="text-sm text-yellow-600">
            If you haven't already, make sure to enter your password in MetaMask to access your account.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate("/admin")} // Navigate to Admin Dashboard
            className="w-full py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Go to Admin Dashboard
          </button>
          <button
            onClick={() => navigate("/owner")} // Navigate to Owner Dashboard
            className="w-full py-3 text-lg font-semibold text-white bg-green-600 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Go to Owner Dashboard
          </button>
          <button
            onClick={() => navigate("/customer")} // Navigate to Customer Dashboard
            className="w-full py-3 text-lg font-semibold text-white bg-yellow-600 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Go to Customer Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
