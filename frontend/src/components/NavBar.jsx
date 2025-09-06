import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav className="bg-gray-800 text-white p-3 flex justify-between">
      <div className="space-x-4">
        <Link to="/">Dashboard</Link>
        <Link to="/products">Products</Link>
        <Link to="/alerts">Alerts</Link>
      </div>
      <div>
        {user && <span className="mr-4">{user.name} ({user.role})</span>}
        <button onClick={logout} className="bg-red-600 px-2 py-1 rounded">Logout</button>
      </div>
    </nav>
  );
}
