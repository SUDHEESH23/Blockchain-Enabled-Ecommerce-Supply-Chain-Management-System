export const handleMarkAsDelivered = async (productId, account, contract, fetchProducts) => {
    if (!contract) return;
  
    try {
      // First, estimate gas to ensure the transaction can succeed
      const gasEstimate = await contract.methods.markDelivered(productId).estimateGas({ from: account });
  
      // Send the transaction with the estimated gas
      await contract.methods.markDelivered(productId).send({ 
        from: account, 
        gas: gasEstimate 
      });
  
      alert("Product marked as delivered!");
      await fetchProducts(); // Re-fetch products after marking as delivered
    } catch (err) {
      console.error("Error marking as delivered:", err);
  
      // Detailed error message
      if (err.message.includes("gas")) {
        alert("Gas estimation failed. Check if the product is already delivered or if there are other contract conditions.");
      } else {
        alert("Failed to mark as delivered.");
      }
    }
  };
  