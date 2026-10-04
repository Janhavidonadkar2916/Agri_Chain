import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Truck,
  Warehouse,
  ShoppingBag,
  QrCode,
  Users,
  Search,
  User,
  Settings,
  LogOut,
  Cpu,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen, isCollapsed, toggleCollapse } = useLayout();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    navigate('/login');
  };

  const role = user?.role?.toLowerCase() || '';

  const getRoleNavLinks = () => {
    switch (role) {
      case 'farmer':
        return [
          { name: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
          { name: 'Add Batch', path: '/farmer/add-batch', icon: PlusCircle },
          { name: 'My Batches', path: '/farmer/my-batches', icon: Package },
        ];
      case 'transport':
        return [
          { name: 'Dashboard', path: '/transport/dashboard', icon: LayoutDashboard },
          { name: 'Shipment Tracking', path: '/transport/dashboard#shipments', icon: Truck },
          { name: 'Scan Batch QR', path: '/transport/dashboard#scan', icon: QrCode },
        ];
      case 'warehouse':
        return [
          { name: 'Dashboard', path: '/warehouse/dashboard', icon: LayoutDashboard },
          { name: 'Receive Batch', path: '/warehouse/dashboard#receive', icon: QrCode },
          { name: 'Inventory Table', path: '/warehouse/dashboard#inventory', icon: Warehouse },
        ];
      case 'retailer':
        return [
          { name: 'Dashboard', path: '/retailer/dashboard', icon: LayoutDashboard },
          { name: 'Receive Product', path: '/retailer/dashboard#receive', icon: QrCode },
          { name: 'Store Inventory', path: '/retailer/dashboard#inventory', icon: ShoppingBag },
        ];
      case 'admin':
        return [
          { name: 'Admin Overview', path: '/admin/panel', icon: LayoutDashboard },
          { name: 'Manage Users', path: '/admin/panel#users', icon: Users },
          { name: 'Blockchain Explorer', path: '/explorer', icon: Search },
        ];
      default:
        return [
          { name: 'Verify Product', path: '/verify', icon: Search },
        ];
    }
  };

  const navLinks = getRoleNavLinks();

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 bg-white dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent border-r md:border-r-0 border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between transition-all duration-300 md:relative md:translate-x-0 md:z-auto ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isCollapsed ? 'w-20 md:w-20' : 'w-72 md:w-64'
      }`}>
        <div className="space-y-6">
          
          {/* Mobile Close Button & Header */}
          <div className="flex items-center justify-between md:hidden border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-sm text-slate-500 uppercase tracking-widest">
              Navigation Menu
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info Header */}
          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center font-bold text-base shadow-agri shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{user?.name}</h4>
                <span className="text-[11px] font-semibold text-agri-600 dark:text-agri-400 capitalize px-2 py-0.5 rounded-full bg-agri-50 dark:bg-agri-950/60 border border-agri-200 dark:border-agri-800 inline-block mt-0.5 whitespace-nowrap">
                  {(user?.role || 'User')} Account
                </span>
              </div>
            </div>
          </div>

          {/* Role Navigation Menu */}
          <div>
            <span className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 transition-all duration-300 ${isCollapsed ? 'md:text-center md:px-0' : 'px-3'}`}>
              {isCollapsed ? 'Menu' : 'Main Menu'}
            </span>
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl font-medium text-sm transition-all duration-200 ${
                        isCollapsed ? 'md:justify-center md:p-3 p-3' : 'gap-3 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-agri-600 text-white shadow-agri font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-agri-600 dark:hover:text-agri-400'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'w-auto opacity-100'}`}>
                      {item.name}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* System Utilities */}
          <div>
            <span className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 transition-all duration-300 ${isCollapsed ? 'md:text-center md:px-0' : 'px-3'}`}>
              {isCollapsed ? 'Util' : 'Utilities'}
            </span>
            <nav className="space-y-1">
              <NavLink
                to="/profile"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center rounded-xl font-medium text-sm transition-all duration-200 ${
                    isCollapsed ? 'md:justify-center md:p-3 p-3' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-agri-600 text-white shadow-agri font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-agri-600 dark:hover:text-agri-400'
                  }`
                }
              >
                <User className="w-5 h-5 shrink-0" />
                <span className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'w-auto opacity-100'}`}>
                  Profile
                </span>
              </NavLink>
              <NavLink
                to="/settings"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center rounded-xl font-medium text-sm transition-all duration-200 ${
                    isCollapsed ? 'md:justify-center md:p-3 p-3' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-agri-600 text-white shadow-agri font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-agri-600 dark:hover:text-agri-400'
                  }`
                }
              >
                <Settings className="w-5 h-5 shrink-0" />
                <span className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'w-auto opacity-100'}`}>
                  Settings
                </span>
              </NavLink>
              <NavLink
                to="/future-scope"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center rounded-xl font-medium text-sm transition-all duration-200 ${
                    isCollapsed ? 'md:justify-center md:p-3 p-3' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-agri-600 text-white shadow-agri font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-amber-500 dark:hover:text-amber-400'
                  }`
                }
              >
                <Cpu className="w-5 h-5 text-amber-500 shrink-0" />
                <span className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'w-auto opacity-100'}`}>
                  Future Scope
                </span>
              </NavLink>
            </nav>
          </div>

        </div>

        {/* Bottom actions & collapse toggle */}
        <div className="space-y-2 mt-6">
          {/* Collapse Toggle Button (Desktop/Tablet only) */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex items-center justify-center w-full py-2 border-t border-slate-200/50 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Logout Footer Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors ${
              isCollapsed ? 'md:justify-center md:p-3 p-3' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'w-auto opacity-100'}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
