/**
 * MongoDB Seed Script - Menu Collection Only
 * ---------------------------------------------------------------
 * Restaurant Billing & Management System — Digital Menu Data
 * Run with: npm run seed:menu
 * Uses existing mongoose models (collections: categories, menuItems)
 */

import 'dotenv/config'
import connectDB from './config/db.js'
import Category from './models/Category.js'
import MenuItem from './models/MenuItem.js'

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
  { name: 'Paneer Tikka', category: 'Starters', price: 220, veg: true, available: true, description: 'Grilled cottage cheese marinated in spiced yogurt.', image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400', sku: 'ST-PT-001' },
  { name: 'Chicken 65', category: 'Starters', price: 260, veg: false, available: true, description: 'Spicy deep-fried chicken tossed in curry leaves.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', sku: 'ST-C65-002' },
  { name: 'Veg Spring Rolls', category: 'Starters', price: 180, veg: true, available: true, description: 'Crispy rolls stuffed with mixed vegetables.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
  { name: 'Chilli Chicken', category: 'Starters', price: 250, veg: false, available: false, description: 'Indo-Chinese style spicy chicken chilli fry.', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
  { name: 'Butter Chicken', category: 'Main Course', price: 320, veg: false, available: true, description: 'Creamy tomato-based curry with tender chicken.', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
  { name: 'Dal Makhani', category: 'Main Course', price: 240, veg: true, available: true, description: 'Slow-cooked black lentils in butter and cream.', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
  { name: 'Paneer Butter Masala', category: 'Main Course', price: 260, veg: true, available: true, description: 'Cottage cheese cubes in rich tomato gravy.', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400' },
  { name: 'Mutton Rogan Josh', category: 'Main Course', price: 380, veg: false, available: true, description: 'Aromatic Kashmiri-style slow-cooked mutton curry.', image: 'https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=400' },
  { name: 'Hyderabadi Chicken Biryani', category: 'Biryani', price: 280, veg: false, available: true, description: 'Aromatic basmati rice layered with spiced chicken.', image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
  { name: 'Veg Biryani', category: 'Biryani', price: 220, veg: true, available: true, description: 'Fragrant rice cooked with mixed vegetables and spices.', image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=400' },
  { name: 'Mutton Biryani', category: 'Biryani', price: 340, veg: false, available: true, description: 'Slow-cooked basmati rice with tender mutton pieces.', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400' },
  { name: 'Veg Fried Rice', category: 'Chinese', price: 180, veg: true, available: true, description: 'Wok-tossed rice with fresh vegetables.', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
  { name: 'Chicken Manchurian', category: 'Chinese', price: 240, veg: false, available: true, description: 'Deep-fried chicken tossed in tangy Manchurian sauce.', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cee6a6?w=400' },
  { name: 'Tandoori Chicken (Half)', category: 'Tandoor', price: 280, veg: false, available: true, description: 'Char-grilled chicken marinated in tandoori spices.', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' },
  { name: 'Tandoori Roti', category: 'Breads', price: 30, veg: true, available: true, description: 'Whole wheat bread baked in a clay oven.', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400' },
  { name: 'Butter Naan', category: 'Breads', price: 45, veg: true, available: true, description: 'Soft leavened bread brushed with butter.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
  { name: 'Masala Dosa', category: 'South Indian', price: 120, veg: true, available: true, description: 'Crispy rice crepe filled with spiced potato masala.', image: 'https://images.unsplash.com/photo-1630383249896-24c322ff2ad9?w=400' },
  { name: 'Idli Sambar', category: 'South Indian', price: 90, veg: true, available: true, description: 'Steamed rice cakes served with lentil sambar.', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400' },
  { name: 'Gulab Jamun', category: 'Desserts', price: 90, veg: true, available: true, description: 'Soft milk-solid dumplings soaked in sugar syrup.', image: 'https://images.unsplash.com/photo-1601303516534-bf0b2fdda9c8?w=400' },
  { name: 'Gajar Halwa', category: 'Desserts', price: 110, veg: true, available: false, description: 'Slow-cooked carrot pudding with nuts and ghee.', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
  { name: 'Cold Coffee', category: 'Beverages', price: 110, veg: true, available: true, description: 'Chilled blended coffee topped with ice cream.', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
  { name: 'Fresh Lime Soda', category: 'Beverages', price: 70, veg: true, available: true, description: 'Refreshing lime soda, sweet or salted.', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400' },
  { name: 'Mango Lassi', category: 'Beverages', price: 100, veg: true, available: true, description: 'Creamy yogurt drink blended with fresh mango.', image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400' },
  { name: 'Family Combo (4 Roti + Curry + Rice)', category: 'Combo Meals', price: 450, veg: true, available: true, description: 'Complete family meal with bread, curry, and rice.', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400' },
  { name: 'Biryani Combo (Biryani + Raita + Shake)', category: 'Combo Meals', price: 350, veg: false, available: true, description: 'Biryani served with raita and a refreshing shake.', image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
]

async function seedMenu() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    await Category.deleteMany({})
    await MenuItem.deleteMany({})

    await Category.insertMany(categories)
    await MenuItem.insertMany(menuItems)

    console.log('✅ Menu data seeded successfully!')
    console.log(`Categories: ${categories.length}, Menu Items: ${menuItems.length}`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error seeding menu data:', err)
    process.exit(1)
  }
}

seedMenu()
