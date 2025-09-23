import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

    const doSignup = async (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Please enter email and password'); return }
    // prefer Vite env, then CRA env, fallback to localhost for local dev
    const api = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
      || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
      || 'http://localhost:4000'

    setLoading(true)
    try {
      const base = String(api).replace(/\/$/, '')
      const res = await fetch(base + '/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password, name: fullName })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Signup failed'); setLoading(false); return }

      const loginRes = await fetch(base + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      })
      const loginData = await loginRes.json()
      if (!loginRes.ok) { setError(loginData.message || 'Auto-login failed'); setLoading(false); navigate('/login'); return }

  localStorage.setItem('authUser', JSON.stringify({ token: loginData.token, username: email, name: fullName || (email && email.split && email.split('@')[0]) }))
      navigate('/home', { replace: true })
    } catch (err) {
      setError('API error: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
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

      <form style={{ padding: 10 }} onSubmit={doSignup}>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <input name="fullName" autoComplete="name" className="input" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
        <input name="email" type="email" autoComplete="email" className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input name="password" type="password" autoComplete="new-password" className="input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

  <button className="signup-btn" type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>

        <div className="dividerContainer">
          <div className="line" />
          <div className="orText">Or sign up with</div>
          <div className="line" />
        </div>

        <div className="socialContainer">
          <button type="button" className="socialBtn">Google</button>
          <button type="button" className="socialBtn">Facebook</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button className="link" type="button" onClick={() => navigate('/login')}>Already have an account? <span style={{ color: 'red' }}>Sign In</span></button>
        </div>
      </form>
    </div>
  )
}
