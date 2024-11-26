import React, { useEffect, useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { formatPrice } from "../utils/format";

const ProductList = () => {
    const { contract } = useWeb3();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const productCount = await contract.methods.productCount().call();
            const allProducts = [];
            for (let i = 1; i <= productCount; i++) {
                const product = await contract.methods.products(i).call();
                allProducts.push(product);
            }
            setProducts(allProducts);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contract) {
            fetchProducts();
        }
    }, [contract]);

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white p-4 text-center">
                <h1 className="text-3xl font-bold">Supply Chain Product List</h1>
            </header>
            <main className="p-6">
                <section className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Product List</h2>
                    <input
                        type="number"
                        placeholder="Enter Product ID"
                        className="p-2 border border-gray-300 rounded-md"
                    />
                    {loading ? (
                        <p className="mt-4 text-gray-500">Loading products...</p>
                    ) : (
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product, index) => (
                                <div
                                    key={index}
                                    className="bg-white shadow-lg rounded-lg p-4 border border-gray-200"
                                >
                                    <h3 className="text-xl font-semibold">{product.name}</h3>
                                    <p className="text-gray-500">ID: {product.id}</p>
                                    <p className="text-gray-500">Price: {formatPrice(product.price)} ETH</p>
                                    <p className="text-gray-500">Location: {product.location}</p>
                                    <p className="text-gray-500">Status: {product.status}</p>
                                    <p className="text-gray-500">Owner: {product.owner}</p>
                                    <p className="text-gray-500">
                                        Delivered: {product.isDelivered ? "Yes" : "No"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <footer className="bg-gray-800 text-white p-4 text-center">
                <p>&copy; 2024 Supply Chain System</p>
            </footer>
        </div>
    );
};

export default ProductList;
