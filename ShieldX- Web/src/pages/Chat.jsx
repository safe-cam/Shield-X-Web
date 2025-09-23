import React, { useState, useRef, useEffect } from 'react'
import { FiUser } from 'react-icons/fi'
import { IoIosAlert, IoMdSend } from 'react-icons/io'

export default function Chat({}) {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'ai', text: "Hello, I'm your AI assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [])

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { id: Date.now().toString(), sender: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setTimeout(scrollToBottom, 100)

    // AI response logic mirroring the RN version
    let aiText = ''
    const text = userMsg.text.toLowerCase()
    if (/panic|sos|urgent|immediate|danger|attack|assault|robbery|theft|violence|shooting|gun|weapon/.test(text)) {
      aiText = 'Emergency detected. Are you in immediate danger? Please confirm your safety and share your location.'
    } else if (/crime|report|help|emergency|police|officer|911/.test(text)) {
      aiText = 'Please provide details about the incident, including your location, type of crime, and any injuries.'
    } else if (/location|where|address|gps|map/.test(text)) {
      aiText = 'Can you share your current location or describe where the incident occurred? You can also use the Live GPS Map feature.'
    } else if (/injur|hurt|medical|ambulance|doctor/.test(text)) {
      aiText = 'If anyone is injured, please describe the injuries and if medical help is needed. Emergency services can be dispatched.'
    } else if (/officer|response|eta|arrive|coming/.test(text)) {
      aiText = 'An officer is being dispatched. You will receive live updates on their location and estimated arrival time.'
    } else if (/thank|thanks|grateful|appreciate/.test(text)) {
      aiText = 'You are welcome. Stay safe! If you need further help, just type your question.'
    } else if (/cancel|mistake|false alarm/.test(text)) {
      aiText = 'If this was a false alarm, please confirm so we can update the response team.'
    } else {
      aiText = "I'm here to assist you with emergencies, police alerts, and safety information. Please describe your situation or question."
    }

    // Simulate delay like RN
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: aiText }])
      setLoading(false)
      setTimeout(scrollToBottom, 100)
    }, 1200)
  }

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <button className="back-btn" onClick={() => window.history.back()} aria-label="back">←</button>
        <div className="chat-title">AI Assistant</div>
        <div style={{ width: 40 }} />
      </header>

      <div className="avatar-row">
        <div className="avatar-circle">
          <img src="/assets/icon.png" alt="avatar" style={{ width: 56, height: 56, borderRadius: 28 }} onError={(e)=>{e.target.onerror=null; e.target.style.display='none'}} />
          <FiUser size={36} />
          <div className="avatar-status" />
        </div>
      </div>

      <div className="chat-area">
        {messages.map(item => (
          <div key={item.id} className={`bubble-row ${item.sender === 'user' ? 'user' : 'ai'}`}>
            {item.sender === 'ai' && <div className="bubble-avatar"><FiUser size={20} /></div>}
            <div className={item.sender === 'ai' ? 'bubble-left' : 'bubble-right'}>
              {item.sender === 'ai' && <div className="bubble-sender">AI Assistant</div>}
              <div className={item.sender === 'ai' ? 'bubble-text' : 'bubble-text-user'}>{item.text}</div>
            </div>
            {item.sender === 'user' && <div className="bubble-avatar-user"><FiUser size={20} /></div>}
          </div>
        ))}
        {loading && (
          <div className="typing-indicator">
            <div className="spinner" />
            <div className="typing-text">AI is typing...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="input-bar">
        <input
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
          disabled={loading}
        />
        <button className="input-mic" disabled>
          🎤
        </button>
        <button className="input-send" onClick={sendMessage} disabled={loading || !input.trim()}>
          <IoMdSend color="#fff" size={20} />
        </button>
      </div>
    </div>
  )
}
