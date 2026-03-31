const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8000/api'

const getAuthUser = () => {
  try {
    const storedUser = localStorage.getItem('authUser')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

const formatDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

const generateEmployeeId = () => {
  const rand = Math.floor(Math.random() * 900) + 100
  return `EMP-${Date.now().toString().slice(-6)}${rand}`
}

const slugifyName = (name) =>
  (name || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/(^\.|\.$)/g, '')

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = localStorage.getItem('authToken')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    console.log('[v0] API Request:', {
      url,
      method: options.method || 'GET',
    })

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[v0] API Error:', { status: response.status, detail: data.detail })
      throw new Error(data.detail || `API Error: ${response.status}`)
    }

    console.log('[v0] API Success:', data)
    return data
  } catch (error) {
    const isNetworkError =
      error.name === 'TypeError' && error.message === 'Failed to fetch'
    const friendlyMessage = isNetworkError
      ? `Cannot reach backend at ${API_BASE_URL}. Is the FastAPI server running and accessible?`
      : error.message

    console.error('[v0] API Exception:', friendlyMessage)
    throw new Error(friendlyMessage)
  }
}

export const authAPI = {
  signup: async (email, password, name) => {
    try {
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: name }),
      })
      
      // Store token from response
      if (response.access_token) {
        localStorage.setItem('authToken', response.access_token)
      }
      
      return {
        success: true,
        user: response.user,
        token: response.access_token,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Signup failed',
      }
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      
      // Store token from response
      if (response.access_token) {
        localStorage.setItem('authToken', response.access_token)
      }
      
      return {
        success: true,
        user: response.user,
        token: response.access_token,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
      }
    }
  },
}

export const personnelAPI = {
  getAll: async () => {
    const response = await apiRequest('/personnel', { method: 'GET' })
    const items = response.items || []
    const data = items.map((person) => ({
      id: person.id,
      name: person.full_name,
      position: person.position,
      department: person.department,
      status: person.is_active ? 'active' : 'inactive',
      access_level: person.access_level,
      employee_id: person.employee_id,
      email: person.email,
      phone: person.phone,
      assigned_areas: person.assigned_areas || [],
    }))
    return { success: true, data }
  },

  create: async (personnel) => {
    const fullName = personnel.name?.trim() || 'New Personnel'
    const email =
      personnel.email ||
      `${slugifyName(fullName)}@shell.com`
    const payload = {
      employee_id: personnel.employee_id || generateEmployeeId(),
      full_name: fullName,
      email,
      department: personnel.department || 'Security',
      position: personnel.position || 'Security Officer',
      access_level: personnel.access_level || 'Level 1',
      phone: personnel.phone || 'N/A',
      assigned_areas: personnel.assigned_areas || [],
    }
    const response = await apiRequest('/personnel', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return { success: true, data: response }
  },

  update: async (id, personnel) => {
    const payload = {
      full_name: personnel.name,
      department: personnel.department,
      position: personnel.position,
      access_level: personnel.access_level || 'Level 1',
      phone: personnel.phone || 'N/A',
      email: personnel.email,
    }
    const response = await apiRequest(`/personnel/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return { success: true, data: response }
  },

  delete: async (id) => {
    await apiRequest(`/personnel/${id}`, { method: 'DELETE' })
    return { success: true }
  },
}

export const accessControlAPI = {
  getAll: async () => {
    const response = await apiRequest('/access-logs', { method: 'GET' })
    const items = response.items || []
    const data = items.map((log) => ({
      id: log.id,
      personName: log.personnel_id,
      level: log.access_type,
      area: log.access_point,
      accessDate: formatDateTime(log.timestamp),
    }))
    return { success: true, data }
  },

  updateAccess: async (id, accessLevel) => {
    const response = await apiRequest(`/access-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ access_type: accessLevel }),
    })
    return { success: true, data: response }
  },
}

export const surveillanceAPI = {
  getCameras: async () => {
    const response = await apiRequest('/surveillance/cameras', { method: 'GET' })
    const data = response.items || []
    return { success: true, data }
  },

  getFootage: async (cameraId) => {
    const response = await apiRequest(
      `/surveillance/cameras/${cameraId}/footage`,
      { method: 'GET' }
    )
    return { success: true, data: response }
  },
}

export const incidentAPI = {
  getAll: async () => {
    const response = await apiRequest('/incidents', { method: 'GET' })
    const items = response.items || []
    const data = items.map((incident) => ({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      location: incident.location,
      status: incident.status,
      date: formatDateTime(incident.created_at),
      response: incident.assigned_to || 'Pending review',
      assignedTo: incident.assigned_to || 'Unassigned',
    }))
    return { success: true, data }
  },

  create: async (incident) => {
    const user = getAuthUser()
    const payload = {
      title: incident.title,
      description: incident.description,
      incident_type: incident.incident_type || 'General',
      severity: incident.severity || 'medium',
      location: incident.location,
      reported_by: user?.full_name || user?.email || 'System',
    }
    const response = await apiRequest('/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return { success: true, data: response }
  },

  getDetail: async (id) => {
    const response = await apiRequest(`/incidents/${id}`, { method: 'GET' })
    const data = {
      id: response.id,
      title: response.title,
      description: response.description,
      severity: response.severity,
      location: response.location,
      status: response.status,
      date: formatDateTime(response.created_at),
      response: response.assigned_to || 'Pending review',
      assignedTo: response.assigned_to || 'Unassigned',
    }
    return { success: true, data }
  },

  update: async (id, incident) => {
    const response = await apiRequest(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(incident),
    })
    return { success: true, data: response }
  },
}

export const alertsAPI = {
  getAll: async () => {
    const response = await apiRequest('/alerts', { method: 'GET' })
    const items = response.items || []
    const data = items.map((alert) => ({
      id: alert.id,
      message: alert.message,
      severity: alert.severity,
      read: alert.is_resolved,
      timestamp: formatDateTime(alert.created_at),
      alert_type: alert.alert_type,
      location: alert.location,
    }))
    return { success: true, data }
  },

  markAsRead: async (id) => {
    const response = await apiRequest(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_resolved: true }),
    })
    return { success: true, data: response }
  },
}

export const settingsAPI = {
  getProfile: async () => {
    const response = await apiRequest('/users/profile', { method: 'GET' })
    return { success: true, data: response }
  },

  updateProfile: async (updates) => {
    const response = await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: updates.name,
        email: updates.email,
        department: updates.department,
      }),
    })
    return { success: true, data: response }
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await apiRequest('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    })
    return { success: true, data: response }
  },
}
