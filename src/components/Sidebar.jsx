'use client';

import { useContext, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import '../styles/sidebar.css'

function Sidebar() {
  const { logout, authState } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/personnel', label: 'Personnel', icon: '👥' },
    { path: '/access-control', label: 'Access Control', icon: '🔐' },
    { path: '/surveillance', label: 'Surveillance', icon: '📹' },
    { path: '/incidents', label: 'Incidents', icon: '⚠️' },
    { path: '/alerts', label: 'Alerts', icon: '🔔' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Network Based Shell Security</h1>
        <button 
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      </div>

      <nav className={`sidebar-nav ${isOpen ? 'open' : ''}`}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{authState.user?.name?.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <div className="user-name">{authState.user?.name}</div>
            <div className="user-role">{authState.user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
