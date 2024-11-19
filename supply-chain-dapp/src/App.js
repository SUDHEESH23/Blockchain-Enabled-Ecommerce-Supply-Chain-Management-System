import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./contractConfig";

function App() {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");

    useEffect(() => {
        const initWeb3 = async () => {
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
        };
        initWeb3();
    }, []);

    const addProduct = async () => {
        if (contract) {
            await contract.methods
                .addProduct(productName, Web3.utils.toWei(productPrice, "ether"))
                .send({ from: account });
            alert("Product added!");
            fetchProducts();
        }
    };

    const fetchProducts = async () => {
        if (contract) {
            const productCount = await contract.methods.productCount().call();
            const allProducts = [];
            for (let i = 1; i <= productCount; i++) {
                const product = await contract.methods.products(i).call();
                allProducts.push(product);
            }
            setProducts(allProducts);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [contract]);

    return (
        <div>
            <h1>Supply Chain DApp</h1>
            <p>Connected Account: {account}</p>

            <h2>Add Product</h2>
            <input
                type="text"
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
            />
            <input
                type="number"
                placeholder="Product Price (ETH)"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
            />
            <button onClick={addProduct}>Add Product</button>

            <h2>Products</h2>
            <ul>
                {products.map((product, index) => (
                    <li key={index}>
                        ID: {product.id} | Name: {product.name} | Price:{" "}
                        {Web3.utils.fromWei(product.price, "ether")} ETH | Owner: {product.owner}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
