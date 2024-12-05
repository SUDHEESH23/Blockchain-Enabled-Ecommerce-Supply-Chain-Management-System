// ProductHistory.js

import React, { useState } from "react";

// Utility function to fetch and display product history
export const fetchProductHistory = async (productId, contract, setHistory) => {
  if (!contract) {
    alert("Contract is not initialized.");
    return;
  }

  try {
    const history = await contract.methods.getHistory(productId).call();

    // Check if history is empty
    if (!history || history.length === 0) {
      alert("No history available for this product.");
      return;
    }

    // Format the history into a readable format and set the state
    const formattedHistory = history.map((event, index) => {
      const timestamp = event.split("(Timestamp: ")[1]?.split(")")[0];
      const formattedDate = new Date(Number(timestamp) * 1000).toLocaleString();

      return {
        eventDescription: event.split(" (Timestamp")[0],
        formattedDate,
      };
    });

    // Set the formatted history in the component state
    setHistory(formattedHistory);
  } catch (err) {
    console.error("Error fetching product history:", err);
    alert("Failed to fetch product history. Please try again.");
  }
};
