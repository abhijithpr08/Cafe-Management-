import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import apiClient from '../../api/apiClient'
import PageTemplate from './PageTemplate'
import {
  downloadBillPDF,
  downloadCSV,
  downloadPDFTable,
  downloadXLSX,
  formatINR,
} from '../../utils/exportHelpers'

const EmptyState = ({ message }) => (
  <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500'>
    {message}
  </div>
)

const LoadingBlock = () => (
  <div className='flex justify-center py-12'>
    <div className='h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500' />
  </div>
)

/** ---------- Customers ---------- */
export const CustomersPage = () => {
  const [customers, setCustomers] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [profile, setProfile] = useState(null)

  const load = async (search = q) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get('/customers', { params: { q: search || undefined } })
      setCustomers(data)
    } catch {
      setError('Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openProfile = async (id) => {
    setSelected(id)
    try {
      const { data } = await apiClient.get(`/customers/${id}`)
      setProfile(data)
    } catch {
      setProfile(null)
    }
  }

  return (
    <PageTemplate title='Customers' subtitle='Loyalty & purchase history'>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row'>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search by name or phone...'
          className='flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm'
        />
        <button
          type='button'
          onClick={() => load(q)}
          className='rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white'
        >
          Search
        </button>
      </div>

      {loading && <LoadingBlock />}
      {error && <div className='rounded-xl bg-red-50 p-3 text-sm text-red-600'>{error}</div>}
      {!loading && !error && customers.length === 0 && <EmptyState message='No customers yet.' />}

      {!loading && customers.length > 0 && (
        <div className='overflow-x-auto rounded-2xl border border-slate-200 bg-white'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-500'>
              <tr>
                <th className='px-4 py-3'>Name</th>
                <th className='px-4 py-3'>Mobile</th>
                <th className='px-4 py-3'>Orders</th>
                <th className='px-4 py-3'>Total Spend</th>
                <th className='px-4 py-3'>Loyalty Pts</th>
                <th className='px-4 py-3' />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className='border-t border-slate-100'>
                  <td className='px-4 py-3 font-medium'>{c.name || '—'}</td>
                  <td className='px-4 py-3'>{c.mobile}</td>
                  <td className='px-4 py-3'>{c.orderCount || c.orderHistory?.length || 0}</td>
                  <td className='px-4 py-3'>{formatINR(c.totalSpend)}</td>
                  <td className='px-4 py-3 text-orange-600 font-semibold'>{c.loyaltyPoints || 0}</td>
                  <td className='px-4 py-3'>
                    <button type='button' onClick={() => openProfile(c._id)} className='text-xs font-semibold text-orange-600'>
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {profile && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6'>
            <div className='flex justify-between'>
              <h3 className='text-xl font-bold'>{profile.customer.name || profile.customer.mobile}</h3>
              <button type='button' onClick={() => setProfile(null)}>×</button>
            </div>
            <p className='text-sm text-slate-500'>{profile.customer.mobile}</p>
            <p className='mt-2 text-sm'>Loyalty: <strong>{profile.customer.loyaltyPoints || 0}</strong> pts · Spend: {formatINR(profile.customer.totalSpend)}</p>
            <h4 className='mt-4 font-semibold'>Purchase History</h4>
            <ul className='mt-2 space-y-2 text-sm'>
              {(profile.orders || []).map((o) => (
                <li key={o._id} className='rounded-xl bg-slate-50 px-3 py-2'>
                  {o.orderId} · {o.status} · {formatINR(o.total)}
                </li>
              ))}
              {!profile.orders?.length && <li className='text-slate-400'>No orders</li>}
            </ul>
          </div>
        </div>
      )}
    </PageTemplate>
  )
}

/** ---------- Reports & Analytics ---------- */
const REPORT_TYPES = [
  { id: 'sales', label: 'Sales Report' },
  { id: 'gst', label: 'GST Report' },
  { id: 'item', label: 'Item-wise Sales' },
  { id: 'category', label: 'Category-wise Sales' },
  { id: 'customer', label: 'Customer Report' },
  { id: 'discount', label: 'Discount Report' },
  { id: 'cancellation', label: 'Cancellation Report' },
  { id: 'daily', label: 'Daily Closing Report' },
]

export const ReportsAnalyticsPage = () => {
  const [type, setType] = useState('sales')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [days, setDays] = useState(7)
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    apiClient.get('/reports', { params: { days } }).then(({ data: d }) => setOverview(d)).catch(console.error)
  }, [days])

  const loadReport = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: d } = await apiClient.get('/reports/analytics', {
        params: { type, from: from || undefined, to: to || (type === 'daily' ? from : undefined) },
      })
      setData(d)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [type])

  const flatRows = useMemo(() => {
    if (!data) return []
    if (type === 'daily') {
      return [
        { metric: 'Sales', value: data.summary?.sales },
        { metric: 'Orders', value: data.summary?.orders },
        { metric: 'Tax', value: data.summary?.tax },
        { metric: 'Discount', value: data.summary?.discount },
        { metric: 'Net (Sales - Discount)', value: data.summary?.net },
        { metric: 'Cancelled', value: data.summary?.cancelled },
        ...(data.payments || []).map((p) => ({ metric: `Pay: ${p._id}`, value: p.amount })),
      ]
    }
    if (type === 'customer') {
      return (data.rows || []).map((c) => ({
        name: c.name,
        mobile: c.mobile,
        orders: c.orderCount,
        spend: c.totalSpend,
        points: c.loyaltyPoints,
      }))
    }
    if (type === 'cancellation') {
      return (data.rows || []).map((o) => ({
        orderId: o.orderId,
        table: o.table,
        reason: o.cancelReason,
        total: o.total,
        date: o.createdAt,
      }))
    }
    return (data.rows || []).map((r) => ({ ...r, id: r._id }))
  }, [data, type])

  return (
    <PageTemplate title='Reports & Analytics' subtitle='Filterable exports'>
      <div className='mb-6 flex flex-wrap gap-2'>
        {[7, 30].map((d) => (
          <button
            key={d}
            type='button'
            onClick={() => setDays(d)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${days === d ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}
          >
            Trend {d}d
          </button>
        ))}
      </div>

      {overview && (
        <div className='mb-8 grid gap-4 lg:grid-cols-2'>
          <div className='rounded-2xl border border-slate-200 bg-white p-4'>
            <h3 className='mb-3 font-semibold'>Sales trend ({days} days)</h3>
            <div className='h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={overview.salesByDate || []}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='_id' />
                  <YAxis />
                  <Tooltip formatter={(v) => formatINR(v)} />
                  <Line type='monotone' dataKey='total' stroke='#f97316' strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-4'>
            <h3 className='mb-3 font-semibold'>Peak hours</h3>
            <div className='h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={overview.peakHours || []}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='label' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='count' fill='#fb923c' radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className='mb-4 flex flex-wrap gap-2'>
        {REPORT_TYPES.map((t) => (
          <button
            key={t.id}
            type='button'
            onClick={() => setType(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${type === t.id ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className='mb-4 flex flex-wrap items-end gap-3'>
        <div>
          <label className='text-xs text-slate-500'>From</label>
          <input type='date' value={from} onChange={(e) => setFrom(e.target.value)} className='block rounded-xl border border-slate-200 px-3 py-2 text-sm' />
        </div>
        <div>
          <label className='text-xs text-slate-500'>To</label>
          <input type='date' value={to} onChange={(e) => setTo(e.target.value)} className='block rounded-xl border border-slate-200 px-3 py-2 text-sm' />
        </div>
        <button type='button' onClick={loadReport} className='rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white'>
          Apply
        </button>
        <button type='button' onClick={() => downloadCSV(flatRows, `${type}-report.csv`)} className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold'>
          Export CSV
        </button>
        <button type='button' onClick={() => downloadXLSX(flatRows, `${type}-report.xlsx`)} className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold'>
          Export Excel
        </button>
        <button type='button' onClick={() => downloadPDFTable(REPORT_TYPES.find((t) => t.id === type)?.label || 'Report', flatRows, `${type}-report.pdf`)} className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold'>
          Export PDF
        </button>
      </div>

      {loading && <LoadingBlock />}
      {error && <div className='rounded-xl bg-red-50 p-3 text-sm text-red-600'>{error}</div>}
      {!loading && data?.netSales !== undefined && (
        <p className='mb-3 text-sm text-slate-600'>Net (Sales − Discounts): <strong>{formatINR(data.netSales)}</strong></p>
      )}
      {!loading && flatRows.length === 0 && <EmptyState message='No rows for this filter.' />}
      {!loading && flatRows.length > 0 && (
        <div className='overflow-x-auto rounded-2xl border border-slate-200 bg-white'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-500'>
              <tr>
                {Object.keys(flatRows[0]).map((h) => (
                  <th key={h} className='px-4 py-3 capitalize'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flatRows.map((row, i) => (
                <tr key={i} className='border-t border-slate-100'>
                  {Object.values(row).map((v, j) => (
                    <td key={j} className='px-4 py-2'>{typeof v === 'number' ? v : String(v ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageTemplate>
  )
}

export { EmptyState, LoadingBlock, formatINR, downloadBillPDF }
