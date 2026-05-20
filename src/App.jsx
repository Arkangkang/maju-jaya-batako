import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { CustomerAuthProvider } from './contexts/AuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import { Toaster } from 'react-hot-toast'

// Public Pages
import Portfolio from './pages/public/Portfolio'
import CustomerLogin from './pages/public/CustomerLogin'
import CustomerSignup from './pages/public/CustomerSignup'

// Customer Pages
import ConfirmData from './pages/customer/ConfirmData'
import OrderPage from './pages/customer/OrderPage'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import CreateInvoice from './pages/admin/CreateInvoice'
import InvoiceData from './pages/admin/InvoiceData'
import CustomerData from './pages/admin/CustomerData'
import VehicleData from './pages/admin/VehicleData'

// Guards
import CustomerGuard from './components/common/CustomerGuard'
import AdminGuard from './components/common/AdminGuard'

export default function App() {
  return (
    <ThemeProvider>
      <CustomerAuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Portfolio />} />
              <Route path="/pesan" element={<CustomerLogin />} />
              <Route path="/daftar" element={<CustomerSignup />} />

              {/* Customer Protected */}
              <Route path="/konfirmasi" element={
                <CustomerGuard><ConfirmData /></CustomerGuard>
              } />
              <Route path="/pemesanan" element={
                <CustomerGuard><OrderPage /></CustomerGuard>
              } />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <AdminGuard><AdminLayout /></AdminGuard>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="buat-invoice" element={<CreateInvoice />} />
                <Route path="data-invoice" element={<InvoiceData />} />
                <Route path="data-pelanggan" element={<CustomerData />} />
                <Route path="data-kendaraan" element={<VehicleData />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </CustomerAuthProvider>
    </ThemeProvider>
  )
}