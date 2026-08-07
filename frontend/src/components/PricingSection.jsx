const pricingTiers = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for cafés and small restaurants.',
    perks: ['1 outlet', 'Basic reports', 'Email support'],
  },
  {
    name: 'Growth',
    price: '$79',
    description: 'For growing chains that need smarter automation.',
    perks: ['Unlimited menus', 'Advanced analytics', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Tailored workflows for multi-branch operations.',
    perks: ['Custom integrations', 'Dedicated onboarding', 'Multi-location control'],
  },
]

const PricingSection = () => {
  return (
    <section id='pricing' className='bg-slate-50 px-4 py-20 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='fade-in-section mb-12 text-center'>
          <p className='mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-orange-500'>Pricing</p>
          <h2 className='text-3xl font-bold text-slate-900 sm:text-4xl'>Choose a plan that fits your growth</h2>
        </div>
        <div className='grid gap-6 lg:grid-cols-3'>
          {pricingTiers.map((tier, index) => (
            <div key={tier.name} className={`fade-in-section rounded-3xl border border-slate-200 bg-white p-8 shadow-sm ${index === 1 ? 'ring-2 ring-orange-400' : ''}`}>
              <h3 className='text-xl font-semibold text-slate-900'>{tier.name}</h3>
              <p className='mt-3 text-sm leading-7 text-slate-600'>{tier.description}</p>
              <div className='mt-6 text-4xl font-black text-slate-900'>{tier.price}</div>
              <ul className='mt-6 space-y-3 text-sm text-slate-600'>
                {tier.perks.map((perk) => (
                  <li key={perk} className='flex items-center gap-2'>
                    <span className='text-orange-500'>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <a href='#contact' className='mt-8 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500'>
                Book a Demo
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PricingSection
