// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom'; // For routing between pages

const Navbar = () => {
    return (
        <nav className="bg-blue-600 p-4 shadow-md">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center">
                <h1 className="text-white text-2xl font-bold">Supply Chain DApp</h1>
                <ul className="flex space-x-6">
                    <li>
                        <Link to="/add-product" className="text-white hover:text-gray-300">Add Product</Link>
                    </li>
                    <li>
                        <Link to="/products" className="text-white hover:text-gray-300">Product List</Link>
                    </li>
                    <li>
                        <Link to="/update-location" className="text-white hover:text-gray-300">Update Location</Link>
                    </li>
                    <li>
                        <Link to="/update-status" className="text-white hover:text-gray-300">Update Status</Link>
                    </li>
                    <li>
                        <Link to="/transfer-ownership" className="text-white hover:text-gray-300">Transfer Ownership</Link>
                    </li>
                    <li>
                        <Link to="/mark-delivered" className="text-white hover:text-gray-300">Mark Delivered</Link>
                    </li>
                    <li>
                        <Link to="/product-history" className="text-white hover:text-gray-300">Product History</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
