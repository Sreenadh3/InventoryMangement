import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Alerts() {
  const [lowStock, setLowStock] = useState([]);
  const [overdue, setOverdue] = useState([]);

  useEffect(() => {
    api.get('/alerts/low-stock').then(r=>setLowStock(r.data));
    api.get('/alerts/overdue-orders').then(r=>setOverdue(r.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Alerts</h2>

      <h3 className="font-semibold">Low Stock</h3>
      <ul className="list-disc ml-5">
        {lowStock.map(p=><li key={p._id}>{p.name} (stock {p.stock})</li>)}
      </ul>

      <h3 className="font-semibold mt-4">Overdue Orders</h3>
      <ul className="list-disc ml-5">
        {overdue.map(o=><li key={o._id}>Order {o._id} for product {o.product_id} overdue</li>)}
      </ul>
    </div>
  );
}
