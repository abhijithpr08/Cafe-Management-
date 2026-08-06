const MenuItemCard = ({ item, onAdd }) => {
  return (
    <div className={`group rounded-3xl border border-slate-800 bg-slate-900 p-5 transition duration-200 hover:-translate-y-0.5 ${item.available ? '' : 'opacity-70'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{item.category}</div>
          <h3 className="mt-3 text-lg font-semibold text-white">{item.name}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${item.available ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
          {item.available ? 'Available' : 'Out of stock'}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{item.description}</p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="text-2xl font-semibold text-white">₹{item.price}</div>
        <button
          type="button"
          onClick={() => onAdd(item)}
          disabled={!item.available}
          className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          Add
        </button>
      </div>
    </div>
  )
}

export default MenuItemCard
