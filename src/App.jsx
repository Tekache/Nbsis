import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import AuthContext from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import PersonnelManagement from './pages/PersonnelManagement'
import AccessControl from './pages/AccessControl'
import SurveillanceMonitoring from './pages/SurveillanceMonitoring'
import IncidentReporting from './pages/IncidentReporting'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'

const normalizeAuthUser = (user) => {
  if (!user) return null

  const fullName = user.full_name || user.name || ''

  return {
    ...user,
    full_name: fullName,
    name: fullName,
  }
}

function App() {
  const [authState, setAuthState] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      }
    }

    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('authUser')

    if (!storedToken || !storedUser) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      }
    }

    try {
      const parsedUser = normalizeAuthUser(JSON.parse(storedUser))
      return {
        isAuthenticated: true,
        user: parsedUser,
        token: storedToken,
      }
    } catch {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      }
    }
  })

  const login = (user, token) => {
    const normalizedUser = normalizeAuthUser(user)

    localStorage.setItem('authToken', token)
    localStorage.setItem('authUser', JSON.stringify(normalizedUser))
    setAuthState({
      isAuthenticated: true,
      user: normalizedUser,
      token,
    })
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    })
  }

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/personnel" element={<PersonnelManagement />} />
            <Route path="/access-control" element={<AccessControl />} />
            <Route path="/surveillance" element={<SurveillanceMonitoring />} />
            <Route path="/incidents" element={<IncidentReporting />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  )
}

export default App
