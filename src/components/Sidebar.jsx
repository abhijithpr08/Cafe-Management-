const Sidebar = ({ view, onChangeView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
    { id: 'menu', label: 'Menu', emoji: '🍽️' },
    { id: 'billing', label: 'Billing', emoji: '💳' },
    { id: 'kitchen', label: 'Kitchen', emoji: '🔥' },
    { id: 'settings', label: 'Settings', emoji: '⚙️' },
  ]

  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-6 border-r border-slate-800 bg-slate-950 p-6 lg:flex">
      <div>
        <div className="text-xs uppercase tracking-[0.35em] text-slate-500">Café ERP Prototype</div>
        <h1 className="mt-4 text-3xl font-semibold text-white">BaristaOne</h1>
        <p className="mt-2 text-sm text-slate-400">Mobile-ready POS, billing, kitchen, and analytics.</p>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeView(item.id)}
            className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-left transition ${view === item.id ? 'bg-slate-800 text-white shadow-lg shadow-slate-950/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
          >
            <span className="text-lg">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        <div className="font-semibold text-white">Role</div>
        <p className="mt-2">Captain / Billing</p>
        <p className="mt-3 text-xs text-slate-500">Prototype view built for touch-first Android and tablet workflows.</p>
      </div>
    </aside>
  )
}

export default Sidebar
