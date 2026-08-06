const OrderItem = ({ item, onChangeQty, onRemove }) => {
  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-200">{item.quantity}x</div>
        <div>
          <div className="font-semibold text-white">{item.name}</div>
          <div className="text-sm text-slate-400">₹{item.price} each</div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-400">
        <button
          type="button"
          onClick={() => onChangeQty(item.id, item.quantity - 1)}
          className="rounded-full border border-slate-700 px-3 py-1 transition hover:bg-slate-800"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => onChangeQty(item.id, item.quantity + 1)}
          className="rounded-full border border-slate-700 px-3 py-1 transition hover:bg-slate-800"
        >
          +
        </button>
        <button type="button" onClick={() => onRemove(item.id)} className="text-rose-400 transition hover:text-rose-300">
          Remove
        </button>
      </div>

      <div className="text-right text-sm text-slate-400 sm:text-base">
        <div className="text-slate-200">Subtotal</div>
        <div className="font-semibold text-white">₹{item.price * item.quantity}</div>
      </div>
    </article>
  )
}

export default OrderItem
