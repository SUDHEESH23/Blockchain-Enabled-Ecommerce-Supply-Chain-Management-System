import React, { useState } from "react";

const OwnershipTransferModal = ({ isOpen, onClose, productId, onTransfer }) => {
  const [newOwner, setNewOwner] = useState("");

  const handleTransferOwnership = async () => {
    if (!newOwner || !productId) {
      return alert("Please enter a valid new owner address and select a product.");
    }

    try {
      await onTransfer(productId, newOwner);
      alert("Product ownership transferred successfully!");
      onClose(); // Close modal after successful transfer
    } catch (error) {
      console.error("Error transferring ownership:", error);
      alert("Error transferring ownership!");
    }
  };

  if (!isOpen) return null; // Don't render if the modal is not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md">
        <h3 className="text-xl font-semibold mb-4">Transfer Ownership</h3>
        <input
          type="text"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          className="p-2 border border-gray-300 rounded-md mb-4 w-full"
          placeholder="New Owner Address"
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-md w-full"
          onClick={handleTransferOwnership}
        >
          Transfer Ownership
        </button>
        <button
          className="bg-gray-500 text-white p-2 rounded-md w-full mt-4"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OwnershipTransferModal;
