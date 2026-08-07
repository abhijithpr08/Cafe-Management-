import connectDB from './config/db.js'
import {
  User,
  Category,
  MenuItem,
  Table,
  Order,
  Inventory,
  Discount,
  Feedback,
  Notification,
} from './models/index.js'

const users = [
  { username: 'admin', password: 'Admin@123', role: 'Administrator', name: 'Rahul Menon', email: 'admin@restro.com', phone: '9876500001', status: 'Active' },
  { username: 'manager', password: 'Manager@123', role: 'Manager', name: 'Anjali Nair', email: 'manager@restro.com', phone: '9876500002', status: 'Active' },
  { username: 'cashier', password: 'Cashier@123', role: 'Cashier', name: 'Vishnu Das', email: 'cashier@restro.com', phone: '9876500003', status: 'Active' },
  { username: 'captain', password: 'Captain@123', role: 'Captain', name: 'Sneha Thomas', email: 'captain@restro.com', phone: '9876500004', status: 'Active' },
  { username: 'kitchen', password: 'Kitchen@123', role: 'Kitchen Staff', name: 'Arun Kumar', email: 'kitchen@restro.com', phone: '9876500005', status: 'Active' },
  { username: 'manager2', password: 'Manager@456', role: 'Manager', name: 'Divya Pillai', email: 'manager2@restro.com', phone: '9876500006', status: 'Active' },
  { username: 'cashier2', password: 'Cashier@456', role: 'Cashier', name: 'Nikhil Roy', email: 'cashier2@restro.com', phone: '9876500007', status: 'Inactive' },
  { username: 'captain2', password: 'Captain@456', role: 'Captain', name: 'Meera Joseph', email: 'captain2@restro.com', phone: '9876500008', status: 'Active' },
  { username: 'kitchen2', password: 'Kitchen@456', role: 'Kitchen Staff', name: 'Sanjay Varma', email: 'kitchen2@restro.com', phone: '9876500009', status: 'Active' },
  { username: 'admin2', password: 'Admin@456', role: 'Administrator', name: 'Priya Suresh', email: 'admin2@restro.com', phone: '9876500010', status: 'Active' },
]

const categories = [
  { name: 'Starters', description: 'Appetizers and small plates' },
  { name: 'Main Course', description: 'Full meal dishes' },
  { name: 'Biryani', description: 'Rice-based specialty dishes' },
  { name: 'Chinese', description: 'Indo-Chinese dishes' },
  { name: 'Tandoor', description: 'Grilled and tandoori items' },
  { name: 'Beverages', description: 'Cold and hot drinks' },
  { name: 'Desserts', description: 'Sweets and desserts' },
  { name: 'Breads', description: 'Rotis, naans, parathas' },
  { name: 'South Indian', description: 'Dosa, idli, and more' },
  { name: 'Combo Meals', description: 'Combo offer meals' },
]

