import React, { useState, useRef } from 'react'
import { FaCamera, FaVideo } from 'react-icons/fa'

export default function Evidence() {
  const [media, setMedia] = useState([]) // { url, type }
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const pickMedia = (type) => {
    if (fileRef.current) fileRef.current.click()
  }

  const onFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    const t = f.type.startsWith('image') ? 'photo' : 'video'
    setMedia(prev => [...prev, { url, type: t }])
  }

  const uploadEvidence = () => {
    if (media.length === 0) return
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setMedia([])
      window.alert('Evidence Uploaded\nYour evidence has been securely sent to authorities.')
    }, 1800)
  }

  return (
    <div className="evidence-screen">
      <header className="header-row">
        <button className="back-btn" onClick={() => window.history.back()}>←</button>
        <div className="header-title">Upload Evidence</div>
        <div style={{ width: 40 }} />
      </header>

      <div className="actions-row">
        <input ref={fileRef} type="file" style={{ display: 'none' }} accept="image/*,video/*" onChange={onFileChange} />
        <button className="action-btn" onClick={() => pickMedia('photo')}><FaCamera style={{ marginRight: 8 }} /> Take / Pick</button>
        <button className="action-btn" onClick={() => pickMedia('video')}><FaVideo style={{ marginRight: 8 }} /> Record / Pick</button>
      </div>

      <div className="media-preview">
        {media.length === 0 ? (
          <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>No evidence selected.</div>
        ) : (
          media.map((m, idx) => (
            <div className="media-box" key={idx}>
              {m.type === 'photo' ? (
                <img src={m.url} alt="media" className="media-img" />
              ) : (
                <FaVideo size={48} color="#1976d2" style={{ marginTop: 12 }} />
              )}
              <div className="media-type">{m.type === 'photo' ? 'Photo' : 'Video'}</div>
            </div>
          ))
        )}
      </div>

      <button className="upload-btn" onClick={uploadEvidence} disabled={media.length === 0 || uploading}>
        {uploading ? 'Uploading...' : 'Upload Evidence'}
      </button>
    </div>
  )
}
