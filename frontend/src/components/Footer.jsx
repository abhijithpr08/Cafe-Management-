const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const Footer = () => {
  return (
    <footer id='contact' className='border-t border-slate-200 bg-slate-950 px-4 py-16 text-slate-300 sm:px-6 lg:px-8'>
      <div className='mx-auto grid max-w-7xl gap-10 md:grid-cols-4'>
        <div className='fade-in-section'>
          <div className='flex items-center gap-3 text-lg font-semibold text-white'>
            <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-lg font-bold text-white'>R</span>
            <span>RestroPOS</span>
          </div>
          <p className='mt-4 leading-7 text-slate-400'>Modern billing and management software made for hospitality teams that move fast.</p>
        </div>

        <div className='fade-in-section'>
          <h3 className='mb-4 font-semibold text-white'>Quick Links</h3>
          <ul className='space-y-3 text-sm'>
            {navLinks.map((link) => (
              <li key={link.label}><a href={link.href} className='transition hover:text-orange-400'>{link.label}</a></li>
            ))}
          </ul>
        </div>

        <div className='fade-in-section'>
          <h3 className='mb-4 font-semibold text-white'>Features</h3>
          <ul className='space-y-3 text-sm'>
            <li>Fast billing</li>
            <li>Inventory control</li>
            <li>Staff management</li>
            <li>Live analytics</li>
          </ul>
        </div>

        <div className='fade-in-section'>
          <h3 className='mb-4 font-semibold text-white'>Contact</h3>
          <ul className='space-y-3 text-sm'>
            <li>hello@restropos.com</li>
            <li>+1 (800) 555-0148</li>
            <li>© 2026 RestroPOS</li>
          </ul>
        </div>
      </div>

      <div className='mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between'>
        <p>© 2026 RestroPOS. All rights reserved.</p>
        <div className='flex gap-4'>
          <a href='#home' className='transition hover:text-orange-400'>Instagram</a>
          <a href='#home' className='transition hover:text-orange-400'>LinkedIn</a>
          <a href='#home' className='transition hover:text-orange-400'>X</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
