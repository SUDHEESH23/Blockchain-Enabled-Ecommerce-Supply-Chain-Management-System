// src/components/UpdateLocation.js
import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";

const UpdateLocation = () => {
    const { account, contract } = useWeb3();
    const [productId, setProductId] = useState("");
    const [newLocation, setNewLocation] = useState("");

    const updateLocation = async () => {
        try {
            await contract.methods
                .updateLocation(productId, newLocation)
                .send({ from: account });
            alert("Location updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update location.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Update Location</h2>
            <div className="mb-4">
                <label htmlFor="product-id" className="block text-gray-700">Product ID</label>
                <input
                    id="product-id"
                    type="number"
                    placeholder="Enter Product ID"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="new-location" className="block text-gray-700">New Location</label>
                <input
                    id="new-location"
                    type="text"
                    placeholder="Enter New Location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
            </div>
            <button
                onClick={updateLocation}
                className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
                Update Location
            </button>
        </div>
    );
};

export default UpdateLocation;
