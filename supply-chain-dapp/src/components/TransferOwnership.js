// src/components/TransferOwnership.js
import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";

const TransferOwnership = () => {
    const { account, contract } = useWeb3();
    const [productId, setProductId] = useState("");
    const [newOwner, setNewOwner] = useState("");

    const transferOwnership = async () => {
        try {
            await contract.methods
                .transferProduct(productId, newOwner)
                .send({ from: account });
            alert("Ownership transferred successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to transfer ownership.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transfer Ownership</h2>
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
                <label htmlFor="new-owner" className="block text-gray-700">New Owner Address</label>
                <input
                    id="new-owner"
                    type="text"
                    placeholder="Enter New Owner Address"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
            </div>
            <button
                onClick={transferOwnership}
                className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
                Transfer Ownership
            </button>
        </div>
    );
};

export default TransferOwnership;
