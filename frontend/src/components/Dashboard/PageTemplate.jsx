const PageTemplate = ({ title, subtitle, children }) => {
  return (
    <div className='animate-[fadeIn_0.35s_ease-out] rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
      <div className='mb-6 flex items-center justify-between gap-4'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.28em] text-orange-500'>Module</p>
          <h2 className='mt-2 text-2xl font-bold text-slate-900'>{title}</h2>
        </div>
        <span className='rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600'>
          {subtitle}
        </span>
      </div>

      {children}
    </div>
  )
}

export default PageTemplate
