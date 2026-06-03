import { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('mjb-admin')
    if (stored) setAdmin(JSON.parse(stored))
  }, [])

  const loginAdmin = (adminData) => {
    setAdmin(adminData)
    sessionStorage.setItem('mjb-admin', JSON.stringify(adminData))
  }

  const logoutAdmin = () => {
    setAdmin(null)
    sessionStorage.removeItem('mjb-admin')
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)