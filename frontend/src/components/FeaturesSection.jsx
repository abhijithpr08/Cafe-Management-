const features = [
  {
    title: 'Lightning-fast billing',
    description: 'Create invoices in seconds with smart item search and instant tax calculation.',
  },
  {
    title: 'Inventory control',
    description: 'Track stock, automate low-stock alerts, and reduce food waste without effort.',
  },
  {
    title: 'Real-time insights',
    description: 'Understand sales trends, staff performance, and peak hours with live dashboards.',
  },
]

const FeaturesSection = () => {
  return (
    <section id='features' className='bg-white px-4 py-20 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='fade-in-section mb-12 text-center'>
          <p className='mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-orange-500'>Features</p>
          <h2 className='text-3xl font-bold text-slate-900 sm:text-4xl'>Built for busy kitchens and front-of-house teams</h2>
          <p className='mx-auto mt-4 max-w-2xl text-lg text-slate-600'>Everything your restaurant needs to serve guests faster and run operations with confidence.</p>
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          {features.map((feature, index) => (
            <article key={feature.title} className={`fade-in-section rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${index === 1 ? 'md:-translate-y-2' : ''}`}>
              <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-xl text-orange-600'>
                {index === 0 ? '🧾' : index === 1 ? '📦' : '📈'}
              </div>
              <h3 className='mb-3 text-xl font-semibold text-slate-900'>{feature.title}</h3>
              <p className='leading-7 text-slate-600'>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
