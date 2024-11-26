import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";

const UpdateStatus = () => {
    const { account, contract } = useWeb3();
    const [productId, setProductId] = useState("");
    const [newStatus, setNewStatus] = useState("");

    const updateStatus = async () => {
        try {
            await contract.methods
                .updateStatus(productId, newStatus)
                .send({ from: account });
            alert("Status updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        }
    };

    return (
        <div>
            <h2>Update Status</h2>
            <input
                type="number"
                placeholder="Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
            />
            <input
                type="text"
                placeholder="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
            />
            <button onClick={updateStatus}>Update Status</button>
        </div>
    );
};

export default UpdateStatus;
