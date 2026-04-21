import { useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  CarFront,
  CalendarCheck2,
  MessageSquareQuote,
  Wrench,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  LogOut,
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
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/garages", label: "Garages", icon: ShieldCheck },
    { to: "/vehicles", label: "My Vehicles", icon: CarFront },
    { to: "/bookings", label: "Bookings", icon: CalendarCheck2 },
    { to: "/feedback", label: "Feedback", icon: MessageSquareQuote },
  ];

  const garageLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/garage/profile", label: "My Garage", icon: Wrench },
    { to: "/garage/bookings", label: "Bookings", icon: ClipboardList },
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

  const roleConfig = {
    admin: {
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.15)",
      label: "Administrator",
    },
    garage: {
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.15)",
      label: "Garage Owner",
    },
    customer: {
      color: "#34d399",
      bg: "rgba(52,211,153,0.15)",
      label: "Customer",
    },
  };

  const role = roleConfig[user?.role] || roleConfig.customer;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#f0f4f8",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* ========== SIDEBAR ========== */}
      <aside
        style={{
          width: collapsed ? "70px" : "255px",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          flexShrink: 0,
          boxShadow: "2px 0 20px rgba(0,0,0,0.2)",
        }}
      >
        {/* Logo + Toggle */}
        <div
          style={{
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            minHeight: "64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              overflow: "hidden",
              flex: 1,
            }}
            onClick={() => navigate("/")}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                background: "#1e3a5f",
                border: "2px solid #2d6a9f",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                color: "#60c3f5",
                fontSize: "13px",
                flexShrink: 0,
                letterSpacing: "0.5px",
              }}
            >
              AH
            </div>
            {!collapsed && (
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    color: "#f1f5f9",
                    fontWeight: "700",
                    fontSize: "15px",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                  }}
                >
                  AutoCare Hub
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    marginTop: "2px",
                  }}
                >
                  Vehicle Service Portal
                </div>
              </div>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: "28px",
              height: "28px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "7px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.5)",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.13)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav Label */}
        {!collapsed && (
          <div
            style={{
              padding: "16px 16px 6px",
              color: "rgba(255,255,255,0.25)",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Menu
          </div>
        )}

        {/* Nav Links */}
        <nav
          style={{
            flex: 1,
            padding: "6px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            overflowY: "auto",
            overflowX: "hidden",
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
                gap: "10px",
                padding: collapsed ? "10px" : "10px 12px",
                borderRadius: "10px",
                textDecoration: "none",
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
                background: isActive ? "rgba(96,195,245,0.15)" : "transparent",
                fontWeight: isActive ? "600" : "400",
                fontSize: "13.5px",
                transition: "all 0.18s",
                whiteSpace: "nowrap",
                overflow: "hidden",
                justifyContent: collapsed ? "center" : "flex-start",
                borderLeft: isActive
                  ? "3px solid #60c3f5"
                  : "3px solid transparent",
                cursor: "pointer",
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: isActive
                        ? "rgba(96,195,245,0.2)"
                        : "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.18s",
                    }}
                  >
                    <Icon
                      size={15}
                      color={isActive ? "#60c3f5" : "rgba(255,255,255,0.45)"}
                    />
                  </div>
                  {!collapsed && (
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "inherit",
                      }}
                    >
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.07)",
            margin: "0 12px",
          }}
        />

        {/* User Profile + Logout */}
        <div
          style={{
            padding: collapsed ? "12px 10px" : "14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {user && !collapsed && (
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "10px",
                padding: "10px 12px",
                border: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#1e3a5f",
                  border: "2px solid #2d6a9f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#60c3f5",
                  fontWeight: "700",
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <p
                  style={{
                    color: "#f1f5f9",
                    fontWeight: "600",
                    fontSize: "12.5px",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.full_name}
                </p>
                <span
                  style={{
                    background: role.bg,
                    color: role.color,
                    padding: "1px 7px",
                    borderRadius: "20px",
                    fontSize: "10px",
                    fontWeight: "600",
                    display: "inline-block",
                    marginTop: "3px",
                  }}
                >
                  {role.label}
                </span>
              </div>
            </div>
          )}

          {/* Collapsed Avatar */}
          {user && collapsed && (
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#1e3a5f",
                border: "2px solid #2d6a9f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#60c3f5",
                fontWeight: "700",
                fontSize: "13px",
                margin: "0 auto",
              }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          {user && (
            <button
              onClick={logout}
              style={{
                width: "100%",
                padding: collapsed ? "9px" : "9px 14px",
                background: "rgba(239,68,68,0.12)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.18)",
                borderRadius: "9px",
                cursor: "pointer",
                fontSize: "12.5px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.22)";
                e.currentTarget.style.color = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.12)";
                e.currentTarget.style.color = "#f87171";
              }}
            >
              <LogOut size={14} />
              {!collapsed && "Sign Out"}
            </button>
          )}
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
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
            padding: "0 20px",
            height: "60px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>🚗</span>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#0f172a",
                    lineHeight: 1.2,
                  }}
                >
                  Smart Vehicle Service Booking Portal
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "#94a3b8",
                  }}
                >
                  Final Year Project — MERN Stack
                </p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <NotificationBell />
            {!user && (
              <div style={{ display: "flex", gap: "8px" }}>
                <NavLink
                  to="/login"
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    textDecoration: "none",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: "white",
                  }}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    color: "white",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Get Started
                </NavLink>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            background: "#f0f4f8",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
