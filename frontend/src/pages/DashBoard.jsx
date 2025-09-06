import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    api.get('/alerts/low-stock').then(r => setLowStock(r.data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <h2 className="font-semibold">Low Stock Items</h2>
      <ul className="list-disc ml-5">
        {lowStock.map(p => (
          <li key={p._id} className="text-red-600">
            {p.name} — Stock: {p.stock}, Reorder point: {p.reorder_point}
          </li>
        ))}
      </ul>
    </div>
  );
}
