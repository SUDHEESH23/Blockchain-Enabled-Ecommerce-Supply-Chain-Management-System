// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import Dashboard from "./components/Dashboard.js";
import AdminDashboard from "./components/AdminDashboard";
import OwnerDashboard from "./components/OwnerDashboard";
import CustomerDashboard from "./components/CustomerDashboard";

const App = () => {
    return (
        <Web3Provider>
            <Router>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/owner" element={<OwnerDashboard />} />
                    <Route path="/customer" element={<CustomerDashboard />} />
                </Routes>
            </Router>
        </Web3Provider>
    );
};

export default App;
