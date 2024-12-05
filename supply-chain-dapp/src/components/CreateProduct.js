import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";

const CreateProduct = () => {
  const { account, contract } = useWeb3();
  const [newProductData, setNewProductData] = useState({
    name: "",
    price: "",
    stock: "",
  });

  const handleCreateProduct = async () => {
    const { name, price, stock } = newProductData;

    try {
      const gasEstimate = await contract.methods.addProduct(name, price, stock).estimateGas({ from: account });
      await contract.methods.addProduct(name, price, stock).send({ from: account, gas: gasEstimate });
      alert("Product added successfully!");
      setNewProductData({
        name: "",
        price: "",
        stock: "",
      });
    } catch (error) {
      console.error("Error creating product:", error);
      if (error.message.includes("MetaMask Tx Signature: User denied transaction signature")) {
        alert("Transaction was rejected by the user. Please try again.");
      } else {
        alert("Error creating product! Please check console for details.");
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Create New Product</h2>
      <input
        type="text"
        placeholder="Product Name"
        className="p-2 border border-gray-300 rounded-md mb-4 w-full"
        onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Product Price"
        className="p-2 border border-gray-300 rounded-md mb-4 w-full"
        onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
      />
      <input
        type="number"
        placeholder="Product Stock"
        className="p-2 border border-gray-300 rounded-md mb-4 w-full"
        onChange={(e) => setNewProductData({ ...newProductData, stock: e.target.value })}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded-md w-full"
        onClick={handleCreateProduct}
      >
        Create Product
      </button>
    </div>
  );
};

export default CreateProduct;
