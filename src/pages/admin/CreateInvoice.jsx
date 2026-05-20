import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, Send } from 'lucide-react'

const PCS_PER_RIT = 1500

export default function CreateInvoice() {
  const [customers, setCustomers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [zonePrices, setZonePrices] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    customer_id: '',
    order_method: 'direct',
    invoice_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [deliveries, setDeliveries] = useState([{
    id: Date.now(),
    delivery_date: new Date().toISOString().split('T')[0],
    item_type: 'Batako Press',
    vehicle_id: '',
    rit_count: 1,
    broken_count: 0,
  }])

  const [selectedZone, setSelectedZone] = useState('')
  const [pricePerPcs, setPricePerPcs] = useState(0)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [
      { data: custs },
      { data: vehs },
      { data: prices }
    ] = await Promise.all([
      supabase.from('customers').select('*').order('full_name'),
      supabase.from('vehicles').select('*').eq('is_active', true).order('brand'),
      supabase.from('zone_prices').select('*').order('zone')
    ])
    setCustomers(custs || [])
    setVehicles(vehs || [])
    setZonePrices(prices || [])
  }

  const handleZoneChange = (zone) => {
    setSelectedZone(zone)
    const price = zonePrices.find(z => z.zone === parseInt(zone))
    setPricePerPcs(price?.price_per_pcs || 0)
  }

  // Saat memilih customer, auto-fill zona berdasarkan data customer
  const handleCustomerChange = (custId) => {
    setForm({ ...form, customer_id: custId })
    const cust = customers.find(c => c.id === custId)
    if (cust) {
      handleZoneChange(String(cust.zone))
    }
  }

  const addDelivery = () => setDeliveries([...deliveries, {
    id: Date.now(), delivery_date: new Date().toISOString().split('T')[0],
    item_type: 'Batako Press', vehicle_id: '', rit_count: 1, broken_count: 0
  }])

  const removeDelivery = (id) => setDeliveries(deliveries.filter(d => d.id !== id))

  const updateDelivery = (id, field, value) =>
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, [field]: value } : d))

  // Kalkulasi total
  const totals = deliveries.reduce((acc, d) => {
    const rit = parseInt(d.rit_count) || 0
    const broken = parseInt(d.broken_count) || 0
    const pcs = rit * PCS_PER_RIT
    return {
      rit: acc.rit + rit,
      pcs: acc.pcs + pcs,
      broken: acc.broken + broken,
      net: acc.net + (pcs - broken)
    }
  }, { rit: 0, pcs: 0, broken: 0, net: 0 })

  const totalAmount = totals.net * pricePerPcs

  const fmt = n => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(n)

  const handleSubmit = async () => {
    if (!form.customer_id || !selectedZone || !pricePerPcs) {
      toast.error('Lengkapi semua field yang wajib!')
      return
    }
    if (deliveries.some(d => !d.vehicle_id)) {
      toast.error('Pilih kendaraan untuk setiap baris pengiriman!')
      return
    }

    setLoading(true)
    try {
      // Buat invoice
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          customer_id: form.customer_id,
          order_method: form.order_method,
          invoice_date: form.invoice_date,
          zone: parseInt(selectedZone),
          price_per_pcs: pricePerPcs,
          total_rit: totals.rit,
          total_pcs: totals.pcs,
          total_broken: totals.broken,
          net_pcs: totals.net,
          total_amount: totalAmount,
          status: 'unpaid',
          notes: form.notes
        })
        .select()
        .single()

      if (error) throw error

      // Insert baris pengiriman
      const deliveryRows = deliveries.map(d => ({
        invoice_id: invoice.id,
        delivery_date: d.delivery_date,
        item_type: d.item_type,
        vehicle_id: d.vehicle_id,
        rit_count: parseInt(d.rit_count),
        broken_count: parseInt(d.broken_count) || 0,
      }))

      const { error: delErr } = await supabase
        .from('invoice_deliveries')
        .insert(deliveryRows)

      if (delErr) throw delErr

      toast.success(`Invoice ${invoice.invoice_number} berhasil dibuat!`)

      // Reset form
      setForm({
        customer_id: '', order_method: 'direct',
        invoice_date: new Date().toISOString().split('T')[0], notes: ''
      })
      setDeliveries([{
        id: Date.now(), delivery_date: new Date().toISOString().split('T')[0],
        item_type: 'Batako Press', vehicle_id: '', rit_count: 1, broken_count: 0
      }])
      setSelectedZone('')
      setPricePerPcs(0)

    } catch (err) {
      toast.error('Gagal membuat invoice: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1.5px solid var(--color-border)',
    backgroundColor: 'var(--color-bg)', color: 'var(--color-text)',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', color: 'var(--color-text)' }}>
        Buat Invoice Baru
      </h2>

      <div style={{
        backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)',
        borderRadius: '16px', padding: '28px',
        boxShadow: '0 2px 8px var(--color-shadow)'
      }}>
        {/* Info Invoice */}
        <h3 style={{ fontWeight: '700', marginBottom: '16px', paddingBottom: '12px',
          borderBottom: '1px solid var(--color-border)' }}>Informasi Invoice</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Customer Dropdown */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
              Nama Pelanggan *
            </label>
            <select value={form.customer_id} onChange={e => handleCustomerChange(e.target.value)}
              style={fieldStyle} required>
              <option value="">-- Pilih Pelanggan --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.whatsapp})
                </option>
              ))}
            </select>
          </div>

          {/* Metode Pemesanan */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
              Opsi Pemesanan *
            </label>
            <select value={form.order_method} onChange={e => setForm({ ...form, order_method: e.target.value })}
              style={fieldStyle}>
              <option value="direct">Langsung</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="online">Online</option>
            </select>
          </div>

          {/* Tanggal Invoice */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
              Tanggal Invoice *
            </label>
            <input type="date" value={form.invoice_date}
              onChange={e => setForm({ ...form, invoice_date: e.target.value })}
              style={fieldStyle} />
          </div>

          {/* Zona */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
              Zona *
            </label>
            <select value={selectedZone} onChange={e => handleZoneChange(e.target.value)} style={fieldStyle}>
              <option value="">-- Pilih Zona --</option>
              {zonePrices.map(z => (
                <option key={z.zone} value={z.zone}>
                  Zona {z.zone} — {z.label} — Rp {z.price_per_pcs.toLocaleString('id-ID')}/pcs
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Baris Pengiriman */}
        <h3 style={{ fontWeight: '700', marginBottom: '16px', paddingBottom: '12px',
          borderBottom: '1px solid var(--color-border)' }}>Baris Pengiriman</h3>

        {deliveries.map((delivery, idx) => (
          <div key={delivery.id} style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: '12px', padding: '16px', marginBottom: '12px',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>Pengiriman {idx + 1}</span>
              {deliveries.length > 1 && (
                <button onClick={() => removeDelivery(delivery.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px'
                }}>
                  <Trash2 size={15} /> Hapus
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Tanggal Kirim</label>
                <input type="date" value={delivery.delivery_date}
                  onChange={e => updateDelivery(delivery.id, 'delivery_date', e.target.value)}
                  style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Jenis Barang</label>
                <input type="text" value={delivery.item_type} readOnly style={{ ...fieldStyle, backgroundColor: 'var(--color-border)' }} />
              </div>
              <div>
                <label style={labelStyle}>Kendaraan *</label>
                <select value={delivery.vehicle_id}
                  onChange={e => updateDelivery(delivery.id, 'vehicle_id', e.target.value)}
                  style={fieldStyle}>
                  <option value="">-- Pilih --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.brand} — {v.plate_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Jumlah Rit</label>
                <input type="number" min={1} value={delivery.rit_count}
                  onChange={e => updateDelivery(delivery.id, 'rit_count', e.target.value)}
                  style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Jumlah Pecah (pcs)</label>
                <input type="number" min={0} value={delivery.broken_count}
                  onChange={e => updateDelivery(delivery.id, 'broken_count', e.target.value)}
                  style={fieldStyle} />
              </div>
            </div>
          </div>
        ))}

        <button onClick={addDelivery} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 18px', borderRadius: '8px',
          border: '1.5px dashed var(--color-orange)',
          backgroundColor: 'transparent', color: 'var(--color-orange)',
          cursor: 'pointer', fontWeight: '600', fontSize: '14px',
          marginBottom: '24px'
        }}>
          <Plus size={16} /> Tambah Baris Pengiriman
        </button>

        {/* Total */}
        <div style={{
          backgroundColor: 'var(--color-orange-light)',
          border: '1px solid var(--color-orange)',
          borderRadius: '12px', padding: '20px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px',
          marginBottom: '24px'
        }}>
          {[
            { label: 'Total Rit', value: `${totals.rit} rit` },
            { label: 'Total Pcs', value: `${totals.pcs.toLocaleString('id-ID')} pcs` },
            { label: 'Total Pecah', value: `${totals.broken.toLocaleString('id-ID')} pcs` },
            { label: 'Net Pcs', value: `${totals.net.toLocaleString('id-ID')} pcs` },
            { label: 'Harga/Pcs', value: fmt(pricePerPcs) },
          ].map(t => (
            <div key={t.label}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{t.label}</p>
              <p style={{ fontWeight: '700', fontSize: '15px' }}>{t.value}</p>
            </div>
          ))}
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>TOTAL TAGIHAN</p>
            <p style={{ fontWeight: '800', fontSize: '22px', color: 'var(--color-orange)' }}>{fmt(totalAmount)}</p>
          </div>
        </div>

        {/* Catatan */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
            Catatan (opsional)
          </label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={3} placeholder="Catatan tambahan..."
            style={{ ...fieldStyle, resize: 'vertical' }} />
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '14px 28px', borderRadius: '10px',
          backgroundColor: 'var(--color-orange)', color: 'white',
          fontWeight: '700', fontSize: '16px', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
        }}>
          <Send size={18} />
          {loading ? 'Menyimpan...' : 'Kirim Invoice'}
        </button>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontWeight: '600', fontSize: '12px', marginBottom: '5px', color: 'var(--color-text-muted)' }