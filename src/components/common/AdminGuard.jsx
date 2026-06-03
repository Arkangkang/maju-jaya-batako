import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'

export default function AdminGuard({ children }) {
  const { admin } = useAdminAuth()
  return admin ? children : <Navigate to="/admin/login" replace />
}