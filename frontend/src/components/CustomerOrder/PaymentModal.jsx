import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import apiClient from '../../api/apiClient'

const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'Google Pay']
const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Wallet', 'Split Payment']

const CardForm = ({ onPay, loading, label }) => {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  const handlePay = () => {
    if (cardNumber.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvv.length < 3) return
    onPay()
  }

  return (
    <div className='space-y-3'>
      <input
        type='text'
        placeholder='Card Number'
        value={cardNumber}
        onChange={(e) => setCardNumber(formatCard(e.target.value))}
        className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400'
      />
      <div className='grid grid-cols-2 gap-3'>
        <input
          type='text'
          placeholder='MM/YY'
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          className='rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400'
        />
        <input
          type='password'
          placeholder='CVV'
          maxLength={4}
          value={cvv}
          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
          className='rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400'
        />
      </div>
      <button
        type='button'
        onClick={handlePay}
        disabled={loading}
        className='w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60'
      >
        {loading ? 'Processing...' : `Pay with ${label}`}
      </button>
    </div>
  )
}

const PaymentModal = ({ isOpen, onClose, order, onPaymentSuccess }) => {
  const [method, setMethod] = useState('UPI')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [wallet, setWallet] = useState(WALLETS[0])
  const [splitMode, setSplitMode] = useState('methods')
  const [splitMethods, setSplitMethods] = useState({ Cash: 0, UPI: 0, 'Credit Card': 0 })
  const [splitPeople, setSplitPeople] = useState(2)
  const [customSplits, setCustomSplits] = useState([0, 0])

  const total = order?.total || 0

  useEffect(() => {
    if (isOpen) {
      setMethod('UPI')
      setError('')
      setSplitMethods({ Cash: 0, UPI: 0, 'Credit Card': 0 })
      setSplitPeople(2)
      setCustomSplits([0, 0])
    }
  }, [isOpen])

  useEffect(() => {
    if (splitMode === 'people' && splitPeople >= 2) {
      setCustomSplits(Array.from({ length: splitPeople }, () => 0))
    }
  }, [splitPeople, splitMode])

  const splitMethodTotal = useMemo(
    () => Object.values(splitMethods).reduce((s, v) => s + (Number(v) || 0), 0),
    [splitMethods]
  )

  const splitPeopleTotal = useMemo(
    () => customSplits.reduce((s, v) => s + (Number(v) || 0), 0),
    [customSplits]
  )

  const remainingBalance = useMemo(() => {
    if (method !== 'Split Payment') return 0
    const paid = splitMode === 'methods' ? splitMethodTotal : splitPeopleTotal
    return Math.round((total - paid) * 100) / 100
  }, [method, splitMode, splitMethodTotal, splitPeopleTotal, total])

  const equalSplitAmount = useMemo(() => {
    if (splitPeople < 2) return 0
    return Math.round((total / splitPeople) * 100) / 100
  }, [total, splitPeople])

  const applyEqualSplit = () => {
    const perPerson = Math.round((total / splitPeople) * 100) / 100
    const amounts = Array.from({ length: splitPeople }, () => perPerson)
    const diff = Math.round((total - perPerson * splitPeople) * 100) / 100
    if (diff !== 0) amounts[0] = Math.round((amounts[0] + diff) * 100) / 100
    setCustomSplits(amounts)
  }

  const buildPaymentDetails = () => {
    if (method === 'Split Payment') {
      if (splitMode === 'methods') {
        return Object.entries(splitMethods)
          .filter(([, amt]) => Number(amt) > 0)
          .map(([m, amt]) => ({ method: m, amount: Number(amt) }))
      }
      return customSplits
        .map((amt, i) => ({ method: `Person ${i + 1}`, amount: Number(amt) }))
        .filter((p) => p.amount > 0)
    }
    return [{ method, amount: total }]
  }

  const validatePayment = () => {
    if (method === 'Split Payment') {
      const paid = splitMode === 'methods' ? splitMethodTotal : splitPeopleTotal
      if (Math.abs(paid - total) > 0.01) {
        setError(`Split amounts must equal ₹${total}. Remaining: ₹${remainingBalance}`)
        return false
      }
    }
    setError('')
    return true
  }

  const processPayment = async () => {
    if (!validatePayment()) return
    setLoading(true)
    setError('')
    try {
      await new Promise((r) => setTimeout(r, method.includes('Card') ? 1500 : 800))
      const paymentDetails = buildPaymentDetails()
      const { data } = await apiClient.put(`/orders/${order._id}/payment`, { paymentDetails })
      onPaymentSuccess?.(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !order) return null

  const upiString = `upi://pay?pa=restropos@upi&pn=RestroPOS&am=${total}&cu=INR&tn=Order${order.orderId}`

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4'>
      <div className='flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl'>
        <div className='flex items-center justify-between border-b border-slate-100 p-5'>
          <div>
            <h3 className='text-xl font-bold text-slate-900'>Pay Now</h3>
            <p className='text-sm text-slate-500'>Total: ₹{total}</p>
          </div>
          <button type='button' onClick={onClose} className='text-2xl text-slate-400 hover:text-slate-600'>×</button>
        </div>

        <div className='flex gap-1 overflow-x-auto border-b border-slate-100 px-3 py-2'>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              type='button'
              onClick={() => setMethod(m)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                method === m ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className='flex-1 overflow-y-auto p-5'>
          {error && <div className='mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600'>{error}</div>}

          {method === 'Cash' && (
            <div className='text-center'>
              <p className='text-slate-600'>Please pay ₹{total} in cash to the cashier.</p>
              <button
                type='button'
                onClick={processPayment}
                disabled={loading}
                className='mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'
              >
                {loading ? 'Confirming...' : 'Confirm Cash Received'}
              </button>
            </div>
          )}

          {method === 'UPI' && (
            <div className='flex flex-col items-center'>
              <div className='rounded-2xl border border-slate-200 bg-white p-4'>
                <QRCodeSVG value={upiString} size={180} level='M' />
              </div>
              <p className='mt-3 text-xs text-slate-500'>Scan with any UPI app (simulated)</p>
              <p className='mt-1 font-mono text-sm text-slate-700'>restropos@upi</p>
              <button
                type='button'
                onClick={processPayment}
                disabled={loading}
                className='mt-6 w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60'
              >
                {loading ? 'Verifying...' : 'Payment Received (Simulate)'}
              </button>
            </div>
          )}

          {(method === 'Credit Card' || method === 'Debit Card') && (
            <CardForm onPay={processPayment} loading={loading} label={method} />
          )}

          {method === 'Wallet' && (
            <div className='space-y-4'>
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none'
              >
                {WALLETS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <button
                type='button'
                onClick={processPayment}
                disabled={loading}
                className='w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60'
              >
                {loading ? 'Processing...' : `Pay ₹${total} via ${wallet}`}
              </button>
            </div>
          )}

          {method === 'Split Payment' && (
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setSplitMode('methods')}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold ${splitMode === 'methods' ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}
                >
                  By Methods
                </button>
                <button
                  type='button'
                  onClick={() => setSplitMode('people')}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold ${splitMode === 'people' ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}
                >
                  By People
                </button>
              </div>

              {splitMode === 'methods' ? (
                <div className='space-y-3'>
                  {Object.keys(splitMethods).map((m) => (
                    <div key={m} className='flex items-center gap-3'>
                      <label className='w-28 text-sm font-medium text-slate-700'>{m}</label>
                      <input
                        type='number'
                        min='0'
                        step='0.01'
                        value={splitMethods[m] || ''}
                        onChange={(e) => setSplitMethods((prev) => ({ ...prev, [m]: e.target.value }))}
                        className='flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none'
                        placeholder='₹0'
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <label className='text-sm font-medium text-slate-700'>Number of people</label>
                    <input
                      type='number'
                      min='2'
                      max='10'
                      value={splitPeople}
                      onChange={(e) => setSplitPeople(Math.max(2, Number(e.target.value)))}
                      className='w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none'
                    />
                    <button type='button' onClick={applyEqualSplit} className='text-xs font-semibold text-orange-600'>
                      Split equally (₹{equalSplitAmount}/person)
                    </button>
                  </div>
                  {customSplits.map((amt, i) => (
                    <div key={i} className='flex items-center gap-3'>
                      <label className='w-28 text-sm font-medium text-slate-700'>Person {i + 1}</label>
                      <input
                        type='number'
                        min='0'
                        step='0.01'
                        value={amt || ''}
                        onChange={(e) => {
                          const next = [...customSplits]
                          next[i] = e.target.value
                          setCustomSplits(next)
                        }}
                        className='flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none'
                        placeholder='₹0'
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                remainingBalance === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                Remaining balance: ₹{remainingBalance}
              </div>

              <button
                type='button'
                onClick={processPayment}
                disabled={loading || remainingBalance !== 0}
                className='w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60'
              >
                {loading ? 'Processing...' : 'Complete Split Payment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