const menuItems = [
  { name: 'Paneer Tikka', category: 'Starters', price: 220, veg: true, available: true, description: 'Grilled cottage cheese marinated in spiced yogurt.', image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400' },
  { name: 'Chicken 65', category: 'Starters', price: 260, veg: false, available: true, description: 'Spicy deep-fried chicken tossed in curry leaves.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
  { name: 'Butter Chicken', category: 'Main Course', price: 320, veg: false, available: true, description: 'Creamy tomato-based curry with tender chicken.', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
  { name: 'Dal Makhani', category: 'Main Course', price: 240, veg: true, available: true, description: 'Slow-cooked black lentils in butter and cream.', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
  { name: 'Hyderabadi Chicken Biryani', category: 'Biryani', price: 280, veg: false, available: true, description: 'Aromatic basmati rice layered with spiced chicken.', image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
  { name: 'Veg Fried Rice', category: 'Chinese', price: 180, veg: true, available: true, description: 'Wok-tossed rice with fresh vegetables.', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
  { name: 'Tandoori Roti', category: 'Breads', price: 30, veg: true, available: true, description: 'Whole wheat bread baked in a clay oven.', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400' },
  { name: 'Masala Dosa', category: 'South Indian', price: 120, veg: true, available: true, description: 'Crispy rice crepe filled with spiced potato masala.', image: 'https://images.unsplash.com/photo-1630383249896-24c322ff2ad9?w=400' },
  { name: 'Gulab Jamun', category: 'Desserts', price: 90, veg: true, available: true, description: 'Soft milk-solid dumplings soaked in sugar syrup.', image: 'https://images.unsplash.com/photo-1601303516534-bf0b2fdda9c8?w=400' },
  { name: 'Cold Coffee', category: 'Beverages', price: 110, veg: true, available: true, description: 'Chilled blended coffee topped with ice cream.', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
]

const tables = [
  { tableNumber: 'T1', capacity: 2, status: 'Available', floor: 'Ground' },
  { tableNumber: 'T2', capacity: 4, status: 'Occupied', floor: 'Ground' },
  { tableNumber: 'T3', capacity: 4, status: 'Available', floor: 'Ground' },
  { tableNumber: 'T4', capacity: 6, status: 'Reserved', floor: 'Ground' },
  { tableNumber: 'T5', capacity: 2, status: 'Available', floor: 'First' },
  { tableNumber: 'T6', capacity: 4, status: 'Occupied', floor: 'First' },
  { tableNumber: 'T7', capacity: 8, status: 'Available', floor: 'First' },
  { tableNumber: 'T8', capacity: 2, status: 'Available', floor: 'First' },
  { tableNumber: 'T9', capacity: 4, status: 'Occupied', floor: 'Rooftop' },
  { tableNumber: 'T10', capacity: 6, status: 'Available', floor: 'Rooftop' },
]

const orders = [
  { orderId: 'ORD1001', table: 'T2', items: [{ name: 'Butter Chicken', qty: 2 }, { name: 'Tandoori Roti', qty: 4 }], status: 'Preparing', total: 760, waiter: 'Sneha Thomas' },
  { orderId: 'ORD1002', table: 'T6', items: [{ name: 'Paneer Tikka', qty: 1 }, { name: 'Cold Coffee', qty: 2 }], status: 'Served', total: 440, waiter: 'Meera Joseph' },
  { orderId: 'ORD1003', table: 'T9', items: [{ name: 'Hyderabadi Chicken Biryani', qty: 3 }], status: 'Ready', total: 840, waiter: 'Sneha Thomas' },
  { orderId: 'ORD1004', table: 'T1', items: [{ name: 'Masala Dosa', qty: 2 }], status: 'Completed', total: 240, waiter: 'Meera Joseph' },
  { orderId: 'ORD1005', table: 'T4', items: [{ name: 'Veg Fried Rice', qty: 2 }, { name: 'Dal Makhani', qty: 1 }], status: 'Preparing', total: 600, waiter: 'Sneha Thomas' },
  { orderId: 'ORD1006', table: 'T3', items: [{ name: 'Chicken 65', qty: 1 }, { name: 'Gulab Jamun', qty: 2 }], status: 'Served', total: 440, waiter: 'Meera Joseph' },
  { orderId: 'ORD1007', table: 'T7', items: [{ name: 'Butter Chicken', qty: 1 }, { name: 'Tandoori Roti', qty: 2 }], status: 'Completed', total: 380, waiter: 'Sneha Thomas' },
  { orderId: 'ORD1008', table: 'T5', items: [{ name: 'Cold Coffee', qty: 1 }], status: 'Served', total: 110, waiter: 'Meera Joseph' },
  { orderId: 'ORD1009', table: 'T10', items: [{ name: 'Hyderabadi Chicken Biryani', qty: 2 }, { name: 'Gulab Jamun', qty: 2 }], status: 'Preparing', total: 740, waiter: 'Sneha Thomas' },
  { orderId: 'ORD1010', table: 'T8', items: [{ name: 'Masala Dosa', qty: 1 }, { name: 'Cold Coffee', qty: 1 }], status: 'Ready', total: 230, waiter: 'Meera Joseph' },
]

const inventory = [
  { itemName: 'Chicken', unit: 'kg', quantity: 25, reorderLevel: 10, supplier: 'Fresh Farms Co.' },
  { itemName: 'Paneer', unit: 'kg', quantity: 12, reorderLevel: 5, supplier: 'Dairy Delight' },
  { itemName: 'Basmati Rice', unit: 'kg', quantity: 60, reorderLevel: 20, supplier: 'Grain Traders' },
  { itemName: 'Tomato', unit: 'kg', quantity: 8, reorderLevel: 10, supplier: 'Local Vegetable Mart' },
  { itemName: 'Onion', unit: 'kg', quantity: 30, reorderLevel: 15, supplier: 'Local Vegetable Mart' },
  { itemName: 'Cooking Oil', unit: 'litre', quantity: 18, reorderLevel: 10, supplier: 'Sunrise Oils' },
  { itemName: 'Milk', unit: 'litre', quantity: 20, reorderLevel: 10, supplier: 'Dairy Delight' },
  { itemName: 'Wheat Flour', unit: 'kg', quantity: 40, reorderLevel: 15, supplier: 'Grain Traders' },
  { itemName: 'Garam Masala', unit: 'kg', quantity: 3, reorderLevel: 2, supplier: 'Spice World' },
  { itemName: 'Coffee Powder', unit: 'kg', quantity: 5, reorderLevel: 3, supplier: 'Bean Suppliers' },
]

const discounts = [
  { name: 'Weekend Special', type: 'Percentage', value: 10, code: 'WEEKEND10', active: true, validTill: '2026-12-31' },
  { name: 'Flat 50 Off', type: 'Flat', value: 50, code: 'FLAT50', active: true, validTill: '2026-09-30' },
  { name: 'Happy Hour Beverages', type: 'Happy Hour', value: 20, code: 'HAPPY20', active: true, validTill: '2026-12-31' },
  { name: 'Combo Meal Deal', type: 'Combo', value: 15, code: 'COMBO15', active: true, validTill: '2026-10-31' },
  { name: 'New Customer Offer', type: 'Percentage', value: 15, code: 'WELCOME15', active: true, validTill: '2026-12-31' },
  { name: 'Festive Discount', type: 'Flat', value: 100, code: 'FEST100', active: false, validTill: '2026-08-15' },
  { name: 'Lunch Special', type: 'Percentage', value: 12, code: 'LUNCH12', active: true, validTill: '2026-12-31' },
  { name: 'Birthday Offer', type: 'Flat', value: 200, code: 'BDAY200', active: true, validTill: '2026-12-31' },
  { name: 'Loyalty Discount', type: 'Percentage', value: 5, code: 'LOYAL5', active: true, validTill: '2026-12-31' },
  { name: 'Late Night Happy Hour', type: 'Happy Hour', value: 25, code: 'NIGHT25', active: true, validTill: '2026-12-31' },
]

const feedback = [
  { table: 'T2', rating: 5, comment: 'Excellent food and service!', customerName: 'Arjun S.' },
  { table: 'T6', rating: 4, comment: 'Good taste, slightly slow service.', customerName: 'Kavya R.' },
  { table: 'T9', rating: 5, comment: 'Best biryani in town!', customerName: 'Rohit M.' },
  { table: 'T1', rating: 3, comment: 'Dosa was cold when served.', customerName: 'Anu K.' },
  { table: 'T4', rating: 4, comment: 'Nice ambience and quick service.', customerName: 'Suresh P.' },
  { table: 'T3', rating: 5, comment: 'Loved the chicken 65!', customerName: 'Divya T.' },
  { table: 'T7', rating: 2, comment: 'Order took too long to arrive.', customerName: 'Vishal N.' },
  { table: 'T5', rating: 4, comment: 'Coffee was great, will visit again.', customerName: 'Neha J.' },
  { table: 'T10', rating: 5, comment: 'Perfect for a family dinner.', customerName: 'Manoj V.' },
  { table: 'T8', rating: 4, comment: 'Good breakfast options.', customerName: 'Lakshmi S.' },
]

const notifications = [
  { type: 'Order Status', message: 'Order ORD1001 is being prepared.', read: false },
  { type: 'Low Stock', message: 'Tomato stock is below reorder level.', read: false },
  { type: 'Daily Sales Summary', message: 'Daily sales increased by 8% compared to yesterday.', read: true },
  { type: 'Table Update', message: 'Table T4 has been reserved for a birthday party.', read: false },
  { type: 'Inventory Alert', message: 'Milk stock is reaching the minimum threshold.', read: false },
  { type: 'Staff Reminder', message: 'Shift handover meeting starts at 6:00 PM.', read: true },
  { type: 'Promotion', message: 'Weekend Special discount is live for dine-in customers.', read: false },
  { type: 'Order Status', message: 'Order ORD1008 has been served to the customer.', read: true },
  { type: 'Kitchen Alert', message: 'Paneer Tikka batch needs replenishment.', read: false },
  { type: 'System Notice', message: 'Backup completed successfully at 11:30 PM.', read: true },
]

const clearCollections = async () => {
  await User.deleteMany({})
  await Category.deleteMany({})
  await MenuItem.deleteMany({})
  await Table.deleteMany({})
  await Order.deleteMany({})
  await Inventory.deleteMany({})
  await Discount.deleteMany({})
  await Feedback.deleteMany({})
  await Notification.deleteMany({})
}

const seedDatabase = async () => {
  try {
    await connectDB()
    await clearCollections()

    await User.insertMany(users)
    await Category.insertMany(categories)
    await MenuItem.insertMany(menuItems)
    await Table.insertMany(tables)
    await Order.insertMany(orders)
    await Inventory.insertMany(inventory)
    await Discount.insertMany(discounts)
    await Feedback.insertMany(feedback)
    await Notification.insertMany(notifications)

    console.log('Database seeded successfully with 10 records in each collection.')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seedDatabase()
