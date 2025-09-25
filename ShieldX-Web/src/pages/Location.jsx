import React, { useState, useEffect, useRef, useCallback } from 'react'
import { IoIosShareAlt } from 'react-icons/io'
import { MdSettings, MdPlace, MdMyLocation, MdDirections, MdOutlineSafetyCheck } from 'react-icons/md'
import { FiAlertTriangle } from 'react-icons/fi'

// NOTE: This file implements a prototype of an advanced Location page.
// Many production features (real AI models, secure APIs, websocket endpoints)
// are simulated or stubbed here. Replace stubs with your server endpoints / models.

const dummyLocations = [
  { id: 'ps1', type: 'police', name: 'Sector 21 Police Station', address: 'Sector 21, Main Road', lat: 28.6168, lng: 77.2090 },
  { id: 'h1', type: 'hospital', name: 'City Hospital', address: 'Block B', lat: 28.6140, lng: 77.2070 },
  { id: 'f1', type: 'fire', name: 'Central Fire Station', address: 'Depot Rd', lat: 28.6185, lng: 77.2130 },
]

const emergencyContacts = [
  { id: 'c1', name: 'Local Police', phone: '100' },
  { id: 'c2', name: 'Ambulance', phone: '102' },
  { id: 'c3', name: 'Fire', phone: '101' },
]

function haversineDistance(a, b) {
  const toRad = v => v * Math.PI / 180
  const R = 6371 // km
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat)
  const x = Math.sin(dLat/2)*(Math.sin(dLat/2)) + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)*(Math.sin(dLon/2))
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x))
  return R * c
}

export default function Location() {
  // COMMON
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [sharingEnabled, setSharingEnabled] = useState(() => { try { return JSON.parse(localStorage.getItem('shareLocation')) || false } catch(e){return false} })

  // Map and location
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)
  const watchIdRef = useRef(null)
  const [userLoc, setUserLoc] = useState({ lat: 28.6139, lng: 77.2090 })
  const [accuracy, setAccuracy] = useState(null)
  const [hasGoogleKey, setHasGoogleKey] = useState(false)
  const [placesService, setPlacesService] = useState(null)

  // Nearby services and recent
  const [nearby, setNearby] = useState([])
  const [savedLocations, setSavedLocations] = useState(() => { try { return JSON.parse(localStorage.getItem('savedLocations')) || [] } catch(e){return []} })

  // AI / realtime stubs
  const [policeUnits, setPoliceUnits] = useState([])
  const [aiSafety, setAiSafety] = useState({ score: 7, color: 'green' })
  const [notifications, setNotifications] = useState([])
  const [toast, setToast] = useState(null)

  const GOOGLE_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_KEY) || ''

  // UTIL
  const showToast = (msg, ms = 3000) => { setToast(msg); setTimeout(()=>setToast(null), ms) }

  // Load Google maps script if key available
  const loadGoogleMaps = useCallback((key) => new Promise((resolve, reject) => {
    if (!key) return reject(new Error('No API key'))
    if (typeof window === 'undefined') return reject(new Error('No window'))
    if (window.google && window.google.maps) return resolve(window.google.maps)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.onload = () => { if (window.google && window.google.maps) resolve(window.google.maps); else reject(new Error('Google maps failed to load')) }
    script.onerror = () => reject(new Error('Google maps script load error'))
    document.head.appendChild(script)
  }), [])

  // Init map when available
  const initMap = useCallback((maps, center) => {
    if (!mapRef.current) return
    mapInstance.current = new maps.Map(mapRef.current, { center, zoom: 14, disableDefaultUI: true })
    markerRef.current = new maps.Marker({ position: center, map: mapInstance.current, title: 'You' })
    setPlacesService(new maps.places.PlacesService(mapInstance.current))
  }, [])

  // Center map helper
  const centerMap = (lat, lng) => {
    const pos = { lat: Number(lat), lng: Number(lng) }
    setUserLoc(pos)
    if (mapInstance.current) {
      mapInstance.current.panTo(pos)
      if (markerRef.current) markerRef.current.setPosition(pos)
      else markerRef.current = new window.google.maps.Marker({ position: pos, map: mapInstance.current })
    }
  }

  // Geocode (basic) via Google Geocode (client) - replace with server proxy in production
  const geocodeAddress = async (q) => {
    if (!GOOGLE_KEY) throw new Error('No key')
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${GOOGLE_KEY}`
    const res = await fetch(url)
    const body = await res.json()
    if (body.status === 'OK' && body.results && body.results.length) return body.results[0]
    throw new Error('Not found')
  }

  // Autocomplete using Google Places AutocompleteService when available
  const getAutocomplete = useCallback((input) => {
    if (!input) { setSuggestions([]); return }
    if (window.google && window.google.maps && window.google.maps.places) {
      const service = new window.google.maps.places.AutocompleteService()
      service.getPlacePredictions({ input, types: ['geocode','establishment'] }, (preds, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && preds) setSuggestions(preds.map(p => ({ id: p.place_id, description: p.description })))
        else setSuggestions([])
      })
    } else {
      // fallback: simple debounced geocode suggestions via Geocoding API (expensive)
      geocodeAddress(input).then(r => setSuggestions([{ id: r.place_id || input, description: r.formatted_address }])).catch(()=>setSuggestions([]))
    }
  }, [])

  // Fetch nearby places: prefer Google Places, otherwise compute from dummy list
  const fetchNearby = useCallback(async (lat, lng) => {
    const center = { lat, lng }
    if (placesService && window.google && window.google.maps) {
      const request = { location: new window.google.maps.LatLng(lat, lng), radius: 3000, type: ['police','hospital','fire_station'] }
      placesService.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const out = results.map(r => ({ id: r.place_id, name: r.name, address: r.vicinity || r.formatted_address, lat: r.geometry.location.lat(), lng: r.geometry.location.lng(), type: r.types && r.types[0] }))
          setNearby(out)
        }
      })
      return
    }
    // fallback: dummy list with distances
    const computed = dummyLocations.map(d => ({ ...d, distanceKm: haversineDistance(center, { lat: d.lat, lng: d.lng }), open24: Math.random() > 0.2 }))
    setNearby(computed)
  }, [placesService])

  // AI safety score stub (replace with ML endpoint). Uses simple heuristics for demo
  const computeSafetyScore = useCallback((pos) => {
    // score 1-10: closer to police -> higher score; night reduces score
    const nearestPolice = dummyLocations.filter(d => d.type === 'police').map(p => haversineDistance(pos, { lat: p.lat, lng: p.lng })).sort((a,b)=>a-b)[0] || 5
    const hour = new Date().getHours()
    let base = Math.max(1, 10 - Math.round(nearestPolice))
    if (hour < 6 || hour > 20) base = Math.max(1, base - 2)
    const color = base >= 8 ? 'green' : base >=5 ? 'yellow' : 'red'
    setAiSafety({ score: base, color })
  }, [])

  // Simulated real-time police units via WebSocket or fallback simulated updates
  useEffect(() => {
    let ws
    const url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_POLICE_WS) || 'ws://localhost:4000/police'
    try {
      ws = new WebSocket(url)
      ws.onopen = () => console.log('WS connected')
      ws.onmessage = (ev) => {
        try { const data = JSON.parse(ev.data); setPoliceUnits(data.units || []) } catch(e){}
      }
      ws.onclose = () => { console.log('WS closed') }
    } catch (e) {
      // fallback: simulate units
      const sim = [
        { id: 'u1', lat: userLoc.lat + 0.002, lng: userLoc.lng + 0.003, status: 'available', etaMin: 2 },
        { id: 'u2', lat: userLoc.lat - 0.004, lng: userLoc.lng - 0.001, status: 'busy', etaMin: 8 }
      ]
      setPoliceUnits(sim)
      const t = setInterval(()=>{
        // jitter positions
        setPoliceUnits(prev => prev.map(p=>({ ...p, lat: p.lat + (Math.random()-0.5)*0.0005, lng: p.lng + (Math.random()-0.5)*0.0005 })))
      }, 3000)
      return ()=>clearInterval(t)
    }
    return ()=>{ try{ ws.close() }catch(e){} }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // watch user location
  useEffect(() => {
    if (!('geolocation' in navigator)) { showToast('Geolocation not supported'); return }
    watchIdRef.current = navigator.geolocation.watchPosition(pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude
      setAccuracy(pos.coords.accuracy)
      setUserLoc({ lat, lng })
      centerMap(lat, lng)
      computeSafetyScore({ lat, lng })
      fetchNearby(lat, lng)
    }, err => { showToast('Location error: ' + (err.message||err.code)) }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 })
    return ()=>{ if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computeSafetyScore, fetchNearby])

  // load maps if key present
  useEffect(()=>{
    if (!GOOGLE_KEY) { setHasGoogleKey(false); return }
    setHasGoogleKey(true)
    loadGoogleMaps(GOOGLE_KEY).then(maps=>initMap(maps, userLoc)).catch(e=>{ console.warn('Maps failed', e); setHasGoogleKey(false) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GOOGLE_KEY])

  // search handlers
  useEffect(()=>{ const t = setTimeout(()=>getAutocomplete(search), 250); return ()=>clearTimeout(t) }, [search, getAutocomplete])

  const onSelectSuggestion = async (s) => {
    setSearch(s.description)
    setSuggestions([])
    try {
      if (window.google && window.google.maps && window.google.maps.places && s.id) {
        const ps = new window.google.maps.places.PlacesService(document.createElement('div'))
        ps.getDetails({ placeId: s.id }, (res, status) => { if (status === window.google.maps.places.PlacesServiceStatus.OK) centerMap(res.geometry.location.lat(), res.geometry.location.lng()) })
      } else {
        const g = await geocodeAddress(s.description)
        const loc = g.geometry.location
        centerMap(loc.lat, loc.lng)
      }
      setRecentSearches(prev => { const next = [s.description, ...prev.filter(x=>x!==s.description)].slice(0,8); localStorage.setItem('recentSearches', JSON.stringify(next)); return next })
    } catch (e) { showToast('Could not locate') }
  }

  useEffect(()=>{ try{ const r = JSON.parse(localStorage.getItem('recentSearches')||'[]'); setRecentSearches(Array.isArray(r)?r:[]) }catch(e){} }, [])

  // toggle sharing
  const toggleSharing = () => { const n = !sharingEnabled; setSharingEnabled(n); localStorage.setItem('shareLocation', JSON.stringify(n)); showToast(n ? 'Location sharing enabled' : 'Location sharing disabled') }

  // Quick actions
  const reportIncident = () => {
    const text = window.prompt('Quick report (what happened?)')
    if (!text) return
    // In production, POST to server /reports
    setNotifications(prev => [{ id: Date.now().toString(), text: 'Incident reported: ' + text, time: Date.now() }, ...prev].slice(0,20))
    showToast('Incident reported — help on the way')
  }

  const safeModeToggle = () => { showToast('Safe mode enabled'); /* implement continuous monitoring hooks here */ }

  // share with emergency contacts (simulated)
  const shareWithContacts = () => {
    if (!sharingEnabled) { showToast('Enable sharing first'); return }
    // in prod, send to server or directly to contacts via SMS/Push
    showToast('Location shared with emergency contacts')
  }

  // ====== Missing helpers (search, location, call, directions) ======
  const doSearch = async (q) => {
    if (!q || !q.trim()) { showToast('Enter a search term'); return }
    try {
      setSearching(true)
      if (hasGoogleKey) {
        // Try client-side geocode (small demo). In production, proxy this server-side.
        const res = await geocodeAddress(q)
        const loc = res.geometry.location
        centerMap(loc.lat, loc.lng)
      } else {
        // fallback simple name/address match
        const low = q.toLowerCase()
        const found = dummyLocations.find(d => (d.name||'').toLowerCase().includes(low) || (d.address||'').toLowerCase().includes(low))
        if (found) centerMap(found.lat, found.lng)
        else showToast('No results')
      }
      // save to recent searches
      setRecentSearches(prev => { const next = [q, ...prev.filter(x=>x!==q)].slice(0,8); localStorage.setItem('recentSearches', JSON.stringify(next)); return next })
    } catch (e) {
      console.warn(e)
      showToast('Search failed')
    } finally {
      setSearching(false)
    }
  }

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) { showToast('Geolocation not available'); return }
    navigator.geolocation.getCurrentPosition(p => {
      const lat = p.coords.latitude, lng = p.coords.longitude
      setAccuracy(p.coords.accuracy)
      centerMap(lat, lng)
      computeSafetyScore({ lat, lng })
      fetchNearby(lat, lng)
    }, err => showToast('Could not get location: ' + (err.message||err.code)), { enableHighAccuracy: true, timeout: 8000 })
  }

  const handleCall = async (phone) => {
    if (!phone) return
    try {
      // mobile first: attempt tel: scheme
      const isMobile = /Mobi|Android/i.test(navigator.userAgent)
      if (isMobile) {
        window.location.href = `tel:${phone}`
        return
      }
      // desktop fallback: copy to clipboard and notify
      await navigator.clipboard.writeText(phone)
      showToast('Phone number copied: ' + phone)
    } catch (e) {
      // last-resort fallback
      prompt('Call number', phone)
    }
  }

  const openDirections = (lat, lng) => {
    if (!lat || !lng) return showToast('Invalid destination')
    const g = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(g, '_blank')
  }

  const removeSaved = (id) => {
    setSavedLocations(prev => {
      const next = prev.filter(x=>x.id!==id)
      try { localStorage.setItem('savedLocations', JSON.stringify(next)) } catch(e){}
      return next
    })
  }


  // UI helpers
  const safetyBadge = () => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 18, background: aiSafety.color === 'green' ? '#1b5e20' : aiSafety.color === 'yellow' ? '#f9a825' : '#d32f2f', color: '#fff' }}>
      <MdOutlineSafetyCheck />
      <div style={{ fontWeight: 700 }}>{aiSafety.score}/10</div>
    </div>
  )

  // minimal responsive layout and accessibility
  return (
    <div className={`location-screen ${false ? 'dark' : ''}`} style={{ padding: 12 }}>
      <header className="header-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div className="header-title">Location</div>
          {safetyBadge()}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button className="header-icon" aria-label="Notifications">🔔</button>
          <button className="header-icon" aria-label="Settings"><MdSettings size={18} color="#222" /></button>
        </div>
      </header>

      <div className="search-bar" style={{ display:'flex', gap:8, marginTop:12 }}>
        <input aria-label="Search places" className="search-input" placeholder="Search places or address..." value={search} onChange={e=>setSearch(e.target.value)} />
        <button className="btn" onClick={()=>{ setSearching(true); doSearch(search).finally(()=>setSearching(false)) }}>{searching? 'Searching...':'Search'}</button>
        <button className="btn outline" onClick={()=>{ useMyLocation(); showToast('Using your location') }}><MdMyLocation /></button>
        <label style={{ display:'flex', alignItems:'center', gap:6, marginLeft:8 }}>
          <input type="checkbox" checked={sharingEnabled} onChange={toggleSharing} /> Share
        </label>
      </div>

      <div className="main-row" style={{ marginTop:12 }}>
        <div className="map-column">
          {/* If Google Maps loaded we attach the map to this div via ref; otherwise show OSM iframe fallback */}
          {hasGoogleKey ? (
            <div ref={mapRef} className="map-box" aria-hidden={false}></div>
          ) : (
            <div className="map-box">
              <iframe
                title="OpenStreetMap fallback"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLoc.lng-0.02}%2C${userLoc.lat-0.02}%2C${userLoc.lng+0.02}%2C${userLoc.lat+0.02}&layer=mapnik&marker=${userLoc.lat}%2C${userLoc.lng}`}
                style={{ border:0, width:'100%', height:'100%' }}
              />
              <div style={{ position:'absolute', left:12, top:12, background:'rgba(255,255,255,0.9)', padding:'4px 8px', borderRadius:8, fontSize:12 }}>Map fallback (OSM)</div>
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            <div>Accuracy: {accuracy ? Math.round(accuracy)+'m' : '—'}</div>
            <div>{userLoc.lat.toFixed(5)}, {userLoc.lng.toFixed(5)}</div>
          </div>
        </div>

  <aside className="side-column">
          <section style={{ marginBottom:12 }}>
            <h4>Quick Actions</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button className="action-btn" style={{ background:'#d32f2f', color:'#fff' }} onClick={()=>handleCall('100')}>Emergency Call</button>
              <button className="action-btn" onClick={shareWithContacts}>Share Location</button>
              <button className="action-btn" onClick={reportIncident}>Report Incident</button>
              <button className="action-btn" onClick={safeModeToggle}>Safe Mode</button>
            </div>
          </section>

          <section style={{ marginBottom:12 }}>
            <h4>Nearby Services</h4>
            {nearby.length===0 && <div style={{ color:'#666' }}>Searching nearby…</div>}
            {nearby.map(n => (
              <div key={n.id} style={{ display:'flex', justifyContent:'space-between', gap:8, padding:'6px 0', borderBottom:'1px solid #eee' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700 }}>{n.name}</div>
                  <div style={{ color:'#666', fontSize:13 }}>{n.address || n.vicinity}</div>
                  <div style={{ color:'#666', fontSize:12 }}>{(n.distanceKm ? n.distanceKm.toFixed(2)+' km' : '')} {n.open24 ? ' • Open 24/7' : ''}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <button className="btn tiny" onClick={()=>centerMap(n.lat, n.lng)}>Center</button>
                  <button className="btn tiny outline" onClick={()=>openDirections(n.lat, n.lng)}>Directions</button>
                </div>
              </div>
            ))}
          </section>

          <section style={{ marginBottom:12 }}>
            <h4>Saved / Recent</h4>
            {savedLocations.map(s => (
              <div key={s.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f3f3f3' }}>
                <div style={{ cursor:'pointer' }} onClick={()=>centerMap(s.lat, s.lng)}>
                  <div style={{ fontWeight:700 }}>{s.label}</div>
                  <div style={{ color:'#666', fontSize:12 }}>{new Date(s.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn tiny" onClick={()=>openDirections(s.lat, s.lng)}>Directions</button>
                  <button className="btn tiny outline" onClick={()=>removeSaved(s.id)}>Remove</button>
                </div>
              </div>
            ))}
            <div style={{ marginTop:8 }}>
              <input className="input" placeholder="Recent searches" value={recentSearches[0]||''} readOnly />
            </div>
          </section>

          <section>
            <h4>Police Units</h4>
            {policeUnits.map(u => (
              <div key={u.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
                <div>
                  <div style={{ fontWeight:700 }}>{u.id}</div>
                  <div style={{ color:'#666', fontSize:12 }}>{u.status} • ETA {u.etaMin} min</div>
                </div>
                <div>
                  <button className="btn tiny" onClick={()=>centerMap(u.lat, u.lng)}>Contact</button>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>

      <div style={{ height:18 }} />
      {toast && <div style={{ position:'fixed', right:16, bottom:20, background:'#111', color:'#fff', padding:'8px 12px', borderRadius:6 }}>{toast}</div>}
    </div>
  )
}
