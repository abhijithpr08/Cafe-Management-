import { useEffect, useState } from 'react'
import apiClient from '../../api/apiClient'
import PageTemplate from './PageTemplate'
import { EmptyState, LoadingBlock, formatINR } from './CustomersReportsPages'
import { useAuth } from '../../context/AuthContext'

/** Full Settings (Administrator) */
export const SettingsConfigPage = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [discounts, setDiscounts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [discountForm, setDiscountForm] = useState({ name: '', type: 'Percentage', value: 10, code: '', validTill: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [s, d, n] = await Promise.all([
        apiClient.get('/settings'),
        apiClient.get('/discounts'),
        apiClient.get('/notifications'),
      ])
      setSettings(s.data)
      setDiscounts(d.data)
      setNotifications(n.data)
    } catch {
      setMsg('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    try {
      const { data } = await apiClient.put('/settings', settings)
      setSettings(data)
      setMsg('Settings saved.')
    } catch (err) {
      setMsg(err.response?.data?.message || 'Save failed')
    }
  }

  const onLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSettings((prev) => ({ ...prev, logoUrl: String(reader.result) }))
    }
    reader.readAsDataURL(file)
  }

  const backup = async () => {
    const { data } = await apiClient.get('/settings/backup')
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `restropos-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Backup downloaded. Notification created.')
  }

  const restore = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const json = JSON.parse(text)
    await apiClient.post('/settings/restore', json)
    setMsg('Restore completed (demo).')
    load()
  }

  if (loading) return <PageTemplate title='Settings'><LoadingBlock /></PageTemplate>
  if (!settings) return <PageTemplate title='Settings'><EmptyState message={msg || 'Unable to load'} /></PageTemplate>

  return (
    <PageTemplate title='Settings & Configuration' subtitle='Administrator'>
      {msg && <div className='mb-4 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-800'>{msg}</div>}

      <div className='grid gap-6 lg:grid-cols-2'>
        <section className='rounded-2xl border border-slate-200 bg-white p-5 space-y-3'>
          <h3 className='font-bold text-slate-800'>Business Details</h3>
          {settings.logoUrl && <img src={settings.logoUrl} alt='Logo' className='h-16 w-16 rounded-xl object-cover' />}
          <input type='file' accept='image/*' onChange={onLogoUpload} className='text-sm' />
          <input className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Business name' value={settings.businessName || ''} onChange={(e) => setSettings({ ...settings, businessName: e.target.value })} />
          <textarea className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Address' value={settings.address || ''} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
          <input className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Phone' value={settings.phone || ''} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
          <input className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Email' value={settings.email || ''} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
        </section>

        <section className='rounded-2xl border border-slate-200 bg-white p-5 space-y-3'>
          <h3 className='font-bold text-slate-800'>GST Configuration</h3>
          <input className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='GSTIN' value={settings.gstin || ''} onChange={(e) => setSettings({ ...settings, gstin: e.target.value })} />
          <div className='grid grid-cols-3 gap-2'>
            <input type='number' className='rounded-xl border px-3 py-2 text-sm' placeholder='CGST %' value={settings.cgstPercent ?? 5} onChange={(e) => setSettings({ ...settings, cgstPercent: Number(e.target.value) })} />
            <input type='number' className='rounded-xl border px-3 py-2 text-sm' placeholder='SGST %' value={settings.sgstPercent ?? 5} onChange={(e) => setSettings({ ...settings, sgstPercent: Number(e.target.value) })} />
            <input type='number' className='rounded-xl border px-3 py-2 text-sm' placeholder='GST %' value={settings.gstPercent ?? 10} onChange={(e) => setSettings({ ...settings, gstPercent: Number(e.target.value) })} />
          </div>
        </section>

        <section className='rounded-2xl border border-slate-200 bg-white p-5 space-y-3'>
          <h3 className='font-bold text-slate-800'>Payment Methods</h3>
          {Object.keys(settings.paymentMethods || {}).map((m) => (
            <label key={m} className='flex items-center justify-between text-sm'>
              <span>{m}</span>
              <input
                type='checkbox'
                checked={!!settings.paymentMethods[m]}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    paymentMethods: { ...settings.paymentMethods, [m]: e.target.checked },
                  })
                }
              />
            </label>
          ))}
        </section>

        <section className='rounded-2xl border border-slate-200 bg-white p-5 space-y-3'>
          <h3 className='font-bold text-slate-800'>Printer Settings (UI only)</h3>
          <input className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Kitchen printer name' value={settings.kitchenPrinter?.name || ''} onChange={(e) => setSettings({ ...settings, kitchenPrinter: { ...settings.kitchenPrinter, name: e.target.value } })} />
          <input className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Kitchen printer IP' value={settings.kitchenPrinter?.ip || ''} onChange={(e) => setSettings({ ...settings, kitchenPrinter: { ...settings.kitchenPrinter, ip: e.target.value } })} />
          <input className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Billing printer name' value={settings.billingPrinter?.name || ''} onChange={(e) => setSettings({ ...settings, billingPrinter: { ...settings.billingPrinter, name: e.target.value } })} />
          <input className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Billing printer IP' value={settings.billingPrinter?.ip || ''} onChange={(e) => setSettings({ ...settings, billingPrinter: { ...settings.billingPrinter, ip: e.target.value } })} />
          <button
            type='button'
            className='rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700'
            onClick={async () => {
              await apiClient.post('/settings/simulate-printer-error')
              setMsg('Printer error notification created.')
              load()
            }}
          >
            Simulate Printer Error
          </button>
        </section>
      </div>

      <div className='mt-6 flex flex-wrap gap-3'>
        <button type='button' onClick={save} className='rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white'>Save Settings</button>
        <button type='button' onClick={backup} className='rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white'>Backup Now</button>
        <label className='cursor-pointer rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold'>
          Restore JSON
          <input type='file' accept='application/json' className='hidden' onChange={restore} />
        </label>
        <button
          type='button'
          className='rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold'
          onClick={async () => {
            await apiClient.post('/settings/daily-summary')
            setMsg('Daily sales summary notification generated.')
            load()
          }}
        >
          Generate Daily Sales Summary
        </button>
      </div>

      {/* Keep existing discount + notification quick tools */}
      <div className='mt-8 grid gap-6 lg:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <h3 className='font-bold'>Discounts</h3>
          <div className='mt-3 space-y-2'>
            <input className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Name' value={discountForm.name} onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })} />
            <input className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Code' value={discountForm.code} onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })} />
            <input type='number' className='w-full rounded-xl border px-3 py-2 text-sm' placeholder='Value' value={discountForm.value} onChange={(e) => setDiscountForm({ ...discountForm, value: Number(e.target.value) })} />
            <input type='date' className='w-full rounded-xl border px-3 py-2 text-sm' value={discountForm.validTill} onChange={(e) => setDiscountForm({ ...discountForm, validTill: e.target.value })} />
            <button
              type='button'
              className='rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white'
              onClick={async () => {
                await apiClient.post('/discounts', { ...discountForm, active: true })
                load()
              }}
            >
              Add Discount
            </button>
          </div>
          <ul className='mt-4 space-y-1 text-sm'>
            {discounts.slice(0, 8).map((d) => (
              <li key={d._id}>{d.code} — {d.name} ({d.value}{d.type?.includes('Percent') ? '%' : ''})</li>
            ))}
          </ul>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <h3 className='font-bold'>Recent Notifications</h3>
          <ul className='mt-3 max-h-64 space-y-2 overflow-y-auto text-sm'>
            {notifications.slice(0, 12).map((n) => (
              <li key={n._id} className='rounded-xl bg-slate-50 px-3 py-2'>
                <span className='font-semibold'>{n.type}</span>
                <p>{n.message}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageTemplate>
  )
}

/** Inventory hub: stock + purchases + vendors + adjustments + wastage */
export const InventoryHubPage = () => {
  const [tab, setTab] = useState('stock')
  const [inventory, setInventory] = useState([])
  const [purchases, setPurchases] = useState([])
  const [vendors, setVendors] = useState([])
  const [adjustments, setAdjustments] = useState([])
  const [wastage, setWastage] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const [inv, pur, ven, adj, was] = await Promise.all([
        apiClient.get('/inventory'),
        apiClient.get('/purchases'),
        apiClient.get('/vendors'),
        apiClient.get('/stock-adjustments'),
        apiClient.get('/wastage'),
      ])
      setInventory(inv.data)
      setPurchases(pur.data)
      setVendors(ven.data)
      setAdjustments(adj.data)
      setWastage(was.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const tabs = [
    { id: 'stock', label: 'Stock' },
    { id: 'purchase', label: 'Purchases' },
    { id: 'vendor', label: 'Vendors' },
    { id: 'adjust', label: 'Adjustments' },
    { id: 'wastage', label: 'Wastage' },
  ]

  return (
    <PageTemplate title='Inventory' subtitle='Stock, purchases, vendors, wastage'>
      <div className='mb-4 flex flex-wrap gap-2'>
        {tabs.map((t) => (
          <button key={t.id} type='button' onClick={() => setTab(t.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === t.id ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <LoadingBlock />}

      {!loading && tab === 'stock' && (
        <div className='space-y-4'>
          <form
            className='grid gap-2 rounded-2xl border bg-white p-4 sm:grid-cols-5'
            onSubmit={async (e) => {
              e.preventDefault()
              await apiClient.post('/inventory', form)
              setForm({})
              load()
            }}
          >
            <input required placeholder='Item' className='rounded-xl border px-3 py-2 text-sm' value={form.itemName || ''} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
            <input required placeholder='Unit' className='rounded-xl border px-3 py-2 text-sm' value={form.unit || ''} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            <input required type='number' placeholder='Qty' className='rounded-xl border px-3 py-2 text-sm' value={form.quantity ?? ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <input required type='number' placeholder='Reorder' className='rounded-xl border px-3 py-2 text-sm' value={form.reorderLevel ?? ''} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
            <button className='rounded-xl bg-orange-500 text-sm font-semibold text-white'>Add</button>
          </form>
          {inventory.length === 0 ? <EmptyState message='No inventory items' /> : (
            <div className='overflow-x-auto rounded-2xl border bg-white'>
              <table className='min-w-full text-sm'>
                <thead className='bg-slate-50 text-slate-500'><tr><th className='px-3 py-2 text-left'>Item</th><th className='px-3 py-2'>Qty</th><th className='px-3 py-2'>Reorder</th><th className='px-3 py-2'>Supplier</th></tr></thead>
                <tbody>
                  {inventory.map((i) => (
                    <tr key={i._id} className={`border-t ${i.quantity < i.reorderLevel ? 'bg-red-50' : ''}`}>
                      <td className='px-3 py-2'>{i.itemName}</td>
                      <td className='px-3 py-2 text-center'>{i.quantity} {i.unit}</td>
                      <td className='px-3 py-2 text-center'>{i.reorderLevel}</td>
                      <td className='px-3 py-2 text-center'>{i.supplier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && tab === 'purchase' && (
        <div className='space-y-4'>
          <form
            className='grid gap-2 rounded-2xl border bg-white p-4 sm:grid-cols-3'
            onSubmit={async (e) => {
              e.preventDefault()
              await apiClient.post('/purchases', form)
              setForm({})
              load()
            }}
          >
            <input required placeholder='Item name' className='rounded-xl border px-3 py-2 text-sm' value={form.itemName || ''} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
            <input required type='number' placeholder='Qty' className='rounded-xl border px-3 py-2 text-sm' value={form.quantity ?? ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <input required type='number' placeholder='Cost' className='rounded-xl border px-3 py-2 text-sm' value={form.cost ?? ''} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
            <input required placeholder='Supplier' className='rounded-xl border px-3 py-2 text-sm' value={form.supplier || ''} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
            <input type='date' className='rounded-xl border px-3 py-2 text-sm' value={form.purchaseDate || ''} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
            <button className='rounded-xl bg-orange-500 text-sm font-semibold text-white'>Record Purchase</button>
          </form>
          {purchases.map((p) => (
            <div key={p._id} className='rounded-xl border bg-white px-4 py-3 text-sm'>
              {p.itemName} +{p.quantity} · {formatINR(p.cost)} · {p.supplier} · {new Date(p.purchaseDate).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'vendor' && (
        <div className='space-y-4'>
          <form
            className='grid gap-2 rounded-2xl border bg-white p-4 sm:grid-cols-3'
            onSubmit={async (e) => {
              e.preventDefault()
              await apiClient.post('/vendors', { ...form, itemsSupplied: (form.itemsSupplied || '').split(',').map((s) => s.trim()).filter(Boolean) })
              setForm({})
              load()
            }}
          >
            <input required placeholder='Vendor name' className='rounded-xl border px-3 py-2 text-sm' value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder='Contact' className='rounded-xl border px-3 py-2 text-sm' value={form.contact || ''} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            <input placeholder='Items (comma-separated)' className='rounded-xl border px-3 py-2 text-sm' value={form.itemsSupplied || ''} onChange={(e) => setForm({ ...form, itemsSupplied: e.target.value })} />
            <button className='rounded-xl bg-orange-500 text-sm font-semibold text-white sm:col-span-3'>Add Vendor</button>
          </form>
          {vendors.map((v) => (
            <div key={v._id} className='flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm'>
              <div>
                <p className='font-semibold'>{v.name}</p>
                <p className='text-slate-500'>{v.contact} · {(v.itemsSupplied || []).join(', ')}</p>
              </div>
              <button type='button' className='text-red-500' onClick={async () => { await apiClient.delete(`/vendors/${v._id}`); load() }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'adjust' && (
        <div className='space-y-4'>
          <form
            className='grid gap-2 rounded-2xl border bg-white p-4 sm:grid-cols-4'
            onSubmit={async (e) => {
              e.preventDefault()
              await apiClient.post('/stock-adjustments', form)
              setForm({})
              load()
            }}
          >
            <input required placeholder='Item name' className='rounded-xl border px-3 py-2 text-sm' value={form.itemName || ''} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
            <input required type='number' placeholder='+/- qty' className='rounded-xl border px-3 py-2 text-sm' value={form.adjustment ?? ''} onChange={(e) => setForm({ ...form, adjustment: Number(e.target.value) })} />
            <input required placeholder='Reason (e.g. recount)' className='rounded-xl border px-3 py-2 text-sm' value={form.reason || ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            <button className='rounded-xl bg-orange-500 text-sm font-semibold text-white'>Adjust</button>
          </form>
          {adjustments.map((a) => (
            <div key={a._id} className='rounded-xl border bg-white px-4 py-3 text-sm'>{a.itemName}: {a.adjustment > 0 ? '+' : ''}{a.adjustment} — {a.reason}</div>
          ))}
        </div>
      )}

      {!loading && tab === 'wastage' && (
        <div className='space-y-4'>
          <form
            className='grid gap-2 rounded-2xl border bg-white p-4 sm:grid-cols-4'
            onSubmit={async (e) => {
              e.preventDefault()
              await apiClient.post('/wastage', form)
              setForm({})
              load()
            }}
          >
            <input required placeholder='Item name' className='rounded-xl border px-3 py-2 text-sm' value={form.itemName || ''} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
            <input required type='number' placeholder='Qty wasted' className='rounded-xl border px-3 py-2 text-sm' value={form.quantity ?? ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <input required placeholder='Reason (damaged...)' className='rounded-xl border px-3 py-2 text-sm' value={form.reason || ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            <button className='rounded-xl bg-orange-500 text-sm font-semibold text-white'>Log Wastage</button>
          </form>
          {wastage.map((w) => (
            <div key={w._id} className='rounded-xl border bg-white px-4 py-3 text-sm'>{w.itemName}: −{w.quantity} — {w.reason}</div>
          ))}
        </div>
      )}
    </PageTemplate>
  )
}

/** Employee management with attendance + shifts + profile */
export const EmployeeHubPage = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState('staff')
  const [users, setUsers] = useState([])
  const [attendance, setAttendance] = useState([])
  const [shifts, setShifts] = useState([])
  const [profileId, setProfileId] = useState(null)
  const [form, setForm] = useState({ shift: 'Morning', date: new Date().toISOString().slice(0, 10) })
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Cashier', name: '', email: '', phone: '', status: 'Active' })

  const load = async () => {
    const [u, a, s] = await Promise.all([
      apiClient.get('/users'),
      apiClient.get('/attendance'),
      apiClient.get('/shifts'),
    ])
    setUsers(u.data)
    setAttendance(a.data)
    setShifts(s.data)
  }

  useEffect(() => {
    load()
  }, [])

  const profileUser = users.find((u) => u._id === profileId)
  const profileAttendance = attendance.filter((a) => a.employeeId === profileId)
  const profileShifts = shifts.filter((s) => s.employeeId === profileId)

  return (
    <PageTemplate title='Employee Management' subtitle='Staff, attendance & shifts'>
      <div className='mb-4 flex gap-2'>
        {['staff', 'attendance', 'shifts'].map((t) => (
          <button key={t} type='button' onClick={() => setTab(t)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${tab === t ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}>{t}</button>
        ))}
      </div>

      {tab === 'staff' && (
        <div className='space-y-4'>
          <form
            className='grid gap-2 rounded-2xl border bg-white p-4 md:grid-cols-3'
            onSubmit={async (e) => {
              e.preventDefault()
              await apiClient.post('/users', newUser)
              setNewUser({ username: '', password: '', role: 'Cashier', name: '', email: '', phone: '', status: 'Active' })
              load()
            }}
          >
            {['name', 'username', 'password', 'email', 'phone'].map((f) => (
              <input key={f} required className='rounded-xl border px-3 py-2 text-sm capitalize' placeholder={f} value={newUser[f]} onChange={(e) => setNewUser({ ...newUser, [f]: e.target.value })} />
            ))}
            <select className='rounded-xl border px-3 py-2 text-sm' value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              {['Administrator', 'Manager', 'Cashier', 'Captain', 'Kitchen Staff'].map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className='rounded-xl bg-orange-500 text-sm font-semibold text-white md:col-span-3'>Create Employee</button>
          </form>
          <div className='grid gap-3 md:grid-cols-2'>
            {users.map((u) => (
              <div key={u._id} className='rounded-2xl border bg-white p-4'>
                <div className='flex justify-between'>
                  <div>
                    <p className='font-bold'>{u.name}</p>
                    <p className='text-sm text-slate-500'>{u.role} · {u.phone}</p>
                  </div>
                  <button type='button' className='text-xs font-semibold text-orange-600' onClick={() => setProfileId(u._id)}>Profile</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className='space-y-4'>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              className='rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white'
              onClick={async () => {
                await apiClient.post('/attendance/check-in', { employeeId: user._id || user.id, employeeName: user.name })
                load()
              }}
            >
              Check In (me)
            </button>
            <button
              type='button'
              className='rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white'
              onClick={async () => {
                await apiClient.post('/attendance/check-out', { employeeId: user._id || user.id })
                load()
              }}
            >
              Check Out (me)
            </button>
          </div>
          {attendance.map((a) => (
            <div key={a._id} className='rounded-xl border bg-white px-4 py-3 text-sm'>
              {a.employeeName} · {a.date} · In: {a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '—'} · Out: {a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '—'}
            </div>
          ))}
        </div>
      )}

      {tab === 'shifts' && (
        <div className='space-y-4'>
          <form
            className='grid gap-2 rounded-2xl border bg-white p-4 sm:grid-cols-4'
            onSubmit={async (e) => {
              e.preventDefault()
              const emp = users.find((u) => u._id === form.employeeId)
              await apiClient.post('/shifts', { ...form, employeeName: emp?.name || 'Staff' })
              load()
            }}
          >
            <select required className='rounded-xl border px-3 py-2 text-sm' value={form.employeeId || ''} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
              <option value=''>Employee</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input type='date' className='rounded-xl border px-3 py-2 text-sm' value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <select className='rounded-xl border px-3 py-2 text-sm' value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>
              {['Morning', 'Afternoon', 'Evening', 'Night'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className='rounded-xl bg-orange-500 text-sm font-semibold text-white'>Assign Shift</button>
          </form>
          {shifts.map((s) => (
            <div key={s._id} className='flex justify-between rounded-xl border bg-white px-4 py-3 text-sm'>
              <span>{s.employeeName} · {s.date} · {s.shift}</span>
              <button type='button' className='text-red-500' onClick={async () => { await apiClient.delete(`/shifts/${s._id}`); load() }}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {profileUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6'>
            <div className='flex justify-between'><h3 className='text-xl font-bold'>{profileUser.name}</h3><button type='button' onClick={() => setProfileId(null)}>×</button></div>
            <p className='text-sm text-slate-500'>{profileUser.role} · {profileUser.email} · {profileUser.phone}</p>
            <h4 className='mt-4 font-semibold'>Attendance</h4>
            <ul className='mt-2 space-y-1 text-sm'>{profileAttendance.slice(0, 10).map((a) => <li key={a._id}>{a.date}: {a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '—'}</li>)}</ul>
            <h4 className='mt-4 font-semibold'>Shifts</h4>
            <ul className='mt-2 space-y-1 text-sm'>{profileShifts.slice(0, 10).map((s) => <li key={s._id}>{s.date} — {s.shift}</li>)}</ul>
          </div>
        </div>
      )}
    </PageTemplate>
  )
}
