export const menuCategories = ['All', 'Beverages', 'Snacks', 'Desserts', 'Combos']

export const menuItems = [
  {
    id: 'espresso',
    name: 'Espresso',
    category: 'Beverages',
    description: 'Rich and smooth single shot with crema.',
    price: 120,
    available: true,
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    category: 'Beverages',
    description: 'Creamy frothed milk with premium espresso.',
    price: 150,
    available: true,
  },
  {
    id: 'club-sandwich',
    name: 'Club Sandwich',
    category: 'Snacks',
    description: 'Triple-layer toasted sandwich with fries.',
    price: 260,
    available: true,
  },
  {
    id: 'veggie-wrap',
    name: 'Veggie Wrap',
    category: 'Snacks',
    description: 'Fresh vegetables wrapped with mint chutney.',
    price: 190,
    available: false,
  },
  {
    id: 'chocolate-mousse',
    name: 'Chocolate Mousse',
    category: 'Desserts',
    description: 'Silky mousse topped with dark chocolate.',
    price: 220,
    available: true,
  },
  {
    id: 'family-combo',
    name: 'Family Combo',
    category: 'Combos',
    description: 'Three snacks and two beverages with discount.',
    price: 750,
    available: true,
  },
]

export const tableStatus = [
  { name: 'Table 1', status: 'Occupied', guests: 3 },
  { name: 'Table 2', status: 'Available', guests: 0 },
  { name: 'Table 3', status: 'Preparing', guests: 2 },
  { name: 'Table 4', status: 'Reserved', guests: 4 },
]

export const kitchenOrders = [
  { id: 'kot-101', table: 'Table 1', status: 'Preparing', items: 3 },
  { id: 'kot-102', table: 'Table 3', status: 'Pending', items: 2 },
  { id: 'kot-103', table: 'Table 4', status: 'Ready', items: 4 },
]

export const dashboardTiles = [
  { title: "Today's Sales", value: '₹16.2k', description: 'Fast billing and instant order tracking.' },
  { title: 'Order Count', value: '84', description: 'Live table and kitchen status.' },
  { title: 'Average Order', value: '₹455', description: 'Mobile-ready billing workflows.' },
  { title: 'GST Summary', value: '₹1.8k', description: 'Tax-ready receipts and reports.' },
]
