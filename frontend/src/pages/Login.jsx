import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');

  async function submit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/');
    } catch {
      alert('Login failed');
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl mb-4 font-bold">Sign in</h2>
        <input className="border p-2 mb-3 w-full"
          placeholder="Email"
          value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="border p-2 mb-3 w-full"
          placeholder="Password"
          value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white p-2 w-full rounded">Login</button>
      </form>
    </div>
  );
}
