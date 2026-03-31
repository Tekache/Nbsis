'use client';

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { surveillanceAPI } from '../services/api'
import '../styles/surveillance.css'

function SurveillanceMonitoring() {
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCameras()
  }, [])

  const fetchCameras = async () => {
    try {
      const response = await surveillanceAPI.getCameras()
      if (response.success) {
        setCameras(response.data)
      }
    } catch (err) {
      console.error('Error fetching cameras:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewFootage = async (camera) => {
    try {
      const response = await surveillanceAPI.getFootage(camera.id)
      setSelectedCamera({ ...camera, ...response.data })
    } catch (err) {
      console.error('Error fetching footage:', err)
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="main-content">
        <Header 
          title="Surveillance Monitoring" 
          subtitle="Real-time surveillance feed and camera management"
        />

        <div className="page-content">
          {selectedCamera && (
            <Card className="footage-viewer">
              <div className="footage-header">
                <h3>{selectedCamera.name}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedCamera(null)}
                >
                  ✕
                </button>
              </div>
              <div className="footage-placeholder">
                <div className="placeholder-content">
                  📹 Live Feed Placeholder
                </div>
                <div className="footage-info">
                  <div><strong>Location:</strong> {selectedCamera.location}</div>
                  <div><strong>Status:</strong> {selectedCamera.status}</div>
                  <div><strong>Duration:</strong> {selectedCamera.duration}</div>
                  <div><strong>Recording:</strong> {selectedCamera.recording ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </Card>
          )}

          <h2>Active Cameras</h2>
          <div className="cameras-grid">
            {cameras.map(camera => (
              <Card key={camera.id} className="camera-card">
                <div className="camera-status-icon">
                  {camera.status === 'online' ? '🟢' : '🔴'}
                </div>
                <h3>{camera.name}</h3>
                <div className="camera-info">
                  <div className="info-row">
                    <span className="label">Location:</span>
                    <span>{camera.location}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`status ${camera.status}`}>
                      {camera.status}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Last Activity:</span>
                    <span>{camera.lastActivity}</span>
                  </div>
                </div>
                <Button 
                  variant={camera.status === 'online' ? 'primary' : 'secondary'}
                  onClick={() => handleViewFootage(camera)}
                  disabled={camera.status === 'offline'}
                >
                  {camera.status === 'online' ? 'View Feed' : 'Offline'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveillanceMonitoring
