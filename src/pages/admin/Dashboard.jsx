import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FileText, Users, Truck, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    unpaidInvoices: 0,
    paidInvoices: 0,
    totalCustomers: 0,
    totalVehicles: 0,
    totalRevenue: 0,
    pendingAmount: 0,
  })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard() }, [])

  const fetchDashboard = async () => {
    const [
      { count: totalInv },
      { count: unpaidInv },
      { count: paidInv },
      { count: totalCust },
      { count: totalVeh },
    ] = await Promise.all([
      supabase.from('invoices').select('id', { count: 'exact' }),
      supabase.from('invoices').select('id', { count: 'exact' }).eq('status', 'unpaid'),
      supabase.from('invoices').select('id', { count: 'exact' }).eq('status', 'paid'),
      supabase.from('customers').select('id', { count: 'exact' }),
      supabase.from('vehicles').select('id', { count: 'exact' }).eq('is_active', true),
    ])

    const { data: revenue } = await supabase
      .from('invoices').select('total_amount, status')

    const totalRevenue = revenue?.filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.total_amount, 0) || 0
    const pendingAmount = revenue?.filter(r => r.status === 'unpaid')
      .reduce((sum, r) => sum + r.total_amount, 0) || 0

    setStats({
      totalInvoices: totalInv || 0, unpaidInvoices: unpaidInv || 0,
      paidInvoices: paidInv || 0, totalCustomers: totalCust || 0,
      totalVehicles: totalVeh || 0, totalRevenue, pendingAmount
    })

    const { data: recent } = await supabase
      .from('invoice_summary')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    setRecentInvoices(recent || [])
    setLoading(false)
  }

  const fmt = (n) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(n)

  if (loading) return <div style={{ color: 'var(--color-text)' }}>Memuat dashboard...</div>

  const statCards = [
    { label: 'Total Invoice', value: stats.totalInvoices, icon: FileText, color: '#3b82f6' },
    { label: 'Belum Lunas', value: stats.unpaidInvoices, icon: AlertCircle, color: '#f97316' },
    { label: 'Sudah Lunas', value: stats.paidInvoices, icon: CheckCircle, color: '#22c55e' },
    { label: 'Total Pelanggan', value: stats.totalCustomers, icon: Users, color: '#8b5cf6' },
    { label: 'Kendaraan Aktif', value: stats.totalVehicles, icon: Truck, color: '#06b6d4' },
    { label: 'Pendapatan Lunas', value: fmt(stats.totalRevenue), icon: DollarSign, color: '#22c55e' },
    { label: 'Tagihan Pending', value: fmt(stats.pendingAmount), icon: DollarSign, color: '#f97316' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', color: 'var(--color-text)' }}>
        Dashboard
      </h2>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px', padding: '20px',
              boxShadow: '0 2px 8px var(--color-shadow)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                    {card.label}
                  </p>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text)' }}>
                    {card.value}
                  </p>
                </div>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  backgroundColor: card.color + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={22} color={card.color} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Invoices */}
      <div style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px', padding: '24px',
        boxShadow: '0 2px 8px var(--color-shadow)'
      }}>
        <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Invoice Terbaru</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                {['No Invoice', 'Pelanggan', 'Tanggal', 'Total', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px', textAlign: 'left',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)', fontWeight: '600', fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--color-border)', fontWeight: '600', fontFamily: 'monospace', fontSize: '13px' }}>
                    {inv.invoice_number}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>
                    {inv.customer_name}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    {new Date(inv.invoice_date).toLocaleDateString('id-ID')}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--color-border)', fontWeight: '600' }}>
                    {fmt(inv.total_amount)}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                      backgroundColor: inv.status === 'paid' ? '#dcfce7' : '#fff7ed',
                      color: inv.status === 'paid' ? '#16a34a' : '#f97316'
                    }}>
                      {inv.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}