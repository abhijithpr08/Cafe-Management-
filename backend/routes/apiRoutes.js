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

const router = express.Router()

router.post('/auth/login', loginUser)

router.get('/users', getUsers)
router.post('/users', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

router.get('/menu', getMenu)
router.post('/menu', createMenuItem)
router.put('/menu/:id', updateMenuItem)
router.delete('/menu/:id', deleteMenuItem)
router.post('/categories', createCategory)
router.delete('/categories/:id', deleteCategory)

router.get('/tables', getTables)
router.put('/tables/:id', updateTable)

router.get('/orders', getOrders)
router.post('/orders', createOrder)
router.put('/orders/:id', updateOrder)

router.get('/inventory', getInventory)
router.post('/inventory', createInventory)
router.put('/inventory/:id', updateInventory)
router.delete('/inventory/:id', deleteInventory)

router.get('/discounts', getDiscounts)
router.post('/discounts', createDiscount)
router.put('/discounts/:id', updateDiscount)
router.delete('/discounts/:id', deleteDiscount)

router.get('/feedback', getFeedback)
router.post('/feedback', createFeedback)

router.get('/notifications', getNotifications)
router.put('/notifications/:id', markNotificationRead)
router.post('/notifications', createNotification)

router.get('/reports', getReports)

export default router
