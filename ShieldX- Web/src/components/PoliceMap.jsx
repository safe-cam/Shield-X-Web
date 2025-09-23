import React, { useEffect, useState } from 'react'

// A lightweight mock map that shows fake police units around a center coordinate.
// Props:
// - center: optional string "lat, lon" or {lat, lon}
// - onDispatch(unit): called when user dispatches a unit
// - onClose(): called when panel should be closed
export default function PoliceMap({ center, onDispatch = () => {}, onClose = () => {} }) {
  const demoCenter = { lat: 28.704060, lon: 77.102493 } // demo coords
  const [centerCoords, setCenterCoords] = useState(demoCenter)
  const [units, setUnits] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    // parse center prop if provided
    if (center) {
      if (typeof center === 'string' && center.includes(',')) {
        const [la, lo] = center.split(',').map(s => parseFloat(s.trim()))
        if (!Number.isNaN(la) && !Number.isNaN(lo)) {
          setCenterCoords({ lat: la, lon: lo })
        }
      } else if (center.lat && center.lon) {
        setCenterCoords(center)
      }
    }
  }, [center])

  useEffect(() => {
    // try browser geolocation if user hasn't provided a center
    if (!center) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const { latitude, longitude } = pos.coords
            setCenterCoords({ lat: latitude, lon: longitude })
          },
          () => {
            // ignore, keep demo center
          },
          { timeout: 8000 }
        )
      }
    }
  }, [center])

  useEffect(() => {
    // generate 5 mock units around center
    const base = centerCoords
    const spread = [
      { dLat: 0.0012, dLon: 0.0008 },
      { dLat: -0.0009, dLon: 0.0010 },
      { dLat: 0.0006, dLon: -0.0011 },
      { dLat: -0.0015, dLon: -0.0006 },
      { dLat: 0.0018, dLon: -0.0003 }
    ]
    const generated = spread.map((s, i) => {
      const lat = base.lat + s.dLat
      const lon = base.lon + s.dLon
      return {
        id: `U-${i + 1}`,
        name: `Unit ${i + 1}`,
        lat,
        lon,
        eta: `${2 + i} min`,
        distanceKm: Math.abs(s.dLat * 111).toFixed(2) // rough km
      }
    })
    setUnits(generated)
  }, [centerCoords])

  // helper to map lat/lon to percentages inside the map box
  const toPercent = (lat, lon) => {
    // compute simple relative position using +/-0.002 range
    const latDiff = lat - centerCoords.lat
    const lonDiff = lon - centerCoords.lon
    const latPct = 50 - (latDiff / 0.002) * 50
    const lonPct = 50 + (lonDiff / 0.002) * 50
    return { top: `${Math.max(6, Math.min(94, latPct))}%`, left: `${Math.max(6, Math.min(94, lonPct))}%` }
  }

  return (
    <div className="map-panel">
      <div className="map-panel-header">
        <div style={{ fontWeight: 700 }}>Nearby Police Units</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn small" onClick={() => { setSelected(null); onClose() }}>Close</button>
        </div>
      </div>

      <div className="map-panel-body">
        <div className="map-area" role="img" aria-label="Mock map showing nearby police units">
          {units.map(u => {
            const pos = toPercent(u.lat, u.lon)
            const isSel = selected && selected.id === u.id
            return (
              <button
                key={u.id}
                className={`marker ${isSel ? 'selected' : ''}`}
                style={{ top: pos.top, left: pos.left }}
                onClick={() => setSelected(u)}
                title={`${u.name} — ${u.distanceKm} km — ETA ${u.eta}`}
                aria-label={`${u.name}, distance ${u.distanceKm} kilometers`}
              >
                <div className="marker-dot" />
              </button>
            )
          })}

          {/* center indicator */}
          <div className="center-dot" style={{ top: '50%', left: '50%' }} title="Your location" />
        </div>

        <div className="unit-list">
          <div className="unit-list-title">Units</div>
          {units.map(u => (
            <div key={u.id} className={`unit-item ${selected && selected.id === u.id ? 'active' : ''}`} onClick={() => setSelected(u)} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')setSelected(u)}}>
              <div>
                <div style={{ fontWeight: 700 }}>{u.name}</div>
                <div style={{ color: '#666', fontSize: 13 }}>{u.distanceKm} km • ETA {u.eta}</div>
              </div>
              <div>
                <button className="btn tiny" onClick={(ev) => { ev.stopPropagation(); onDispatch(u); window.alert(`Dispatch requested to ${u.name} (simulation)`); }}>
                  Dispatch
                </button>
              </div>
            </div>
          ))}

          {selected && (
            <div className="selected-details">
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{selected.name}</div>
              <div style={{ color: '#666', marginBottom: 8 }}>{selected.distanceKm} km away • ETA {selected.eta}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => { onDispatch(selected); window.alert('Dispatch requested (simulation)') }}>Dispatch</button>
                <button className="btn outline" onClick={() => setSelected(null)}>Deselect</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
