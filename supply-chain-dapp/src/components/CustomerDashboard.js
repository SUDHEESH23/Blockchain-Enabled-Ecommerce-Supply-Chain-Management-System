import React, { useEffect, useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import Web3 from "web3";
import { fetchProductHistory } from "./ProductHistory"; // Import the history function
import ProductHistoryAccordion from "./ProductHistoryDisplay"; // Import the history accordion component

const Sidebar = ({ setSection, section }) => {
  return (
    <div className="w-64 bg-teal-800 text-white p-6 space-y-6">
      <h2 className="text-xl font-bold">Customer Dashboard</h2>
      <ul className="space-y-3">
        <li
          className={`cursor-pointer p-3 rounded-md transition-all ${section === "products" ? "bg-teal-600" : "hover:bg-teal-700"}`}
          onClick={() => setSection("products")}
        >
          Available Products
        </li>
        <li
          className={`cursor-pointer p-3 rounded-md transition-all ${section === "purchased" ? "bg-teal-600" : "hover:bg-teal-700"}`}
          onClick={() => setSection("purchased")}
        >
          Purchased Products
        </li>
        <li
          className={`cursor-pointer p-3 rounded-md transition-all ${section === "delivered" ? "bg-teal-600" : "hover:bg-teal-700"}`}
          onClick={() => setSection("delivered")}
        >
          Delivered Products
        </li>
      </ul>
    </div>
  );
};

const CustomerDashboard = () => {
  const { account, contract, isLoading, error } = useWeb3();
  const [products, setProducts] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [deliveredProducts, setDeliveredProducts] = useState([]); // State for delivered products
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState("products");
  const [history, setHistory] = useState([]); // State to store product history
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false); // State to control modal visibility

  const fetchProducts = async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const productCount = await contract.methods.productCount().call();
      const productsList = [];
      const purchasedList = [];
      const deliveredList = [];

      for (let i = 1; i <= productCount; i++) {
        const product = await contract.methods.getProductBasicDetails(i).call();
        const deliveryDetails = await contract.methods.getProductDeliveryDetails(i).call();
        const formattedProduct = {
          id: product.id.toString(),
          name: product.name,
          price: Web3.utils.fromWei(product.price.toString(), "ether"),
          stock: product.stock.toString(),
          status: product.status,
          owner: product.owner,
          isDelivered: deliveryDetails.isDelivered,
          finalCustomer: deliveryDetails.finalCustomer,
        };

        if (formattedProduct.isDelivered && formattedProduct.finalCustomer.toLowerCase() === account.toLowerCase()) {
          deliveredList.push(formattedProduct);
        } 
        // Check if the product is purchased by the current user
        else if (formattedProduct.finalCustomer && formattedProduct.finalCustomer.toLowerCase() === account.toLowerCase()) {
          purchasedList.push(formattedProduct);
        } 
        // Otherwise, it's available for purchase
        else if(!formattedProduct.isDelivered && formattedProduct.finalCustomer === "0x0000000000000000000000000000000000000000") {
          productsList.push(formattedProduct);
        }
      }

      setProducts(productsList);
      setPurchasedProducts(purchasedList);
      setDeliveredProducts(deliveredList);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const purchaseProduct = async (productId, price) => {
    if (!contract) return;
  
    setLoading(true);
    try {
      await contract.methods.purchaseProduct(productId, 1).send({
        from: account,
        value: Web3.utils.toWei(price, "ether"),
      });
      alert("Product purchased successfully!");
      
      // Wait for a moment to ensure the history updates, then fetch product history
      setTimeout(async () => {
        await fetchProductHistory(productId, contract, setHistory);
      }, 2000);  // 2 seconds delay to allow history update
  
      await fetchProducts(); // Refetch products after purchase
    } catch (err) {
      console.error("Error purchasing product:", err);
      alert("Transaction failed.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsDelivered = async (productId) => {
    if (!contract) return;

    try {
      // Mark the product as delivered
      await contract.methods.markDelivered(productId).send({ from: account });
      alert("Product marked as delivered!");

      // Move the product from purchasedProducts to deliveredProducts
      const updatedPurchasedProducts = purchasedProducts.filter(product => product.id !== productId);
      const updatedDeliveredProduct = purchasedProducts.find(product => product.id === productId);

      if (updatedDeliveredProduct) {
        updatedDeliveredProduct.isDelivered = true; // Update its status
        setDeliveredProducts((prevDelivered) => [...prevDelivered, updatedDeliveredProduct]); // Add it to delivered
      }

      setPurchasedProducts(updatedPurchasedProducts); // Remove it from purchased list
    } catch (err) {
      console.error("Error marking as delivered:", err);
      alert("Failed to mark as delivered.");
    }
  };

  const handleViewHistory = async (productId) => {
    // Fetch and update history
    await fetchProductHistory(productId, contract, setHistory);
    setHistoryModalOpen(true); // Open the history modal after fetching history
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false); // Close the history modal
  };

  useEffect(() => {
    if (contract && account) {
      fetchProducts();
    }
  }, [contract, account]);

  if (isLoading) return <div>Loading Web3...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex">
      <Sidebar setSection={setSection} section={section} />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
        <p className="mb-4">Connected Account: {account}</p>

        {loading && <p>Loading...</p>}

        {section === "products" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.length === 0 ? (
              <p>No products available</p>
            ) : (
              products.map((product, index) => (
                <div key={`${product.id}-${index}`} className="p-4 bg-white shadow rounded">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p>Price: {Math.floor(product.price * 1e18)} ETH</p>
                  <p>Stock: {product.stock !== "0" ? product.stock : "Out of stock"}</p>
                  <p>Status: {product.status}</p>

                  <button
                    onClick={() => purchaseProduct(product.id, product.price)}
                    disabled={product.stock <= 0 || product.isDelivered || product.owner === account || product.finalCustomer === account}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Purchase
                  </button>
                </div>
              ))
            )}
          </div>
        ) : section === "purchased" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchasedProducts.length === 0 ? (
              <p>No purchased products available</p>
            ) : (
              purchasedProducts.map((product, index) => (
                <div key={`${product.id}-${index}`} className="p-4 bg-white shadow rounded">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p>Price: {Math.floor(product.price * 1e18)} ETH</p>
                  <p>Status: {product.status}</p>

                  <button
                    onClick={() => handleMarkAsDelivered(product.id)}
                    className="mt-2 mr-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Mark as Delivered
                  </button>

                  <button
                    onClick={() => handleViewHistory(product.id)}
                    className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    View History
                  </button>
                </div>
              ))
            )}
          </div>
        ) : section === "delivered" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveredProducts.length === 0 ? (
              <p>No delivered products available</p>
            ) : (
              deliveredProducts.map((product, index) => (
                <div key={`${product.id}-${index}`} className="p-4 bg-white shadow rounded">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p>Price: {Math.floor(product.price * 1e18)} ETH</p>
                  <p>Status: {product.status}</p>
                  <button
                    onClick={() => handleViewHistory(product.id)}
                    className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    View History
                  </button>
                </div>
              ))
            )}
          </div>
        ) : null}

        {/* Product History Modal */}
        {isHistoryModalOpen && (
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-1/2">
              <h2 className="text-2xl font-semibold mb-4">Product History</h2>
              <ProductHistoryAccordion history={history} />
              <button
                onClick={closeHistoryModal}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
