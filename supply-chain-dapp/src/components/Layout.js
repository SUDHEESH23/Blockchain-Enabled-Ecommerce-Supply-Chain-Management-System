// src/components/Layout.js
import React from 'react';

const Layout = ({ children }) => {
    return (
        <div>
            {/* Navbar is already included here */}
            {children}
        </div>
    );
};

export default Layout;
