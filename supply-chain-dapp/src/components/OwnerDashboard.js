import React, { useEffect, useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import Web3 from "web3";

// Sidebar component with only one entry for "My Products"
const Sidebar = ({ setSection, section }) => {
  return (
    <div className="w-64 bg-teal-800 text-white p-6 space-y-6">
      <h2 className="text-xl font-bold">Owner Dashboard</h2>
      <ul className="space-y-3">
        <li
          className={`cursor-pointer p-3 rounded-md transition-all ${section === "products" ? "bg-teal-600" : "hover:bg-teal-700"}`}
          onClick={() => setSection("products")}
        >
          My Products
        </li>
      </ul>
    </div>
  );
};

const OwnerDashboard = () => {
  const { account, contract, isLoading, error } = useWeb3();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState("products");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [newOwnerInput, setNewOwnerInput] = useState("");
  const [editType, setEditType] = useState(""); // New state to track the type of edit

  // Fetch products from the blockchain contract
  const fetchProducts = async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const productCount = await contract.methods.productCount().call();
      const ownerProducts = [];

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
          location: product.location,
        };

        // Check if the product is owned by the current account
        if (formattedProduct.owner.toLowerCase() === account.toLowerCase()) {
          ownerProducts.push(formattedProduct);
        }
      }

      setProducts(ownerProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle location update for a specific product
  const updateLocation = async (productId, newLocation) => {
    if (!contract || !newLocation) return;

    setLoading(true);
    try {
      const tx = await contract.methods.updateLocation(productId, newLocation).send({ from: account });
      console.log("Location update successful:", tx);
      alert("Product location updated successfully!");

      // Update products list with the new location
      const updatedProducts = products.map((product) =>
        product.id === productId ? { ...product, location: newLocation } : product
      );
      setProducts(updatedProducts);

      // Close the modal and reset input after successful update
      setIsModalOpen(false);
      setLocationInput("");
      setCurrentProduct(null);
    } catch (err) {
      console.error("Error updating location:", err);
      alert("Failed to update location.");
    } finally {
      setLoading(false);
    }
  };

  // Handle status update for a specific product
  const updateStatus = async (productId, newStatus) => {
    if (!contract || !newStatus) return;

    setLoading(true);
    try {
      const tx = await contract.methods.updateStatus(productId, newStatus).send({ from: account });
      console.log("Status update successful:", tx);
      alert("Product status updated successfully!");

      // Update products list with the new status
      const updatedProducts = products.map((product) =>
        product.id === productId ? { ...product, status: newStatus } : product
      );
      setProducts(updatedProducts);

      // Close the modal and reset input after successful update
      setIsModalOpen(false);
      setStatusInput("");
      setCurrentProduct(null);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  // Handle ownership transfer for a specific product
  const transferOwnership = async (productId, newOwnerAddress) => {
    if (!newOwnerInput || !currentProduct?.id) {
      return alert("Please enter a valid new owner address and select a product.");
    }
  
    try {
      await contract.methods.transferProduct(currentProduct.id, newOwnerInput).send({ from: account });
      fetchProducts(); // Refresh the product list
      alert("Product ownership transferred successfully!");
      setIsModalOpen(false); // Close the modal after successful transfer
      setNewOwnerInput(""); // Clear the input field
    } catch (error) {
      console.error("Error transferring ownership:", error);
      alert("Error transferring ownership!");
    }
  };
  

  // UseEffect to fetch products on account or contract change
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
        <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>
        <p className="mb-4">Connected Account: {account}</p>

        {loading && <p>Loading...</p>}

        {/* Display the products under the owner's ownership */}
        {section === "products" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.length === 0 ? (
              <p>No products under your ownership</p>
            ) : (
              products.map((product, index) => (
                <div key={`${product.id}-${index}`} className="p-4 bg-white shadow rounded">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p>Price: {Math.floor(product.price * 1e18)} ETH</p>
                  <p>Stock: {product.stock !== "0" ? product.stock : "Out of stock"}</p>
                  <p>Status: {product.status}</p>
                  <p>Location: {product.location}</p>

                  {/* Edit Location Button */}
                  <button
                    onClick={() => {
                      setCurrentProduct(product);
                      setLocationInput(product.location); // Pre-populate the input field with the current location
                      setEditType("location"); // Set the edit type to location
                      setIsModalOpen(true);
                    }}
                    className="mt-2 mr-2 p-2 bg-teal-600 text-white rounded"
                  >
                    Edit Location
                  </button>

                  {/* Edit Status Button */}
                  <button
                    onClick={() => {
                      setCurrentProduct(product);
                      setStatusInput(product.status); // Pre-populate the input field with the current status
                      setEditType("status"); // Set the edit type to status
                      setIsModalOpen(true);
                    }}
                    className="mt-2 mr-2 p-2 bg-teal-600 text-white rounded"
                  >
                    Edit Status
                  </button>

                  {/* Transfer Ownership Button */}
                  <button
                    onClick={() => {
                      setCurrentProduct(product);
                      setNewOwnerInput(""); // Reset new owner input
                      setEditType("ownership"); // Set the edit type to ownership
                      setIsModalOpen(true);
                    }}
                    className="mt-2 p-2 bg-teal-600 text-white rounded"
                  >
                    Transfer Ownership
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <p>Select a section to view</p>
          </div>
        )}
      </div>

      {/* Modal for editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">
              {editType === "location" && "Edit Product Location"}
              {editType === "status" && "Edit Product Status"}
              {editType === "ownership" && "Transfer Ownership"}
            </h3>

            {editType === "location" && (
              <div>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="p-2 border rounded mb-4 w-full"
                  placeholder="New location"
                />
                <button
                  onClick={() => updateLocation(currentProduct.id, locationInput)}
                  className="w-full p-2 bg-teal-600 text-white rounded"
                >
                  Update Location
                </button>
              </div>
            )}

            {editType === "status" && (
              <div>
                <input
                  type="text"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="p-2 border rounded mb-4 w-full"
                  placeholder="New status"
                />
                <button
                  onClick={() => updateStatus(currentProduct.id, statusInput)}
                  className="w-full p-2 bg-teal-600 text-white rounded"
                >
                  Update Status
                </button>
              </div>
            )}

            {editType === "ownership" && (
              <div>
                <input
                  type="text"
                  value={newOwnerInput}
                  onChange={(e) => setNewOwnerInput(e.target.value)}
                  className="p-2 border rounded mb-4 w-full"
                  placeholder="New owner address"
                />
                <button
                  onClick={() => transferOwnership(currentProduct.id, newOwnerInput)}
                  className="w-full p-2 bg-teal-600 text-white rounded"
                >
                  Transfer Ownership
                </button>
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full p-2 bg-gray-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
