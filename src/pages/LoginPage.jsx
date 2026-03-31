'use client';

import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import { authAPI } from '../services/api'
import Button from '../components/Button'
import '../styles/auth-pages.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const getPasswordByteLength = (str) => {
    return new Blob([str]).size
  }

  const validateForm = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (getPasswordByteLength(password) > 72) {
      newErrors.password = `Password is too long (${getPasswordByteLength(password)} bytes). Maximum 72 bytes allowed.`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.login(email, password)
      
      if (response.success) {
        setSuccess('Login successful! Redirecting...')
        login(response.user, response.token)
        setTimeout(() => {
          navigate('/dashboard')
        }, 500)
      } else {
        setError(response.message || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const passwordByteLength = getPasswordByteLength(password)
  const passwordTooLong = passwordByteLength > 72

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Network Shell Security System</h1>
          <p>Network Security Management Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && <div className="error-message" role="alert">{error}</div>}
          {success && <div className="success-message" role="status">{success}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors({ ...errors, email: '' })
              }}
              placeholder="your.email@company.com"
              required
              disabled={loading}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <span id="email-error" className="error-message" style={{ marginTop: '-4px', padding: '6px 0' }}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password {password && <span style={{ fontSize: '12px', color: passwordTooLong ? '#ff4444' : '#666' }}>({passwordByteLength}/72 bytes)</span>}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors({ ...errors, password: '' })
              }}
              placeholder="••••••••"
              required
              disabled={loading}
              aria-describedby={errors.password ? 'password-error' : undefined}
              style={{ borderColor: passwordTooLong ? '#ff4444' : undefined }}
            />
            {errors.password && <span id="password-error" className="error-message" style={{ marginTop: '-4px', padding: '6px 0' }}>{errors.password}</span>}
          </div>

          <Button 
            type="submit" 
            disabled={loading || passwordTooLong}
            variant="primary"
            style={{ marginTop: '10px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
