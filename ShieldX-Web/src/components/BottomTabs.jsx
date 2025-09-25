import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IoMdHome, IoMdLocate } from 'react-icons/io'
import { MdChat, MdNotifications } from 'react-icons/md'

export default function BottomTabs(){
  const loc = useLocation()
  const active = (p) => loc.pathname === p
  const navigate = useNavigate()
  return (
    <nav className="bottom-tabs">
      <Link to="/home" className={`tab ${active('/home')||active('/')? 'active':''}`}><IoMdHome size={20}/> <div className="tab-label">Home</div></Link>
      <Link to="/chat" className={`tab ${active('/chat')? 'active':''}`}><MdChat size={20}/> <div className="tab-label">Chat</div></Link>
      <Link to="/location" className={`tab ${active('/location')? 'active':''}`}><IoMdLocate size={20}/> <div className="tab-label">Location</div></Link>
      <Link to="/alerts" className={`tab ${active('/alerts')? 'active':''}`}><MdNotifications size={20}/> <div className="tab-label">Alerts</div></Link>
      {/* Logout moved to Profile page */}
    </nav>
  )
}
