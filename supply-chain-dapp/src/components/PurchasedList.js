import React, { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import Web3 from "web3";
import OwnershipTransferModal from "./OwnershipTransferModal"; // Import the modal component

const PurchasedList = () => {
  const { contract, account } = useWeb3();
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [transferProductId, setTransferProductId] = useState(null);

  // Fetch purchased products
  const fetchPurchasedProducts = useCallback(async () => {
    if (!contract) return;
  
    try {
      const productCount = await contract.methods.productCount().call();
      const purchasedList = [];
  
      for (let i = 1; i <= productCount; i++) {
        const product = await contract.methods.getProductBasicDetails(i).call();
        const deliveryDetails = await contract.methods.getProductDeliveryDetails(i).call();
        if (!deliveryDetails.isDelivered && deliveryDetails.finalCustomer !== "0x0000000000000000000000000000000000000000") {
        const formattedProduct = {
          id: product.id.toString(),
          name: product.name,
          price: Web3.utils.fromWei(product.price.toString(), "ether"),
          stock: product.stock.toString(),
          status: product.status,
          owner: product.owner,
          isDelivered: deliveryDetails.isDelivered,
          location: product.location,
          finalCustomer: deliveryDetails.finalCustomer, // Add finalCustomer
        };
  
        // Include only products with status "Purchased"

          purchasedList.push(formattedProduct);
      }
    }
      setPurchasedProducts(purchasedList);
    } catch (err) {
      console.error("Error fetching purchased products:", err);
    }
  }, [contract]);
  

  // Initial fetch and re-fetch on dependency change
  useEffect(() => {
    if (contract && account) {
      fetchPurchasedProducts();
    }
  }, [contract, account, fetchPurchasedProducts]);

  // Handle ownership transfer
  const handleOwnershipTransfer = async (productId, newOwner) => {
    if (!productId || !newOwner) {
      alert("Invalid product ID or new owner address.");
      return;
    }

    try {
      await contract.methods.transferProduct(productId, newOwner).send({ from: account });
      alert("Ownership transferred successfully!");
      fetchPurchasedProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error transferring ownership:", error);
      alert("Error transferring ownership!");
    }
  };

  // Close modal and reset transferProductId
  const handleCloseModal = () => {
    setTransferProductId(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">Purchased Products</h2>
      {purchasedProducts.length === 0 ? (
        <p className="text-center text-gray-500">No purchased products available.</p>
      ) : (
      <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse mx-auto text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Product Name</th>
                <th className="p-2 border">Price (ETH)</th>
                <th className="p-2 border">Location</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Owner</th>
                <th className="p-2 border">Delivery Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchasedProducts.map((product) => (
                <tr key={product.id} className="bg-white">
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">{Math.floor(product.price * 1e18)}</td>
                  <td className="p-2 border">{product.location}</td>
                  <td className="p-2 border">{product.status}</td>
                  <td className="p-2 border">
                    <div className="mb-2">
                      <span className="font-semibold text-blue-500">Owner:{product.owner}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-green-500">Customer:{product.finalCustomer}</span>
                    </div>
                  </td>
                  <td className="p-2 border">{product.isDelivered ? "Delivered" : "Pending"}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => setTransferProductId(product.id)}
                      className="bg-blue-500 text-white p-2 rounded-md"
                    >
                      Transfer Ownership
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {transferProductId !== null && (
        <OwnershipTransferModal
          isOpen={transferProductId !== null}
          onClose={handleCloseModal}
          productId={transferProductId}
          onTransfer={handleOwnershipTransfer}
        />
      )}
    </div>
  );
};

export default PurchasedList;
