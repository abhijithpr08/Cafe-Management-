const SummaryCard = ({ title, value, description, accent }) => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/40">
      <div className={`text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 ${accent || ''}`}>
        {title}
      </div>
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
      {description ? <div className="mt-2 text-sm text-slate-400">{description}</div> : null}
    </div>
  )
}

export default SummaryCard
