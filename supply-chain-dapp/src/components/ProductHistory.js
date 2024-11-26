// src/components/ProductHistory.js
import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";

const ProductHistory = () => {
    const { contract } = useWeb3();
    const [productId, setProductId] = useState("");
    const [history, setHistory] = useState([]);

    const fetchHistory = async () => {
        try {
            const productHistory = await contract.methods.getHistory(productId).call();
            
            // Format each event in the history, converting timestamp to a human-readable date
            const formattedHistory = productHistory.map((event) => {
                const [description, timestamp] = event.split(" at: "); // Assuming format "Event at: Timestamp"
                const formattedDate = timestamp
                    ? new Date(parseInt(timestamp) * 1000).toLocaleString() // Convert timestamp to date
                    : "Invalid date";
                return `${description} at: ${formattedDate}`;
            });

            setHistory(formattedHistory);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch product history.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product History</h2>
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
            <button
                onClick={fetchHistory}
                className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
            >
                Get History
            </button>
            <ul>
                {history.length > 0 ? (
                    history.map((event, index) => (
                        <li key={index} className="p-2 border-b border-gray-200">{event}</li>
                    ))
                ) : (
                    <li className="p-2 text-gray-500">No history available for this product.</li>
                )}
            </ul>
        </div>
    );
};

export default ProductHistory;
