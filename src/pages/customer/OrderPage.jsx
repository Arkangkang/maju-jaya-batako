import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Package, Info } from 'lucide-react'

const PCS_PER_RIT = 1500

export default function OrderPage() {
  const navigate = useNavigate()
  const { customer } = useCustomerAuth()
  const [rit, setRit] = useState(1)
  const [zonePrices, setZonePrices] = useState([])
  const [customerZone, setCustomerZone] = useState(null)
  const [pricePerPcs, setPricePerPcs] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchZonePrices()
  }, [])

  const fetchZonePrices = async () => {
    setLoading(true)
    const { data: prices } = await supabase.from('zone_prices').select('*').order('zone')
    setZonePrices(prices || [])

    // Ambil data zona customer dari tabel customer_accounts
    // Zona ditentukan oleh admin saat mendaftarkan customer
    if (customer) {
      const { data: custData } = await supabase
        .from('customers')
        .select('zone')
        .eq('whatsapp', customer.whatsapp)
        .single()

      if (custData && prices) {
        const zoneData = prices.find(p => p.zone === custData.zone)
        setCustomerZone(custData.zone)
        setPricePerPcs(zoneData?.price_per_pcs || 1600)
      } else {
        // Default zona 1 jika belum ada data di customers
        setCustomerZone(1)
        const defaultPrice = prices?.find(p => p.zone === 1)
        setPricePerPcs(defaultPrice?.price_per_pcs || 1600)
      }
    }
    setLoading(false)
  }

  const totalPcs = rit * PCS_PER_RIT
  const totalAmount = totalPcs * pricePerPcs

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  const handleSubmit = async () => {
    if (rit < 1) { toast.error('Jumlah rit minimal 1!'); return }
    if (!customerZone) { toast.error('Zona belum ditentukan. Hubungi admin.'); return }

    setSubmitting(true)
    try {
      // Buat invoice dari pemesanan online
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          customer_account_id: customer.id,
          order_method: 'online',
          invoice_date: new Date().toISOString().split('T')[0],
          zone: customerZone,
          price_per_pcs: pricePerPcs,
          total_rit: rit,
          total_pcs: totalPcs,
          net_pcs: totalPcs,
          total_amount: totalAmount,
          status: 'unpaid'
        })
        .select()
        .single()

      if (error) throw error

      // Tambah delivery row
      await supabase.from('invoice_deliveries').insert({
        invoice_id: invoice.id,
        delivery_date: new Date().toISOString().split('T')[0],
        item_type: 'Batako Press',
        rit_count: rit,
        broken_count: 0
      })

      toast.success('Pesanan berhasil dikirim! Admin akan menghubungi kamu.')
      navigate('/')
    } catch (err) {
      toast.error('Gagal mengirim pesanan: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <p>Memuat data...</p>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        width: '100%', maxWidth: '500px',
        backgroundColor: 'var(--color-card)',
        borderRadius: '20px', padding: '40px',
        border: '1px solid var(--color-border)',
        boxShadow: '0 8px 32px var(--color-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <Package size={28} color="var(--color-orange)" />
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Form Pemesanan</h2>
        </div>

        {/* Info Zona */}
        <div style={{
          padding: '16px', borderRadius: '12px', marginBottom: '24px',
          backgroundColor: 'var(--color-orange-light)',
          border: '1px solid var(--color-orange)',
          display: 'flex', gap: '12px', alignItems: 'flex-start'
        }}>
          <Info size={18} color="var(--color-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-orange)' }}>
              Zona {customerZone} — {formatRupiah(pricePerPcs)}/pcs
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Harga sudah termasuk pengiriman ke zona kamu
            </p>
          </div>
        </div>

        {/* Input Rit */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>
            Jumlah Rit
          </label>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
            1 rit = {PCS_PER_RIT.toLocaleString('id-ID')} pcs batako
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setRit(Math.max(1, rit - 1))} style={{
              width: '44px', height: '44px', borderRadius: '10px',
              border: '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
              fontSize: '22px', cursor: 'pointer', color: 'var(--color-text)'
            }}>-</button>
            <input
              type="number" value={rit} min={1}
              onChange={e => setRit(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px', textAlign: 'center',
                border: '1.5px solid var(--color-orange)',
                backgroundColor: 'var(--color-bg)', color: 'var(--color-text)',
                fontSize: '18px', fontWeight: '700', boxSizing: 'border-box'
              }}
            />
            <button onClick={() => setRit(rit + 1)} style={{
              width: '44px', height: '44px', borderRadius: '10px',
              border: '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
              fontSize: '22px', cursor: 'pointer', color: 'var(--color-text)'
            }}>+</button>
          </div>
        </div>

        {/* Ringkasan */}
        <div style={{
          padding: '20px', borderRadius: '14px', marginBottom: '24px',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)'
        }}>
          <h4 style={{ fontWeight: '700', marginBottom: '14px' }}>Ringkasan Pesanan</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SummaryRow label="Jenis Barang" value="Batako Press 38x18x9 cm" />
            <SummaryRow label="Jumlah Rit" value={`${rit} rit`} />
            <SummaryRow label="Total Pcs" value={`${totalPcs.toLocaleString('id-ID')} pcs`} />
            <SummaryRow label="Harga/Pcs" value={formatRupiah(pricePerPcs)} />
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '4px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>Total Tagihan</span>
              <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--color-orange)' }}>
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          backgroundColor: 'var(--color-orange)', color: 'white',
          fontWeight: '700', fontSize: '16px', border: 'none',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.7 : 1
        }}>
          {submitting ? 'Mengirim Pesanan...' : 'Kirim Pesanan'}
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontWeight: '600' }}>{value}</span>
    </div>
  )
}