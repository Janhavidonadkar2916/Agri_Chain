import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLayout } from '../context/LayoutContext';
import { Sun, Moon, Sprout, LogOut, User, Search, Cpu, ShieldCheck, Menu, X, ArrowRight, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { isSidebarOpen, toggleSidebar, setIsSidebarOpen } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user || !user.role) return '/login';
    switch (user.role.toLowerCase()) {
      case 'farmer': return '/farmer/dashboard';
      case 'transport': return '/transport/dashboard';
      case 'warehouse': return '/warehouse/dashboard';
      case 'retailer': return '/retailer/dashboard';
      case 'admin': return '/admin/panel';
      default: return '/verify';
    }
  };

  // Determine if current route displays the Sidebar component
  const hasSidebar = user && user.role && !['/', '/login', '/register', '/verify', '/explorer', '/future-scope'].includes(location.pathname);

  const publicNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Verify Product', path: '/verify', icon: ShieldCheck, iconColor: 'text-agri-600' },
    { name: 'Blockchain Explorer', path: '/explorer', icon: Search, iconColor: 'text-agri-600' },
    { name: 'Future Scope', path: '/future-scope', icon: Cpu, iconColor: 'text-amber-500' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-agri-600 to-agri-500 flex items-center justify-center text-white shadow-agri group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-agri-700 via-agri-600 to-agri-500 bg-clip-text text-transparent dark:from-agri-400 dark:to-agri-300">
                AgriChain
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-agri-100 dark:bg-agri-950 text-agri-700 dark:text-agri-300 border border-agri-200 dark:border-agri-800">
                Web3 Supply Chain
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {publicNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className={`flex items-center gap-1.5 transition-colors hover:text-agri-600 dark:hover:text-agri-400 ${
                    location.pathname === link.path ? 'text-agri-600 dark:text-agri-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${link.iconColor}`} />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions & User Profile (Desktop/Tablet) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center">
              {user ? (
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
                  <Link 
                    to={getDashboardPath()}
                    className="hidden lg:flex flex-col text-right cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-agri-600 transition-colors">
                      {user?.name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-agri-600 dark:text-agri-400">
                      {user?.role || 'User'} Dashboard
                    </span>
                  </Link>
                  
                  <Link
                    to={getDashboardPath()}
                    className="w-9 h-9 rounded-xl bg-agri-100 dark:bg-agri-950 text-agri-700 dark:text-agri-300 flex items-center justify-center font-bold text-sm border border-agri-300 dark:border-agri-700 hover:ring-2 hover:ring-agri-500 transition-all"
                    title="Go to Dashboard"
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-agri-600 dark:hover:text-agri-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-md hover:shadow-agri transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Open Navigation"
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </header>

      {/* Slide-Over Drawer for Public Pages (when no Sidebar exists) */}
      {!hasSidebar && isSidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden flex justify-end">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-80 max-w-[85%] bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col gap-6 border-l border-slate-100 dark:border-slate-800 overflow-y-auto animate-slideInRight">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Menu Navigation
              </span>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card (Inside Drawer if Logged In) */}
            {user && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-agri-600 text-white flex items-center justify-center font-bold text-lg shadow-agri shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{user?.name}</h4>
                  <span className="text-[10px] font-bold text-agri-600 dark:text-agri-400 capitalize px-2 py-0.5 rounded-full bg-agri-50 dark:bg-agri-950/60 border border-agri-200 dark:border-agri-800 inline-block mt-0.5">
                    {user?.role || 'User'} Account
                  </span>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <nav className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 block mb-1">
                Platform Utilities
              </span>
              {publicNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                      location.pathname === link.path
                        ? 'bg-agri-600 text-white shadow-agri'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons (Footer of Drawer) */}
            <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full py-3.5 px-4 font-bold text-sm text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-agri flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <Link
                      to="/profile"
                      onClick={() => setIsSidebarOpen(false)}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsSidebarOpen(false)}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full py-3 px-4 font-bold text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out Account
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full py-3 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full py-3.5 px-4 font-bold text-sm text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-md text-center hover:shadow-agri transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
