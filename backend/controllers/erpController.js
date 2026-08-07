import Vendor from '../models/Vendor.js'
import Purchase from '../models/Purchase.js'
import StockAdjustment from '../models/StockAdjustment.js'
import Wastage from '../models/Wastage.js'
import Attendance from '../models/Attendance.js'
import Shift from '../models/Shift.js'
import Settings from '../models/Settings.js'
import Customer from '../models/Customer.js'
import Inventory from '../models/Inventory.js'
import Order from '../models/Order.js'
import Table from '../models/Table.js'
import MenuItem from '../models/MenuItem.js'
import Discount from '../models/Discount.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import Category from '../models/Category.js'
import Feedback from '../models/Feedback.js'

const notify = async (type, message) => {
  await Notification.create({ type, message, read: false })
}

const todayStr = () => new Date().toISOString().slice(0, 10)

export const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({ key: 'business' })
  if (!settings) {
    settings = await Settings.create({ key: 'business' })
  }
  return settings
}

export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings', error: error.message })
  }
}

export const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { key: 'business' },
      { $set: { ...req.body, key: 'business' } },
      { new: true, upsert: true, runValidators: true }
    )
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings', error: error.message })
  }
}

export const simulatePrinterError = async (req, res) => {
  try {
    await notify('Printer Errors', req.body?.message || 'Kitchen printer offline (simulated demo error).')
    res.json({ success: true, message: 'Printer error notification created.' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to simulate printer error', error: error.message })
  }
}

export const generateDailySalesSummary = async (req, res) => {
  try {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const paid = await Order.aggregate([
      { $match: { createdAt: { $gte: start }, paymentStatus: 'Paid', status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ])
    const total = paid[0]?.total || 0
    const count = paid[0]?.count || 0
    await notify(
      'Daily Sales Summary',
      `Daily summary for ${todayStr()}: ₹${total.toFixed(2)} across ${count} paid orders.`
    )
    res.json({ success: true, total, count })
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate daily summary', error: error.message })
  }
}

export const backupData = async (req, res) => {
  try {
    const [
      users,
      categories,
      menuItems,
      tables,
      orders,
      inventory,
      discounts,
      feedback,
      notifications,
      customers,
      vendors,
      purchases,
      stockAdjustments,
      wastage,
      attendance,
      shifts,
      settings,
    ] = await Promise.all([
      User.find({}, { password: 0 }),
      Category.find(),
      MenuItem.find(),
      Table.find(),
      Order.find(),
      Inventory.find(),
      Discount.find(),
      Feedback.find(),
      Notification.find(),
      Customer.find(),
      Vendor.find(),
      Purchase.find(),
      StockAdjustment.find(),
      Wastage.find(),
      Attendance.find(),
      Shift.find(),
      Settings.find(),
    ])

    const payload = {
      exportedAt: new Date().toISOString(),
      users,
      categories,
      menuItems,
      tables,
      orders,
      inventory,
      discounts,
      feedback,
      notifications,
      customers,
      vendors,
      purchases,
      stockAdjustments,
      wastage,
      attendance,
      shifts,
      settings,
    }

    await notify('Backup Completion', `Backup completed at ${new Date().toLocaleString()} (${orders.length} orders).`)
    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: 'Backup failed', error: error.message })
  }
}

export const restoreData = async (req, res) => {
  try {
    const data = req.body
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Invalid backup JSON.' })
    }

    // Demo restore: upsert settings + reinsert key collections if arrays provided
    if (data.settings?.[0]) {
      await Settings.findOneAndUpdate({ key: 'business' }, data.settings[0], { upsert: true })
    }
    if (Array.isArray(data.vendors)) {
      await Vendor.deleteMany({})
      if (data.vendors.length) await Vendor.insertMany(data.vendors.map(({ _id, ...rest }) => rest))
    }
    if (Array.isArray(data.customers)) {
      await Customer.deleteMany({})
      if (data.customers.length) await Customer.insertMany(data.customers.map(({ _id, ...rest }) => rest))
    }

    await notify('Backup Completion', `Restore applied at ${new Date().toLocaleString()} (demo partial restore).`)
    res.json({ success: true, message: 'Restore completed (settings, vendors, customers).' })
  } catch (error) {
    res.status(500).json({ message: 'Restore failed', error: error.message })
  }
}

// ---------- Customers ----------
export const getCustomers = async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { mobile: { $regex: q, $options: 'i' } },
          ],
        }
      : {}
    const customers = await Customer.find(filter).sort({ totalSpend: -1 })
    res.json(customers)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers', error: error.message })
  }
}

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    const orders = await Order.find({
      $or: [{ orderId: { $in: customer.orderHistory } }, { customerMobile: customer.mobile }, { customerPhone: customer.mobile }],
    }).sort({ createdAt: -1 })
    res.json({ customer, orders })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer', error: error.message })
  }
}

