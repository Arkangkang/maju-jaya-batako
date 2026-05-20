import { Navigate } from 'react-router-dom'
import { useCustomerAuth } from '../../contexts/AuthContext'

export default function CustomerGuard({ children }) {
  const { customer } = useCustomerAuth()
  return customer ? children : <Navigate to="/pesan" replace />
}