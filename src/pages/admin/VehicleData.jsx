import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Truck, Edit2, Trash2, X } from 'lucide-react'

export default function VehicleData() {
  const [vehicles, setVehicles] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editVehicle, setEditVehicle] = useState(null)
  const [form, setForm] = useState({ plate_number: '', brand: '', capacity: 1500 })

  useEffect(() => { fetchVehicles() }, [])

  const fetchVehicles = async () => {
    const { data } = await supabase.from('vehicles').select('*').order('brand')
    setVehicles(data || [])
  }

  const handleSave = async () => {
    if (!form.plate_number || !form.brand) {
      toast.error('Lengkapi data kendaraan!'); return
    }
    try {
      if (editVehicle) {
        await supabase.from('vehicles').update(form).eq('id', editVehicle.id)
        toast.success('Kendaraan diperbarui!')
      } else {
        await supabase.from('vehicles').insert(form)
        toast.success('Kendaraan ditambahkan!')
      }
      setShowModal(false)
      fetchVehicles()
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus kendaraan ini?')) return
    await supabase.from('vehicles').delete().eq('id', id)
    toast.success('Kendaraan dihapus')
    fetchVehicles()
  }

  const fieldStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1.5px solid var(--color-border)',
    backgroundColor: 'var(--color-bg)', color: 'var(--color-text)',
    fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text)' }}>Data Kendaraan</h2>
        <button onClick={() => { setEditVehicle(null); setForm({ plate_number: '', brand: '', capacity: 1500 }); setShowModal(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 18px', borderRadius: '8px',
            backgroundColor: 'var(--color-orange)', color: 'white',
            fontWeight: '600', border: 'none', cursor: 'pointer'
          }}>
          <Plus size={16} /> Tambah Kendaraan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {vehicles.map(v => (
          <div key={v.id} style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '20px',
            boxShadow: '0 2px 8px var(--color-shadow)'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                backgroundColor: 'var(--color-orange-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Truck size={24} color="var(--color-orange)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{v.brand}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '4px' }}>
                  {v.plate_number}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Kapasitas: {v.capacity.toLocaleString('id-ID')} pcs
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px',
              paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
              <button onClick={() => { setEditVehicle(v); setForm({ plate_number: v.plate_number, brand: v.brand, capacity: v.capacity }); setShowModal(true) }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'transparent', color: 'var(--color-text)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px', fontWeight: '600', fontSize: '13px'
                }}>
                <Edit2 size={14} /> Edit
              </button>
              <button onClick={() => handleDelete(v.id)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '8px',
                  backgroundColor: '#fee2e2', color: '#ef4444',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '6px', fontWeight: '600', fontSize: '13px'
                }}>
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            backgroundColor: 'var(--color-card)', borderRadius: '20px',
            width: '100%', maxWidth: '400px', padding: '32px',
            margin: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: '700' }}>
                {editVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Nomor Plat *', name: 'plate_number', placeholder: 'B 1234 ABC' },
                { label: 'Merk / Tipe *', name: 'brand', placeholder: 'Mitsubishi Colt Diesel' },
                { label: 'Kapasitas (pcs)', name: 'capacity', placeholder: '1500', type: 'number' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '5px' }}>{f.label}</label>
                  <input type={f.type || 'text'} value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    placeholder={f.placeholder} style={fieldStyle} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '11px', borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                backgroundColor: 'transparent', color: 'var(--color-text)',
                fontWeight: '600', cursor: 'pointer'
              }}>Batal</button>
              <button onClick={handleSave} style={{
                flex: 2, padding: '11px', borderRadius: '8px',
                backgroundColor: 'var(--color-orange)', color: 'white',
                fontWeight: '700', border: 'none', cursor: 'pointer'
              }}>
                {editVehicle ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}