// ---------- Vendors / Purchases / Adjustments / Wastage ----------
export const getVendors = async (req, res) => {
  try {
    res.json(await Vendor.find().sort({ name: 1 }))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vendors', error: error.message })
  }
}

export const createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body)
    res.status(201).json(vendor)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create vendor', error: error.message })
  }
}

export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })
    res.json(vendor)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update vendor', error: error.message })
  }
}

export const deleteVendor = async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id)
    res.json({ message: 'Vendor deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete vendor', error: error.message })
  }
}

export const getPurchases = async (req, res) => {
  try {
    res.json(await Purchase.find().sort({ purchaseDate: -1 }))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch purchases', error: error.message })
  }
}

export const createPurchase = async (req, res) => {
  try {
    const { itemName, quantity, unit, cost, supplier, vendorId, purchaseDate, notes } = req.body
    if (!itemName || quantity === undefined || cost === undefined || !supplier) {
      return res.status(400).json({ message: 'itemName, quantity, cost, and supplier are required.' })
    }
    const purchase = await Purchase.create({
      itemName,
      quantity,
      unit: unit || 'kg',
      cost,
      supplier,
      vendorId,
      purchaseDate: purchaseDate || new Date(),
      notes: notes || '',
    })

    let inv = await Inventory.findOne({ itemName })
    if (inv) {
      inv.quantity += Number(quantity)
      if (supplier) inv.supplier = supplier
      await inv.save()
    } else {
      inv = await Inventory.create({
        itemName,
        unit: unit || 'kg',
        quantity: Number(quantity),
        reorderLevel: 5,
        supplier,
      })
    }

    res.status(201).json({ purchase, inventory: inv })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create purchase', error: error.message })
  }
}

export const getStockAdjustments = async (req, res) => {
  try {
    res.json(await StockAdjustment.find().sort({ createdAt: -1 }))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch adjustments', error: error.message })
  }
}

export const createStockAdjustment = async (req, res) => {
  try {
    const { itemName, adjustment, reason, adjustedBy, inventoryId } = req.body
    if (!itemName || adjustment === undefined || !reason) {
      return res.status(400).json({ message: 'itemName, adjustment, and reason are required.' })
    }

    const inv = inventoryId
      ? await Inventory.findById(inventoryId)
      : await Inventory.findOne({ itemName })
    if (!inv) return res.status(404).json({ message: 'Inventory item not found' })

    inv.quantity = Math.max(0, inv.quantity + Number(adjustment))
    await inv.save()

    if (inv.quantity < inv.reorderLevel) {
      await notify('Low Stock', `${inv.itemName} is low (${inv.quantity} ${inv.unit}). Reorder level: ${inv.reorderLevel}.`)
    }

    const record = await StockAdjustment.create({
      itemName: inv.itemName,
      inventoryId: inv._id,
      adjustment: Number(adjustment),
      reason,
      adjustedBy: adjustedBy || 'Staff',
    })

    res.status(201).json({ adjustment: record, inventory: inv })
  } catch (error) {
    res.status(500).json({ message: 'Failed to adjust stock', error: error.message })
  }
}

export const getWastage = async (req, res) => {
  try {
    res.json(await Wastage.find().sort({ createdAt: -1 }))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wastage', error: error.message })
  }
}

export const createWastage = async (req, res) => {
  try {
    const { itemName, quantity, reason, loggedBy, inventoryId } = req.body
    if (!itemName || quantity === undefined || !reason) {
      return res.status(400).json({ message: 'itemName, quantity, and reason are required.' })
    }

    const inv = inventoryId
      ? await Inventory.findById(inventoryId)
      : await Inventory.findOne({ itemName })
    if (!inv) return res.status(404).json({ message: 'Inventory item not found' })

    inv.quantity = Math.max(0, inv.quantity - Number(quantity))
    await inv.save()

    if (inv.quantity < inv.reorderLevel) {
      await notify('Low Stock', `${inv.itemName} is low after wastage (${inv.quantity} ${inv.unit}).`)
    }

    const record = await Wastage.create({
      itemName: inv.itemName,
      inventoryId: inv._id,
      quantity: Number(quantity),
      reason,
      loggedBy: loggedBy || 'Staff',
    })

    res.status(201).json({ wastage: record, inventory: inv })
  } catch (error) {
    res.status(500).json({ message: 'Failed to log wastage', error: error.message })
  }
}

// ---------- Attendance / Shifts ----------
export const getAttendance = async (req, res) => {
  try {
    const filter = {}
    if (req.query.employeeId) filter.employeeId = req.query.employeeId
    if (req.query.date) filter.date = req.query.date
    res.json(await Attendance.find(filter).sort({ date: -1, checkIn: -1 }))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message })
  }
}

export const checkIn = async (req, res) => {
  try {
    const { employeeId, employeeName } = req.body
    if (!employeeId || !employeeName) {
      return res.status(400).json({ message: 'employeeId and employeeName are required.' })
    }
    const date = todayStr()
    let record = await Attendance.findOne({ employeeId, date })
    if (record?.checkIn && !record.checkOut) {
      return res.status(400).json({ message: 'Already checked in today.' })
    }
    if (!record) {
      record = await Attendance.create({
        employeeId,
        employeeName,
        date,
        checkIn: new Date(),
        status: 'Present',
      })
    } else {
      record.checkIn = new Date()
      record.checkOut = undefined
      record.status = 'Present'
      await record.save()
    }
    res.status(201).json(record)
  } catch (error) {
    res.status(500).json({ message: 'Check-in failed', error: error.message })
  }
}

export const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body
    const date = todayStr()
    const record = await Attendance.findOne({ employeeId, date })
    if (!record?.checkIn) return res.status(400).json({ message: 'No check-in found for today.' })
    record.checkOut = new Date()
    await record.save()
    res.json(record)
  } catch (error) {
    res.status(500).json({ message: 'Check-out failed', error: error.message })
  }
}

export const getShifts = async (req, res) => {
  try {
    const filter = {}
    if (req.query.date) filter.date = req.query.date
    if (req.query.employeeId) filter.employeeId = req.query.employeeId
    res.json(await Shift.find(filter).sort({ date: 1 }))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shifts', error: error.message })
  }
}

export const createShift = async (req, res) => {
  try {
    const shift = await Shift.create(req.body)
    res.status(201).json(shift)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create shift', error: error.message })
  }
}

export const updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!shift) return res.status(404).json({ message: 'Shift not found' })
    res.json(shift)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update shift', error: error.message })
  }
}

export const deleteShift = async (req, res) => {
  try {
    await Shift.findByIdAndDelete(req.params.id)
    res.json({ message: 'Shift deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete shift', error: error.message })
  }
}

// ---------- Table operations ----------
export const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body)
    res.status(201).json(table)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create table', error: error.message })
  }
}

export const reserveTable = async (req, res) => {
  try {
    const { customerName, phone, reservedFor, notes } = req.body
    const table = await Table.findById(req.params.id)
    if (!table) return res.status(404).json({ message: 'Table not found' })
    table.status = 'Reserved'
    table.reservation = {
      customerName: customerName || '',
      phone: phone || '',
      reservedFor: reservedFor ? new Date(reservedFor) : new Date(),
      notes: notes || '',
    }
    await table.save()
    res.json(table)
  } catch (error) {
    res.status(500).json({ message: 'Failed to reserve table', error: error.message })
  }
}

export const mergeTables = async (req, res) => {
  try {
    const { primaryTable, secondaryTables, orderId } = req.body
    if (!primaryTable || !secondaryTables?.length) {
      return res.status(400).json({ message: 'primaryTable and secondaryTables are required.' })
    }

    const all = [primaryTable, ...secondaryTables]
    await Table.updateMany(
      { tableNumber: { $in: all } },
      { status: 'Occupied', mergedWith: all, activeOrderId: orderId || '' }
    )

    if (orderId) {
      await Order.findOneAndUpdate(
        { orderId },
        { table: primaryTable, mergedTables: all }
      )
    }

    res.json({ success: true, merged: all })
  } catch (error) {
    res.status(500).json({ message: 'Failed to merge tables', error: error.message })
  }
}

export const transferOrder = async (req, res) => {
  try {
    const { orderId, fromTable, toTable } = req.body
    if (!orderId || !toTable) {
      return res.status(400).json({ message: 'orderId and toTable are required.' })
    }

    const order = await Order.findOne({ orderId })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const prev = order.table
    order.transferredFrom = fromTable || prev
    order.table = toTable
    await order.save()

    if (prev) {
      await Table.updateOne(
        { tableNumber: prev },
        { status: 'Available', activeOrderId: '', mergedWith: [] }
      )
    }
    await Table.updateOne(
      { tableNumber: toTable },
      { status: 'Occupied', activeOrderId: orderId }
    )

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to transfer order', error: error.message })
  }
}

export const splitOrderBill = async (req, res) => {
  try {
    const { orderId, splits } = req.body
    // splits: [{ items: [{name, qty}], customerName? }]
    if (!orderId || !splits?.length) {
      return res.status(400).json({ message: 'orderId and splits are required.' })
    }

    const order = await Order.findOne({ orderId })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const created = []
    for (let i = 0; i < splits.length; i++) {
      const part = splits[i]
      const items = part.items || []
      const subtotal = items.reduce((s, it) => s + (it.price || 0) * it.qty, 0)
      const newOrder = await Order.create({
        orderId: `${order.orderId}-S${i + 1}`,
        orderType: order.orderType,
        table: order.table,
        items,
        status: order.status === 'Completed' ? 'Completed' : 'Served',
        total: subtotal,
        subtotal,
        waiter: order.waiter,
        customerName: part.customerName || order.customerName,
        customerPhone: part.customerPhone || order.customerPhone,
        customerMobile: order.customerMobile,
        orderSource: order.orderSource,
        splitFrom: order.orderId,
        paymentStatus: 'Pending',
      })
      created.push(newOrder)
    }

    order.status = 'Cancelled'
    order.cancelReason = 'Split into separate bills'
    await order.save()

    res.status(201).json({ original: order, splits: created })
  } catch (error) {
    res.status(500).json({ message: 'Failed to split bill', error: error.message })
  }
}

// ---------- Analytics reports ----------
const dateRangeFilter = (from, to) => {
  const match = { status: { $ne: 'Cancelled' } }
  if (from || to) {
    match.createdAt = {}
    if (from) match.createdAt.$gte = new Date(from)
    if (to) {
      const end = new Date(to)
      end.setHours(23, 59, 59, 999)
      match.createdAt.$lte = end
    }
  }
  return match
}

