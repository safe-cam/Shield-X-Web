import React, { useState } from 'react'
import { IoIosShareAlt } from 'react-icons/io'
import { MdSettings, MdPlace } from 'react-icons/md'

const dummyLocations = [
  { id: '1', name: 'Police Station', address: 'Sector 21, Main Road' },
  { id: '2', name: 'Hospital', address: 'City Hospital, Block B' },
  { id: '3', name: 'Your Last Location', address: 'Park Avenue, Sector 17' },
]
const emergencyContacts = [
  { id: '1', name: 'Police', phone: '100' },
  { id: '2', name: 'Ambulance', phone: '102' },
  { id: '3', name: 'Fire', phone: '101' },
]

export default function Location() {
  const [search, setSearch] = useState('')
  const [officerStatus, setOfficerStatus] = useState('No active alert')

  const triggerAlert = () => {
    setOfficerStatus('Officer dispatched (ETA: 2 min)')
    window.alert('Police Alert Sent\nAn officer is being dispatched to your location.')
    setTimeout(() => setOfficerStatus('Officer en route (ETA: 1 min)'), 2000)
    setTimeout(() => setOfficerStatus('Officer arrived'), 6000)
  }

  const shareLocation = () => {
    window.open('https://maps.google.com', '_blank')
  }

  const callEmergency = (phone) => window.alert(`Call ${phone}`)

  return (
    <div className="location-screen">
      <header className="header-row">
        <div className="header-title">Location</div>
        <button className="header-icon"><MdSettings size={18} color="#222" /></button>
      </header>

      <div className="search-bar">
        <input className="search-input" placeholder="Search places or address..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="map-view"> 
        <div style={{ textAlign: 'center' }}>
          <MdPlace size={64} color="#E53935" />
          <div style={{ color: '#888', fontSize: 16, marginTop: 8 }}>Map placeholder for web. Use mobile app for live map features.</div>
        </div>
      </div>

      <div className={`status-bar ${officerStatus !== 'No active alert' ? 'alert' : ''}`}>
        <div style={{ marginRight: 8 }}>🛡️</div>
        <div className="status-text">{officerStatus}</div>
      </div>

      <div className="action-row">
        <button className="action-btn" onClick={shareLocation}>Share Location</button>
        <button className="action-btn" onClick={() => window.open('https://www.google.com/maps', '_blank')}>Directions</button>
        <button className="action-btn alt" onClick={triggerAlert}>Police Alert</button>
      </div>

      <div className="emergency-section">
        <div className="list-title">Emergency Contacts</div>
        <div className="emergency-row">
          {emergencyContacts.map(c => (
            <button key={c.id} className="emergency-btn" onClick={() => callEmergency(c.phone)}>
              <div style={{ fontSize: 20, color: '#E53935' }}><IoIosShareAlt /></div>
              <div className="emergency-btn-text">{c.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="list-section">
        <div className="list-title">Nearby & Recent Locations</div>
        {dummyLocations.map(item => (
          <div key={item.id} className="list-item">
            <div style={{ marginRight: 12, fontSize: 20, color: '#E53935' }}><MdPlace /></div>
            <div>
              <div className="list-item-name">{item.name}</div>
              <div className="list-item-address">{item.address}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
