const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null

  const colors = {
    info: 'bg-slate-900 text-white',
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    otp: 'bg-orange-600 text-white',
  }

  return (
    <div className='fixed bottom-24 left-1/2 z-[100] w-[90%] max-w-sm -translate-x-1/2 animate-[fadeIn_0.3s_ease]'>
      <div className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-xl ${colors[type] || colors.info}`}>
        <p className='text-sm font-medium'>{message}</p>
        <button type='button' onClick={onClose} className='text-lg leading-none opacity-70 hover:opacity-100'>
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast
