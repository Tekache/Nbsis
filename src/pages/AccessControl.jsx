'use client';

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { accessControlAPI } from '../services/api'
import '../styles/access-control.css'

function AccessControl() {
  const [accessList, setAccessList] = useState([])
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [newAccessLevel, setNewAccessLevel] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccessData()
  }, [])

  const fetchAccessData = async () => {
    try {
      const response = await accessControlAPI.getAll()
      if (response.success) {
        setAccessList(response.data)
      }
    } catch (err) {
      console.error('Error fetching access control data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAccess = async () => {
    if (!selectedPerson || !newAccessLevel) return

    try {
      await accessControlAPI.updateAccess(selectedPerson.id, newAccessLevel)
      fetchAccessData()
      setSelectedPerson(null)
      setNewAccessLevel('')
    } catch (err) {
      console.error('Error updating access:', err)
    }
  }

  const accessLevels = [
    { value: 'Level 1', label: 'Level 1 - Basic Access' },
    { value: 'Level 2', label: 'Level 2 - Extended Access' },
    { value: 'Level 3', label: 'Level 3 - Full Access' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="main-content">
        <Header 
          title="Access Control" 
          subtitle="Manage personnel access levels and permissions"
        />

        <div className="page-content">
          {selectedPerson && (
            <Card className="update-card">
              <h3>Update Access Level</h3>
              <div className="selected-person">
                <strong>Person:</strong> {selectedPerson.personName}
              </div>
              <div className="form-group">
                <label>New Access Level</label>
                <select
                  value={newAccessLevel}
                  onChange={(e) => setNewAccessLevel(e.target.value)}
                >
                  <option value="">Select Access Level</option>
                  {accessLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <Button 
                  variant="primary"
                  onClick={handleUpdateAccess}
                >
                  Confirm Update
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setSelectedPerson(null)
                    setNewAccessLevel('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          <div className="access-list">
            <h2>Access Records</h2>
            {accessList.map(access => (
              <Card key={access.id} className="access-item">
                <div className="access-header">
                  <h3>{access.personName}</h3>
                  <span className="access-level">{access.level}</span>
                </div>
                <div className="access-details">
                  <div><strong>Area:</strong> {access.area}</div>
                  <div><strong>Last Access:</strong> {access.accessDate}</div>
                </div>
                <Button 
                  variant="secondary"
                  onClick={() => setSelectedPerson(access)}
                >
                  Update Access
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessControl
