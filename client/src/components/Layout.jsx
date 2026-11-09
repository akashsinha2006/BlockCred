import { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, FilePlus2, Files, ScanSearch, Info, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/Auth';
import ThemeToggle from './ThemeToggle';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/issue', label: 'Issue credential', Icon: FilePlus2 },
  { to: '/credentials', label: 'Credentials', Icon: Files },
  { to: '/verify', label: 'Verify (public)', Icon: ScanSearch },
  { to: '/about', label: 'About', Icon: Info },
];

export function Brand({ to = '/' }) {
  return (
    <Link to={to} className="brand">
      <span className="brand-icon"><ShieldCheck size={20} /></span>
      <span><b>BlockCred</b><small>Credential trust layer</small></span>
    </Link>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const title = NAV.find((n) => pathname.startsWith(n.to))?.label || 'BlockCred';

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-top"><Brand to="/dashboard" /><button className="icon-btn mobile-only" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
        <nav onClick={() => setOpen(false)}>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}><Icon size={18} /> {label}</NavLink>
          ))}
        </nav>
        <div className="side-user">
          <div className="avatar">{user?.email?.[0]?.toUpperCase()}</div>
          <div className="grow"><b>Issuer</b><small>{user?.email}</small></div>
          <button className="icon-btn" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main-wrap">
        <header className="topbar">
          <button className="icon-btn lg mobile-only" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={19} /></button>
          <h2>{title}</h2>
          <div className="grow" />
          <span className="env-pill"><span className="dot" /> Local demo</span>
          <ThemeToggle />
        </header>
        <main className="main"><Outlet /></main>
        <footer className="footer">BlockCred · Prototype for demonstration · Use fictional data only</footer>
      </div>
    </div>
  );
}
