// Layout — wraps every page with a navbar, main content area, and footer
// Navbar shows different links based on the user's role:
//   - participant: "My Tickets"
//   - organizer: "My Events"
//   - admin: "Admin Panel"
// Also includes dark mode toggle and mobile hamburger menu

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Sun, Moon, LogOut, LayoutDashboard, Menu, X, Ticket, Briefcase } from 'lucide-react';

import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Log out and redirect to login page
  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate('/login');
  }

  // Helper: is this path currently active?
  function isActive(path) {
    return location.pathname === path;
  }

  // Nav link class — highlights the active page
  function navClass(path) {
    return `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
      isActive(path)
        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
    }`;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans">

      {/* ── Sticky Navbar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Evently
                </span>
                <span className="text-[10px] text-slate-400 font-bold block leading-none uppercase tracking-widest">
                  Smart Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-950/40 p-1.5 rounded-xl border border-slate-200/20">
              {/* Always visible */}
              <Link to="/" className={navClass('/')}>Browse Events</Link>

              {/* Participant: My Tickets */}
              {user?.role === 'participant' && (
                <Link to="/my-tickets" className={`${navClass('/my-tickets')} flex items-center gap-1.5`}>
                  <Ticket className="w-4 h-4" /> My Tickets
                </Link>
              )}

              {/* Organizer: My Events dashboard */}
              {(user?.role === 'organizer') && (
                <Link to="/organizer" className={`${navClass('/organizer')} flex items-center gap-1.5`}>
                  <Briefcase className="w-4 h-4" /> My Events
                </Link>
              )}

              {/* Admin: Admin Panel */}
              {user?.role === 'admin' && (
                <Link to="/admin" className={`${navClass('/admin')} flex items-center gap-1.5`}>
                  <LayoutDashboard className="w-4 h-4" /> Admin Panel
                </Link>
              )}
            </nav>

            {/* Right side: theme toggle + user info */}
            <div className="flex items-center gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark'
                  ? <Sun className="w-5 h-5 text-amber-400" />
                  : <Moon className="w-5 h-5 text-indigo-600" />}
              </button>

              {/* Logged in: show name, role badge, logout */}
              {user ? (
                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {user.name || user.email}
                    </span>
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                /* Not logged in: Sign In / Sign Up */
                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                  <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 md:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                Browse Events
              </Link>

              {user?.role === 'participant' && (
                <Link to="/my-tickets" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  My Tickets
                </Link>
              )}

              {user?.role === 'organizer' && (
                <Link to="/organizer" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  My Events
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Admin Panel
                </Link>
              )}

              {/* Mobile user section */}
              {user ? (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 px-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full text-center px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full text-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-white">Evently Portal</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Evently — Smart Event Registration Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
