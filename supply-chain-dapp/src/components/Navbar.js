import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white">
      <ul className="flex justify-around">
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/owner">Owner</Link></li>
        <li><Link to="/user">User</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;