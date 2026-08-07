const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const Navbar = ({ menuOpen, setMenuOpen, scrolled, user, onLoginClick, onLogout }) => {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-lg backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8'>
        <a href='#home' className='flex items-center gap-3 text-lg font-semibold text-slate-900'>
          <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-lg font-bold text-white shadow-lg shadow-orange-200'>R</span>
          <span>RestroPOS</span>
        </a>

        <div className='hidden items-center gap-8 md:flex'>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className='text-sm font-medium text-slate-700 transition hover:text-orange-500'
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className='flex items-center gap-3'>
          {user ? (
            <div className='hidden items-center gap-3 md:flex'>
              <div className='rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white'>
                {user.username} · {user.role}
              </div>
              <button
                type='button'
                onClick={onLogout}
                className='rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-orange-400 hover:text-orange-500'
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type='button'
              onClick={onLoginClick}
              className='hidden rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-500 md:inline-flex'
            >
              Login / Sign In
            </button>
          )}

          <button
            type='button'
            aria-label='Toggle navigation menu'
            className='rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm md:hidden'
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='mx-4 mb-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg'>
          <div className='flex flex-col gap-3'>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className='rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-500'
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {user ? (
              <>
                <div className='rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white'>
                  {user.username} · {user.role}
                </div>
                <button
                  type='button'
                  onClick={onLogout}
                  className='mt-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 transition hover:border-orange-400 hover:text-orange-500'
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type='button'
                onClick={() => {
                  setMenuOpen(false)
                  onLoginClick()
                }}
                className='mt-2 rounded-full bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-orange-500'
              >
                Login / Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