export const getAnalyticsReport = async (req, res) => {
  try {
    const { type = 'sales', from, to } = req.query
    const match = dateRangeFilter(from, to)

    if (type === 'sales') {
      const rows = await Order.aggregate([
        { $match: { ...match, paymentStatus: 'Paid' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$total' },
            orders: { $sum: 1 },
            discount: { $sum: { $ifNull: ['$discountApplied.discountAmount', 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ])
      const net = rows.reduce((s, r) => s + r.sales, 0) - rows.reduce((s, r) => s + r.discount, 0)
      return res.json({ type, rows, netSales: net })
    }

    if (type === 'gst') {
      const rows = await Order.aggregate([
        { $match: { ...match, paymentStatus: 'Paid' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            cgst: { $sum: { $ifNull: ['$tax.cgst', 0] } },
            sgst: { $sum: { $ifNull: ['$tax.sgst', 0] } },
            taxTotal: { $sum: { $ifNull: ['$tax.total', 0] } },
            taxable: { $sum: { $ifNull: ['$subtotal', '$total'] } },
          },
        },
        { $sort: { _id: 1 } },
      ])
      return res.json({ type, rows })
    }

    if (type === 'item') {
      const rows = await Order.aggregate([
        { $match: match },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            qty: { $sum: '$items.qty' },
            revenue: { $sum: { $multiply: ['$items.qty', { $ifNull: ['$items.price', 0] }] } },
          },
        },
        { $sort: { qty: -1 } },
      ])
      return res.json({ type, rows })
    }

    if (type === 'category') {
      const menu = await MenuItem.find()
      const catMap = Object.fromEntries(menu.map((m) => [m.name, m.category]))
      const itemRows = await Order.aggregate([
        { $match: match },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            qty: { $sum: '$items.qty' },
            revenue: { $sum: { $multiply: ['$items.qty', { $ifNull: ['$items.price', 0] }] } },
          },
        },
      ])
      const byCat = {}
      itemRows.forEach((r) => {
        const cat = catMap[r._id] || 'Uncategorized'
        if (!byCat[cat]) byCat[cat] = { _id: cat, qty: 0, revenue: 0 }
        byCat[cat].qty += r.qty
        byCat[cat].revenue += r.revenue
      })
      return res.json({ type, rows: Object.values(byCat).sort((a, b) => b.revenue - a.revenue) })
    }

    if (type === 'customer') {
      const rows = await Customer.find().sort({ totalSpend: -1 }).lean()
      return res.json({ type, rows })
    }

    if (type === 'discount') {
      const rows = await Order.aggregate([
        { $match: { ...match, 'discountApplied.discountAmount': { $gt: 0 } } },
        {
          $project: {
            orderId: 1,
            createdAt: 1,
            code: '$discountApplied.code',
            name: '$discountApplied.name',
            discountAmount: '$discountApplied.discountAmount',
            total: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      return res.json({ type, rows })
    }

    if (type === 'cancellation') {
      const rows = await Order.find({ status: 'Cancelled', ...(match.createdAt ? { createdAt: match.createdAt } : {}) })
        .sort({ createdAt: -1 })
        .lean()
      return res.json({ type, rows })
    }

    if (type === 'daily') {
      const day = from || todayStr()
      const start = new Date(day)
      start.setHours(0, 0, 0, 0)
      const end = new Date(day)
      end.setHours(23, 59, 59, 999)
      const dayMatch = { createdAt: { $gte: start, $lte: end }, status: { $ne: 'Cancelled' } }
      const [sales, payments, cancelled] = await Promise.all([
        Order.aggregate([
          { $match: { ...dayMatch, paymentStatus: 'Paid' } },
          {
            $group: {
              _id: null,
              sales: { $sum: '$total' },
              orders: { $sum: 1 },
              tax: { $sum: { $ifNull: ['$tax.total', 0] } },
              discount: { $sum: { $ifNull: ['$discountApplied.discountAmount', 0] } },
            },
          },
        ]),
        Order.aggregate([
          { $match: { ...dayMatch, paymentStatus: 'Paid' } },
          { $unwind: { path: '$paymentDetails', preserveNullAndEmptyArrays: true } },
          { $group: { _id: { $ifNull: ['$paymentDetails.method', 'Unknown'] }, amount: { $sum: '$paymentDetails.amount' } } },
        ]),
        Order.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'Cancelled' }),
      ])
      const s = sales[0] || { sales: 0, orders: 0, tax: 0, discount: 0 }
      return res.json({
        type,
        day,
        summary: { ...s, net: s.sales - s.discount, cancelled },
        payments,
      })
    }

    res.status(400).json({ message: 'Unknown report type' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report', error: error.message })
  }
}

/** Apply loyalty points after payment (1 pt per ₹100) */
export const applyLoyaltyForOrder = async (order) => {
  const mobile = order.customerMobile || order.customerPhone
  if (!mobile || !/^\d{10}$/.test(mobile)) return
  const points = Math.floor(Number(order.total || 0) / 100)
  let customer = await Customer.findOne({ mobile })
  if (!customer) {
    customer = await Customer.create({
      mobile,
      name: order.customerName || '',
      orderHistory: [order.orderId],
      loyaltyPoints: points,
      totalSpend: order.total || 0,
      orderCount: 1,
    })
  } else {
    if (!customer.orderHistory.includes(order.orderId)) customer.orderHistory.push(order.orderId)
    customer.loyaltyPoints += points
    customer.totalSpend += Number(order.total || 0)
    customer.orderCount += 1
    if (order.customerName && !customer.name) customer.name = order.customerName
    await customer.save()
  }
  return customer
}

export { notify }
