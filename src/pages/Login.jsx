import React, { useState } from 'react'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { IoMdHome, IoMdMap } from 'react-icons/io'
import { MdNotifications } from 'react-icons/md'
import { FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [remember, setRemember] = useState(false)
  const navigate = useNavigate()

  const doLogin = (e) => {
    e?.preventDefault()
    // Basic auth simulation: store a flag
    localStorage.setItem('authUser', JSON.stringify({ loggedIn: true }))
    navigate('/home', { replace: true })
  }

  return (
    <div className="login-screen auth-screen">
      <div className="header" style={{ paddingTop: 30, paddingBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 40, color: 'red' }}>⚠️</div>
        <div style={{ fontSize: 28, fontWeight: '700', color: '#300' }}>ShieldX</div>
        <div style={{ fontSize: 14, color: '#800', marginTop: 4 }}>Instant Police Alerts</div>
      </div>

      <div style={{ padding: 10 }}>
  <input className="input" placeholder="Email or Username" />
  <input className="input" placeholder="Password" type="password" />

        <div className="remember-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
            <span style={{ color: '#555' }}>Remember me</span>
          </label>
          <button className="forgot">Forgot password?</button>
        </div>

  <button className="login-btn" onClick={doLogin}>Log In</button>

        <div className="divider-row">
          <div className="divider" />
          <div className="or-text">Or continue with</div>
          <div className="divider" />
        </div>

        <div className="social-row">
          <button className="social-btn"><FaGoogle style={{ marginRight: 8 }} /> Google</button>
          <button className="social-btn"><FaFacebook style={{ marginRight: 8 }} /> Facebook</button>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div className="bottom-nav">
        <div>
          <IoMdHome color="red" size={20} />
          <div className="nav-text-active">Home</div>
        </div>
        <div>
          <IoMdMap color="#777" size={20} />
          <div className="nav-text">Map</div>
        </div>
        <div>
          <MdNotifications color="#777" size={20} />
          <div className="nav-text">Alert</div>
        </div>
        <div>
          <FaUser color="#777" size={20} />
          <div className="nav-text">Profile</div>
        </div>
      </div>
    </div>
  )
}
