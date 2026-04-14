'use client';

import { useContext, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import '../styles/sidebar.css'

function Sidebar() {
  const { logout, authState } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const displayName = useMemo(() => {
    return (
      authState.user?.full_name ||
      authState.user?.name ||
      authState.user?.email ||
      'User'
    )
  }, [authState.user])

  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'U'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'DB' },
    { path: '/personnel', label: 'Personnel', icon: 'PR' },
    { path: '/access-control', label: 'Access Control', icon: 'AC' },
    { path: '/surveillance', label: 'Surveillance', icon: 'SV' },
    { path: '/incidents', label: 'Incidents', icon: 'IN' },
    { path: '/alerts', label: 'Alerts', icon: 'AL' },
    { path: '/settings', label: 'Settings', icon: 'ST' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Network Based Shell Security</h1>
        <button
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle sidebar"
        >
          Menu
        </button>
      </div>

      {isOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        />
      )}

      <nav className={`sidebar-nav ${isOpen ? 'open' : ''}`}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              navigate(item.path)
              setIsOpen(false)
            }}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{avatarInitial}</div>
          <div className="user-details">
            <div className="user-name">{displayName}</div>
            <div className="user-role">{authState.user?.role || 'user'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
