import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Search, Plus, MessageCircle, Edit2, Trash2, X } from 'lucide-react'

const ZONE_LABELS = {
  1: '< 5 km', 2: '5-20 km', 3: '20-25 km', 4: '> 25 km'
}

export default function CustomerData() {
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name_asc')
  const [filterZone, setFilterZone] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [form, setForm] = useState({
    full_name: '', whatsapp: '', address: '', distance_km: '', notes: ''
  })

  useEffect(() => { fetchCustomers() }, [])

  useEffect(() => {
    let result = [...customers]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.full_name?.toLowerCase().includes(q) || c.whatsapp?.includes(q))
    }
    if (filterZone) result = result.filter(c => c.zone === parseInt(filterZone))
    if (sortBy === 'name_asc') result.sort((a, b) => a.full_name.localeCompare(b.full_name))
    else if (sortBy === 'name_desc') result.sort((a, b) => b.full_name.localeCompare(a.full_name))
    else if (sortBy === 'dist_asc') result.sort((a, b) => a.distance_km - b.distance_km)
    else if (sortBy === 'dist_desc') result.sort((a, b) => b.distance_km - a.distance_km)
    else if (sortBy === 'zone_asc') result.sort((a, b) => a.zone - b.zone)
    setFiltered(result)
  }, [customers, search, sortBy, filterZone])

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customer_invoice_count')
      .select('*')
      .order('full_name')
    setCustomers(data || [])
  }

  const openAddModal = () => {
    setEditCustomer(null)
    setForm({ full_name: '', whatsapp: '', address: '', distance_km: '', notes: '' })
    setShowModal(true)
  }

  const openEditModal = (cust) => {
    setEditCustomer(cust)
    setForm({
      full_name: cust.full_name, whatsapp: cust.whatsapp,
      address: cust.address, distance_km: cust.distance_km, notes: cust.notes || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.full_name || !form.whatsapp || !form.address || !form.distance_km) {
      toast.error('Lengkapi semua field!'); return
    }
    try {
      if (editCustomer) {
        const { error } = await supabase.from('customers')
          .update({ ...form, distance_km: parseFloat(form.distance_km) })
          .eq('id', editCustomer.id)
        if (error) throw error
        toast.success('Data pelanggan diperbarui!')
      } else {
        const { error } = await supabase.from('customers')
          .insert({ ...form, distance_km: parseFloat(form.distance_km) })
        if (error) throw error
        toast.success('Pelanggan berhasil ditambahkan!')
      }
      setShowModal(false)
      fetchCustomers()
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus pelanggan ini? Semua invoice terkait juga akan terhapus!')) return
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (!error) { toast.success('Pelanggan dihapus'); fetchCustomers() }
  }

  const fieldStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1.5px solid var(--color-border)',
    backgroundColor: 'var(--color-bg)', color: 'var(--color-text)',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text)' }}>Data Pelanggan</h2>
        <button onClick={openAddModal} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 18px', borderRadius: '8px',
          backgroundColor: 'var(--color-orange)', color: 'white',
          fontWeight: '600', border: 'none', cursor: 'pointer'
        }}>
          <Plus size={16} /> Tambah Pelanggan
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input placeholder="Cari nama pelanggan..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...fieldStyle, paddingLeft: '36px' }} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={fieldStyle}>
          <option value="name_asc">Nama A-Z</option>
          <option value="name_desc">Nama Z-A</option>
          <option value="dist_asc">Jarak Terdekat</option>
          <option value="dist_desc">Jarak Terjauh</option>
          <option value="zone_asc">Zona Terkecil</option>
        </select>
        <select value={filterZone} onChange={e => setFilterZone(e.target.value)} style={fieldStyle}>
          <option value="">Semua Zona</option>
          {[1, 2, 3, 4].map(z => <option key={z} value={z}>Zona {z}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)',
        borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px var(--color-shadow)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <tr>
                {['Nama', 'WhatsApp', 'Alamat', 'Jarak', 'Zona', 'Jml Invoice', 'Aksi'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  Tidak ada data pelanggan
                </td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', fontWeight: '600' }}>
                    {c.full_name}
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {c.whatsapp}
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '13px', maxWidth: '200px' }}>
                    <span title={c.address} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.address}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                    {c.distance_km} km
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                      backgroundColor: 'var(--color-orange-light)', color: 'var(--color-orange)'
                    }}>
                      Zona {c.zone}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', textAlign: 'center', fontWeight: '700' }}>
                    {c.invoice_count}
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                        title="WhatsApp"
                        style={{ display: 'flex', alignItems: 'center', padding: '4px',
                          color: '#25d366', textDecoration: 'none' }}>
                        <MessageCircle size={16} />
                      </a>
                      <button onClick={() => openEditModal(c)} title="Edit"
                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--color-orange)', padding: '4px' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} title="Hapus"
                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                          color: '#ef4444', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-card)', borderRadius: '20px',
            width: '100%', maxWidth: '520px', padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: '700', fontSize: '18px' }}>
                {editCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Nama Lengkap *', name: 'full_name', placeholder: 'Nama lengkap pelanggan' },
                { label: 'Nomor WhatsApp *', name: 'whatsapp', placeholder: '08xxxxxxxxxx' },
                { label: 'Jarak dari Perusahaan (km) *', name: 'distance_km', placeholder: 'Contoh: 12.5', type: 'number' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '5px' }}>{f.label}</label>
                  <input type={f.type || 'text'} value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    placeholder={f.placeholder} style={fieldStyle} />
                  {f.name === 'distance_km' && form.distance_km && (
                    <p style={{ fontSize: '12px', color: 'var(--color-orange)', marginTop: '4px' }}>
                      → Zona {
                        parseFloat(form.distance_km) < 5 ? 1 :
                        parseFloat(form.distance_km) < 20 ? 2 :
                        parseFloat(form.distance_km) < 25 ? 3 : 4
                      } ({ZONE_LABELS[
                        parseFloat(form.distance_km) < 5 ? 1 :
                        parseFloat(form.distance_km) < 20 ? 2 :
                        parseFloat(form.distance_km) < 25 ? 3 : 4
                      ]})
                    </p>
                  )}
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '5px' }}>
                  Alamat Lengkap *
                </label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Alamat lengkap pengiriman" rows={3}
                  style={{ ...fieldStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '5px' }}>Catatan</label>
                <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Catatan tambahan (opsional)" style={fieldStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '12px', borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                backgroundColor: 'transparent', color: 'var(--color-text)',
                fontWeight: '600', cursor: 'pointer'
              }}>Batal</button>
              <button onClick={handleSave} style={{
                flex: 2, padding: '12px', borderRadius: '8px',
                backgroundColor: 'var(--color-orange)', color: 'white',
                fontWeight: '700', border: 'none', cursor: 'pointer'
              }}>
                {editCustomer ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}