/** In-memory OTP store for simulated SMS verification (trial/demo only). */
const otpStore = new Map()

const OTP_TTL_MS = 5 * 60 * 1000

export const storeOtp = (mobile, otp) => {
  otpStore.set(mobile, { otp, expiresAt: Date.now() + OTP_TTL_MS })
}

export const verifyStoredOtp = (mobile, otp) => {
  const entry = otpStore.get(mobile)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(mobile)
    return false
  }
  if (entry.otp !== otp) return false
  otpStore.delete(mobile)
  return true
}

export const clearOtp = (mobile) => {
  otpStore.delete(mobile)
}
