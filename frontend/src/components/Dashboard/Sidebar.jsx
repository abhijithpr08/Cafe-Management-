import { getMenuItemsForRole } from '../../data/rolePermissions'

const Sidebar = ({ role, currentPath, onNavigate, collapsed, onToggleCollapse }) => {
  const menuItems = getMenuItemsForRole(role)

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white/95 shadow-xl transition-all duration-300 md:static md:translate-x-0 ${
        collapsed ? 'translate-x-[-100%]' : 'translate-x-0'
      } ${collapsed ? 'w-0 md:w-72' : 'w-72'} md:w-72`}
    >
      <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
        <div className='flex items-center gap-3'>
          <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-lg font-bold text-white'>R</span>
          <div>
            <p className='text-sm text-slate-500'>Workspace</p>
            <h2 className='font-semibold text-slate-900'>RestroPOS</h2>
          </div>
        </div>

        <button
          type='button'
          className='rounded-full border border-slate-200 p-2 text-slate-600 md:hidden'
          onClick={onToggleCollapse}
        >
          ✕
        </button>
      </div>

      <nav className='flex-1 space-y-1 overflow-y-auto p-3'>
        {menuItems.map((item) => {
          const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/dashboard')

          return (
            <button
              key={item.key}
              type='button'
              onClick={() => onNavigate(item.path)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <span>{item.label}</span>
              <span>{isActive ? '→' : '•'}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
