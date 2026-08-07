import User from '../models/User.js'
import Category from '../models/Category.js'
import MenuItem from '../models/MenuItem.js'
import Table from '../models/Table.js'
import Order from '../models/Order.js'
import Inventory from '../models/Inventory.js'
import Discount from '../models/Discount.js'
import Feedback from '../models/Feedback.js'
import Notification from '../models/Notification.js'

const formatMessage = (message) => ({ message })

const serializeUser = (user) => {
  if (!user) return null

  const result = user.toObject ? user.toObject() : { ...user }
  delete result.password
  return result
}

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' })
    }

    const user = await User.findOne({ username: username.trim() })
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    const safeUser = user.toObject ? user.toObject() : { ...user }
    delete safeUser.password

    res.json({
      success: true,
      user: safeUser,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to login', error: error.message })
  }
}

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message })
  }
}

export const createUser = async (req, res) => {
  try {
    const { username, password, role, name, email, phone, status } = req.body

    if (!username || !password || !role || !name || !email || !phone) {
      return res.status(400).json({ message: 'All required fields are required.' })
    }

    const exists = await User.findOne({ username })
    if (exists) {
      return res.status(409).json({ message: 'User already exists.' })
    }

    const user = await User.create({
      username,
      password,
      role,
      name,
      email,
      phone,
      status: status || 'Active',
    })

    res.status(201).json(serializeUser(user))
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(serializeUser(user))
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message })
  }
}

export const getMenu = async (req, res) => {
  try {
    const [items, categories] = await Promise.all([
      MenuItem.find().sort({ createdAt: -1 }),
      Category.find().sort({ createdAt: -1 }),
    ])

    res.json({ items, categories })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu data', error: error.message })
  }
}

export const createMenuItem = async (req, res) => {
  try {
    const { name, category, price, veg, available, description, image } = req.body

    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Name, category and price are required.' })
    }

    const categoryExists = await Category.findOne({ name: category })
    if (!categoryExists) {
      await Category.create({ name: category, description: `${category} menu category` })
    }

    const item = await MenuItem.create({
      name,
      category,
      price,
      veg: veg ?? true,
      available: available ?? true,
      description: description || '',
      image: image || '',
    })

    res.status(201).json(item)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create menu item', error: error.message })
  }
}

export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' })
    }

    res.json(item)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update menu item', error: error.message })
  }
}

export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' })
    }

    res.json({ message: 'Menu item deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete menu item', error: error.message })
  }
}

export const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 })
    res.json(tables)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tables', error: error.message })
  }
}

export const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!table) {
      return res.status(404).json({ message: 'Table not found' })
    }

    res.json(table)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update table', error: error.message })
  }
}

export const getOrders = async (req, res) => {
  try {
    const filter = {}
    if (req.query.table) filter.table = req.query.table
    if (req.query.status) filter.status = req.query.status

    const orders = await Order.find(filter).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message })
  }
}

