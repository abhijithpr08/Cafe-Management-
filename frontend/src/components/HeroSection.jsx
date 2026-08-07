const HeroSection = () => {
  return (
    <section className='relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.15),_transparent_28%),linear-gradient(135deg,#fff7ed_0%,#f8fafc_45%,#eef2ff_100%)]'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.12),transparent_25%)]' />
      <div className='relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-32'>
        <div className='fade-in-section space-y-8'>
          <div className='inline-flex items-center rounded-full border border-orange-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-orange-600 shadow-sm'>
            Trusted by 300+ modern restaurants
          </div>
          <div className='space-y-4'>
            <h1 className='max-w-2xl text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl'>
              Smart billing and restaurant management made simple.
            </h1>
            <p className='max-w-xl text-lg leading-8 text-slate-600'>
              Streamline orders, payments, inventory, and staff workflows from one elegant platform built for fast-moving hospitality teams.
            </p>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <a href='#pricing' className='rounded-full bg-orange-500 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600'>
              Get Started
            </a>
            <a href='#features' className='rounded-full border border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-orange-400 hover:text-orange-500'>
              Watch Demo
            </a>
          </div>
          <div className='flex flex-wrap gap-4 text-sm text-slate-600'>
            <span className='rounded-full bg-white/80 px-3 py-1.5 shadow-sm'>⚡ 2x faster checkout</span>
            <span className='rounded-full bg-white/80 px-3 py-1.5 shadow-sm'>📊 Live reports</span>
            <span className='rounded-full bg-white/80 px-3 py-1.5 shadow-sm'>🧾 GST-ready invoices</span>
          </div>
        </div>

        <div className='fade-in-section'>
          <div className='relative mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white/80 p-4 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)] backdrop-blur sm:p-6'>
            <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-400/20 blur-3xl' />
            <div className='absolute -bottom-5 -left-5 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl' />
            <svg viewBox='0 0 560 420' className='w-full rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-4'>
              <rect x='40' y='50' width='480' height='320' rx='24' fill='white' opacity='0.06' />
              <rect x='70' y='90' width='180' height='110' rx='16' fill='#f97316' />
              <rect x='270' y='90' width='220' height='55' rx='14' fill='#f8fafc' opacity='0.95' />
              <rect x='270' y='160' width='160' height='40' rx='14' fill='#f8fafc' opacity='0.9' />
              <rect x='270' y='220' width='220' height='110' rx='16' fill='#e2e8f0' />
              <rect x='90' y='220' width='140' height='110' rx='16' fill='#f59e0b' opacity='0.95' />
              <circle cx='420' cy='130' r='24' fill='#38bdf8' />
              <path d='M385 130h70' stroke='#fff' strokeWidth='8' strokeLinecap='round' />
              <path d='M420 95v70' stroke='#fff' strokeWidth='8' strokeLinecap='round' />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
