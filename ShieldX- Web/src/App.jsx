import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chat from './pages/Chat'
import Location from './pages/Location'
import Alerts from './pages/Alerts'
import Evidence from './pages/Evidence'
import BottomTabs from './components/BottomTabs'

export default function App() {
  const isAuth = () => !!localStorage.getItem('authUser')

  const ProtectedRoute = ({ children }) => {
    return isAuth() ? children : <Navigate to="/login" replace />
  }

  return (
    <div className="app-root">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/location" element={<ProtectedRoute><Location /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/evidence" element={<ProtectedRoute><Evidence /></ProtectedRoute>} />
        </Routes>
      </main>
      {isAuth() && <BottomTabs />}
    </div>
  )
}
