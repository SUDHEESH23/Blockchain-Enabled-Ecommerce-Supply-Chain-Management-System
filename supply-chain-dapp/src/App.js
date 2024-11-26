// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import Navbar from './components/Navbar';
import AddProduct from './components/AddProduct';
import ProductList from './components/ProductList';
import UpdateLocation from './components/UpdateLocation';
import UpdateStatus from './components/UpdateStatus';
import TransferOwnership from './components/TransferOwnership';
import MarkDelivered from './components/MarkDelivered';
import ProductHistory from './components/ProductHistory';
import Layout from './components/Layout';

function App() {
    return (
        <Router>
            <Web3Provider>
                <Layout>
                    <Navbar /> {/* Place Navbar at the top */}
                    <Routes>
                        {/* Define routes for each component */}
                        <Route path="/add-product" element={<AddProduct />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/update-location" element={<UpdateLocation />} />
                        <Route path="/update-status" element={<UpdateStatus />} />
                        <Route path="/transfer-ownership" element={<TransferOwnership />} />
                        <Route path="/mark-delivered" element={<MarkDelivered />} />
                        <Route path="/product-history" element={<ProductHistory />} />
                    </Routes>
                </Layout>
            </Web3Provider>
        </Router>
    );
}

export default App;
