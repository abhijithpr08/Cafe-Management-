import express from 'express'
import {
  loginUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
  deleteCategory,
  getTables,
  updateTable,
  getOrders,
  createOrder,
  updateOrder,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getFeedback,
  createFeedback,
  getNotifications,
  markNotificationRead,
  getReports,
  createNotification,
} from '../controllers/dataController.js'
import {
  sendOtp,
  verifyOtp,
  getCategories,
  getOrderById,
  validateDiscount,
  createCustomerOrder,
  updateOrderPayment,
  applyBillToOrder,
} from '../controllers/customerController.js'
import {
  getSettings,
  updateSettings,
  simulatePrinterError,
  generateDailySalesSummary,
  backupData,
  restoreData,
  getCustomers,
  getCustomerById,
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getPurchases,
  createPurchase,
  getStockAdjustments,
  createStockAdjustment,
  getWastage,
  createWastage,
  getAttendance,
  checkIn,
  checkOut,
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  createTable,
  reserveTable,
  mergeTables,
  transferOrder,
  splitOrderBill,
  getAnalyticsReport,
} from '../controllers/erpController.js'

const router = express.Router()

router.post('/auth/login', loginUser)
router.post('/auth/send-otp', sendOtp)
router.post('/auth/verify-otp', verifyOtp)

router.get('/users', getUsers)
router.post('/users', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

router.get('/menu', getMenu)
router.post('/menu', createMenuItem)
router.put('/menu/:id', updateMenuItem)
router.delete('/menu/:id', deleteMenuItem)
router.get('/categories', getCategories)
router.post('/categories', createCategory)
router.delete('/categories/:id', deleteCategory)

router.get('/tables', getTables)
router.post('/tables', createTable)
router.put('/tables/:id', updateTable)
router.post('/tables/:id/reserve', reserveTable)
router.post('/tables/merge', mergeTables)

router.get('/orders', getOrders)
router.get('/orders/:id', getOrderById)
router.post('/orders', createOrder)
router.post('/orders/customer', createCustomerOrder)
router.put('/orders/:id', updateOrder)
router.put('/orders/:id/payment', updateOrderPayment)
router.post('/orders/:id/bill', applyBillToOrder)
router.post('/orders/transfer', transferOrder)
router.post('/orders/split-bill', splitOrderBill)

router.get('/inventory', getInventory)
router.post('/inventory', createInventory)
router.put('/inventory/:id', updateInventory)
router.delete('/inventory/:id', deleteInventory)

router.get('/discounts', getDiscounts)
router.get('/discounts/validate/:code', validateDiscount)
router.post('/discounts', createDiscount)
router.put('/discounts/:id', updateDiscount)
router.delete('/discounts/:id', deleteDiscount)

router.get('/feedback', getFeedback)
router.post('/feedback', createFeedback)

router.get('/notifications', getNotifications)
router.put('/notifications/:id', markNotificationRead)
router.post('/notifications', createNotification)

router.get('/reports', getReports)
router.get('/reports/analytics', getAnalyticsReport)

router.get('/customers', getCustomers)
router.get('/customers/:id', getCustomerById)

router.get('/vendors', getVendors)
router.post('/vendors', createVendor)
router.put('/vendors/:id', updateVendor)
router.delete('/vendors/:id', deleteVendor)

router.get('/purchases', getPurchases)
router.post('/purchases', createPurchase)

router.get('/stock-adjustments', getStockAdjustments)
router.post('/stock-adjustments', createStockAdjustment)

router.get('/wastage', getWastage)
router.post('/wastage', createWastage)

router.get('/attendance', getAttendance)
router.post('/attendance/check-in', checkIn)
router.post('/attendance/check-out', checkOut)

router.get('/shifts', getShifts)
router.post('/shifts', createShift)
router.put('/shifts/:id', updateShift)
router.delete('/shifts/:id', deleteShift)

router.get('/settings', getSettings)
router.put('/settings', updateSettings)
router.post('/settings/simulate-printer-error', simulatePrinterError)
router.post('/settings/daily-summary', generateDailySalesSummary)
router.get('/settings/backup', backupData)
router.post('/settings/restore', restoreData)

export default router
