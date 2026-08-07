export const rolePermissions = {
  Administrator: [
    'DashboardOverview',
    'Billing',
    'Orders',
    'Inventory',
    'Reports',
    'EmployeeManagement',
    'KitchenOrders',
    'Settings',
    'UserManagement',
    'Payments',
    'OrderManagement',
    'TableManagement',
    'KOT',
    'OrderStatusUpdates',
  ],
  Manager: ['DashboardOverview', 'Reports', 'Inventory', 'EmployeeManagement'],
  Cashier: ['Billing', 'Payments', 'Orders'],
  Captain: ['OrderManagement', 'TableManagement', 'KOT', 'Orders'],
  'Kitchen Staff': ['KitchenOrders', 'OrderStatusUpdates'],
}

export const moduleMeta = {
  DashboardOverview: { label: 'Dashboard Overview', path: '/dashboard' },
  Billing: { label: 'Billing', path: '/dashboard/billing' },
  Orders: { label: 'Orders', path: '/dashboard/orders' },
  Inventory: { label: 'Inventory', path: '/dashboard/inventory' },
  Reports: { label: 'Reports', path: '/dashboard/reports' },
  EmployeeManagement: { label: 'Employee Management', path: '/dashboard/employee-management' },
  KitchenOrders: { label: 'Kitchen Orders', path: '/dashboard/kitchen-orders' },
  Settings: { label: 'Settings', path: '/dashboard/settings' },
  UserManagement: { label: 'User Management', path: '/dashboard/user-management' },
  Payments: { label: 'Payments', path: '/dashboard/payments' },
  OrderManagement: { label: 'Order Management', path: '/dashboard/order-management' },
  TableManagement: { label: 'Table Management', path: '/dashboard/table-management' },
  KOT: { label: 'Send KOT', path: '/dashboard/kot' },
  OrderStatusUpdates: { label: 'Order Status Updates', path: '/dashboard/order-status-updates' },
}

export const getMenuItemsForRole = (role) => {
  const normalizedRole = role || 'Administrator'
  const permissions = rolePermissions[normalizedRole] || []
  return Object.entries(moduleMeta)
    .filter(([key]) => permissions.includes(key))
    .map(([key, meta]) => ({ key, ...meta }))
}

export const hasAccess = (role, moduleKey) => {
  const normalizedRole = role || 'Administrator'
  return (rolePermissions[normalizedRole] || []).includes(moduleKey)
}
