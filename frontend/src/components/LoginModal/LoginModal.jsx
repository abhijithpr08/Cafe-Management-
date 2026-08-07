import { useState } from 'react'

const LoginModal = ({ isOpen, onClose, onSubmit, error }) => {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(formData.username, formData.password)
  }

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl shadow-slate-900/25 transition-all duration-300 animate-[fadeIn_0.25s_ease-out] sm:p-7'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-orange-500'>Welcome back</p>
            <h2 className='mt-2 text-2xl font-bold text-slate-900'>Sign in</h2>
          </div>

          <button
            type='button'
            aria-label='Close login modal'
            className='flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900'
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label htmlFor='username' className='mb-2 block text-sm font-medium text-slate-700'>Username</label>
            <input
              id='username'
              type='text'
              value={formData.username}
              onChange={(event) => setFormData({ ...formData, username: event.target.value })}
              className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100'
              placeholder='Enter username'
            />
          </div>

          <div>
            <label htmlFor='password' className='mb-2 block text-sm font-medium text-slate-700'>Password</label>
            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100'
                placeholder='Enter password'
              />
              <button
                type='button'
                aria-label='Toggle password visibility'
                className='absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-slate-900'
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <p className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600'>
              {error}
            </p>
          )}

          <button
            type='submit'
            className='w-full rounded-full bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-500'
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