export const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      table,
      items,
      status,
      total,
      waiter,
      customerMobile,
      orderSource,
      orderType,
      customerName,
      customerPhone,
      customerAddress,
      complimentaryReason,
      subtotal,
      tax,
      discountApplied,
      mergedTables,
    } = req.body

    if (!orderId || !items?.length) {
      return res.status(400).json({ message: 'Order ID and items are required.' })
    }

    const type = orderType || 'Dine-in'
    if (type === 'Dine-in' && !table) {
      return res.status(400).json({ message: 'Table is required for dine-in orders.' })
    }
    if ((type === 'Takeaway' || type === 'Delivery') && !customerPhone && !customerMobile) {
      return res.status(400).json({ message: 'Customer phone is required for takeaway/delivery.' })
    }
    if (type === 'Delivery' && !customerAddress) {
      return res.status(400).json({ message: 'Address is required for delivery orders.' })
    }
    if (type === 'Complimentary' && !complimentaryReason) {
      return res.status(400).json({ message: 'Complimentary reason is required.' })
    }

    const finalTotal = type === 'Complimentary' ? 0 : total || 0

    const order = await Order.create({
      orderId,
      table: table || (type === 'Takeaway' ? 'TAKEAWAY' : type === 'Delivery' ? 'DELIVERY' : type === 'Complimentary' ? 'COMP' : ''),
      items,
      status: status || 'Preparing',
      total: finalTotal,
      subtotal: subtotal ?? finalTotal,
      tax,
      discountApplied,
      waiter: waiter || 'Staff',
      customerMobile: customerMobile || customerPhone || '',
      customerName: customerName || '',
      customerPhone: customerPhone || customerMobile || '',
      customerAddress: customerAddress || '',
      complimentaryReason: complimentaryReason || '',
      orderType: type,
      orderSource: orderSource || 'POS',
      paymentStatus: type === 'Complimentary' ? 'Paid' : 'Pending',
      paymentDetails: type === 'Complimentary' ? [{ method: 'Complimentary', amount: 0 }] : [],
      mergedTables: mergedTables || [],
    })

    if (table && type === 'Dine-in') {
      await Table.updateOne({ tableNumber: table }, { status: 'Occupied', activeOrderId: orderId })
    }
    if (mergedTables?.length) {
      await Table.updateMany(
        { tableNumber: { $in: mergedTables } },
        { status: 'Occupied', activeOrderId: orderId, mergedWith: mergedTables }
      )
    }

    await Notification.create({
      type: 'Order Status',
      message: `New ${type} order ${order.orderId} — Preparing`,
      read: false,
    })

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message })
  }
}

export const updateOrder = async (req, res) => {
  try {
    const prev = await Order.findById(req.params.id)
    if (!prev) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (req.body.status && req.body.status !== prev.status) {
      await Notification.create({
        type: 'Order Status',
        message: `Order ${order.orderId} status: ${prev.status} → ${order.status}`,
        read: false,
      })

      if (['Completed', 'Served', 'Ready', 'Preparing', 'Cancelled'].includes(req.body.status)) {
        const statusMap = {
          Completed: 'Available',
          Cancelled: 'Available',
          Served: 'Occupied',
          Ready: 'Occupied',
          Preparing: 'Occupied',
        }
        if (order.table && !['TAKEAWAY', 'DELIVERY', 'COMP'].includes(order.table)) {
          await Table.updateOne(
            { tableNumber: order.table },
            {
              status: statusMap[req.body.status] || 'Occupied',
              ...(req.body.status === 'Completed' || req.body.status === 'Cancelled'
                ? { activeOrderId: '', mergedWith: [] }
                : {}),
            }
          )
        }
      }
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message })
  }
}

export const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ quantity: 1 })
    res.json(inventory)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory', error: error.message })
  }
}

export const createInventory = async (req, res) => {
  try {
    const { itemName, unit, quantity, reorderLevel, supplier } = req.body
    if (!itemName || !unit || quantity === undefined || !reorderLevel || !supplier) {
      return res.status(400).json({ message: 'All inventory fields are required.' })
    }

    const item = await Inventory.create({ itemName, unit, quantity, reorderLevel, supplier })
    res.status(201).json(item)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create inventory item', error: error.message })
  }
}

export const updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    if (item.quantity < item.reorderLevel) {
      await Notification.create({
        type: 'Low Stock',
        message: `${item.itemName} is low (${item.quantity} ${item.unit}). Reorder level: ${item.reorderLevel}.`,
        read: false,
      })
    }

    res.json(item)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update inventory item', error: error.message })
  }
}

export const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    res.json({ message: 'Inventory item deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete inventory item', error: error.message })
  }
}

export const getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 })
    res.json(discounts)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch discounts', error: error.message })
  }
}

export const createDiscount = async (req, res) => {
  try {
    const { name, type, value, code, active, validTill } = req.body
    if (!name || !type || value === undefined || !code || !validTill) {
      return res.status(400).json({ message: 'All discount fields are required.' })
    }

    const existing = await Discount.findOne({ code })
    if (existing) {
      return res.status(409).json({ message: 'Discount code already exists.' })
    }

    const discount = await Discount.create({
      name,
      type,
      value,
      code,
      active: active ?? true,
      validTill,
    })

    res.status(201).json(discount)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create discount', error: error.message })
  }
}

