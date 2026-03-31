'use client';

import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import { authAPI } from '../services/api'
import Button from '../components/Button'
import '../styles/auth-pages.css'

function SignupPage() {
  const [name, setName] = useState('')
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

    if (!name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

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
      const response = await authAPI.signup(email, password, name)
      
      if (response.success) {
        setSuccess('Account created successfully! Redirecting...')
        login(response.user, response.token)
        setTimeout(() => {
          navigate('/dashboard')
        }, 500)
      } else {
        setError(response.message || 'Signup failed. Please try again.')
      }
    } catch (err) {
      console.error('[v0] Signup error:', err)
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
          <h1>Shell Security System</h1>
          <p>Create Your Account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && <div className="error-message" role="alert">{error}</div>}
          {success && <div className="success-message" role="status">{success}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors({ ...errors, name: '' })
              }}
              placeholder="John Smith"
              required
              disabled={loading}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <span id="name-error" className="error-message" style={{ marginTop: '-4px', padding: '6px 0' }}>{errors.name}</span>}
          </div>

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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
