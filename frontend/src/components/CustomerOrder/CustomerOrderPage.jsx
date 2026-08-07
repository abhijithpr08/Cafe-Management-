import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import apiClient from '../../api/apiClient'
import MenuSection from '../Menu/MenuSection'
import OtpModal from './OtpModal'
import PaymentModal from './PaymentModal'
import Toast from './Toast'
import {
  buildEmailBillText,
  buildSmsBillText,
  buildWhatsAppBillLink,
  downloadBillPDF,
} from '../../utils/exportHelpers'
import { CART_STORAGE_KEY } from '../Menu/LandingMenuSection'

const STEPS = ['menu', 'cart', 'tracking', 'bill', 'receipt']
const STATUS_FLOW = ['Preparing', 'Ready', 'Served', 'Completed']
const ESTIMATED_MINS = 25

const CustomerOrderPage = () => {
  const [searchParams] = useSearchParams()
  const tableNumber = searchParams.get('table') || ''

  const [step, setStep] = useState('menu')
  const [menu, setMenu] = useState({ items: [], categories: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState(() => {
    // Restore cart carried over from the home-page menu
    try {
      const raw = sessionStorage.getItem(CART_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      sessionStorage.removeItem(CART_STORAGE_KEY)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [showOtp, setShowOtp] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [order, setOrder] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [toast, setToast] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [ebillPreview, setEbillPreview] = useState('')

  const showToastMsg = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // If guest arrived with items from home menu, open cart step so they see them
  useEffect(() => {
    if (tableNumber && cart.length > 0) {
      setStep('cart')
      showToastMsg(`${cart.length} item(s) loaded from menu`, 'success')
    }
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true)
      try {
        const [menuRes, catRes] = await Promise.all([
          apiClient.get('/menu'),
          apiClient.get('/categories'),
        ])
        setMenu({
          items: menuRes.data.items || [],
          categories: catRes.data || menuRes.data.categories || [],
        })
      } catch {
        setError('Failed to load menu. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    loadMenu()
  }, [])

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart])
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart])

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id || c.name === item.name)
      if (existing) {
        return prev.map((c) =>
          (c._id === item._id || c.name === item.name) ? { ...c, qty: c.qty + 1 } : c
        )
      }
      return [...prev, { _id: item._id, name: item.name, price: item.price, qty: 1 }]
    })
    showToastMsg(`${item.name} added to cart`, 'success')
  }, [])

  const updateQty = (name, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.name === name ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    )
  }

  const removeItem = (name) => {
    setCart((prev) => prev.filter((c) => c.name !== name))
  }

  const handleProceedToOrder = () => {
    if (!tableNumber) {
      showToastMsg('Table number missing. Please scan the table QR code.', 'error')
      return
    }
    if (cart.length === 0) return
    setShowOtp(true)
  }

  const handleOtpVerified = async (customer) => {
    setShowOtp(false)
    setPlacingOrder(true)
    const mobile = customer?.mobile
    if (!mobile) {
      showToastMsg('Mobile verification failed.', 'error')
      setPlacingOrder(false)
      return
    }
    try {
      const orderId = `ORD${Date.now()}`
      const items = cart.map(({ name, qty, price }) => ({ name, qty, price }))
      const { data } = await apiClient.post('/orders/customer', {
        orderId,
        table: tableNumber,
        items,
        customerMobile: mobile,
        status: 'Preparing',
        total: subtotal,
        subtotal,
      })
      setOrder(data)
      setCart([])
      setStep('tracking')
      showToastMsg('Order placed successfully!', 'success')
    } catch (err) {
      showToastMsg(err.response?.data?.message || 'Failed to place order.', 'error')
    } finally {
      setPlacingOrder(false)
    }
  }

  // Poll order status
  useEffect(() => {
    if (step !== 'tracking' && step !== 'bill') return
    if (!order?._id) return

    const poll = async () => {
      try {
        const { data } = await apiClient.get(`/orders/${order._id}`)
        setOrder(data)
        if (data.status === 'Served' && step === 'tracking') {
          // Auto-ready for bill when served
        }
      } catch {
        /* ignore poll errors */
      }
    }

    poll()
    const interval = setInterval(poll, 4000)
    return () => clearInterval(interval)
  }, [order?._id, step])

  const handleRequestBill = async () => {
    if (!order?._id) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const { data } = await apiClient.post(`/orders/${order._id}/bill`, {
        discountCode: couponCode || undefined,
      })
      setOrder(data)
      setStep('bill')
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Failed to generate bill.')
    } finally {
      setCouponLoading(false)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const { data } = await apiClient.get(`/discounts/validate/${encodeURIComponent(couponCode)}`)
      if (!data.valid) {
        setCouponError('Invalid coupon code.')
        return
      }
      const { data: billData } = await apiClient.post(`/orders/${order._id}/bill`, { discountCode: couponCode })
      setOrder(billData)
      showToastMsg(`Coupon "${data.discount.code}" applied!`, 'success')
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code.')
    } finally {
      setCouponLoading(false)
    }
  }

  const handlePaymentSuccess = (updatedOrder) => {
    setShowPayment(false)
    setOrder(updatedOrder)
    setStep('receipt')
  }

  const printReceipt = () => window.print()

  const statusIndex = STATUS_FLOW.indexOf(order?.status)
  const canRequestBill = order && ['Served', 'Ready', 'Completed'].includes(order.status)

  if (!tableNumber && step === 'menu') {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-white'>
        <span className='text-5xl'>📱</span>
        <h1 className='mt-4 text-2xl font-bold'>Scan Table QR Code</h1>
        <p className='mt-2 max-w-md text-slate-400'>
          Open the QR code on your table to start ordering. You can browse our menu on the home page.
        </p>
        <Link to='/' className='mt-6 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600'>
          View Menu on Home
        </Link>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 pb-24'>
      {/* Header */}
      <header className='sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3'>
          <div>
            <Link to='/' className='text-lg font-bold text-slate-900'>
              Restro<span className='text-orange-500'>POS</span>
            </Link>
            {tableNumber && (
              <p className='text-xs text-slate-500'>Table {tableNumber}</p>
            )}
          </div>
          {order && (
            <span className='rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700'>
              {order.orderId}
            </span>
          )}
        </div>

        {/* Stepper */}
        {order && (
          <div className='flex gap-1 overflow-x-auto px-4 pb-2'>
            {['Track', 'Bill', 'Pay', 'Done'].map((label, i) => {
              const stepMap = ['tracking', 'bill', 'bill', 'receipt']
              const active = step === stepMap[i] || (step === 'receipt' && i === 3)
              const done = STEPS.indexOf(step) > STEPS.indexOf(stepMap[i])
              return (
                <div
                  key={label}
                  className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold ${
                    active ? 'bg-orange-500 text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {done ? '✓' : i + 1}. {label}
                </div>
              )
            })}
          </div>
        )}
      </header>

      {/* Menu step */}
      {step === 'menu' && (
        <MenuSection
          items={menu.items}
          categories={menu.categories}
          showAddButton
          onAddToCart={addToCart}
          loading={loading}
          error={error}
          title={`Table ${tableNumber} Menu`}
          subtitle='Browse and add items to your cart'
        />
      )}

      {/* Cart step */}
      {step === 'cart' && (
        <div className='mx-auto max-w-lg px-4 py-6'>
          <h2 className='text-2xl font-bold text-slate-900'>Your Cart</h2>
          {cart.length === 0 ? (
            <div className='mt-8 text-center text-slate-500'>
              <p>Your cart is empty.</p>
              <button type='button' onClick={() => setStep('menu')} className='mt-4 text-orange-600 font-semibold'>
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              <ul className='mt-6 space-y-3'>
                {cart.map((item) => (
                  <li key={item.name} className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4'>
                    <div className='flex-1'>
                      <p className='font-semibold text-slate-900'>{item.name}</p>
                      <p className='text-sm text-slate-500'>₹{item.price} each</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button type='button' onClick={() => updateQty(item.name, -1)} className='h-8 w-8 rounded-lg bg-slate-100 font-bold'>−</button>
                      <span className='w-6 text-center font-semibold'>{item.qty}</span>
                      <button type='button' onClick={() => updateQty(item.name, 1)} className='h-8 w-8 rounded-lg bg-slate-100 font-bold'>+</button>
                    </div>
                    <p className='w-16 text-right font-bold text-slate-900'>₹{item.price * item.qty}</p>
                    <button type='button' onClick={() => removeItem(item.name)} className='text-red-400 hover:text-red-600'>✕</button>
                  </li>
                ))}
              </ul>
              <div className='mt-6 rounded-2xl bg-white p-4 border border-slate-200'>
                <div className='flex justify-between text-lg font-bold'>
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>
              <button
                type='button'
                onClick={handleProceedToOrder}
                disabled={placingOrder}
                className='mt-6 w-full rounded-2xl bg-orange-500 py-4 text-base font-bold text-white hover:bg-orange-600 disabled:opacity-60'
              >
                {placingOrder ? 'Placing Order...' : 'Proceed to Order'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Tracking step */}
      {step === 'tracking' && order && (
        <div className='mx-auto max-w-lg px-4 py-8'>
          <div className='rounded-3xl bg-white p-6 shadow-sm border border-slate-200 text-center'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl'>
              ✓
            </div>
            <h2 className='mt-4 text-2xl font-bold text-slate-900'>Order Confirmed!</h2>
            <p className='mt-1 text-slate-500'>Order ID: <span className='font-semibold text-slate-800'>{order.orderId}</span></p>
            <p className='mt-1 text-sm text-slate-500'>Estimated time: ~{ESTIMATED_MINS} minutes</p>
          </div>

          <div className='mt-8 rounded-3xl bg-white p-6 border border-slate-200'>
            <h3 className='font-bold text-slate-900'>Track Order Status</h3>
            <div className='mt-6 space-y-4'>
              {STATUS_FLOW.slice(0, 3).map((status, i) => {
                const isActive = order.status === status
                const isDone = statusIndex > i || order.status === 'Completed'
                return (
                  <div key={status} className='flex items-center gap-4'>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <div>
                      <p className={`font-semibold ${isActive || isDone ? 'text-slate-900' : 'text-slate-400'}`}>{status}</p>
                      {isActive && <p className='text-xs text-orange-600'>In progress...</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <ul className='mt-6 rounded-2xl bg-white p-4 border border-slate-200 space-y-2'>
            {(order.items || []).map((item) => (
              <li key={item.name} className='flex justify-between text-sm'>
                <span>{item.name} × {item.qty}</span>
                <span className='font-medium'>₹{(item.price || 0) * item.qty}</span>
              </li>
            ))}
          </ul>

          {canRequestBill && (
            <button
              type='button'
              onClick={handleRequestBill}
              disabled={couponLoading}
              className='mt-6 w-full rounded-2xl bg-slate-900 py-4 text-base font-bold text-white hover:bg-slate-800 disabled:opacity-60'
            >
              {couponLoading ? 'Generating Bill...' : 'Request Bill'}
            </button>
          )}

          {order.status === 'Preparing' && (
            <p className='mt-4 text-center text-sm text-slate-500'>
              Your order is being prepared. Bill will be available once served.
            </p>
          )}
        </div>
      )}

      {/* Bill step */}
      {step === 'bill' && order && (
        <div className='mx-auto max-w-lg px-4 py-8 print:py-4'>
          <div id='e-bill' className='rounded-3xl bg-white p-6 shadow-sm border border-slate-200'>
            <div className='text-center border-b border-dashed border-slate-200 pb-4'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-xl font-bold text-white'>R</div>
              <h2 className='mt-2 text-xl font-black text-slate-900'>RestroPOS</h2>
              <p className='text-xs text-slate-500'>GSTIN: 29ABCDE1234F1Z5</p>
            </div>

            <div className='mt-4 grid grid-cols-2 gap-2 text-sm'>
              <div><span className='text-slate-500'>Table:</span> <span className='font-semibold'>{order.table}</span></div>
              <div><span className='text-slate-500'>Order:</span> <span className='font-semibold'>{order.orderId}</span></div>
              <div className='col-span-2'><span className='text-slate-500'>Date:</span> <span className='font-semibold'>{new Date(order.createdAt).toLocaleString()}</span></div>
            </div>

            <table className='mt-6 w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-200 text-left text-slate-500'>
                  <th className='pb-2'>Item</th>
                  <th className='pb-2 text-center'>Qty</th>
                  <th className='pb-2 text-right'>Price</th>
                  <th className='pb-2 text-right'>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item) => (
                  <tr key={item.name} className='border-b border-slate-50'>
                    <td className='py-2'>{item.name}</td>
                    <td className='py-2 text-center'>{item.qty}</td>
                    <td className='py-2 text-right'>₹{item.price || 0}</td>
                    <td className='py-2 text-right font-medium'>₹{(item.price || 0) * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Coupon */}
            {order.paymentStatus !== 'Paid' && (
              <div className='mt-4 flex gap-2'>
                <input
                  type='text'
                  placeholder='Coupon code'
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className='flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400'
                />
                <button
                  type='button'
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className='rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60'
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className='mt-2 text-xs text-red-600'>{couponError}</p>}

            <div className='mt-4 space-y-1 border-t border-dashed border-slate-200 pt-4 text-sm'>
              <div className='flex justify-between'><span className='text-slate-500'>Subtotal</span><span>₹{order.subtotal ?? subtotal}</span></div>
              {order.discountApplied?.discountAmount > 0 && (
                <div className='flex justify-between text-emerald-600'>
                  <span>Discount ({order.discountApplied.code})</span>
                  <span>-₹{order.discountApplied.discountAmount}</span>
                </div>
              )}
              {order.tax && (
                <>
                  <div className='flex justify-between'><span className='text-slate-500'>CGST ({order.tax.cgstPercent}%)</span><span>₹{order.tax.cgst}</span></div>
                  <div className='flex justify-between'><span className='text-slate-500'>SGST ({order.tax.sgstPercent}%)</span><span>₹{order.tax.sgst}</span></div>
                </>
              )}
              <div className='flex justify-between text-lg font-black pt-2'>
                <span>Grand Total</span>
                <span className='text-orange-600'>₹{order.total}</span>
              </div>
            </div>
          </div>

          {order.paymentStatus !== 'Paid' ? (
            <button
              type='button'
              onClick={() => setShowPayment(true)}
              className='mt-6 w-full rounded-2xl bg-orange-500 py-4 text-base font-bold text-white hover:bg-orange-600 print:hidden'
            >
              Pay Now — ₹{order.total}
            </button>
          ) : null}
        </div>
      )}

      {/* Receipt / Payment success */}
      {step === 'receipt' && order && (
        <div className='mx-auto max-w-lg px-4 py-8 text-center'>
          <div className='rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white shadow-xl'>
            <div className='text-5xl'>✅</div>
            <h2 className='mt-4 text-3xl font-black'>Payment Successful!</h2>
            <p className='mt-2 opacity-90'>Thank you for dining with us</p>
          </div>

          <div className='mt-6 rounded-2xl bg-white p-6 border border-slate-200 text-left text-sm'>
            <p><span className='text-slate-500'>Order ID:</span> <span className='font-bold'>{order.orderId}</span></p>
            <p className='mt-1'><span className='text-slate-500'>Table:</span> <span className='font-bold'>{order.table}</span></p>
            <p className='mt-1'><span className='text-slate-500'>Amount Paid:</span> <span className='font-bold text-emerald-600'>₹{order.total}</span></p>
            {(order.paymentDetails || []).map((p, i) => (
              <p key={i} className='mt-1 text-slate-600'>{p.method}: ₹{p.amount}</p>
            ))}
          </div>

          <div className='mt-4 grid grid-cols-2 gap-2 print:hidden'>
            <button
              type='button'
              className='rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white'
              onClick={() => {
                const phone = order.customerMobile || prompt('WhatsApp number')
                if (phone) window.open(buildWhatsAppBillLink(phone, order), '_blank')
              }}
            >
              WhatsApp Bill
            </button>
            <button
              type='button'
              className='rounded-xl bg-sky-600 py-2.5 text-xs font-semibold text-white'
              onClick={() => setEbillPreview(buildSmsBillText(order))}
            >
              SMS Bill
            </button>
            <button
              type='button'
              className='rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white'
              onClick={() => {
                const e = buildEmailBillText(order)
                setEbillPreview(`Subject: ${e.subject}\n\n${e.body}`)
              }}
            >
              Email Bill
            </button>
            <button
              type='button'
              className='rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white'
              onClick={() => downloadBillPDF(order)}
            >
              PDF Bill
            </button>
          </div>

          {ebillPreview && (
            <pre className='mt-3 whitespace-pre-wrap rounded-xl bg-slate-900 p-3 text-left text-xs text-green-300 print:hidden'>
              {ebillPreview}
              {'\n\n'}(Simulated delivery)
            </pre>
          )}

          <div className='mt-4 flex gap-3 print:hidden'>
            <button type='button' onClick={printReceipt} className='flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold hover:bg-slate-50'>
              Print
            </button>
            <Link to='/' className='flex-1 rounded-2xl bg-orange-500 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600'>
              Done
            </Link>
          </div>
        </div>
      )}

      {/* Floating cart */}
      {step === 'menu' && cartCount > 0 && (
        <div className='fixed bottom-6 right-4 z-30 print:hidden'>
          <button
            type='button'
            onClick={() => setStep('cart')}
            className='flex items-center gap-3 rounded-full bg-orange-500 px-5 py-3.5 text-white shadow-xl shadow-orange-300/50 transition hover:bg-orange-600 active:scale-95'
          >
            <span className='relative'>
              🛒
              <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-orange-600'>
                {cartCount}
              </span>
            </span>
            <span className='text-sm font-bold'>View Cart · ₹{subtotal}</span>
          </button>
        </div>
      )}

      {step === 'cart' && (
        <button
          type='button'
          onClick={() => setStep('menu')}
          className='fixed bottom-6 left-4 z-30 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg border border-slate-200 print:hidden'
        >
          ← Back to Menu
        </button>
      )}

      <OtpModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        onVerified={handleOtpVerified}
      />

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        order={order}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default CustomerOrderPage
