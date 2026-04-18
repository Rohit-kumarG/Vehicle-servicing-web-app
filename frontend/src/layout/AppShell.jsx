import {
  Bell,
  CalendarCheck2,
  CarFront,
  LayoutDashboard,
  MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/garages", label: "Garages", icon: ShieldCheck },
  { to: "/vehicles", label: "Vehicles", icon: CarFront },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck2 },
  { to: "/feedback", label: "Feedback", icon: MessageSquareQuote },
  { to: "/admin", label: "Admin", icon: Bell },
];

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">AH</div>
          <div className="brand-copy">
            <h1>AutoCare Hub</h1>
            <p>Vehicle Service Booking</p>
          </div>
        </div>

        <nav className="nav-links">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="profile-card">
          <p>Signed in as</p>
          <strong>{user?.full_name || user?.name || "Guest User"}</strong>
          <span>{user?.role || "viewer"}</span>
          {user && (
            <button
              onClick={logout}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "6px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          )}
        </div>
      </aside>

      <main className="page-shell">
        <header className="topbar">
          <div>
            <span className="eyebrow">Final Year Project</span>
            <h2>Smart Vehicle Service Booking Portal</h2>
          </div>

          <div className="topbar-actions">
            <NavLink className="ghost-button" to="/login">
              Login
            </NavLink>
            <NavLink className="primary-button" to="/register">
              Create Account
            </NavLink>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
