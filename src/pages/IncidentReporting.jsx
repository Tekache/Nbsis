'use client';

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { incidentAPI } from '../services/api'
import '../styles/incidents.css'

function IncidentReporting() {
  const [incidents, setIncidents] = useState([])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    location: '',
  })

  async function fetchIncidents() {
    try {
      const response = await incidentAPI.getAll()
      if (response.success) {
        setIncidents(response.data)
      }
    } catch (err) {
      console.error('Error fetching incidents:', err)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchIncidents()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await incidentAPI.create(formData)
      fetchIncidents()
      setShowForm(false)
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        location: '',
      })
    } catch (err) {
      console.error('Error creating incident:', err)
    }
  }

  const handleViewDetail = async (id) => {
    try {
      const response = await incidentAPI.getDetail(id)
      if (response.success) {
        setSelectedIncident(response.data)
      }
    } catch (err) {
      console.error('Error fetching incident detail:', err)
    }
  }

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

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="main-content">
        <Header 
          title="Incident Reporting" 
          subtitle="Report and track security incidents"
        />

        <div className="page-content">
          <div className="content-header">
            <h2>Incident Records</h2>
            <Button 
              variant="primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Report Incident'}
            </Button>
          </div>

          {showForm && (
            <Card className="form-card">
              <h3>Report New Incident</h3>
              <form onSubmit={handleSubmit} className="incident-form">
                <div className="form-group">
                  <label>Incident Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Brief description of incident"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed description..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Severity</label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Location of incident"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary">
                  Submit Report
                </Button>
              </form>
            </Card>
          )}

          {selectedIncident && (
            <Card className="detail-card">
              <div className="detail-header">
                <h3>{selectedIncident.title}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedIncident(null)}
                >
                  ✕
                </button>
              </div>
              <div className="detail-content">
                <div className="detail-row">
                  <strong>Status:</strong>
                  <span className={`status-badge status-${selectedIncident.status}`}>
                    {selectedIncident.status}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Severity:</strong>
                  <span className={`severity-badge ${getSeverityColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Location:</strong>
                  <span>{selectedIncident.location}</span>
                </div>
                <div className="detail-row">
                  <strong>Date:</strong>
                  <span>{selectedIncident.date}</span>
                </div>
                <div className="detail-row">
                  <strong>Description:</strong>
                  <span>{selectedIncident.description}</span>
                </div>
                <div className="detail-row">
                  <strong>Response:</strong>
                  <span>{selectedIncident.response}</span>
                </div>
                <div className="detail-row">
                  <strong>Assigned To:</strong>
                  <span>{selectedIncident.assignedTo}</span>
                </div>
              </div>
            </Card>
          )}

          <div className="incidents-list">
            {incidents.map(incident => (
              <Card key={incident.id} className="incident-item">
                <div className="incident-header">
                  <h3>{incident.title}</h3>
                  <div className="incident-badges">
                    <span className={`severity-badge ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className={`status-badge status-${incident.status}`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
                <div className="incident-details">
                  <div><strong>Location:</strong> {incident.location}</div>
                  <div><strong>Date:</strong> {incident.date}</div>
                </div>
                <Button 
                  variant="secondary"
                  onClick={() => handleViewDetail(incident.id)}
                >
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentReporting
