import Customer from '../models/Customer.js'
import Order from '../models/Order.js'
import Discount from '../models/Discount.js'
import Notification from '../models/Notification.js'
import Table from '../models/Table.js'
import Category from '../models/Category.js'
import { storeOtp, verifyStoredOtp } from '../config/otpStore.js'
import { calculateTax } from '../config/taxConfig.js'
import { applyLoyaltyForOrder } from './erpController.js'

const generateOtp = () => String(Math.floor(1000 + Math.random() * 9000))

export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Valid 10-digit mobile number is required.' })
    }

    const otp = generateOtp()
    storeOtp(mobile, otp)

    // Simulated SMS — returned in response for demo purposes
    res.json({
      success: true,
      message: 'OTP sent successfully (simulated).',
      mobile,
      otp,
      simulatedSms: true,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message })
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp, name } = req.body

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Valid 10-digit mobile number is required.' })
    }

    if (!otp || !/^\d{4}$/.test(otp)) {
      return res.status(400).json({ message: 'Valid 4-digit OTP is required.' })
    }

    const isValid = verifyStoredOtp(mobile, otp)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' })
    }

    let customer = await Customer.findOne({ mobile })
    if (!customer) {
      customer = await Customer.create({ mobile, name: name || '' })
    } else if (name && !customer.name) {
      customer.name = name
      await customer.save()
    }

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      customer,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message })
  }
}

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message })
  }
}

export const validateDiscount = async (req, res) => {
  try {
    const code = req.params.code?.trim().toUpperCase()
    if (!code) {
      return res.status(400).json({ message: 'Discount code is required.' })
    }

    const discount = await Discount.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') } })
    if (!discount) {
      return res.status(404).json({ valid: false, message: 'Invalid coupon code.' })
    }

    if (!discount.active) {
      return res.status(400).json({ valid: false, message: 'This coupon is no longer active.' })
    }

    if (new Date(discount.validTill) < new Date()) {
      return res.status(400).json({ valid: false, message: 'This coupon has expired.' })
    }

    res.json({
      valid: true,
      discount: {
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to validate discount', error: error.message })
  }
}

export const createCustomerOrder = async (req, res) => {
  try {
    const { orderId, table, items, status, total, customerMobile, subtotal, discountApplied } = req.body

    if (!orderId || !table || !items?.length || !customerMobile) {
      return res.status(400).json({ message: 'Order ID, table, items, and customer mobile are required.' })
    }

    const computedSubtotal =
      subtotal ??
      items.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0)

    let discountAmount = 0
    if (discountApplied?.code) {
      const discount = await Discount.findOne({
        code: { $regex: new RegExp(`^${discountApplied.code}$`, 'i') },
        active: true,
      })
      if (discount && new Date(discount.validTill) >= new Date()) {
        if (discount.type.toLowerCase().includes('percent')) {
          discountAmount = (computedSubtotal * discount.value) / 100
        } else {
          discountAmount = discount.value
        }
        discountApplied.discountAmount = Math.min(discountAmount, computedSubtotal)
        discountApplied.name = discount.name
        discountApplied.type = discount.type
        discountApplied.value = discount.value
      }
    }

    const afterDiscount = computedSubtotal - (discountApplied?.discountAmount || 0)
    const tax = calculateTax(afterDiscount)
    const grandTotal = Math.round((afterDiscount + tax.total) * 100) / 100

    const order = await Order.create({
      orderId,
      table,
      items,
      status: status || 'Preparing',
      total: total ?? grandTotal,
      subtotal: computedSubtotal,
      customerMobile,
      discountApplied: discountApplied?.discountAmount ? discountApplied : undefined,
      tax,
      waiter: 'Customer (QR)',
      orderSource: 'QR',
      paymentStatus: 'Pending',
    })

    await Table.updateOne({ tableNumber: table }, { status: 'Occupied' })

    let customer = await Customer.findOne({ mobile: customerMobile })
    if (!customer) {
      customer = await Customer.create({ mobile: customerMobile, orderHistory: [order.orderId] })
    } else if (!customer.orderHistory.includes(order.orderId)) {
      customer.orderHistory.push(order.orderId)
      await customer.save()
    }

    await Notification.create({
      type: 'Order Status',
      message: `New QR order ${order.orderId} from Table ${table} — Preparing`,
      read: false,
    })

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message })
  }
}

export const updateOrderPayment = async (req, res) => {
  try {
    const { paymentDetails, discountApplied } = req.body

    if (!paymentDetails?.length) {
      return res.status(400).json({ message: 'Payment details are required.' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const paidTotal = paymentDetails.reduce((sum, p) => sum + Number(p.amount), 0)
    const expectedTotal = order.total

    if (Math.abs(paidTotal - expectedTotal) > 0.01) {
      return res.status(400).json({
        message: `Payment total (₹${paidTotal}) does not match bill total (₹${expectedTotal}).`,
      })
    }

    if (discountApplied && !order.discountApplied) {
      order.discountApplied = discountApplied
    }

    order.paymentDetails = paymentDetails
    order.paymentStatus = 'Paid'
    order.status = 'Completed'
    await order.save()

    await Table.updateOne({ tableNumber: order.table }, { status: 'Available', activeOrderId: '', mergedWith: [] })

    try {
      await applyLoyaltyForOrder(order)
    } catch {
      /* loyalty is best-effort */
    }

    await Notification.create({
      type: 'Order Status',
      message: `Order ${order.orderId} (Table ${order.table}) — Payment received & Completed`,
      read: false,
    })

    await Notification.create({
      type: 'Daily Sales Summary',
      message: `Payment of ₹${paidTotal} recorded for order ${order.orderId}. Daily sales updated.`,
      read: false,
    })

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update payment', error: error.message })
  }
}

export const applyBillToOrder = async (req, res) => {
  try {
    const { discountCode } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const subtotal =
      order.subtotal ??
      order.items.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0)

    let discountApplied = order.discountApplied
    let discountAmount = discountApplied?.discountAmount || 0

    if (discountCode && !discountApplied) {
      const discount = await Discount.findOne({
        code: { $regex: new RegExp(`^${discountCode.trim()}$`, 'i') },
        active: true,
      })

      if (!discount) {
        return res.status(404).json({ message: 'Invalid coupon code.' })
      }
      if (new Date(discount.validTill) < new Date()) {
        return res.status(400).json({ message: 'This coupon has expired.' })
      }

      if (discount.type.toLowerCase().includes('percent')) {
        discountAmount = (subtotal * discount.value) / 100
      } else {
        discountAmount = discount.value
      }
      discountAmount = Math.min(discountAmount, subtotal)

      discountApplied = {
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        discountAmount,
      }
    }

    const afterDiscount = subtotal - discountAmount
    const tax = calculateTax(afterDiscount)
    const grandTotal = Math.round((afterDiscount + tax.total) * 100) / 100

    order.subtotal = subtotal
    order.discountApplied = discountApplied || undefined
    order.tax = tax
    order.total = grandTotal
    await order.save()

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate bill', error: error.message })
  }
}
