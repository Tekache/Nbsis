'use client';

import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

function ProtectedRoute() {
  const { authState } = useContext(AuthContext)

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
