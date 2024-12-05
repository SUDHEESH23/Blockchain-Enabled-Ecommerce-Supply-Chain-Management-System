import React, { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import Web3 from "web3";
import { fetchProductHistory } from "./ProductHistory"; // Import the fetchProductHistory utility function
import ProductHistoryAccordion from "./ProductHistoryDisplay"; // Import the ProductHistoryAccordion component

const DeliveredList = () => {
  const { contract, account } = useWeb3();
  const [deliveredProducts, setDeliveredProducts] = useState([]);
  const [productHistory, setProductHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  // Fetch delivered products
  const fetchDeliveredProducts = useCallback(async () => {
    if (!contract) return;

    try {
      const productCount = await contract.methods.productCount().call();
      const deliveredList = [];

      for (let i = 1; i <= productCount; i++) {
        const product = await contract.methods.getProductBasicDetails(i).call();
        const deliveryDetails = await contract.methods.getProductDeliveryDetails(i).call();
        if (deliveryDetails.isDelivered) {
          deliveredList.push({
            id: product.id.toString(),
            name: product.name,
            price: Web3.utils.fromWei(product.price.toString(), "ether"),
            stock: product.stock.toString(),
            finalCustomer: deliveryDetails.finalCustomer,
          });
        }
      }
      setDeliveredProducts(deliveredList);
    } catch (err) {
      console.error("Error fetching delivered products:", err);
    }
  }, [contract]);

  useEffect(() => {
    if (contract && account) {
      fetchDeliveredProducts();
    }
  }, [contract, account, fetchDeliveredProducts]);

  const handleViewHistory = async (productId) => {
    setSelectedProduct(productId);
    setIsHistoryVisible(true);
    await fetchProductHistory(productId, contract, setProductHistory);
  };

  const closeHistoryBox = () => {
    setIsHistoryVisible(false);
    setProductHistory([]);
    setSelectedProduct(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">Delivered Products</h2>
      {deliveredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No delivered products available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse mx-auto text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Product Name</th>
                <th className="p-2 border">Price (ETH)</th>
                <th className="p-2 border">Stock</th>
                <th className="p-2 border">Final Customer</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveredProducts.map((product) => (
                <tr key={product.id} className="bg-white">
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">{product.price}</td>
                  <td className="p-2 border">{product.stock}</td>
                  <td className="p-2 border">{product.finalCustomer}</td>
                  <td className="p-2 border">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => handleViewHistory(product.id)}
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Display Product History in a box if history is available */}
      {isHistoryVisible && productHistory.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-3/4 max-w-4xl relative flex flex-col"
            style={{ marginLeft: "200px" }} // Adjust the box position if there is a sidebar
          >
            <button
              className="absolute top-2 right-2 bg-red-500 text-white text-xl font-bold w-8 h-8 flex items-center justify-center"
              onClick={closeHistoryBox}
            >
              &times; {/* Close button (X) */}
            </button>

            <h3 className="text-xl font-semibold mb-4 text-center">
              Product History for ID: {selectedProduct}
            </h3>
            <ProductHistoryAccordion history={productHistory} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveredList;