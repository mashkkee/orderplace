import React, { useState } from 'react'
import './index.css'
import image from './assets/plan.png'
import Chef from './components/Chef'
import Authentication from './components/Authentication'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext'
function App() {
  function isAuthenticated() {
    let token = localStorage.getItem('token')
    if (token) {
      return true
    }
  }


  return (
    <AuthProvider>
      <Routes>

        <Route path="/login" element={<Authentication />} />
        
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
        <Route path="/*" element={<Navigate to="/login" />} />

      </Routes>
    </AuthProvider>
  )
}

export default App
