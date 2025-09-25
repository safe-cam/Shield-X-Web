import React, { useState, useRef, useEffect } from 'react'
import { FiShield } from 'react-icons/fi'
import { MdSettings } from 'react-icons/md'
import { IoIosAlert } from 'react-icons/io'
import { MdChat, MdNotificationsActive } from 'react-icons/md'
import { IoMdLocate } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [status, setStatus] = useState('Safe')
  const [panicActive, setPanicActive] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const navigate = useNavigate()

  const handlePanic = () => {
    setPanicActive(true)
    setStatus('Alert Sent! Officer Notified')
    timerRef.current = setTimeout(() => setStatus('Officer En Route (ETA: 2 min)'), 2000)
    timerRef.current = setTimeout(() => { setStatus('Help Arrived'); setPanicActive(false) }, 6000)
  }

  // load user from localStorage to show avatar
  const [user, setUser] = useState(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('authUser')
      if (raw) {
        const parsed = JSON.parse(raw)
        setUser(parsed)
      }
    } catch (e) { /* ignore */ }
  }, [])

  const initials = (user?.name || user?.username || 'U').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
  const avatar = user?.avatar || null

  return (
    <div className="safe-area">
      <header className="header-row">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/assets/icon.png" alt="icon" style={{ width: 32, height: 32, marginRight: 8 }} onError={(e)=>{e.target.onerror=null; e.target.style.display='none'}} />
          <FiShield size={28} color="#E53935" style={{ marginRight: 8 }} />
          <div className="header-title">AI Police Alert</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="header-icon" onClick={() => navigate('/profile')} title="Settings"><MdSettings size={18} color="#222" /></button>
          <button className="avatar-circle" onClick={() => navigate('/profile')} title="Profile" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatar ? <img src={avatar} alt="me" style={{ width: 36, height: 36, borderRadius: 18, objectFit: 'cover' }} /> : initials}
          </button>
        </div>
      </header>

      <div className={`status-bar ${panicActive ? 'panic' : ''}`}>
        <div style={{ marginRight: 8 }}>{panicActive ? <IoIosAlert size={18} color="#E53935" /> : <IoIosAlert size={18} color="#3ecf4a" />}</div>
        <div className={`status-text ${panicActive ? 'panic' : ''}`}>{status}</div>
      </div>

      <div className="sos-container">
        <button className={`sos-button ${panicActive ? 'active' : ''}`} onClick={handlePanic} disabled={panicActive}>
          <IoIosAlert size={56} color={panicActive ? '#E53935' : '#fff'} />
          <div className={`sos-text ${panicActive ? 'active' : ''}`}>PANIC</div>
        </button>
        <div className="sos-subtext">{panicActive ? 'Alert in progress...' : 'Tap to send instant police alert.'}</div>
      </div>

      <div className="quick-actions-section">
        <div className="quick-actions-title">Quick Actions</div>
        <div className="quick-actions-grid">
          <div className="quick-action-box" role="button" tabIndex={0} onClick={() => navigate('/chat')} onKeyDown={(e)=>{if(e.key==='Enter')navigate('/chat')}} aria-label="Open AI Chat Assistant">
            <MdChat size={28} color="#E53935" />
            <div className="quick-action-label">AI Chat Assistant</div>
          </div>
          <div className="quick-action-box" role="button" tabIndex={0} onClick={() => navigate('/location')} onKeyDown={(e)=>{if(e.key==='Enter')navigate('/location')}} aria-label="Open Live GPS Map">
            <IoMdLocate size={28} color="#E53935" />
            <div className="quick-action-label">Live GPS Map</div>
          </div>
        </div>
        <div className="quick-actions-grid">
          <div className="quick-action-box" role="button" tabIndex={0} onClick={() => navigate('/alerts')} onKeyDown={(e)=>{if(e.key==='Enter')navigate('/alerts')}} aria-label="View Recent Alerts">
            <MdNotificationsActive size={28} color="#E53935" />
            <div className="quick-action-label">Recent Alerts</div>
          </div>
          <div className="quick-action-box" role="button" tabIndex={0} onClick={() => navigate('/alerts')} onKeyDown={(e)=>{if(e.key==='Enter')navigate('/alerts')}} aria-label="Safety and Research">
            <FiShield size={26} color="#E53935" />
            <div className="quick-action-label">Safety & Research</div>
          </div>
        </div>
      </div>
    </div>
  )
}
