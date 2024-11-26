import React, { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../contractConfig";

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);

    useEffect(() => {
        const initWeb3 = async () => {
            try {
                if (window.ethereum) {
                    const web3 = new Web3(window.ethereum);
                    await window.ethereum.request({ method: "eth_requestAccounts" });
                    const accounts = await web3.eth.getAccounts();
                    setAccount(accounts[0]);
    
                    const supplyChainContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                    setContract(supplyChainContract);
                } else {
                    alert("Please install MetaMask to interact with the blockchain.");
                }
            } catch (error) {
                console.error("Failed to initialize Web3:", error);
                alert("Failed to connect to Web3. Check your MetaMask and blockchain setup.");
            }
        };
        initWeb3();
    }, []);
    

    return (
        <Web3Context.Provider value={{ account: account || "", contract }}>
            {children}
        </Web3Context.Provider>
    );
    
};
