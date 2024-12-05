import React, { useState, useEffect } from "react";
import Web3 from "web3";
import CreateProduct from "./CreateProduct";
import ProductList from "./ProductList";
import PurchasedList from "./PurchasedList"; // Component for Purchased Products
import DeliveredList from "./DeliveredList"; // New component for Delivered Products

const AdminDashboard = () => {
  const [selectedFeature, setSelectedFeature] = useState("createProduct");
  const [isAdmin, setIsAdmin] = useState(false);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_ADDRESS = "0x2fc6C8609C61C3C3B15f892A0FBCA3a60546fA15"; // Hardcoded admin address

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        setLoading(true);

        // Check if Web3 is injected (e.g., MetaMask)
        const provider = window.ethereum || "http://localhost:7545";
        const web3 = new Web3(provider);

        if (window.ethereum) {
          // Request accounts if MetaMask is available
          await window.ethereum.request({ method: "eth_requestAccounts" });
        }

        // Request accounts
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        // Check if the account matches the admin address
        const isAdmin = accounts[0].toLowerCase() === ADMIN_ADDRESS.toLowerCase();
        setIsAdmin(isAdmin);
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Checking access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="mt-4 text-lg text-gray-600">Your address: {account}</p>
          <h2 className="text-2xl font-semibold text-red-500">
            You do not have access to the Admin Dashboard
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar for managing products */}
      <div className="w-64 bg-gray-900 text-white p-6 space-y-6">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <ul className="space-y-3">
          <li
            className={`cursor-pointer p-3 rounded-md transition-all ${
              selectedFeature === "createProduct"
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setSelectedFeature("createProduct")}
          >
            Create Product
          </li>
          <li
            className={`cursor-pointer p-3 rounded-md transition-all ${
              selectedFeature === "productList"
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setSelectedFeature("productList")}
          >
            Product List
          </li>
          {/* Sidebar item for Purchased Products */}
          <li
            className={`cursor-pointer p-3 rounded-md transition-all ${
              selectedFeature === "purchasedList"
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setSelectedFeature("purchasedList")}
          >
            Purchased Products
          </li>
          {/* New Sidebar item for Delivered Products */}
          <li
            className={`cursor-pointer p-3 rounded-md transition-all ${
              selectedFeature === "deliveredList"
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setSelectedFeature("deliveredList")}
          >
            Delivered Products
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-8">
        {selectedFeature === "createProduct" && <CreateProduct />}
        {selectedFeature === "productList" && <ProductList />}
        {selectedFeature === "purchasedList" && <PurchasedList />}
        {selectedFeature === "deliveredList" && <DeliveredList />}
      </div>
    </div>
  );
};

export default AdminDashboard;