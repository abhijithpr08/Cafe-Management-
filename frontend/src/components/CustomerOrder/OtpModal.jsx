import { useEffect, useRef, useState } from 'react'
import apiClient from '../../api/apiClient'
import Toast from './Toast'

const OtpModal = ({ isOpen, onClose, onVerified, mobile: initialMobile = '' }) => {
  const [step, setStep] = useState('mobile')
  const [mobile, setMobile] = useState(initialMobile)
  const [otp, setOtp] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef([])

  useEffect(() => {
    if (isOpen) {
      setStep('mobile')
      setMobile(initialMobile)
      setOtp(['', '', '', ''])
      setError('')
    }
  }, [isOpen, initialMobile])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 5000)
  }

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.post('/auth/send-otp', { mobile })
      console.log(`[Simulated SMS] OTP for ${mobile}: ${data.otp}`)
      showToast(`Demo OTP: ${data.otp} (simulated SMS)`)
      setStep('otp')
      setCountdown(30)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    await handleSendOtp()
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return

    const next = [...otp]
    next[index] = value
    setOtp(next)

    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpValue = otp.join('')
    if (otpValue.length !== 4) {
      setError('Please enter the 4-digit OTP.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.post('/auth/verify-otp', { mobile, otp: otpValue })
      onVerified?.(data.customer)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center'>
        <div className='w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xl font-bold text-slate-900'>
              {step === 'mobile' ? 'Enter Mobile Number' : 'Verify OTP'}
            </h3>
            <button type='button' onClick={onClose} className='text-2xl text-slate-400 hover:text-slate-600'>
              ×
            </button>
          </div>

          <p className='mt-2 text-sm text-slate-500'>
            {step === 'mobile'
              ? 'We need your mobile number to place the order and send updates.'
              : `Enter the 4-digit OTP sent to +91 ${mobile}`}
          </p>

          {error && (
            <div className='mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600'>{error}</div>
          )}

          {step === 'mobile' ? (
            <div className='mt-6 space-y-4'>
              <div>
                <label className='text-sm font-medium text-slate-700'>Mobile Number</label>
                <div className='mt-1 flex overflow-hidden rounded-xl border border-slate-200'>
                  <span className='flex items-center bg-slate-50 px-3 text-sm text-slate-500'>+91</span>
                  <input
                    type='tel'
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder='9876543210'
                    className='flex-1 px-3 py-3 text-sm outline-none'
                  />
                </div>
              </div>
              <button
                type='button'
                onClick={handleSendOtp}
                disabled={loading}
                className='w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60'
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className='mt-6 space-y-4'>
              <div className='flex justify-center gap-3'>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type='text'
                    inputMode='numeric'
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className='h-14 w-12 rounded-xl border-2 border-slate-200 text-center text-xl font-bold outline-none focus:border-orange-400'
                  />
                ))}
              </div>

              <button
                type='button'
                onClick={handleVerify}
                disabled={loading}
                className='w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60'
              >
                {loading ? 'Verifying...' : 'Verify & Place Order'}
              </button>

              <button
                type='button'
                onClick={handleResendOtp}
                disabled={countdown > 0 || loading}
                className='w-full text-sm font-medium text-orange-600 disabled:text-slate-400'
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>

              <button
                type='button'
                onClick={() => { setStep('mobile'); setOtp(['', '', '', '']); setError('') }}
                className='w-full text-sm text-slate-500 hover:text-slate-700'
              >
                Change mobile number
              </button>
            </div>
          )}
        </div>
      </div>
      <Toast message={toast} type='otp' onClose={() => setToast('')} />
    </>
  )
}

export default OtpModal
