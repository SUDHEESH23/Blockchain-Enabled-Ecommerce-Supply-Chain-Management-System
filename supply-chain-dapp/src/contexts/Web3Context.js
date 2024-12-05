import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../contractConfig"; // Replace with your contract ABI and address

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [roles, setRoles] = useState({ isAdmin: false, isOwner: false });
    const [contract, setContract] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const initWeb3 = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            if (window.ethereum) {
                // Create Web3 instance and connect to MetaMask
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                // Request account access
                await window.ethereum.request({ method: "eth_requestAccounts" });
                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);

                // Initialize contract
                const supplyChainContract = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                setContract(supplyChainContract);

                // Fetch roles for the account
                fetchRoles(accounts[0], supplyChainContract);

                // Listen to account changes
                window.ethereum.on("accountsChanged", (newAccounts) => {
                    setAccount(newAccounts[0]);
                    if (supplyChainContract) {
                        fetchRoles(newAccounts[0], supplyChainContract);
                    }
                });

                // Handle network changes
                window.ethereum.on("chainChanged", () => {
                    window.location.reload();
                });
            } else {
                setError("Please install MetaMask to interact with the blockchain.");
            }
        } catch (err) {
            setError(`Web3 Initialization Failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchRoles = async (account, supplyChainContract) => {
        if (!supplyChainContract || !web3) return;

        try {
            // Fetch roles using contract methods
            const isAdmin = await supplyChainContract.methods
    .hasRole(web3.utils.keccak256("ADMIN_ROLE"), account)
    .call();


            const isOwner = await supplyChainContract.methods
                .hasRole(web3.utils.keccak256("OWNER_ROLE"), account)
                .call();

            setRoles({ isAdmin, isOwner });
        } catch (err) {
            setError(`Failed to fetch roles: ${err.message}`);
        }
    };

    useEffect(() => {
        initWeb3();

        // Cleanup listeners on unmount
        return () => {
            window.ethereum?.removeAllListeners("accountsChanged");
            window.ethereum?.removeAllListeners("chainChanged");
        };
    }, [initWeb3]);

    const handleAssignRole = async (userAddress, role) => {
        if (!contract || !roles.isAdmin) {
            setError("You do not have permission to assign roles.");
            return;
        }

        try {
            // Grant role only if admin
            const roleBytes32 = web3.utils.keccak256(role);
            await contract.methods.grantRole(roleBytes32, userAddress).send({ from: account });
            console.log(`Role ${role} assigned to ${userAddress}`);
        } catch (error) {
            console.error("Error assigning role:", error);
            setError(`Error assigning role: ${error.message}`);
        }
    };

    return (
        <Web3Context.Provider value={{ web3, account, roles, contract, error, isLoading, handleAssignRole }}>
            {children}
        </Web3Context.Provider>
    );
};
