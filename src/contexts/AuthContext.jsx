import { createContext, useContext, useState, useEffect } from 'react'

const CustomerAuthContext = createContext()

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('mjb-customer')
    if (stored) setCustomer(JSON.parse(stored))
  }, [])

  const login = (customerData) => {
    setCustomer(customerData)
    sessionStorage.setItem('mjb-customer', JSON.stringify(customerData))
  }

  const logout = () => {
    setCustomer(null)
    sessionStorage.removeItem('mjb-customer')
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, login, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export const useCustomerAuth = () => useContext(CustomerAuthContext)