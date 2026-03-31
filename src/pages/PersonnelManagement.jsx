'use client';

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { personnelAPI } from '../services/api'
import '../styles/personnel.css'

function PersonnelManagement() {
  const [personnel, setPersonnel] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    status: 'active',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPersonnel()
  }, [])

  const fetchPersonnel = async () => {
    try {
      const response = await personnelAPI.getAll()
      if (response.success) {
        setPersonnel(response.data)
      }
    } catch (err) {
      console.error('Error fetching personnel:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        await personnelAPI.update(editingId, formData)
      } else {
        await personnelAPI.create(formData)
      }
      
      fetchPersonnel()
      setShowForm(false)
      setEditingId(null)
      setFormData({ name: '', position: '', department: '', status: 'active' })
    } catch (err) {
      console.error('Error saving personnel:', err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await personnelAPI.delete(id)
        fetchPersonnel()
      } catch (err) {
        console.error('Error deleting personnel:', err)
      }
    }
  }

  const handleEdit = (person) => {
    setFormData(person)
    setEditingId(person.id)
    setShowForm(true)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="main-content">
        <Header 
          title="Personnel Management" 
          subtitle="Manage security personnel and staff"
        />

        <div className="page-content">
          <div className="content-header">
            <h2>Personnel Records</h2>
            <Button 
              variant="primary"
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
                setFormData({ name: '', position: '', department: '', status: 'active' })
              }}
            >
              Add Personnel
            </Button>
          </div>

          {showForm && (
            <Card className="form-card">
              <h3>{editingId ? 'Edit Personnel' : 'Add New Personnel'}</h3>
              <form onSubmit={handleSubmit} className="personnel-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option>Select Department</option>
                    <option>Security</option>
                    <option>Field Operations</option>
                    <option>Monitoring</option>
                    <option>Administration</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-actions">
                  <Button type="submit" variant="primary">Save</Button>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="personnel-list">
            {personnel.map(person => (
              <Card key={person.id} className="personnel-item">
                <div className="personnel-header">
                  <h3>{person.name}</h3>
                  <span className={`status-badge status-${person.status}`}>
                    {person.status}
                  </span>
                </div>
                <div className="personnel-details">
                  <div><strong>Position:</strong> {person.position}</div>
                  <div><strong>Department:</strong> {person.department}</div>
                </div>
                <div className="personnel-actions">
                  <Button 
                    variant="secondary"
                    onClick={() => handleEdit(person)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={() => handleDelete(person.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonnelManagement
