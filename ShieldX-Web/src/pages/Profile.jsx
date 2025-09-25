import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState({ id: '', username: '', name: '', email: '', contact: '' })
  const [form, setForm] = useState({ name: '', username: '', contact: '', email: '', dobDay: '', dobMonth: '', dobYear: '', gender: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [contacts, setContacts] = useState([])
  const fileRef = useRef(null)

  useEffect(() => {
    // prefer Vite env, then CRA env, fallback to localhost for local dev
    const api = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
      || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
      || 'http://localhost:4000'

    async function load() {
      try {
        const raw = localStorage.getItem('authUser')
        const parsed = raw ? JSON.parse(raw) : null
        const token = parsed && parsed.token
        if (!token) return
        const base = String(api).replace(/\/$/, '')
        const res = await fetch(base + '/api/me', { headers: { Authorization: 'Bearer ' + token } })
        if (!res.ok) {
          console.error('Failed to fetch /api/me')
          return
        }
        const body = await res.json()
        const u = body.user || {}
        setUser({ id: u.id || u._id || '', username: u.username || '', name: u.name || '', email: u.email || '', contact: u.contact || '' })
        setForm({
          name: u.name || '', username: u.username || '', contact: u.contact || '', email: u.email || '',
          dobDay: u.dobDay || '', dobMonth: u.dobMonth || '', dobYear: u.dobYear || '', gender: u.gender || ''
        })
        if (u.avatar) setAvatarPreview(u.avatar)
        // merge any locally staged contacts (when user added while unauthenticated)
        const serverContacts = u.contacts || []
        let merged = serverContacts
        try {
          const localRaw = localStorage.getItem('localContacts')
          const local = localRaw ? JSON.parse(localRaw) : []
          if (Array.isArray(local) && local.length) {
            // add local contacts that don't match by phone
            const phones = new Set(serverContacts.map(x => (x.phone || '').toString()))
            const additions = local.filter(x => !phones.has((x.phone || '').toString()))
            merged = [...serverContacts, ...additions]
          }
        } catch (e) { /* ignore parse errors */ }
        setContacts(merged)
      } catch (e) { console.error('Load profile', e) }
    }

    load()
  }, [])

  const onFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const triggerFile = () => fileRef.current && fileRef.current.click()

  const save = async (contactsOverride) => {
    // Persist to backend
    const api = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
      || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
      || 'http://localhost:4000'
    try {
      const raw = localStorage.getItem('authUser')
      const parsed = raw ? JSON.parse(raw) : null
      const token = parsed && parsed.token
      if (!token) {
        // Persist contacts locally so user doesn't lose them.
        try {
          const toSave = (typeof contactsOverride !== 'undefined' ? contactsOverride : contacts) || []
          localStorage.setItem('localContacts', JSON.stringify(toSave))
          setContacts(toSave)
          alert('Saved locally. Sign in to sync these with your account.')
        } catch (e) {
          console.error('Failed to save contacts locally', e)
          alert('Not authenticated. Could not save.')
        }
        return
      }
      const base = String(api).replace(/\/$/, '')
      const payload = { ...form, contacts: (typeof contactsOverride !== 'undefined' ? contactsOverride : contacts) }
      if (avatarPreview) payload.avatar = avatarPreview
      const res = await fetch(base + '/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(payload)
      })
      const body = await res.json()
  if (!res.ok) { alert(body.message || 'Save failed'); console.error(body); return }
      const u = body.user || {}
      setUser({ id: u.id || u._id || '', username: u.username || '', name: u.name || '', email: u.email || '', contact: u.contact || '' })
      setForm({ name: u.name || '', username: u.username || '', contact: u.contact || '', email: u.email || '', dobDay: u.dobDay || '', dobMonth: u.dobMonth || '', dobYear: u.dobYear || '', gender: u.gender || '' })
      setContacts(u.contacts || [])
      if (u.avatar) setAvatarPreview(u.avatar)
  // successful server save — clear any locally staged contacts
  try { localStorage.removeItem('localContacts') } catch (e) { /* ignore */ }
      // keep token in localStorage but update user fields
      try {
        const raw2 = localStorage.getItem('authUser')
        const parsed2 = raw2 ? JSON.parse(raw2) : {}
        const merged = { ...parsed2, ...u }
        localStorage.setItem('authUser', JSON.stringify(merged))
      } catch (e) { /* ignore */ }
      alert('Profile saved')
    } catch (e) { console.error('Save profile', e); alert('Save failed') }
  }

  const addContact = (c) => {
    const arr = [...contacts, { id: Date.now().toString(), name: c.name, phone: c.phone }]
    setContacts(arr)
    // persist immediately
    save(arr)
  }

  const removeContact = (id) => {
    const arr = contacts.filter(x => x.id !== id)
    setContacts(arr)
    // persist immediately
    save(arr)
  }

  // Quick actions: call / sms with desktop fallback (copy to clipboard)
  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent || '')

  const normalizePhone = (phone) => (phone || '').toString().trim().replace(/[^+\d]/g, '')

  const handleCall = async (phone) => {
    const p = normalizePhone(phone)
    if (!p) { alert('No phone number'); return }
    const href = 'tel:' + p
    if (isMobile) {
      window.location.href = href
      return
    }
    // desktop fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(phone)
      alert('Phone number copied to clipboard. Paste it on your phone to call: ' + phone)
    } catch (e) {
      // final fallback: show prompt so user can copy
      // NOTE: prompt returns the value but user will copy manually
      // eslint-disable-next-line no-alert
      window.prompt('Copy phone number', phone)
    }
  }

  const handleSms = async (phone) => {
    const p = normalizePhone(phone)
    if (!p) { alert('No phone number'); return }
    const href = 'sms:' + p
    if (isMobile) {
      window.location.href = href
      return
    }
    try {
      await navigator.clipboard.writeText(phone)
      alert('Phone number copied to clipboard. Paste it on your phone to send SMS: ' + phone)
    } catch (e) {
      // eslint-disable-next-line no-alert
      window.prompt('Copy phone number', phone)
    }
  }

  return (
    <div className="profile-page">
      <header className="header-row">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-title">Profile</div>
        <div style={{ width: 40 }} />
      </header>

      <div className="profile-hero">
        <div style={{ textAlign: 'center' }}>
          <div style={{ margin: '8px auto' }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" style={{ width: 96, height: 96, borderRadius: 48, objectFit: 'cover', display: 'block', margin: '0 auto' }} />
            ) : (
              <div className="avatar-circle" style={{ width: 96, height: 96, borderRadius: 48, fontSize: 32 }}>{(user.name || user.username || 'U').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}</div>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name || user.username || 'Your Name'}</div>
          <div style={{ color: '#666', marginTop: 6 }}>{user.email || ''}</div>
          <div style={{ marginTop: 10 }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onFile(e.target.files && e.target.files[0])} />
            <button className="change-photo-btn" onClick={triggerFile}>Change Profile Photo</button>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <h3>Personal Information</h3>
        <div style={{ marginTop: 8 }}>
          <label>Full Name</label>
          <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

          <label style={{ marginTop: 8 }}>Contact Number</label>
          <input className="input" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />

          <label style={{ marginTop: 8 }}>Email Address</label>
          <input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label>Date of Birth</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder="DD" value={form.dobDay} onChange={e => setForm(f => ({ ...f, dobDay: e.target.value }))} />
                <input className="input" placeholder="Month" value={form.dobMonth} onChange={e => setForm(f => ({ ...f, dobMonth: e.target.value }))} />
                <input className="input" placeholder="YYYY" value={form.dobYear} onChange={e => setForm(f => ({ ...f, dobYear: e.target.value }))} />
              </div>
            </div>
          </div>

          <label style={{ marginTop: 8 }}>Gender</label>
          <select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <div style={{ marginTop: 14 }}>
            <button className="btn primary" onClick={save} style={{ width: '100%' }}>Save Changes</button>
          </div>
        </div>
      </div>

      <div className="profile-card" style={{ marginTop: 12 }}>
        <h3>Emergency Contacts</h3>
        {contacts.length === 0 && <div className="empty-queued">No emergency contacts yet.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {contacts.map(c => (
            <div key={c.id} className="list-item" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ color: '#666' }}>{c.phone}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn tiny" onClick={() => handleCall(c.phone)} aria-label={`Call ${c.name}`}>Call</button>
                <button className="btn tiny outline" onClick={() => handleSms(c.phone)} aria-label={`SMS ${c.name}`}>SMS</button>
                <button className="btn tiny" onClick={() => removeContact(c.id)}>Remove</button>
              </div>
            </div>
          ))}
          <AddContact onAdd={addContact} />
        </div>
      </div>

      <div className="profile-card" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="list-item" onClick={() => navigate('/profile/alerts')}>Alert Preferences <div>›</div></button>
          <button className="list-item" onClick={() => navigate('/profile/privacy')}>Privacy Settings <div>›</div></button>
          <button className="list-item" onClick={() => navigate('/profile/settings')}>Settings <div>›</div></button>
        </div>
      </div>

      <div style={{ height: 24 }} />
      <div style={{ padding: 12 }}>
        <button className="btn" style={{ width: '100%' }} onClick={() => { localStorage.removeItem('authUser'); navigate('/login') }}>Logout</button>
      </div>

    </div>
  )
}

function AddContact({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  if (!open) return <button className="btn outline" onClick={() => setOpen(true)} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>+ Add New Contact</button>
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <input className="input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input className="input" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn tiny" onClick={() => { onAdd({ name, phone }); setName(''); setPhone(''); setOpen(false) }}>Add</button>
        <button className="btn tiny outline" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  )
}
