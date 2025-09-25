import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function PrivacySettings(){
  const navigate = useNavigate()
  return (
    <div className="profile-page">
      <header className="header-row">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-title">Privacy Settings</div>
        <div style={{ width: 40 }} />
      </header>

      <div className="profile-card">
        <h3>Privacy</h3>
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <input type="checkbox" defaultChecked /> Share location with authorities
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <input type="checkbox" /> Allow data for research (anonymized)
          </label>
        </div>
      </div>
    </div>
  )
}
