import React, { useState } from 'react'
import './index.css'
import image from './assets/plan.png'
import Chef from './components/Chef'
import Authentication from './components/Authentication'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext'
// import Menu from './components/Menu'
function App() {
  function isAuthenticated() {
    let token = localStorage.getItem('token')
    if (token) {
      fetch('http://localhost:5000/api/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        return res.json()
      }).then(data => {
        if (data.status != 'sucsess') { return false }
      })
      return true
    }
  }


  return (
    <AuthProvider>
      <Routes>

        <Route
          path="/login"
          element={
            isAuthenticated() ? (
              <Navigate to="/chef" />
            ) : (
              <Authentication />
            )
          }
        />
        {/* <Route path="/menu/:restaurantName/:tableNum" element={<Menu />} /> */}
        <Route
          path="/chef"
          element={
            isAuthenticated() ? (
              <Chef />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />

      </Routes>
    </AuthProvider>
  )
}

export default App
