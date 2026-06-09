import {
  Bell,
  CalendarDays,
  CarFront,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../context/AuthContext";

export default function AppShell() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--accent-strong)", fontWeight: "600" }}>
        Loading Elite Services...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="landing-frame">
        <main className="landing-content">
          <Outlet />
        </main>
      </div>
    );
  }

  const customerLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/bookings", label: "Appointments", icon: CalendarDays },
    { to: "/garages", label: "Services", icon: CarFront },
    { to: "/vehicles", label: "My Vehicles", icon: Wrench },
    { to: "/feedback", label: "Feedback", icon: MessageSquareQuote },
  ];

  const garageLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/garage/bookings", label: "Appointments", icon: ClipboardList },
    { to: "/garage/profile", label: "My Garage", icon: Wrench },
  ];

  const adminLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
  ];

  const links =
    user?.role === "garage"
      ? garageLinks
      : user?.role === "admin"
        ? adminLinks
        : customerLinks;

  const displayName = user?.full_name || "Olivia P.";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="app-frame">
      <aside className={`elite-sidebar ${collapsed ? "collapsed" : ""}`}>
        <button className="brand-lockup" onClick={() => navigate("/")}>
          <ShieldCheck size={31} strokeWidth={1.7} />
          {!collapsed && (
            <span>
              <strong>GARAGE WALA</strong>
            </span>
          )}
        </button>

        <nav className="elite-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to + label} to={to} end={to === "/"}>
              {({ isActive }) => (
                <span className={isActive ? "active" : ""} title={label}>
                  <Icon size={18} strokeWidth={1.7} />
                  {!collapsed && label}
                </span>
              )}
            </NavLink>
          ))}


          <NavLink to="/profile">
            {({ isActive }) => (
              <span className={isActive ? "active" : ""} title="Profile">
                <UserRound size={18} strokeWidth={1.7} />
                {!collapsed && "Profile"}
              </span>
            )}
          </NavLink>
        </nav>
      </aside>

      <section className="elite-main">
        <header className="elite-topbar">
          <button className="icon-button" onClick={() => setCollapsed(!collapsed)} aria-label="Menu">
            <Menu size={18} />
          </button>

          <div className="topbar-actions">
            <div className="user-chip">
              <span className="avatar">{initial}</span>
              <span>{displayName}</span>
            </div>
            {user ? (
              <NotificationBell />
            ) : (
              <button className="icon-button" aria-label="Notifications">
                <Bell size={18} />
              </button>
            )}
            {user && (
              <button className="icon-button danger" onClick={logout} aria-label="Sign out">
                <LogOut size={17} />
              </button>
            )}
          </div>
        </header>

        <main className="elite-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
