import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chat from './pages/Chat'
import Location from './pages/Location'
import Alerts from './pages/Alerts'
import Evidence from './pages/Evidence'
import Profile from './pages/Profile'
import BottomTabs from './components/BottomTabs'
import AlertPreferences from './pages/AlertPreferences'
import PrivacySettings from './pages/PrivacySettings'
import Settings from './pages/Settings'

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
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/alerts" element={<ProtectedRoute><AlertPreferences /></ProtectedRoute>} />
          <Route path="/profile/privacy" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
          <Route path="/profile/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>
      {isAuth() && <BottomTabs />}
    </div>
  )
}
