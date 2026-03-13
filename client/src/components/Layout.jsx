import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItem = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2.5 text-sm rounded transition-colors ${
    isActive ? 'bg-brand-700 text-white font-medium' : 'text-brand-100 hover:bg-brand-700/60'
  }`;

const mobileNavItem = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-3 text-sm rounded transition-colors ${
    isActive ? 'bg-brand-700 text-white font-medium' : 'text-brand-100 hover:bg-brand-700/60'
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-brand-500">DONDO</div>
          <div className="text-sm font-semibold text-gray-900 leading-tight">Scheduler</div>
        </div>
        <NavLink to="/profile" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </NavLink>
      </header>

      {/* Sidebar */}
      <aside className="hidden w-56 bg-brand-800 flex-col shrink-0 md:flex">
        <div className="px-4 py-5 border-b border-brand-700">
          <div className="font-mono text-white text-xs tracking-widest uppercase opacity-60">DONDO</div>
          <div className="font-semibold text-white text-lg leading-tight">Scheduler</div>
        </div>

        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          <NavLink to="/" end className={navItem}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </NavLink>
          <NavLink to="/events" className={navItem}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Events
          </NavLink>
          <NavLink to="/events/new" className={navItem}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Event
          </NavLink>
          <NavLink to="/assets" className={navItem}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7L12 3 4 7l8 4 8-4zM4 12l8 4 8-4M4 17l8 4 8-4" /></svg>
            Assets
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin/users" className={navItem}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Users
            </NavLink>
          )}
        </nav>

        <div className="px-2 py-3 border-t border-brand-700">
          <NavLink to="/profile" className={navItem}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            {user?.name?.split(' ')[0]}
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-200 hover:text-white hover:bg-brand-700/60 rounded transition-colors mt-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" onClick={closeMobileMenu} className="absolute inset-0 bg-black/40" aria-label="Close menu" />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[84vw] bg-brand-800 flex flex-col shadow-2xl">
            <div className="px-4 py-5 border-b border-brand-700 flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-white text-xs tracking-widest uppercase opacity-60">DONDO</div>
                <div className="font-semibold text-white text-lg leading-tight">Scheduler</div>
              </div>
              <button type="button" onClick={closeMobileMenu} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-100 hover:bg-brand-700/60" aria-label="Close menu">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
              <NavLink to="/" end className={mobileNavItem} onClick={closeMobileMenu}>Dashboard</NavLink>
              <NavLink to="/events" className={mobileNavItem} onClick={closeMobileMenu}>Events</NavLink>
              <NavLink to="/events/new" className={mobileNavItem} onClick={closeMobileMenu}>New Event</NavLink>
              <NavLink to="/assets" className={mobileNavItem} onClick={closeMobileMenu}>Assets</NavLink>
              {user?.role === 'admin' && <NavLink to="/admin/users" className={mobileNavItem} onClick={closeMobileMenu}>Users</NavLink>}
              <NavLink to="/profile" className={mobileNavItem} onClick={closeMobileMenu}>{user?.name?.split(' ')[0]}</NavLink>
            </nav>

            <div className="px-2 py-3 border-t border-brand-700">
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-3 text-sm text-brand-200 hover:text-white hover:bg-brand-700/60 rounded transition-colors">
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 px-2 py-1.5">
          <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center rounded px-1 py-2 text-[11px] ${isActive ? 'text-brand-700' : 'text-gray-500'}`}>
            <span>Home</span>
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `flex flex-col items-center rounded px-1 py-2 text-[11px] ${isActive ? 'text-brand-700' : 'text-gray-500'}`}>
            <span>Events</span>
          </NavLink>
          <NavLink to="/events/new" className={({ isActive }) => `flex flex-col items-center rounded px-1 py-2 text-[11px] ${isActive ? 'text-brand-700' : 'text-gray-500'}`}>
            <span>New</span>
          </NavLink>
          <NavLink to="/assets" className={({ isActive }) => `flex flex-col items-center rounded px-1 py-2 text-[11px] ${isActive ? 'text-brand-700' : 'text-gray-500'}`}>
            <span>Assets</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
