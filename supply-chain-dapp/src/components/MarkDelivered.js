// src/components/MarkDelivered.js
import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";

const MarkDelivered = () => {
    const { account, contract } = useWeb3();
    const [productId, setProductId] = useState("");

    const markAsDelivered = async () => {
        try {
            await contract.methods
                .markDelivered(productId)
                .send({ from: account });
            alert("Product marked as delivered!");
        } catch (err) {
            console.error(err);
            alert("Failed to mark product as delivered.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mark as Delivered</h2>
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
                onClick={markAsDelivered}
                className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
                Mark as Delivered
            </button>
        </div>
    );
};

export default MarkDelivered;
