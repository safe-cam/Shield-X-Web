import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AlertPreferences(){
  const navigate = useNavigate()
  return (
    <div className="profile-page">
      <header className="header-row">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-title">Alert Preferences</div>
        <div style={{ width: 40 }} />
      </header>

      <div className="profile-card">
        <h3>Alert Preferences</h3>
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <input type="checkbox" defaultChecked /> Push Notifications
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <input type="checkbox" defaultChecked /> Send SMS when offline
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <input type="checkbox" /> Silent Alerts Only
          </label>
        </div>
      </div>
    </div>
  )
}
