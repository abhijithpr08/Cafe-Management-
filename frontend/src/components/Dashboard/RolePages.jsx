import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import apiClient from '../../api/apiClient'
import PageTemplate from './PageTemplate'
import PaymentModal from '../CustomerOrder/PaymentModal'
import {
  buildEmailBillText,
  buildSmsBillText,
  buildWhatsAppBillLink,
  downloadBillPDF,
  formatINR,
} from '../../utils/exportHelpers'
import { useAuth } from '../../context/AuthContext'

const formatCurrency = formatINR

const statusClasses = {
  Available: 'bg-emerald-100 text-emerald-700',
  Occupied: 'bg-amber-100 text-amber-700',
  Reserved: 'bg-sky-100 text-sky-700',
  Preparing: 'bg-orange-100 text-orange-700',
  Ready: 'bg-cyan-100 text-cyan-700',
  Served: 'bg-violet-100 text-violet-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
}

const EmptyState = ({ message }) => (
  <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500'>
    {message}
  </div>
)

export const DashboardOverviewPage = () => {
  const [summary, setSummary] = useState({})
  const [reports, setReports] = useState({
    salesByDate: [],
    topItems: [],
    tableRevenue: [],
    peakHours: [],
    paymentMethods: [],
  })
  const [notifications, setNotifications] = useState([])
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [reportRes, notificationRes] = await Promise.all([
          apiClient.get('/reports', { params: { days } }),
          apiClient.get('/notifications'),
        ])
        setSummary(reportRes.data.summary || {})
        setReports(reportRes.data)
        setNotifications(notificationRes.data || [])
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [days])

  const pieData = useMemo(
    () =>
      (reports.topItems || []).slice(0, 5).map((item, index) => ({
        ...item,
        fill: ['#f97316', '#f59e0b', '#fb7185', '#34d399', '#60a5fa'][index % 5],
      })),
    [reports.topItems]
  )

  if (loading) {
    return (
      <PageTemplate title='Dashboard Overview' subtitle='Live'>
        <div className='flex justify-center py-16'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500' />
        </div>
      </PageTemplate>
    )
  }

  return (
    <PageTemplate title='Dashboard Overview' subtitle='Business analytics'>
      {error && <div className='mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600'>{error}</div>}

      <div className='mb-4 flex gap-2'>
        {[7, 30].map((d) => (
          <button
            key={d}
            type='button'
            onClick={() => setDays(d)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${days === d ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}
          >
            Last {d} days
          </button>
        ))}
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          { label: "Today's Sales", value: formatCurrency(summary.todaySales) },
          { label: 'Weekly Revenue', value: formatCurrency(summary.weeklyRevenue) },
          { label: 'Monthly Revenue', value: formatCurrency(summary.monthlyRevenue) },
          { label: 'Avg Order Value', value: formatCurrency(summary.averageOrderValue) },
          { label: 'Order Count', value: summary.totalOrders ?? 0 },
          { label: "Today's Orders", value: summary.todayOrders ?? 0 },
          { label: 'GST Collected', value: formatCurrency(summary.gstCollected) },
          { label: 'Active Tables', value: summary.activeTables ?? 0 },
        ].map((card) => (
          <div key={card.label} className='rounded-2xl bg-slate-100 p-5'>
            <p className='text-sm text-slate-500'>{card.label}</p>
            <h3 className='mt-2 text-2xl font-bold text-slate-900'>{card.value}</h3>
          </div>
        ))}
      </div>

      <div className='mt-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Sales trend</h3>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={reports.salesByDate || []}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                <XAxis dataKey='_id' stroke='#64748b' />
                <YAxis stroke='#64748b' />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type='monotone' dataKey='total' stroke='#f97316' strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Best selling (Top 5)</h3>
          <div className='h-72'>
            {(reports.topItems || []).length === 0 ? (
              <EmptyState message='No sales data yet' />
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie data={pieData} dataKey='totalQty' nameKey='_id' innerRadius={48} outerRadius={90} paddingAngle={2}>
                    {pieData.map((entry) => (
                      <Cell key={entry._id} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className='mt-8 grid gap-6 lg:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold'>Peak business hours</h3>
          <div className='h-56'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={reports.peakHours || []}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='label' />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey='count' fill='#fb923c' radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold'>Payment method summary</h3>
          <div className='space-y-2'>
            {(reports.paymentMethods || []).length === 0 && <EmptyState message='No payments yet' />}
            {(reports.paymentMethods || []).map((p) => (
              <div key={p._id} className='flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm'>
                <span>{p._id}</span>
                <span className='font-semibold'>{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
          <div className='mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800'>
            GST: CGST {formatCurrency(summary.cgstCollected)} · SGST {formatCurrency(summary.sgstCollected)}
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold'>Recent alerts</h3>
          <div className='space-y-3 max-h-56 overflow-y-auto'>
            {notifications.slice(0, 8).map((item) => (
              <div key={item._id} className='rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600'>
                <span className='font-semibold text-slate-700'>{item.type}</span>
                <p className='mt-1'>{item.message}</p>
              </div>
            ))}
            {!notifications.length && <EmptyState message='No notifications' />}
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}


export const BillingPage = () => {
  const { user } = useAuth()
  const [menu, setMenu] = useState({ items: [], categories: [] })
  const [tables, setTables] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [table, setTable] = useState('T1')
  const [waiter, setWaiter] = useState('')
  const [orderType, setOrderType] = useState('Dine-in')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [complimentaryReason, setComplimentaryReason] = useState('')
  const [barcode, setBarcode] = useState('')
  const [pastOrders, setPastOrders] = useState([])
  const [payOrder, setPayOrder] = useState(null)
  const [ebillOrder, setEbillOrder] = useState(null)
  const [ebillSim, setEbillSim] = useState('')
  const [splitPeople, setSplitPeople] = useState(2)
  const canComp = ['Administrator', 'Manager'].includes(user?.role)

  const loadData = async () => {
    const [menuRes, tableRes, ordersRes] = await Promise.all([
      apiClient.get('/menu'),
      apiClient.get('/tables'),
      apiClient.get('/orders'),
    ])
    setMenu(menuRes.data)
    setTables(tableRes.data)
    setPastOrders((ordersRes.data || []).filter((o) => o.paymentStatus === 'Paid' || o.status === 'Completed'))
  }

  useEffect(() => {
    loadData()
  }, [])

  const addItem = (item) => {
    if (item.available === false) return
    setOrderItems((prev) => {
      const existing = prev.find((entry) => entry.name === item.name)
      if (existing) {
        return prev.map((entry) =>
          entry.name === item.name ? { ...entry, qty: entry.qty + 1 } : entry
        )
      }
      return [...prev, { name: item.name, qty: 1, price: Number(item.price), sku: item.sku || '' }]
    })
  }

  const lookupBarcode = () => {
    const code = barcode.trim().toLowerCase()
    if (!code) return
    const item = (menu.items || []).find(
      (i) =>
        i.sku?.toLowerCase() === code ||
        i.name.toLowerCase() === code ||
        i.name.toLowerCase().includes(code)
    )
    if (!item) {
      alert('No menu item matched that code/name.')
      return
    }
    addItem(item)
    setBarcode('')
  }

  const updateQty = (name, qty) => {
    setOrderItems((prev) =>
      prev
        .map((entry) => (entry.name === name ? { ...entry, qty: Math.max(0, qty) } : entry))
        .filter((entry) => entry.qty > 0)
    )
  }

  const total = useMemo(
    () => (orderType === 'Complimentary' ? 0 : orderItems.reduce((sum, item) => sum + item.qty * item.price, 0)),
    [orderItems, orderType]
  )

  const handleCreateOrder = async (andPay = false) => {
    if (!orderItems.length) {
      alert('Add at least one item.')
      return
    }
    if (!waiter.trim()) {
      alert('Waiter / cashier name is required.')
      return
    }
    if (orderType === 'Dine-in' && !table) {
      alert('Select a table for dine-in.')
      return
    }
    if ((orderType === 'Takeaway' || orderType === 'Delivery') && !customerPhone) {
      alert('Customer phone is required.')
      return
    }
    if (orderType === 'Delivery' && !customerAddress) {
      alert('Delivery address is required.')
      return
    }
    if (orderType === 'Complimentary') {
      if (!canComp) {
        alert('Only Administrator/Manager can create complimentary orders.')
        return
      }
      if (!complimentaryReason.trim()) {
        alert('Complimentary reason is required.')
        return
      }
    }

    try {
      const { data } = await apiClient.post('/orders', {
        orderId: `ORD${Date.now()}`,
        table: orderType === 'Dine-in' ? table : undefined,
        waiter: waiter.trim(),
        items: orderItems.map((item) => ({ name: item.name, qty: item.qty, price: item.price, sku: item.sku })),
        total,
        subtotal: total,
        status: 'Preparing',
        orderType,
        customerName,
        customerPhone,
        customerMobile: customerPhone,
        customerAddress,
        complimentaryReason,
        orderSource: 'POS',
      })

      setOrderItems([])
      setCustomerName('')
      setCustomerPhone('')
      setCustomerAddress('')
      setComplimentaryReason('')
      loadData()

      if (andPay && orderType !== 'Complimentary') {
        setPayOrder(data)
      } else {
        alert(`Order ${data.orderId} created.`)
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create order')
    }
  }

  const quickBill = async () => {
    if (orderItems.length !== 1 || orderItems[0].qty !== 1) {
      alert('Quick Bill works with a single item (qty 1). Add one item first.')
      return
    }
    if (!waiter.trim()) setWaiter(user?.name || 'Cashier')
    await handleCreateOrder(true)
  }

  return (
    <PageTemplate title='Billing' subtitle='POS · Order types · Quick bill · Reprint'>
      <div className='mb-4 flex flex-wrap gap-2'>
        {['Dine-in', 'Takeaway', 'Delivery', ...(canComp ? ['Complimentary'] : [])].map((t) => (
          <button
            key={t}
            type='button'
            onClick={() => setOrderType(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${orderType === t ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <div className='mb-4 flex gap-2'>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookupBarcode()}
              placeholder='Scan / type barcode, SKU, or item name'
              className='flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm'
            />
            <button type='button' onClick={lookupBarcode} className='rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white'>
              Add
            </button>
          </div>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Menu</h3>
          <div className='grid max-h-[28rem] gap-3 overflow-y-auto md:grid-cols-2'>
            {(menu.items || []).map((item) => (
              <button
                type='button'
                key={item._id}
                disabled={item.available === false}
                onClick={() => addItem(item)}
                className={`rounded-2xl border p-4 text-left transition ${
                  item.available === false
                    ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-50'
                    : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='font-semibold text-slate-800'>{item.name}</p>
                    <p className='mt-1 text-xs text-slate-500'>{item.category}{item.sku ? ` · ${item.sku}` : ''}</p>
                  </div>
                  <span className='rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700'>
                    {formatCurrency(item.price)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Current bill ({orderType})</h3>
          <div className='space-y-3'>
            {orderType === 'Dine-in' && (
              <select value={table} onChange={(e) => setTable(e.target.value)} className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm'>
                {(tables || []).map((item) => (
                  <option key={item._id} value={item.tableNumber}>
                    {item.tableNumber} ({item.status})
                  </option>
                ))}
              </select>
            )}
            <input value={waiter} onChange={(e) => setWaiter(e.target.value)} placeholder='Waiter / cashier name' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' />

            {(orderType === 'Takeaway' || orderType === 'Delivery' || orderType === 'Complimentary') && (
              <>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder='Customer name' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' />
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder='Customer phone' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' />
              </>
            )}
            {orderType === 'Delivery' && (
              <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder='Delivery address' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' />
            )}
            {orderType === 'Complimentary' && (
              <input value={complimentaryReason} onChange={(e) => setComplimentaryReason(e.target.value)} placeholder='Complimentary reason' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' />
            )}

            <div className='space-y-2 max-h-48 overflow-y-auto'>
              {orderItems.length ? (
                orderItems.map((item) => (
                  <div key={item.name} className='flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-2'>
                    <div>
                      <p className='font-medium text-slate-700'>{item.name}</p>
                      <p className='text-xs text-slate-500'>{formatCurrency(item.price)} each</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button type='button' onClick={() => updateQty(item.name, item.qty - 1)} className='h-8 w-8 rounded-full bg-slate-200'>-</button>
                      <span className='w-5 text-center text-sm font-semibold'>{item.qty}</span>
                      <button type='button' onClick={() => updateQty(item.name, item.qty + 1)} className='h-8 w-8 rounded-full bg-slate-200'>+</button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message='No items added yet.' />
              )}
            </div>

            <div className='rounded-xl bg-slate-100 p-3'>
              <div className='flex items-center justify-between text-sm text-slate-600'>
                <span>Total</span>
                <span className='text-lg font-bold text-slate-900'>{formatCurrency(total)}</span>
              </div>
              {orderItems.length > 0 && (
                <p className='mt-2 text-xs text-slate-500'>
                  Split equally ({splitPeople} people): {formatCurrency(total / Math.max(1, splitPeople))} each
                  <input type='number' min={2} max={10} value={splitPeople} onChange={(e) => setSplitPeople(Number(e.target.value))} className='ml-2 w-14 rounded border px-1' />
                </p>
              )}
            </div>

            <button type='button' onClick={() => handleCreateOrder(false)} className='w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-500'>
              Create Order
            </button>
            <button type='button' onClick={() => handleCreateOrder(true)} className='w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white'>
              Create & Pay (Split/Methods)
            </button>
            <button type='button' onClick={quickBill} className='w-full rounded-full border border-orange-300 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700'>
              Quick Bill (1 item)
            </button>
          </div>
        </div>
      </div>

      <div className='mt-8 rounded-2xl border border-slate-200 bg-white p-4'>
        <h3 className='mb-3 text-lg font-semibold'>Bill reprint · E-bill delivery</h3>
        <div className='space-y-2 max-h-64 overflow-y-auto'>
          {pastOrders.slice(0, 15).map((o) => (
            <div key={o._id} className='flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm'>
              <span>{o.orderId} · {o.table} · {formatCurrency(o.total)}</span>
              <div className='flex flex-wrap gap-2'>
                <button type='button' className='text-xs font-semibold text-orange-600' onClick={() => downloadBillPDF(o)}>PDF</button>
                <button type='button' className='text-xs font-semibold text-slate-700' onClick={() => { window.print(); setEbillOrder(o) }}>Reprint</button>
                <button type='button' className='text-xs font-semibold text-emerald-600' onClick={() => {
                  const phone = o.customerPhone || o.customerMobile || prompt('WhatsApp number (10 digits)')
                  if (phone) window.open(buildWhatsAppBillLink(phone, o), '_blank')
                }}>WhatsApp</button>
                <button type='button' className='text-xs font-semibold text-sky-600' onClick={() => setEbillSim(buildSmsBillText(o))}>SMS</button>
                <button type='button' className='text-xs font-semibold text-violet-600' onClick={() => {
                  const e = buildEmailBillText(o)
                  setEbillSim(`Subject: ${e.subject}\n\n${e.body}`)
                }}>Email</button>
                {o.paymentStatus !== 'Paid' && (
                  <button type='button' className='text-xs font-semibold text-orange-700' onClick={() => setPayOrder(o)}>Pay</button>
                )}
              </div>
            </div>
          ))}
          {!pastOrders.length && <EmptyState message='No completed bills yet.' />}
        </div>
        {ebillSim && (
          <pre className='mt-3 whitespace-pre-wrap rounded-xl bg-slate-900 p-3 text-xs text-green-300'>
            {ebillSim}
            {'\n\n'}(Simulated — no real SMS/email sent)
          </pre>
        )}
      </div>

      <PaymentModal
        isOpen={!!payOrder}
        onClose={() => setPayOrder(null)}
        order={payOrder}
        onPaymentSuccess={(updated) => {
          setPayOrder(null)
          setEbillOrder(updated)
          loadData()
          alert('Payment successful. Use e-bill options below to share the receipt.')
        }}
      />
    </PageTemplate>
  )
}

export const OrdersPage = () => {
  const [orders, setOrders] = useState([])

  const fetchOrders = async () => {
    const { data } = await apiClient.get('/orders')
    setOrders(data)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id, status) => {
    await apiClient.put(`/orders/${id}`, { status })
    fetchOrders()
  }

  return (
    <PageTemplate title='Orders' subtitle='Sales'>
      <div className='space-y-4'>
        {orders.length ? (
          orders.map((order) => (
            <div key={order._id} className='rounded-2xl border border-slate-200 bg-white p-4'>
              <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                  <p className='text-sm text-slate-500'>Order ID</p>
                  <h4 className='text-xl font-bold text-slate-800'>{order.orderId}</h4>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'>Table {order.table}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[order.status] || 'bg-slate-100 text-slate-700'}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className='mt-4 grid gap-3 md:grid-cols-2'>
                <div>
                  <p className='text-sm text-slate-500'>Items</p>
                  <ul className='mt-2 space-y-1 text-sm text-slate-700'>
                    {(order.items || []).map((item) => (
                      <li key={`${order._id}-${item.name}`}>
                        {item.name} x {item.qty}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className='text-sm text-slate-500'>Total</p>
                  <p className='mt-2 text-2xl font-bold text-slate-900'>{formatCurrency(order.total)}</p>
                  <div className='mt-3 flex items-center gap-2'>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className='rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm'
                    >
                      <option value='Preparing'>Preparing</option>
                      <option value='Ready'>Ready</option>
                      <option value='Served'>Served</option>
                      <option value='Completed'>Completed</option>
                      <option value='Cancelled'>Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState message='No orders have been created yet.' />
        )}
      </div>
    </PageTemplate>
  )
}

export const InventoryPage = () => {
  const [inventory, setInventory] = useState([])
  const [form, setForm] = useState({ itemName: '', unit: 'kg', quantity: 0, reorderLevel: 0, supplier: '' })

  const fetchInventory = async () => {
    const { data } = await apiClient.get('/inventory')
    setInventory(data)
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiClient.post('/inventory', form)
      setForm({ itemName: '', unit: 'kg', quantity: 0, reorderLevel: 0, supplier: '' })
      fetchInventory()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add inventory item')
    }
  }

  const updateQty = async (id, quantity) => {
    await apiClient.put(`/inventory/${id}`, { quantity })
    fetchInventory()
  }

  return (
    <PageTemplate title='Inventory' subtitle='Stock'>
      <div className='grid gap-6 xl:grid-cols-[0.8fr_1.2fr]'>
        <form onSubmit={handleSubmit} className='space-y-4 rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='text-lg font-semibold text-slate-800'>Add inventory</h3>
          <input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder='Item name' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder='Unit' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <input type='number' value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} placeholder='Quantity' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <input type='number' value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} placeholder='Reorder level' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder='Supplier' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <button type='submit' className='w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white'>Save item</button>
        </form>

        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Stock overview</h3>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-slate-200 text-slate-500'>
                  <th className='py-3 pr-4'>Item</th>
                  <th className='py-3 pr-4'>Qty</th>
                  <th className='py-3 pr-4'>Reorder</th>
                  <th className='py-3 pr-4'>Supplier</th>
                  <th className='py-3 pr-4'>Action</th>
                </tr>
              </thead>
              <tbody>
                {(inventory || []).map((item) => (
                  <tr key={item._id} className='border-b border-slate-100'>
                    <td className='py-3 pr-4'>{item.itemName}</td>
                    <td className='py-3 pr-4'>{item.quantity} {item.unit}</td>
                    <td className='py-3 pr-4'>{item.reorderLevel}</td>
                    <td className='py-3 pr-4'>{item.supplier}</td>
                    <td className='py-3 pr-4'>
                      <button type='button' onClick={() => updateQty(item._id, item.quantity + 1)} className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold'>+1</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}

export const ReportsPage = () => {
  const [reports, setReports] = useState({ summary: {}, salesByDate: [], topItems: [], tableRevenue: [] })

  useEffect(() => {
    apiClient.get('/reports').then(({ data }) => setReports(data)).catch(console.error)
  }, [])

  const pieData = useMemo(
    () => (reports.topItems || []).slice(0, 5).map((item, index) => ({ ...item, fill: ['#f97316', '#f59e0b', '#ef4444', '#38bdf8', '#34d399'][index % 5] })),
    [reports.topItems]
  )

  return (
    <PageTemplate title='Reports' subtitle='Analytics'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <div className='rounded-2xl bg-slate-100 p-5'>
          <p className='text-sm text-slate-500'>Today sales</p>
          <h3 className='mt-2 text-3xl font-bold text-slate-900'>{formatCurrency(reports.summary.todaySales)}</h3>
        </div>
        <div className='rounded-2xl bg-slate-100 p-5'>
          <p className='text-sm text-slate-500'>Total orders</p>
          <h3 className='mt-2 text-3xl font-bold text-slate-900'>{reports.summary.totalOrders || 0}</h3>
        </div>
        <div className='rounded-2xl bg-slate-100 p-5'>
          <p className='text-sm text-slate-500'>Active tables</p>
          <h3 className='mt-2 text-3xl font-bold text-slate-900'>{reports.summary.activeTables || 0}</h3>
        </div>
        <div className='rounded-2xl bg-slate-100 p-5'>
          <p className='text-sm text-slate-500'>Low stock</p>
          <h3 className='mt-2 text-3xl font-bold text-slate-900'>{reports.summary.lowStockAlerts || 0}</h3>
        </div>
      </div>

      <div className='mt-8 grid gap-6 xl:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Daily sales</h3>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={reports.salesByDate || []}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                <XAxis dataKey='_id' stroke='#64748b' />
                <YAxis stroke='#64748b' />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey='total' fill='#f97316' radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Popular items</h3>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie data={pieData} dataKey='totalQty' nameKey='_id' innerRadius={45} outerRadius={90}>
                  {pieData.map((entry) => (
                    <Cell key={entry._id} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}

export const EmployeeManagementPage = () => {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: '', password: '', role: 'Manager', name: '', email: '', phone: '', status: 'Active' })

  const fetchUsers = async () => {
    const { data } = await apiClient.get('/users')
    setUsers(data)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiClient.post('/users', form)
      setForm({ username: '', password: '', role: 'Manager', name: '', email: '', phone: '', status: 'Active' })
      fetchUsers()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create employee')
    }
  }

  return (
    <PageTemplate title='Employee Management' subtitle='Team'>
      <div className='grid gap-6 xl:grid-cols-[0.9fr_1.1fr]'>
        <form onSubmit={handleSubmit} className='space-y-3 rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='text-lg font-semibold text-slate-800'>Add employee</h3>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder='Full name' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder='Username' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <input type='password' value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder='Password' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm'>
            <option>Administrator</option>
            <option>Manager</option>
            <option>Cashier</option>
            <option>Captain</option>
            <option>Kitchen Staff</option>
          </select>
          <input type='email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder='Email' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder='Phone' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <button type='submit' className='w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-500'>Create Employee</button>
        </form>

        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Staff list</h3>
          <div className='space-y-3'>
            {(users || []).map((user) => (
              <div key={user._id} className='flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 md:flex-row md:items-center md:justify-between'>
                <div>
                  <p className='font-semibold text-slate-800'>{user.name}</p>
                  <p className='text-sm text-slate-500'>{user.role} • {user.email}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}

export const KitchenOrdersPage = () => {
  const [orders, setOrders] = useState([])

  const fetchOrders = async () => {
    const { data } = await apiClient.get('/orders')
    setOrders(data.filter((order) => ['Preparing', 'Ready'].includes(order.status)))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id, status) => {
    await apiClient.put(`/orders/${id}`, { status })
    fetchOrders()
  }

  return (
    <PageTemplate title='Kitchen Orders' subtitle='Prep'>
      <div className='space-y-4'>
        {(orders || []).map((order) => (
          <div key={order._id} className='rounded-2xl border border-slate-200 bg-white p-4'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm text-slate-500'>Table {order.table}</p>
                <h4 className='text-xl font-bold text-slate-800'>{order.orderId}</h4>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[order.status] || 'bg-slate-100 text-slate-700'}`}>
                {order.status}
              </span>
            </div>

            <ul className='mt-3 space-y-1 text-sm text-slate-600'>
              {(order.items || []).map((item) => (
                <li key={`${order._id}-${item.name}`}>
                  {item.name} x {item.qty}
                </li>
              ))}
            </ul>

            <div className='mt-4 flex gap-2'>
              <button type='button' onClick={() => updateStatus(order._id, 'Ready')} className='rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white'>Mark Ready</button>
              <button type='button' onClick={() => updateStatus(order._id, 'Completed')} className='rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white'>Complete</button>
            </div>
          </div>
        ))}
      </div>
    </PageTemplate>
  )
}

export const SettingsPage = () => {
  const [discounts, setDiscounts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [discountForm, setDiscountForm] = useState({ name: '', type: 'Percentage', value: 0, code: '', validTill: '', active: true })
  const [noticeForm, setNoticeForm] = useState({ type: 'System Notice', message: '' })

  const loadData = async () => {
    const [discountRes, notificationRes] = await Promise.all([apiClient.get('/discounts'), apiClient.get('/notifications')])
    setDiscounts(discountRes.data)
    setNotifications(notificationRes.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const createDiscount = async (e) => {
    e.preventDefault()
    await apiClient.post('/discounts', discountForm)
    setDiscountForm({ name: '', type: 'Percentage', value: 0, code: '', validTill: '', active: true })
    loadData()
  }

  const createNotice = async (e) => {
    e.preventDefault()
    await apiClient.post('/notifications', noticeForm)
    setNoticeForm({ type: 'System Notice', message: '' })
    loadData()
  }

  return (
    <PageTemplate title='Settings' subtitle='Config'>
      <div className='grid gap-6 xl:grid-cols-2'>
        <form onSubmit={createDiscount} className='space-y-3 rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='text-lg font-semibold text-slate-800'>Discounts</h3>
          <input value={discountForm.name} onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })} placeholder='Discount name' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <select value={discountForm.type} onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })} className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm'>
            <option>Percentage</option>
            <option>Flat</option>
            <option>Happy Hour</option>
            <option>Combo</option>
          </select>
          <input type='number' value={discountForm.value} onChange={(e) => setDiscountForm({ ...discountForm, value: Number(e.target.value) })} placeholder='Value' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <input value={discountForm.code} onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })} placeholder='Code' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <input type='date' value={discountForm.validTill} onChange={(e) => setDiscountForm({ ...discountForm, validTill: e.target.value })} className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <button type='submit' className='w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white'>Add discount</button>
        </form>

        <form onSubmit={createNotice} className='space-y-3 rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='text-lg font-semibold text-slate-800'>Notification</h3>
          <input value={noticeForm.type} onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value })} placeholder='Type' className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <textarea value={noticeForm.message} onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })} placeholder='Notification text' className='min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm' required />
          <button type='submit' className='w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-500'>Send alert</button>
        </form>
      </div>

      <div className='mt-8 grid gap-4 lg:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Active offers</h3>
          <div className='space-y-2'>
            {(discounts || []).map((item) => (
              <div key={item._id} className='flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2'>
                <div>
                  <p className='font-medium text-slate-700'>{item.name}</p>
                  <p className='text-xs text-slate-500'>{item.code}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {item.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>System alerts</h3>
          <div className='space-y-2'>
            {(notifications || []).slice(0, 6).map((item) => (
              <div key={item._id} className='rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600'>
                <span className='font-semibold text-slate-700'>{item.type}</span>
                <p className='mt-1'>{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}

export const UserManagementPage = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    apiClient.get('/users').then(({ data }) => setUsers(data)).catch(console.error)
  }, [])

  return (
    <PageTemplate title='User Management' subtitle='Access'>
      <div className='rounded-2xl border border-slate-200 bg-white p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-slate-800'>Access roles</h3>
          <span className='rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700'>{users.length} users</span>
        </div>

        <div className='space-y-3'>
          {(users || []).map((user) => (
            <div key={user._id} className='flex flex-col gap-3 rounded-2xl bg-slate-50 p-3 md:flex-row md:items-center md:justify-between'>
              <div>
                <p className='font-semibold text-slate-800'>{user.name}</p>
                <p className='text-sm text-slate-500'>{user.username} • {user.role}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                {user.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageTemplate>
  )
}

export const PaymentsPage = () => {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    apiClient.get('/orders').then(({ data }) => setOrders(data)).catch(console.error)
  }, [])

  const total = useMemo(() => orders.reduce((sum, item) => sum + Number(item.total || 0), 0), [orders])

  return (
    <PageTemplate title='Payments' subtitle='Checkout'>
      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-2xl bg-slate-100 p-5'>
          <p className='text-sm text-slate-500'>Collected</p>
          <h3 className='mt-2 text-3xl font-bold text-slate-900'>{formatCurrency(total)}</h3>
        </div>
        <div className='rounded-2xl bg-slate-100 p-5'>
          <p className='text-sm text-slate-500'>Orders</p>
          <h3 className='mt-2 text-3xl font-bold text-slate-900'>{orders.length}</h3>
        </div>
        <div className='rounded-2xl bg-slate-100 p-5'>
          <p className='text-sm text-slate-500'>Pending</p>
          <h3 className='mt-2 text-3xl font-bold text-slate-900'>{orders.filter((order) => order.status !== 'Completed').length}</h3>
        </div>
      </div>

      <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-4'>
        <h3 className='mb-4 text-lg font-semibold text-slate-800'>Payment ledger</h3>
        <div className='space-y-3'>
          {(orders || []).map((order) => (
            <div key={order._id} className='flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2'>
              <div>
                <p className='font-medium text-slate-700'>{order.orderId}</p>
                <p className='text-xs text-slate-500'>Table {order.table}</p>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-slate-800'>{formatCurrency(order.total)}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClasses[order.status] || 'bg-slate-100 text-slate-700'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTemplate>
  )
}

export const OrderManagementPage = () => {
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const load = async () => {
      const [tableRes, orderRes] = await Promise.all([apiClient.get('/tables'), apiClient.get('/orders')])
      setTables(tableRes.data)
      setOrders(orderRes.data)
    }
    load()
  }, [])

  const updateTable = async (id, status) => {
    await apiClient.put(`/tables/${id}`, { status })
    const [tableRes, orderRes] = await Promise.all([apiClient.get('/tables'), apiClient.get('/orders')])
    setTables(tableRes.data)
    setOrders(orderRes.data)
  }

  return (
    <PageTemplate title='Order Management' subtitle='Service'>
      <div className='grid gap-6 xl:grid-cols-[0.9fr_1.1fr]'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Table status</h3>
          <div className='grid gap-3 sm:grid-cols-2'>
            {(tables || []).map((table) => (
              <div key={table._id} className='rounded-2xl bg-slate-50 p-3'>
                <div className='flex items-center justify-between'>
                  <p className='font-semibold text-slate-800'>{table.tableNumber}</p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClasses[table.status] || 'bg-slate-100 text-slate-700'}`}>
                    {table.status}
                  </span>
                </div>
                <p className='mt-2 text-xs text-slate-500'>Floor: {table.floor}</p>
                <select value={table.status} onChange={(e) => updateTable(table._id, e.target.value)} className='mt-3 w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm'>
                  <option value='Available'>Available</option>
                  <option value='Occupied'>Occupied</option>
                  <option value='Reserved'>Reserved</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-slate-800'>Service queue</h3>
          <div className='space-y-3'>
            {(orders || []).map((order) => (
              <div key={order._id} className='rounded-xl bg-slate-50 p-3'>
                <div className='flex items-center justify-between'>
                  <p className='font-semibold text-slate-800'>{order.orderId}</p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClasses[order.status] || 'bg-slate-100 text-slate-700'}`}>{order.status}</span>
                </div>
                <p className='mt-1 text-sm text-slate-500'>Table {order.table} • {order.waiter}</p>
                <p className='mt-2 text-sm text-slate-600'>{(order.items || []).map((item) => `${item.name} x ${item.qty}`).join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}

export const TableManagementPage = () => {
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [expandedQr, setExpandedQr] = useState(null)
  const [reserveForm, setReserveForm] = useState({})
  const [mergePrimary, setMergePrimary] = useState('')
  const [mergeSecondary, setMergeSecondary] = useState('')
  const [transferFrom, setTransferFrom] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [transferOrderId, setTransferOrderId] = useState('')
  const [splitOrderId, setSplitOrderId] = useState('')

  const orderBaseUrl = typeof window !== 'undefined' ? `${window.location.origin}/order` : '/order'

  const load = async () => {
    const [t, o] = await Promise.all([apiClient.get('/tables'), apiClient.get('/orders')])
    setTables(t.data)
    setOrders((o.data || []).filter((ord) => !['Completed', 'Cancelled'].includes(ord.status)))
  }

  useEffect(() => {
    load()
  }, [])

  const updateTable = async (id, status) => {
    await apiClient.put(`/tables/${id}`, { status })
    load()
  }

  const getTableOrderUrl = (tableNumber) => `${orderBaseUrl}?table=${encodeURIComponent(tableNumber)}`

  return (
    <PageTemplate title='Table Management' subtitle='QR · Reserve · Merge · Transfer · Split'>
      <div className='mb-6 grid gap-4 lg:grid-cols-2'>
        <div className='rounded-2xl border bg-white p-4 space-y-2'>
          <h3 className='font-semibold'>Merge tables</h3>
          <select className='w-full rounded-xl border px-3 py-2 text-sm' value={mergePrimary} onChange={(e) => setMergePrimary(e.target.value)}>
            <option value=''>Primary table</option>
            {tables.map((t) => <option key={t._id} value={t.tableNumber}>{t.tableNumber}</option>)}
          </select>
          <select className='w-full rounded-xl border px-3 py-2 text-sm' value={mergeSecondary} onChange={(e) => setMergeSecondary(e.target.value)}>
            <option value=''>Secondary table</option>
            {tables.map((t) => <option key={t._id} value={t.tableNumber}>{t.tableNumber}</option>)}
          </select>
          <button
            type='button'
            className='rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white'
            onClick={async () => {
              const active = orders.find((o) => o.table === mergePrimary)
              await apiClient.post('/tables/merge', {
                primaryTable: mergePrimary,
                secondaryTables: [mergeSecondary],
                orderId: active?.orderId,
              })
              load()
            }}
          >
            Merge
          </button>
        </div>

        <div className='rounded-2xl border bg-white p-4 space-y-2'>
          <h3 className='font-semibold'>Transfer order</h3>
          <select className='w-full rounded-xl border px-3 py-2 text-sm' value={transferOrderId} onChange={(e) => setTransferOrderId(e.target.value)}>
            <option value=''>Active order</option>
            {orders.map((o) => <option key={o._id} value={o.orderId}>{o.orderId} ({o.table})</option>)}
          </select>
          <div className='grid grid-cols-2 gap-2'>
            <select className='rounded-xl border px-3 py-2 text-sm' value={transferFrom} onChange={(e) => setTransferFrom(e.target.value)}>
              <option value=''>From</option>
              {tables.map((t) => <option key={t._id} value={t.tableNumber}>{t.tableNumber}</option>)}
            </select>
            <select className='rounded-xl border px-3 py-2 text-sm' value={transferTo} onChange={(e) => setTransferTo(e.target.value)}>
              <option value=''>To</option>
              {tables.map((t) => <option key={t._id} value={t.tableNumber}>{t.tableNumber}</option>)}
            </select>
          </div>
          <button
            type='button'
            className='rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
            onClick={async () => {
              await apiClient.post('/orders/transfer', { orderId: transferOrderId, fromTable: transferFrom, toTable: transferTo })
              load()
            }}
          >
            Transfer
          </button>
        </div>

        <div className='rounded-2xl border bg-white p-4 space-y-2 lg:col-span-2'>
          <h3 className='font-semibold'>Split bill (creates separate orders)</h3>
          <select className='w-full rounded-xl border px-3 py-2 text-sm' value={splitOrderId} onChange={(e) => setSplitOrderId(e.target.value)}>
            <option value=''>Select order</option>
            {orders.map((o) => <option key={o._id} value={o.orderId}>{o.orderId} — {(o.items || []).length} items · ₹{o.total}</option>)}
          </select>
          <button
            type='button'
            className='rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white'
            onClick={async () => {
              const order = orders.find((o) => o.orderId === splitOrderId)
              if (!order?.items?.length) return
              const mid = Math.ceil(order.items.length / 2)
              const splits = [
                { items: order.items.slice(0, mid), customerName: 'Guest A' },
                { items: order.items.slice(mid), customerName: 'Guest B' },
              ].filter((s) => s.items.length)
              await apiClient.post('/orders/split-bill', { orderId: splitOrderId, splits })
              alert('Bill split into separate orders.')
              load()
            }}
          >
            Split into 2 bills by items
          </button>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {(tables || []).map((table) => {
          const orderUrl = getTableOrderUrl(table.tableNumber)
          const showQr = expandedQr === table._id
          return (
            <div key={table._id} className='rounded-2xl border border-slate-200 bg-white p-4'>
              <div className='flex items-center justify-between'>
                <h4 className='text-lg font-bold text-slate-800'>{table.tableNumber}</h4>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClasses[table.status] || 'bg-slate-100 text-slate-700'}`}>
                  {table.status}
                </span>
              </div>
              <p className='mt-2 text-sm text-slate-500'>Capacity: {table.capacity} · Floor: {table.floor}</p>
              {table.reservation?.customerName && (
                <p className='mt-1 text-xs text-sky-700'>Reserved: {table.reservation.customerName} ({table.reservation.phone})</p>
              )}
              {table.mergedWith?.length > 1 && (
                <p className='mt-1 text-xs text-orange-700'>Merged: {table.mergedWith.join(', ')}</p>
              )}

              <div className='mt-3 space-y-2 rounded-xl bg-slate-50 p-2'>
                <input className='w-full rounded-lg border px-2 py-1 text-xs' placeholder='Guest name' value={reserveForm[table._id]?.customerName || ''} onChange={(e) => setReserveForm((p) => ({ ...p, [table._id]: { ...p[table._id], customerName: e.target.value } }))} />
                <input className='w-full rounded-lg border px-2 py-1 text-xs' placeholder='Phone' value={reserveForm[table._id]?.phone || ''} onChange={(e) => setReserveForm((p) => ({ ...p, [table._id]: { ...p[table._id], phone: e.target.value } }))} />
                <input type='datetime-local' className='w-full rounded-lg border px-2 py-1 text-xs' value={reserveForm[table._id]?.reservedFor || ''} onChange={(e) => setReserveForm((p) => ({ ...p, [table._id]: { ...p[table._id], reservedFor: e.target.value } }))} />
                <button
                  type='button'
                  className='w-full rounded-lg bg-sky-600 py-1.5 text-xs font-semibold text-white'
                  onClick={async () => {
                    await apiClient.post(`/tables/${table._id}/reserve`, reserveForm[table._id] || {})
                    load()
                  }}
                >
                  Reserve Table
                </button>
              </div>

              <button type='button' onClick={() => setExpandedQr(showQr ? null : table._id)} className='mt-3 w-full rounded-xl border border-orange-200 bg-orange-50 py-2 text-sm font-semibold text-orange-700'>
                {showQr ? 'Hide QR' : 'Show QR'}
              </button>
              {showQr && (
                <div className='mt-3 flex flex-col items-center rounded-xl bg-slate-50 p-3'>
                  <QRCodeSVG value={orderUrl} size={120} level='M' />
                  <p className='mt-2 break-all text-center text-[10px] text-slate-500'>{orderUrl}</p>
                </div>
              )}
              <select value={table.status} onChange={(e) => updateTable(table._id, e.target.value)} className='mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm'>
                <option value='Available'>Available</option>
                <option value='Occupied'>Occupied</option>
                <option value='Reserved'>Reserved</option>
              </select>
            </div>
          )
        })}
      </div>
    </PageTemplate>
  )
}

export const KOTPage = () => {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    apiClient.get('/orders').then(({ data }) => setOrders(data.filter((order) => ['Preparing', 'Ready'].includes(order.status)))).catch(console.error)
  }, [])

  return (
    <PageTemplate title='Send KOT' subtitle='Kitchen'>
      <div className='space-y-4'>
        {(orders || []).map((order) => (
          <div key={order._id} className='rounded-2xl border border-slate-200 bg-white p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-500'>Dinner</p>
                <h4 className='text-xl font-bold text-slate-800'>{order.orderId}</h4>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[order.status] || 'bg-slate-100 text-slate-700'}`}>{order.status}</span>
            </div>
            <p className='mt-3 text-sm text-slate-600'>Table {order.table} • Waiter: {order.waiter}</p>
            <ul className='mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700'>
              {(order.items || []).map((item) => (
                <li key={`${order._id}-${item.name}`}>{item.name} x {item.qty}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageTemplate>
  )
}

export const OrderStatusUpdatesPage = () => {
  const [orders, setOrders] = useState([])

  const fetchOrders = async () => {
    const { data } = await apiClient.get('/orders')
    setOrders(data)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id, status) => {
    await apiClient.put(`/orders/${id}`, { status })
    fetchOrders()
  }

  return (
    <PageTemplate title='Order Status Updates' subtitle='Kitchen'>
      <div className='space-y-4'>
        {(orders || []).map((order) => (
          <div key={order._id} className='rounded-2xl border border-slate-200 bg-white p-4'>
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
              <div>
                <p className='text-sm text-slate-500'>Order</p>
                <h4 className='text-xl font-bold text-slate-800'>{order.orderId}</h4>
              </div>
              <div className='flex items-center gap-2'>
                <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} className='rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm'>
                  <option value='Preparing'>Preparing</option>
                  <option value='Ready'>Ready</option>
                  <option value='Served'>Served</option>
                  <option value='Completed'>Completed</option>
                  <option value='Cancelled'>Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageTemplate>
  )
}
