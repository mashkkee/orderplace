import React, { useState, useEffect } from 'react';
import './index.css';
import image from './assets/plan.png';
import Chef from './components/Chef';
import Authentication from './components/Authentication';
import Menu from './components/Menu';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      let token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/verify', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await response.json();

          if (data.status === 'success') {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          setIsAuthenticated(false);
        } finally {
          setAuthChecked(true);
        }
      } else {
        setAuthChecked(true);
      }
    };

    checkAuthentication();
  }, []);

  return (
    <AuthProvider>
      {authChecked && (
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/chef" />
              ) : (
                <Authentication />
              )
            }
          />
          <Route
            path="/chef"
            element={
              isAuthenticated ? (
                <Chef />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/menu/:restaurant/:table" element={<Menu />} />
          <Route path="/" element={<Navigate to="/menu" />} />
        </Routes>
      )}
    </AuthProvider>
  );
}

export default App;
