import { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import {
  BillingPage,
  DashboardOverviewPage,
  KitchenOrdersPage,
  OrderManagementPage,
  OrderStatusUpdatesPage,
  OrdersPage,
  PaymentsPage,
  TableManagementPage,
  UserManagementPage,
  KOTPage,
} from './RolePages'
import { CustomersPage, ReportsAnalyticsPage } from './CustomersReportsPages'
import {
  EmployeeHubPage,
  InventoryHubPage,
  SettingsConfigPage,
} from './SettingsInventoryEmployeePages'
import { getMenuItemsForRole, hasAccess } from '../../data/rolePermissions'
import { useAuth } from '../../context/AuthContext'

const DashboardShell = () => {
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = useMemo(() => getMenuItemsForRole(user.role), [user.role])
  const currentModule = menuItems.find((item) => item.path === location.pathname) || menuItems[0]

  const handleNavigate = (path) => {
    setIsSidebarOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const renderPageForPath = (path) => {
    if (path === '/dashboard') return <DashboardOverviewPage />
    if (path === '/dashboard/billing') return <BillingPage />
    if (path === '/dashboard/orders') return <OrdersPage />
    if (path === '/dashboard/inventory') return <InventoryHubPage />
    if (path === '/dashboard/customers') return <CustomersPage />
    if (path === '/dashboard/reports') return <ReportsAnalyticsPage />
    if (path === '/dashboard/employee-management') return <EmployeeHubPage />
    if (path === '/dashboard/kitchen-orders') return <KitchenOrdersPage />
    if (path === '/dashboard/settings') return <SettingsConfigPage />
    if (path === '/dashboard/user-management') return <UserManagementPage />
    if (path === '/dashboard/payments') return <PaymentsPage />
    if (path === '/dashboard/order-management') return <OrderManagementPage />
    if (path === '/dashboard/table-management') return <TableManagementPage />
    if (path === '/dashboard/kot') return <KOTPage />
    if (path === '/dashboard/order-status-updates') return <OrderStatusUpdatesPage />

    return <Navigate to='/dashboard' replace />
  }

  return (
    <div className='min-h-screen bg-slate-100'>
      <div className='flex min-h-screen'>
        <button
          type='button'
          className='fixed left-4 top-4 z-50 rounded-full bg-slate-900 p-3 text-white shadow-lg md:hidden'
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          ☰
        </button>

        <Sidebar
          role={user.role}
          currentPath={location.pathname}
          onNavigate={handleNavigate}
          collapsed={!isSidebarOpen}
          onToggleCollapse={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className='flex-1 p-4 sm:p-6 md:p-8'>
          <header className='mb-6 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Signed in as</p>
              <h1 className='text-2xl font-bold text-slate-900'>{user.name}</h1>
            </div>

            <div className='flex items-center gap-3'>
              <span className='rounded-full bg-orange-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700'>
                {user.role}
              </span>
              <button
                type='button'
                onClick={handleLogout}
                className='rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500'
              >
                Logout
              </button>
            </div>
          </header>

          <Routes>
            <Route path='/' element={renderPageForPath('/dashboard')} />
            {menuItems.map((item) => (
              <Route
                key={item.key}
                path={item.path.replace('/dashboard', '') || '/'}
                element={
                  hasAccess(user.role, item.key) ? (
                    renderPageForPath(item.path)
                  ) : (
                    <Navigate to='/dashboard' replace />
                  )
                }
              />
            ))}
            <Route path='*' element={<Navigate to='/dashboard' replace />} />
          </Routes>

          {currentModule && (
            <div className='mt-4 text-sm text-slate-500'>
              Active module: <span className='font-semibold text-slate-800'>{currentModule.label}</span>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardShell
