import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Settings(){
  const navigate = useNavigate()
  return (
    <div className="profile-page">
      <header className="header-row">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-title">Settings</div>
        <div style={{ width: 40 }} />
      </header>

      <div className="profile-card">
        <h3>Settings</h3>
        <div style={{ marginTop: 8 }}>
          <div className="list-item">Language <div>English</div></div>
          <div className="list-item" style={{ marginTop: 8 }}>About <div>v1.0</div></div>
        </div>
      </div>
    </div>
  )
}
