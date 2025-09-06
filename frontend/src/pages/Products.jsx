import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [forecast, setForecast] = useState(null);

  async function load() {
    const r = await api.get('/products');
    setProducts(r.data);
  }

  useEffect(() => { load(); }, []);

  async function stockIn(id) {
    const qty = parseInt(prompt('Enter qty in:'), 10);
    if (qty) {
      await api.post(`/products/${id}/stock-in`, { qty });
      await load();
    }
  }

  async function stockOut(id) {
    const qty = parseInt(prompt('Enter qty out:'), 10);
    if (qty) {
      await api.post(`/products/${id}/stock-out`, { qty });
      await load();
    }
  }

  async function getForecast(id) {
    const res = await api.get(`/products/${id}/forecast?horizon=7`);
    setForecast(res.data);
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th>Name</th><th>Category</th><th>Stock</th><th>Reorder</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td className={p.stock <= p.reorder_point ? 'text-red-600' : ''}>{p.stock}</td>
              <td>{p.reorder_point}</td>
              <td>
                <button onClick={()=>stockIn(p._id)} className="bg-green-500 text-white px-2 py-1 mr-2 rounded">IN</button>
                <button onClick={()=>stockOut(p._id)} className="bg-yellow-500 text-white px-2 py-1 mr-2 rounded">OUT</button>
                <button onClick={()=>getForecast(p._id)} className="bg-blue-500 text-white px-2 py-1 rounded">Forecast</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {forecast && (
        <div className="mt-6 p-4 bg-gray-50 border rounded">
          <h3 className="font-semibold mb-2">Forecast for {forecast.product_id}</h3>
          <ul>
            {forecast.forecast.map(f => (
              <li key={f.date}>{f.date} → {f.demand_pred.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
