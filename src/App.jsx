import { useMemo, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import SummaryCard from './components/SummaryCard.jsx'
import MenuItemCard from './components/MenuItemCard.jsx'
import OrderItem from './components/OrderItem.jsx'
import { dashboardTiles, kitchenOrders, menuCategories, menuItems, tableStatus } from './data/mockData.js'

const App = () => {
  const [view, setView] = useState('dashboard')
  const [category, setCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [category, searchTerm])

  const addToCart = (item) => {
    setCartItems((current) => {
      const existing = current.find((entry) => entry.id === item.id)
      if (existing) {
        return current.map((entry) => (entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))
      }
      return [...current, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id, nextQuantity) => {
    setCartItems((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, nextQuantity) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeCartItem = (id) => {
    setCartItems((current) => current.filter((item) => item.id !== id))
  }

  const clearCart = () => setCartItems([])

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  )

  const orderCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const renderDashboard = () => (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-2">
        {dashboardTiles.map((tile) => (
          <SummaryCard key={tile.title} title={tile.title} value={tile.value} description={tile.description} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Table Management</h2>
              <p className="mt-2 text-sm text-slate-400">Real-time occupancy and availability.</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">Touch</span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {tableStatus.map((table) => (
              <div key={table.name} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{table.name}</div>
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-500">{table.guests} guests</div>
                  </div>
                  <span className="rounded-full px-3 py-1 text-[11px] font-semibold text-slate-200 bg-slate-800">{table.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">Kitchen Orders</h2>
          <p className="mt-2 text-sm text-slate-400">Order flow from captain to kitchen.</p>
          <div className="mt-6 space-y-4">
            {kitchenOrders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{order.id}</div>
                    <div className="text-sm text-slate-400">{order.table}</div>
                  </div>
                  <div className="text-right text-sm text-slate-300">
                    <div>{order.items} items</div>
                    <div className="mt-1 rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">{order.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )

  const renderMenu = () => (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Menu Browser</h2>
              <p className="mt-2 text-sm text-slate-400">Search items and add them to the current bill quickly.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search items..."
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 sm:w-72"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 sm:w-48"
              >
                {menuCategories.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} onAdd={addToCart} />
        ))}
      </section>
    </div>
  )

  const renderBilling = () => (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Billing Terminal</h2>
            <p className="mt-2 text-sm text-slate-400">Generate bills, accept payments, and print receipts.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Items</div>
              <div className="mt-2 text-xl font-semibold text-white">{cartItems.length}</div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Qty</div>
              <div className="mt-2 text-xl font-semibold text-white">{orderCount}</div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Payment</div>
              <div className="mt-2 text-xl font-semibold text-white">{paymentMethod}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="text-sm uppercase tracking-[0.3em] text-slate-500">Current Order</div>
          {cartItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950 p-8 text-center text-slate-400">Add items from the menu to start billing.</div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <OrderItem key={item.id} item={item} onChangeQty={updateQuantity} onRemove={removeCartItem} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-slate-500">Receipt</div>
              <div className="mt-4 text-3xl font-semibold text-white">₹{cartTotal}</div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Wallet</option>
              </select>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={clearCart}
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600"
              >
                Clear Cart
              </button>
              <button
                type="button"
                onClick={() => alert('Bill generated. Receipt ready for print.')}
                disabled={cartItems.length === 0}
                className="rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  const renderKitchen = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">Kitchen Order Management</h2>
        <p className="mt-2 text-sm text-slate-400">Track KOT status with a quick tap.</p>
        <div className="mt-6 space-y-4">
          {kitchenOrders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{order.id}</div>
                  <div className="text-sm text-slate-400">{order.table}</div>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">Table Status</h2>
        <p className="mt-2 text-sm text-slate-400">See availability for the captain module.</p>
        <div className="mt-6 grid gap-3">
          {tableStatus.map((table) => (
            <div key={table.name} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{table.name}</div>
                  <div className="text-sm text-slate-400">{table.guests} guests</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${table.status === 'Available' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                  {table.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">System Settings</h2>
        <p className="mt-2 text-sm text-slate-400">Configure business details, tax, and printer options.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {['Business Details', 'GST Settings', 'Printer Setup', 'Payment Methods'].map((name) => (
            <div key={name} className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-300">
              <div className="font-semibold text-white">{name}</div>
              <p className="mt-2 text-slate-400">Editable configuration for future expansion.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">Mobile & Offline</h2>
        <p className="mt-2 text-sm text-slate-400">Touch-first UI, offline billing, and sync-ready architecture.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {['Android', 'POS Devices', 'Offline Sync'].map((label) => (
            <div key={label} className="rounded-3xl border border-slate-800 bg-slate-950 p-4 text-center text-sm text-slate-300">
              {label}
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  const renderView = () => {
    switch (view) {
      case 'menu':
        return renderMenu()
      case 'billing':
        return renderBilling()
      case 'kitchen':
        return renderKitchen()
      case 'settings':
        return renderSettings()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <Sidebar view={view} onChangeView={setView} />

        <main className="flex-1 p-4 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/60 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-slate-500">Point of Sale Prototype</div>
              <h1 className="mt-2 text-3xl font-semibold text-white">{view === 'dashboard' ? 'Dashboard' : view.charAt(0).toUpperCase() + view.slice(1)}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-3xl bg-slate-950 px-4 py-3 text-sm text-slate-300">Items in cart: {cartItems.length}</div>
              <div className="rounded-3xl bg-slate-950 px-4 py-3 text-sm text-slate-300">Total value: ₹{cartTotal}</div>
            </div>
          </div>

          <div className="space-y-6">{renderView()}</div>
        </main>
      </div>
    </div>
  )
}

export default App
