import { useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../../contexts/AuthContext'
import { User, Phone, MapPin, CheckCircle } from 'lucide-react'

export default function ConfirmData() {
  const navigate = useNavigate()
  const { customer, logout } = useCustomerAuth()

  if (!customer) return null

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        width: '100%', maxWidth: '480px',
        backgroundColor: 'var(--color-card)',
        borderRadius: '20px', padding: '40px',
        border: '1px solid var(--color-border)',
        boxShadow: '0 8px 32px var(--color-shadow)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: 'var(--color-orange-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle size={32} color="var(--color-orange)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            Konfirmasi Data Pengirim
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Pastikan data di bawah sudah benar sebelum melanjutkan
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <DataRow icon={<User size={18} color="var(--color-orange)" />}
            label="Nama Lengkap" value={customer.full_name} />
          <DataRow icon={<Phone size={18} color="var(--color-orange)" />}
            label="Nomor WhatsApp" value={customer.whatsapp} />
          <DataRow icon={<MapPin size={18} color="var(--color-orange)" />}
            label="Alamat Pengiriman" value={customer.address} />
        </div>

        <button onClick={() => navigate('/pemesanan')} style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          backgroundColor: 'var(--color-orange)', color: 'white',
          fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer'
        }}>
          Data Sudah Benar, Lanjut Pesan →
        </button>

        <button onClick={logout} style={{
          width: '100%', padding: '12px', marginTop: '12px',
          borderRadius: '10px', backgroundColor: 'transparent',
          color: 'var(--color-text-muted)', fontWeight: '500',
          fontSize: '14px', border: '1px solid var(--color-border)', cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>
    </div>
  )
}

function DataRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', gap: '14px',
      padding: '16px', borderRadius: '12px',
      backgroundColor: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)'
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px',
        backgroundColor: 'var(--color-orange-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontWeight: '600', fontSize: '15px' }}>{value}</p>
      </div>
    </div>
  )
}