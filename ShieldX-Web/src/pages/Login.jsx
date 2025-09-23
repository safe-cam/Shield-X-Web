import React, { useState } from 'react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { IoMdHome, IoMdMap } from 'react-icons/io';
import { MdNotifications } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';

export default function Login() {
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const doLogin = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    setError(null)
    if (!id || !password) { setError('Enter username/email and password'); return }
    // prefer Vite env, then CRA env, fallback to localhost for local dev
    const api = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
      || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
      || 'http://localhost:4000'

    setLoading(true)
    try {
      const base = String(api).replace(/\/$/, '')
      const res = await fetch(base + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: id, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Login failed'); setLoading(false); return }
      localStorage.setItem('authUser', JSON.stringify({ token: data.token, ...data.user }))
      navigate('/home', { replace: true })
    } catch (err) {
      setError('API error: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen auth-screen">
      <div className="header" style={{ paddingTop: 30, paddingBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 40, color: 'red' }}><FiShield size={26} color="#E53935" /></div>
        <div style={{ fontSize: 28, fontWeight: '700', color: '#300' }}>ShieldX</div>
        <div style={{ fontSize: 14, color: '#800', marginTop: 4 }}>Instant Police Alerts</div>
      </div>

      <form style={{ padding: 10 }} onSubmit={doLogin}>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <input name="id" className="input" placeholder="Email or Username" value={id} onChange={e => setId(e.target.value)} />
        <input name="password" className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

        <div className="remember-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
            <span style={{ color: '#555' }}>Remember me</span>
          </label>
          <button type="button" className="forgot">Forgot password?</button>
        </div>

        <button className="login-btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>

        <div className="divider-row">
          <div className="divider" />
          <div className="or-text">Or continue with</div>
          <div className="divider" />
        </div>

        <div className="social-row" >
          <button type="button" className="social-btn"><FaGoogle style={{ marginRight: 8 }} /> Google</button>
          <button type="button" className="social-btn"><FaFacebook style={{ marginRight: 8 }} /> Facebook</button>
        </div>



        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button className="link" type="button" onClick={() => navigate('/Signup')}>Don't have an account? <span style={{ color: 'red' }}>Sign Up</span></button>
        </div>
      </form>


    </div>
  )
}
