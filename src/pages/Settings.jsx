'use client';

import { useState, useEffect, useContext } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import AuthContext from '../context/AuthContext'
import { settingsAPI } from '../services/api'
import '../styles/settings.css'

function Settings() {
  const { authState } = useContext(AuthContext)
  const [profile, setProfile] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await settingsAPI.getProfile()
      if (response.success) {
        setProfile(response.data)
        setFormData({
          name: response.data.name,
          email: response.data.email,
          department: response.data.department,
        })
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      await settingsAPI.updateProfile(formData)
      setMessage('Profile updated successfully')
      fetchProfile()
      setEditMode(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error updating profile')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters')
      return
    }

    try {
      await settingsAPI.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      )
      setMessage('Password changed successfully')
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setPasswordMode(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error changing password')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">
          <Header title="Settings" />
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="main-content">
        <Header 
          title="Settings & Profile" 
          subtitle="Manage your account settings"
        />

        <div className="page-content">
          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <Card className="settings-section">
            <div className="section-header">
              <h2>Profile Information</h2>
              <Button 
                variant="secondary"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="settings-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleProfileInputChange}
                  />
                </div>

                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </form>
            ) : (
              <div className="profile-display">
                <div className="profile-row">
                  <span className="label">Name:</span>
                  <span>{profile?.name}</span>
                </div>
                <div className="profile-row">
                  <span className="label">Email:</span>
                  <span>{profile?.email}</span>
                </div>
                <div className="profile-row">
                  <span className="label">Role:</span>
                  <span>{profile?.role}</span>
                </div>
                <div className="profile-row">
                  <span className="label">Department:</span>
                  <span>{profile?.department}</span>
                </div>
                <div className="profile-row">
                  <span className="label">Member Since:</span>
                  <span>{profile?.joinDate}</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="settings-section">
            <div className="section-header">
              <h2>Security</h2>
              <Button 
                variant="secondary"
                onClick={() => setPasswordMode(!passwordMode)}
              >
                {passwordMode ? 'Cancel' : 'Change Password'}
              </Button>
            </div>

            {passwordMode && (
              <form onSubmit={handleChangePassword} className="settings-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>

                <Button type="submit" variant="primary">
                  Update Password
                </Button>
              </form>
            )}
          </Card>

          <Card className="settings-section system-info">
            <h2>System Information</h2>
            <div className="info-row">
              <span className="label">Application Version:</span>
              <span>1.0.0</span>
            </div>
            <div className="info-row">
              <span className="label">Last Updated:</span>
              <span>2024-01-15</span>
            </div>
            <div className="info-row">
              <span className="label">User ID:</span>
              <span>{profile?.id}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings
