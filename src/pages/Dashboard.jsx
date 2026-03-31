'use client';

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import { alertsAPI, personnelAPI, incidentAPI } from '../services/api'
import '../styles/dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    activePersonnel: 0,
    alertsUnread: 0,
    incidentsOpen: 0,
    systemStatus: 'online',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alerts, personnel, incidents] = await Promise.all([
          alertsAPI.getAll(),
          personnelAPI.getAll(),
          incidentAPI.getAll(),
        ])

        setStats({
          activePersonnel: personnel.data.filter(p => p.status === 'active').length,
          alertsUnread: alerts.data.filter(a => !a.read).length,
          incidentsOpen: incidents.data.filter(i => i.status !== 'resolved').length,
          systemStatus: 'online',
        })
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const StatCard = ({ icon, label, value, bgColor }) => (
    <Card className={`stat-card ${bgColor}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </Card>
  )

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="main-content">
        <Header 
          title="Dashboard" 
          subtitle="System Overview & Key Metrics"
        />

        <div className="dashboard-grid">
          <div className="stats-grid">
            <StatCard 
              icon="👥" 
              label="Active Personnel" 
              value={stats.activePersonnel}
              bgColor="stat-personnel"
            />
            <StatCard 
              icon="🔔" 
              label="Unread Alerts" 
              value={stats.alertsUnread}
              bgColor="stat-alerts"
            />
            <StatCard 
              icon="⚠️" 
              label="Open Incidents" 
              value={stats.incidentsOpen}
              bgColor="stat-incidents"
            />
            <StatCard 
              icon="🟢" 
              label="System Status" 
              value={stats.systemStatus}
              bgColor="stat-system"
            />
          </div>

          <div className="dashboard-sections">
            <Card>
              <h2>System Overview</h2>
              <div className="overview-list">
                <div className="overview-item">
                  <span className="overview-label">Surveillance Cameras:</span>
                  <span className="overview-value">12 Online</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Access Points:</span>
                  <span className="overview-value">8 Active</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Last System Check:</span>
                  <span className="overview-value">5 minutes ago</span>
                </div>
              </div>
            </Card>

            <Card>
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <button className="action-btn">View Live Surveillance</button>
                <button className="action-btn">Report Incident</button>
                <button className="action-btn">Manage Access</button>
                <button className="action-btn">Check Alerts</button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
