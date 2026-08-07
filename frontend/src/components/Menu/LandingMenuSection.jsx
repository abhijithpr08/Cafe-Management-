import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../../api/apiClient'
import MenuSection from './MenuSection'

const CART_STORAGE_KEY = 'restropos-landing-cart'

export { CART_STORAGE_KEY }

/**
 * Home-page Digital Menu with a working cart.
 * Guests can add items here; "Proceed to Order" opens the table QR order flow
 * and carries the cart via sessionStorage.
 */
const LandingMenuSection = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadMenu = async () => {
      setLoading(true)
      setError('')
      try {
        const [menuRes, catRes] = await Promise.all([
          apiClient.get('/menu'),
          apiClient.get('/categories'),
        ])
        if (cancelled) return
        setItems(menuRes.data?.items || [])
        setCategories(catRes.data?.length ? catRes.data : menuRes.data?.categories || [])
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load digital menu:', err)
          setError('Unable to load menu from the server. Please try again later.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMenu()
    return () => {
      cancelled = true
    }
  }, [])

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart])
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart])

  const showToast = (msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2500)
  }

  const handleAddToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id || c.name === item.name)
      if (existing) {
        return prev.map((c) =>
          c._id === item._id || c.name === item.name ? { ...c, qty: c.qty + 1 } : c
        )
      }
      return [...prev, { _id: item._id, name: item.name, price: item.price, qty: 1 }]
    })
    showToast(`${item.name} added to cart`)
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

  const proceedToOrder = (table = 'T5') => {
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      /* ignore */
    }
    setCartOpen(false)
    navigate(`/order?table=${encodeURIComponent(table)}`)
  }

  return (
    <div className='relative'>
      <MenuSection
        items={items}
        categories={categories}
        loading={loading}
        error={error}
        showAddButton
        onAddToCart={handleAddToCart}
        title='Our Menu'
        subtitle='Add dishes to your cart, then continue to your table to place the order'
      />

      {/* Toast confirmation */}
      {toast && (
        <div className='fixed bottom-28 left-1/2 z-[60] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white shadow-xl'>
          {toast}
        </div>
      )}

      {/* Floating cart button — appears after first add */}
      {cartCount > 0 && !cartOpen && (
        <button
          type='button'
          onClick={() => setCartOpen(true)}
          className='fixed bottom-6 right-4 z-[60] flex items-center gap-3 rounded-full bg-orange-500 px-5 py-3.5 text-white shadow-xl shadow-orange-300/50 transition hover:bg-orange-600 active:scale-95'
        >
          <span className='relative text-lg' aria-hidden>
            🛒
            <span className='absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-orange-600'>
              {cartCount}
            </span>
          </span>
          <span className='text-sm font-bold'>View Cart · ₹{subtotal}</span>
        </button>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className='fixed inset-0 z-[70] flex items-end justify-center bg-black/45 sm:items-center'>
          <button type='button' className='absolute inset-0 cursor-default' aria-label='Close cart' onClick={() => setCartOpen(false)} />
          <div className='relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl'>
            <div className='flex items-center justify-between border-b border-slate-100 px-5 py-4'>
              <div>
                <h3 className='text-lg font-bold text-slate-900'>Your Cart</h3>
                <p className='text-xs text-slate-500'>{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
              </div>
              <button type='button' onClick={() => setCartOpen(false)} className='text-2xl text-slate-400 hover:text-slate-700'>
                ×
              </button>
            </div>

            <div className='flex-1 space-y-3 overflow-y-auto px-5 py-4'>
              {cart.length === 0 ? (
                <p className='py-8 text-center text-sm text-slate-500'>Cart is empty. Add items from the menu.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.name} className='flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3'>
                    <div className='flex-1'>
                      <p className='font-semibold text-slate-900'>{item.name}</p>
                      <p className='text-xs text-slate-500'>₹{item.price} each</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button type='button' onClick={() => updateQty(item.name, -1)} className='h-8 w-8 rounded-lg bg-white font-bold shadow-sm'>−</button>
                      <span className='w-5 text-center text-sm font-semibold'>{item.qty}</span>
                      <button type='button' onClick={() => updateQty(item.name, 1)} className='h-8 w-8 rounded-lg bg-white font-bold shadow-sm'>+</button>
                    </div>
                    <p className='w-14 text-right text-sm font-bold'>₹{item.price * item.qty}</p>
                    <button type='button' onClick={() => removeItem(item.name)} className='text-red-400 hover:text-red-600'>✕</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className='border-t border-slate-100 px-5 py-4'>
                <div className='mb-3 flex justify-between text-base font-bold'>
                  <span>Subtotal</span>
                  <span className='text-orange-600'>₹{subtotal}</span>
                </div>
                <p className='mb-3 text-xs text-slate-500'>
                  To place the order, continue to a table (demo uses Table T5). In the restaurant you scan the QR on your table.
                </p>
                <button
                  type='button'
                  onClick={() => proceedToOrder('T5')}
                  className='w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-bold text-white hover:bg-orange-600'
                >
                  Proceed to Order (Table T5)
                </button>
                <Link
                  to='/order?table=T5'
                  onClick={() => {
                    try {
                      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
                    } catch {
                      /* ignore */
                    }
                  }}
                  className='mt-2 block text-center text-xs font-medium text-slate-500 hover:text-orange-600'
                >
                  Or open order page →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingMenuSection
