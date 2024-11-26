import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import Web3 from "web3";

const AddProduct = ({ refreshProducts }) => {
    const { account, contract } = useWeb3();
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");

    const addProduct = async () => {
        if (!productName.trim() || !productPrice) {
            alert("Please provide valid product details.");
            return;
        }

        if (!contract) {
            console.error("Contract is not initialized.");
            alert("Smart contract not loaded. Please try again.");
            return;
        }

        try {
            await contract.methods
                .addProduct(productName, Web3.utils.toWei(productPrice, "ether"))
                .send({ from: account });
            alert("Product added successfully!");

            if (typeof refreshProducts === "function") {
                refreshProducts();
            } else {
                console.warn("refreshProducts is not a valid function.");
            }
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Failed to add product. Please check the console for details.");
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Add Product</h2>
            <div className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <input
                        type="number"
                        placeholder="Product Price (ETH)"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <button
                        onClick={addProduct}
                        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
