import { useState } from "react";
import {
  Bell,
  CalendarCheck2,
  CarFront,
  LayoutDashboard,
  MessageSquareQuote,
  ShieldCheck,
  Wrench,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const customerLinks = [
    { to: "/", label: "Home", icon: LayoutDashboard },
    { to: "/garages", label: "Garages", icon: ShieldCheck },
    { to: "/vehicles", label: "Vehicles", icon: CarFront },
    { to: "/bookings", label: "Bookings", icon: CalendarCheck2 },
    { to: "/feedback", label: "Feedback", icon: MessageSquareQuote },
  ];

  const garageLinks = [
    { to: "/", label: "Home", icon: LayoutDashboard },
    { to: "/garage/profile", label: "My Garage", icon: Wrench },
    { to: "/garage/bookings", label: "Bookings", icon: ClipboardList },
  ];

  const adminLinks = [
    { to: "/", label: "Home", icon: LayoutDashboard },
    { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
  ];

  const links =
    user?.role === "garage"
      ? garageLinks
      : user?.role === "admin"
        ? adminLinks
        : customerLinks;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? "70px" : "240px",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease",
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: collapsed ? "20px 16px" : "20px 20px",
            borderBottom: "1px solid #1e293b",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#f59e0b",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              color: "white",
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            AH
          </div>
          {!collapsed && (
            <div>
              <div
                style={{ color: "white", fontWeight: "700", fontSize: "15px" }}
              >
                AutoCare Hub
              </div>
              <div style={{ color: "#64748b", fontSize: "11px" }}>
                Vehicle Service Booking
              </div>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav
          style={{
            flex: 1,
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to + label}
              to={to}
              end={to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                textDecoration: "none",
                color: isActive ? "white" : "#94a3b8",
                background: isActive ? "#1e40af" : "transparent",
                fontWeight: isActive ? "600" : "400",
                fontSize: "14px",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                overflow: "hidden",
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div
          style={{
            padding: collapsed ? "12px 8px" : "12px 16px",
            borderTop: "1px solid #1e293b",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {!collapsed && user && (
            <div
              style={{
                background: "#1e293b",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <p style={{ color: "#64748b", fontSize: "11px", margin: 0 }}>
                Signed in as
              </p>
              <p
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: "13px",
                  margin: "2px 0",
                }}
              >
                {user?.full_name || "Guest"}
              </p>
              <span
                style={{
                  background:
                    user?.role === "admin"
                      ? "#7c3aed"
                      : user?.role === "garage"
                        ? "#d97706"
                        : "#059669",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                }}
              >
                {user?.role}
              </span>
            </div>
          )}

          {user && (
            <button
              onClick={logout}
              style={{
                width: "100%",
                padding: "8px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {collapsed ? "←" : "Logout"}
            </button>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute",
            top: "50%",
            right: "-14px",
            transform: "translateY(-50%)",
            width: "28px",
            height: "28px",
            background: "#1e40af",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Bar */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
              🚗 Smart Vehicle Service Booking Portal
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <NotificationBell />
            {!user && (
              <>
                <NavLink
                  to="/login"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    textDecoration: "none",
                    color: "#333",
                    fontSize: "13px",
                  }}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#1e40af",
                    color: "white",
                    textDecoration: "none",
                    fontSize: "13px",
                  }}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
