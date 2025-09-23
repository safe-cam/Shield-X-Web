import React, { useState } from 'react'
import { IoMdWifi } from 'react-icons/io'
import { MdPeople, MdCloudOff, MdSettings, MdVideocam, MdVolumeOff, MdSend, MdLocationOn } from 'react-icons/md'
import { IoIosAlert } from 'react-icons/io'
import { FiShield } from 'react-icons/fi'
import { FaUsers, FaMapMarkerAlt } from 'react-icons/fa'
import PoliceMap from '../components/PoliceMap'

export default function Alerts() {
  const [status, setStatus] = useState('online') // online | offline | mesh
  const [queuedAlerts, setQueuedAlerts] = useState([
    // sample queued alert for demo
    // { id: '1', time: '2025-09-18 14:22', type: 'Panic', details: 'User pressed panic button at Park Avenue.' }
  ])

  // helper to add a demo queued alert
  const pushDemoAlert = () => {
    const id = Date.now().toString()
    const now = new Date().toLocaleString()
    setQueuedAlerts(prev => [{ id, time: now, type: 'Panic', details: 'Demo: Panic pressed at Park Avenue.' }, ...prev])
  }

  const [lastSharedLocation, setLastSharedLocation] = useState(null)

  // Share current location (web) and queue a Location Share alert
  const shareLocation = () => {
    if (!navigator.geolocation) {
      window.alert('Geolocation is not supported in this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        const id = Date.now().toString()
        const now = new Date().toLocaleString()
        setQueuedAlerts(prev => [{ id, time: now, type: 'Location Share', details: `Shared location: ${coords}` }, ...prev])
        setLastSharedLocation(coords)
        window.alert('Location shared: ' + coords)
      },
      (err) => {
        window.alert('Unable to get location: ' + (err?.message || 'error'))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const toggleStatus = () => {
    if (status === 'online') setStatus('offline')
    else if (status === 'offline') setStatus('mesh')
    else setStatus('online')
  }

  const sendQueued = () => {
    setQueuedAlerts([])
    setStatus('online')
    window.alert('Alerts Sent\nAll queued alerts have been sent to authorities.')
  }

  const [showPolice, setShowPolice] = useState(false)

  const handleDispatch = (unit) => {
    const id = Date.now().toString()
    const now = new Date().toLocaleString()
    setQueuedAlerts(prev => [{ id, time: now, type: 'Dispatch', details: `Dispatch requested to ${unit.name} (ETA ${unit.eta})` }, ...prev])
  }

  return (
    <div className="alerts-screen">
      <header className="header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="header-title">Alert System</div>
          <div className={`status-pill ${status}`}>{status === 'online' ? 'Online' : status === 'mesh' ? 'Mesh' : 'Offline'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="icon-btn" title="Toggle status" onClick={toggleStatus}><MdSettings size={18} /></button>
        </div>
      </header>

      <div className={`status-card ${status}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="status-icon">
            {status === 'online' ? <IoMdWifi size={22} color="#3ecf4a" /> : status === 'mesh' ? <MdPeople size={22} color="#1976d2" /> : <MdCloudOff size={22} color="#E53935" />}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: 16, color: '#222' }}>{status === 'online' ? 'Online' : status === 'mesh' ? 'Mesh Fallback' : 'Offline'}</div>
            <div style={{ color: '#444', marginTop: 6 }}>
              {status === 'online' && 'All alerts are sent instantly to authorities.'}
              {status === 'offline' && 'No internet. Alerts will be queued and sent via SMS or mesh when possible.'}
              {status === 'mesh' && 'Mesh fallback active. Alerts are relayed via nearby users/devices.'}
            </div>
          </div>
        </div>
        <div className="alert-controls">
          <button className="btn" onClick={pushDemoAlert}><MdSend style={{ marginRight: 8 }} />Push Demo Alert</button>
          <button className="btn outline" onClick={() => window.alert('Test alert sent (simulation)')}>Send Test Alert</button>
        </div>
      </div>
      {showPolice && (
        <PoliceMap
          center={lastSharedLocation}
          onDispatch={(unit) => { handleDispatch(unit) }}
          onClose={() => setShowPolice(false)}
        />
      )}

      <div className="queued-section">
        <div className="queued-header">
          <div className="queued-title">Queued Alerts</div>
          <div className="queued-actions">
            <button className="btn small" onClick={() => setQueuedAlerts([])}>Clear</button>
            <button className="btn small primary" onClick={sendQueued} disabled={queuedAlerts.length === 0}><MdSend /></button>
          </div>
        </div>
        {queuedAlerts.length === 0 ? (
          <div className="empty-queued">No alerts queued.</div>
        ) : (
          <div className="queued-list">
            {queuedAlerts.map(a => (
              <div key={a.id} className="queued-alert-box">
                <div className="queued-left"><IoIosAlert size={18} color="#E53935" /></div>
                <div className="queued-body">
                  <div className="queued-type">{a.type} Alert</div>
                  <div className="queued-details">{a.details}</div>
                  <div className="queued-time">{a.time}</div>
                </div>
                <div className="queued-actions">
                  <button className="btn tiny" onClick={() => window.alert('Retry send (simulation)')}>Retry</button>
                  <button className="btn tiny outline" onClick={() => setQueuedAlerts(prev => prev.filter(x => x.id !== a.id))}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="features-section">
        <div className="features-title">Features</div>
        <div className="features-grid">
          <div className="feature-box" role="button" tabIndex={0} onClick={shareLocation} onKeyDown={(e)=>{if(e.key==='Enter')shareLocation()}}>
            <MdLocationOn size={28} color="#E53935" />
            <div className="feature-label">Share Location</div>
            {lastSharedLocation && <div className="feature-subtext">Last: {lastSharedLocation}</div>}
          </div>

          <div className="feature-box" role="button" tabIndex={0} onClick={() => setShowPolice(true)} onKeyDown={(e)=>{if(e.key==='Enter')setShowPolice(true)}}>
            <FiShield size={26} color="#E53935" />
            <div className="feature-label">Nearby Police<br/>Units</div>
            <div className="feature-subtext">Tap to view nearby units</div>
          </div>

          <div className="feature-box">
            <MdVideocam size={28} color="#E53935" />
            <div className="feature-label">Video/Audio<br/>Recording</div>
          </div>

          <div className="feature-box">
            <MdVolumeOff size={28} color="#E53935" />
            <div className="feature-label">Silent Alert</div>
          </div>

          <div className="feature-box">
            <MdPeople size={28} color="#E53935" />
            <div className="feature-label">Mesh<br/>Communication</div>
          </div>
        </div>
      </div>

      <div className="research-section">
        <div className="research-title">Research & About</div>
        <div className="research-text">This app uses advanced mesh networking and SMS fallback to ensure alerts reach authorities even without internet. Mesh communication relays alerts via nearby users/devices, while SMS queue ensures delivery when back online. Your privacy is protected—no personal data is shared without consent.</div>
        <div className="research-text">For more info, visit our website or read the research on mesh networks and emergency response.</div>
      </div>
    </div>
  )
}
