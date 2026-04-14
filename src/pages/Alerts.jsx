'use client';

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { alertsAPI } from '../services/api'
import '../styles/alerts.css'

function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filterUnread, setFilterUnread] = useState(false)

  async function fetchAlerts() {
    try {
      const response = await alertsAPI.getAll()
      if (response.success) {
        setAlerts(response.data)
      }
    } catch (err) {
      console.error('Error fetching alerts:', err)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAlerts()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await alertsAPI.markAsRead(id)
      fetchAlerts()
    } catch (err) {
      console.error('Error marking alert as read:', err)
    }
  }

  const filteredAlerts = filterUnread 
    ? alerts.filter(a => !a.read)
    : alerts

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'severity-high'
      case 'medium':
        return 'severity-medium'
      case 'low':
        return 'severity-low'
      default:
        return ''
    }
  }

  const unreadCount = alerts.filter(a => !a.read).length

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="main-content">
        <Header 
          title="Alerts" 
          subtitle="System alerts and notifications"
        />

        <div className="page-content">
          <div className="alerts-header">
            <div className="alerts-info">
              <h2>Active Alerts</h2>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount} unread</span>
              )}
            </div>
            <div className="alerts-controls">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filterUnread}
                  onChange={(e) => setFilterUnread(e.target.checked)}
                />
                <span>Show unread only</span>
              </label>
            </div>
          </div>

          <div className="alerts-list">
            {filteredAlerts.length === 0 ? (
              <Card className="empty-state">
                <p>No alerts to display</p>
              </Card>
            ) : (
              filteredAlerts.map(alert => (
                <Card 
                  key={alert.id} 
                  className={`alert-item ${!alert.read ? 'unread' : 'read'}`}
                >
                  <div className="alert-header">
                    <div className="alert-main">
                      <div className="alert-message">{alert.message}</div>
                      <div className="alert-timestamp">{alert.timestamp}</div>
                    </div>
                    <div className="alert-badge">
                      <span className={`severity-badge ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                  {!alert.read && (
                    <Button 
                      variant="secondary"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Alerts
