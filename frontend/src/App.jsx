import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './auth/AuthProvider';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Alerts from './pages/Alerts';

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/*" element={
          <PrivateRoute>
            <div>
              <NavBar/>
              <Routes>
                <Route path="/" element={<Dashboard/>} />
                <Route path="/products" element={<Products/>} />
                <Route path="/alerts" element={<Alerts/>} />
              </Routes>
            </div>
          </PrivateRoute>
        }/>
      </Routes>
    </BrowserRouter>
  );
}