export const updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }

    res.json(discount)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update discount', error: error.message })
  }
}

export const deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id)
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }

    res.json({ message: 'Discount deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete discount', error: error.message })
  }
}

export const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 })
    res.json(feedback)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message })
  }
}

export const createFeedback = async (req, res) => {
  try {
    const { table, rating, comment, customerName } = req.body

    if (!table || !rating || !customerName) {
      return res.status(400).json({ message: 'Table, rating and customer name are required.' })
    }

    const entry = await Feedback.create({ table, rating, comment, customerName })
    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create feedback', error: error.message })
  }
}

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 })
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message })
  }
}

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true, runValidators: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.json(notification)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification', error: error.message })
  }
}

export const getReports = async (req, res) => {
  try {
    const rangeDays = Number(req.query.days) || 7
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    weekStart.setHours(0, 0, 0, 0)

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const rangeStart = new Date()
    rangeStart.setDate(rangeStart.getDate() - (rangeDays - 1))
    rangeStart.setHours(0, 0, 0, 0)

    const paidMatch = { paymentStatus: 'Paid', status: { $ne: 'Cancelled' } }

    const [
      todaySales,
      weekSales,
      monthSales,
      totalOrders,
      activeTables,
      lowStock,
      salesByDate,
      topItems,
      tableRevenue,
      peakHours,
      gstSummary,
      paymentMethods,
      avgOrder,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { ...paidMatch, createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { ...paidMatch, createdAt: { $gte: weekStart } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { ...paidMatch, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.countDocuments({ status: { $ne: 'Cancelled' } }),
      Table.countDocuments({ status: { $ne: 'Available' } }),
      Inventory.find({ $expr: { $lt: ['$quantity', '$reorderLevel'] } }),
      Order.aggregate([
        { $match: { ...paidMatch, createdAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', totalQty: { $sum: '$items.qty' } } },
        { $sort: { totalQty: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        { $group: { _id: '$table', total: { $sum: '$total' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        {
          $group: {
            _id: null,
            cgst: { $sum: { $ifNull: ['$tax.cgst', 0] } },
            sgst: { $sum: { $ifNull: ['$tax.sgst', 0] } },
            taxTotal: { $sum: { $ifNull: ['$tax.total', 0] } },
          },
        },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        { $unwind: { path: '$paymentDetails', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ['$paymentDetails.method', 'Unspecified'] },
            amount: { $sum: { $ifNull: ['$paymentDetails.amount', 0] } },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        { $group: { _id: null, avg: { $avg: '$total' }, count: { $sum: 1 } } },
      ]),
    ])

    const summary = {
      todaySales: todaySales[0]?.total || 0,
      todayOrders: todaySales[0]?.count || 0,
      weeklyRevenue: weekSales[0]?.total || 0,
      monthlyRevenue: monthSales[0]?.total || 0,
      totalOrders,
      averageOrderValue: Math.round((avgOrder[0]?.avg || 0) * 100) / 100,
      activeTables,
      lowStockAlerts: lowStock.length,
      gstCollected: gstSummary[0]?.taxTotal || 0,
      cgstCollected: gstSummary[0]?.cgst || 0,
      sgstCollected: gstSummary[0]?.sgst || 0,
    }

    res.json({
      summary,
      salesByDate,
      topItems,
      tableRevenue,
      peakHours: peakHours.map((h) => ({ hour: h._id, count: h.count, label: `${h._id}:00` })),
      paymentMethods,
      lowStockItems: lowStock,
      rangeDays,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate reports', error: error.message })
  }
}

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' })
    }

    const category = await Category.create({ name, description: description || '' })
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message })
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message })
  }
}

export const createNotification = async (req, res) => {
  try {
    const { type, message } = req.body
    if (!type || !message) {
      return res.status(400).json({ message: 'Notification type and message are required.' })
    }

    const notification = await Notification.create({ type, message, read: false })
    res.status(201).json(notification)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification', error: error.message })
  }
}

export { formatMessage }
