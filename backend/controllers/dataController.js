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
    const { name, category, price, veg, available, description } = req.body

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
    const { orderId, table, items, status, total, waiter } = req.body

    if (!orderId || !table || !items || !waiter) {
      return res.status(400).json({ message: 'Order ID, table, items, and waiter are required.' })
    }

    const order = await Order.create({
      orderId,
      table,
      items,
      status: status || 'Preparing',
      total: total || 0,
      waiter,
    })

    await Table.updateOne({ tableNumber: table }, { status: 'Occupied' })
    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message })
  }
}

export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (req.body.status && ['Completed', 'Served', 'Ready', 'Preparing'].includes(req.body.status)) {
      const statusMap = {
        Completed: 'Available',
        Served: 'Occupied',
        Ready: 'Occupied',
        Preparing: 'Occupied',
      }

      await Table.updateOne({ tableNumber: order.table }, { status: statusMap[req.body.status] || 'Occupied' })
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
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [todaySales, totalOrders, activeTables, lowStock, salesByDate, topItems, tableRevenue] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.countDocuments(),
      Table.countDocuments({ status: { $ne: 'Available' } }),
      Inventory.find({ $expr: { $lt: ['$quantity', '$reorderLevel'] } }),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            },
          },
        },
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
        { $unwind: '$items' },
        { $group: { _id: '$items.name', totalQty: { $sum: '$items.qty' } } },
        { $sort: { totalQty: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        { $group: { _id: '$table', total: { $sum: '$total' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
    ])

    const summary = {
      todaySales: todaySales[0]?.total || 0,
      totalOrders: totalOrders,
      activeTables: activeTables,
      lowStockAlerts: lowStock.length,
    }

    res.json({
      summary,
      salesByDate: salesByDate,
      topItems,
      tableRevenue,
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
