import { NavLink, Outlet } from 'react-router-dom';

import { useAuthStore } from '../stores/auth.store';

export default function AdminLayout() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          NovaShop
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/dashboard/products"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            Products
          </NavLink>
          
          <NavLink
            to="/dashboard/products/trash"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            Trash
          </NavLink>

          <NavLink
            to="/dashboard/orders"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            Orders
          </NavLink>

          <NavLink
            to="/dashboard/users"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            Customers
          </NavLink>
        </nav>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </aside>

      {/* Main area */}
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <strong>NovaShop Admin</strong>
          </div>

          <div className="admin-user">
            Administrator
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}