import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const doSignup = (e) => {
    e?.preventDefault()
    localStorage.setItem('authUser', JSON.stringify({ loggedIn: true, name: fullName || 'User' }))
    navigate('/home', { replace: true })
  }

  return (
    <div className="signup-screen auth-screen">
      <button className="back-btn" onClick={() => window.history.back()}>←</button>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '12px 0' }}>Sign Up</h2>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ display: 'inline-block', background: '#ffe5e5', borderRadius: 50, padding: 20 }}>
          ℹ️
        </div>
      </div>

      <div style={{ padding: 10 }}>
        <input className="input" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

        <button className="signup-btn" onClick={doSignup}>Sign Up</button>

        <div className="dividerContainer">
          <div className="line" />
          <div className="orText">Or sign up with</div>
          <div className="line" />
        </div>

        <div className="socialContainer">
          <button className="socialBtn">Google</button>
          <button className="socialBtn">Facebook</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button className="link" onClick={() => navigate('/login')}>Already have an account? <span style={{ color: 'red' }}>Sign In</span></button>
        </div>
      </div>
    </div>
  )
}
