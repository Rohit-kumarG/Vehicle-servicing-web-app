import { useEffect, useState } from "react";
import { adminService, feedbackService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { Shield, Users, Warehouse, FileText, CheckCircle, Clock, XCircle, Trash2, ToggleLeft, ToggleRight, CalendarCheck2, Star } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [garages, setGarages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAll();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, garagesRes, bookingsRes, reviewsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getGarages(),
        adminService.getBookings(),
        feedbackService.getAllForAdmin(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setGarages(garagesRes.data);
      setBookings(bookingsRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGarage = async (id) => {
    try {
      await adminService.toggleGarageStatus(id);
      fetchAll();
    } catch (err) {
      alert("Failed to update garage status");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminService.deleteUser(id);
      fetchAll();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px",
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          maxWidth: "500px",
          margin: "40px auto"
        }}
      >
        <span style={{ fontSize: "40px" }}>🚨</span>
        <h2 style={{ marginTop: "12px" }}>Access Denied</h2>
        <p style={{ marginTop: "8px", color: "var(--muted)" }}>Only authorized platform administrators may audit this dashboard console.</p>
      </div>
    );
  }

  if (loading) return <div className="page-content"><p>Loading system metrics...</p></div>;

  return (
    <div className="page-content">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--line)",
          paddingBottom: "20px",
          marginBottom: "12px",
        }}
      >
        <div>
          <h2>Administration Console</h2>
          <p>Supervise registered customer profiles, garages, and system transactions</p>
        </div>
      </div>

      {/* Luxury Tabs Bar */}
      <div 
        style={{ 
          display: "flex", 
          gap: "8px", 
          marginBottom: "12px",
          background: "var(--bg-darker)",
          padding: "6px",
          borderRadius: "var(--radius-sm)",
          width: "fit-content",
          border: "1px solid var(--line)"
        }}
      >
        {[
          { id: "stats", label: "Overview Stats", icon: Shield },
          { id: "users", label: "User Accounts", icon: Users },
          { id: "garages", label: "Partner Garages", icon: Warehouse },
          { id: "bookings", label: "Bookings", icon: CalendarCheck2 },
          { id: "reviews", label: "Reviews", icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={isActive ? "primary-button" : "ghost-button"}
              style={{
                padding: "8px 18px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "700",
                fontSize: "12.5px",
                minHeight: "36px",
                gap: "6px",
                boxShadow: isActive ? "0 4px 10px rgba(197, 168, 128, 0.15)" : "none"
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Stats Tab view */}
      {activeTab === "stats" && stats && (
        <div style={{ animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>System-Wide Totals</h3>
          
          <div className="card-grid four-column">
            {[
              { label: "Active Clients", val: stats.users.total, icon: Users, col: "var(--accent)" },
              { label: "Servicing Hubs", val: stats.garages.active, icon: Warehouse, col: "var(--secondary)" },
              { label: "Service Orders", val: stats.bookings.total, icon: FileText, col: "var(--success)" },
              { label: "Review Feedbacks", val: stats.feedbacks.total, icon: CheckCircle, col: "#bd8e4e" }
            ].map((s, idx) => (
              <div key={idx} className="stat-card" style={{ borderLeftColor: s.col, padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase" }}>{s.label}</span>
                  <s.icon size={16} color={s.col} />
                </div>
                <strong style={{ fontSize: "2.4rem", color: "var(--text)" }}>{s.val}</strong>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginTop: "12px" }}>Order Queue Statistics</h3>

          <div className="admin-chart-grid">
            <article className="analytics-card">
              <h3>Booking Status Chart</h3>
              {[
                { label: "Completed", value: stats.bookings.completed, color: "var(--success)" },
                { label: "Pending", value: stats.bookings.pending, color: "var(--warning)" },
                { label: "Cancelled", value: stats.bookings.cancelled, color: "var(--danger)" },
              ].map((item) => {
                const max = Math.max(stats.bookings.completed, stats.bookings.pending, stats.bookings.cancelled, 1);
                return (
                  <div className="admin-bar-row" key={item.label}>
                    <span>{item.label}</span>
                    <div><b style={{ width: `${(item.value / max) * 100}%`, background: item.color }} /></div>
                    <strong>{item.value}</strong>
                  </div>
                );
              })}
            </article>

            <article className="analytics-card">
              <h3>Garage Activation Ratio</h3>
              <div className="donut-chart" style={{ "--active": `${stats.garages.total ? (stats.garages.active / stats.garages.total) * 100 : 0}%` }}>
                <span>{stats.garages.active}/{stats.garages.total}</span>
              </div>
              <p style={{ textAlign: "center", marginTop: "10px" }}>
                Active vs inactive partner garages
              </p>
            </article>
          </div>

          <div className="card-grid three-column">
            {[
              { label: "Completed Bookings", val: stats.bookings.completed, icon: CheckCircle, col: "var(--success)", bg: "var(--success-light)" },
              { label: "Pending Bookings", val: stats.bookings.pending, icon: Clock, col: "var(--warning)", bg: "var(--warning-light)" },
              { label: "Cancelled Bookings", val: stats.bookings.cancelled, icon: XCircle, col: "var(--danger)", bg: "var(--danger-light)" }
            ].map((s, idx) => (
              <div 
                key={idx} 
                className="garage-card" 
                style={{ 
                  textAlign: "center", 
                  padding: "24px", 
                  background: "var(--panel)", 
                  border: "1px solid var(--line)"
                }}
              >
                <div 
                  style={{ 
                    width: "36px", 
                    height: "36px", 
                    background: s.bg, 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    margin: "0 auto 12px"
                  }}
                >
                  <s.icon size={16} color={s.col} />
                </div>
                <h2 style={{ fontSize: "2rem", color: "var(--text)", fontWeight: "800" }}>{s.val}</h2>
                <p style={{ fontSize: "12.5px", color: "var(--muted)", fontWeight: "600", marginTop: "4px" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab view */}
      {activeTab === "users" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "1.2rem" }}>All Accounts Directory ({users.length})</h3>
          
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Email Credentials</th>
                  <th>Permission Role</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: "600" }}>{u.full_name}</td>
                    <td style={{ color: "var(--muted)" }}>{u.email}</td>
                    <td>
                      <span
                        className={`status-badge ${u.role === "admin" ? "completed" : u.role === "garage" ? "in_progress" : "confirmed"}`}
                        style={{ fontSize: "10.5px" }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.role !== "admin" ? (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          style={{
                            background: "rgba(153, 27, 27, 0.08)",
                            color: "var(--danger)",
                            border: "1px solid rgba(153, 27, 27, 0.15)",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--danger-light)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(153, 27, 27, 0.08)"; }}
                        >
                          <Trash2 size={12} /> Delete User
                        </button>
                      ) : (
                        <span style={{ fontSize: "11.5px", color: "var(--muted)", fontStyle: "italic" }}>Default Root</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Garages Tab view */}
      {activeTab === "garages" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "1.2rem" }}>Serving Center Partners Directory ({garages.length})</h3>
          
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Center Name</th>
                  <th>Location City</th>
                  <th>Registered Owner</th>
                  <th>Status Indicator</th>
                  <th>Security Toggle</th>
                </tr>
              </thead>
              <tbody>
                {garages.map((g) => (
                  <tr key={g._id}>
                    <td style={{ fontWeight: "700" }}>{g.name}</td>
                    <td>{g.city}</td>
                    <td>{g.owner_id?.full_name || "Unassigned"}</td>
                    <td>
                      <span
                        className={`status-badge ${g.is_active ? "completed" : "cancelled"}`}
                        style={{ fontSize: "11px" }}
                      >
                        {g.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleGarage(g._id)}
                        style={{
                          background: g.is_active ? "rgba(153, 27, 27, 0.08)" : "rgba(61, 92, 75, 0.08)",
                          color: g.is_active ? "var(--danger)" : "var(--success)",
                          border: g.is_active ? "1px solid rgba(153, 27, 27, 0.15)" : "1px solid rgba(61, 92, 75, 0.15)",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.background = g.is_active ? "var(--danger-light)" : "var(--success-light)"; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.background = g.is_active ? "rgba(153, 27, 27, 0.08)" : "rgba(61, 92, 75, 0.08)"; 
                        }}
                      >
                        {g.is_active ? (
                          <>
                            <ToggleRight size={14} /> Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={14} /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "1.2rem" }}>Bookings Management ({bookings.length})</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Garage</th>
                  <th>Vehicle</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td style={{ fontWeight: "700" }}>{booking.service_type}</td>
                    <td>{booking.customer_id?.full_name || "Customer"}</td>
                    <td>{booking.garage_id?.name || "Garage"}</td>
                    <td>
                      {booking.vehicle_id
                        ? `${booking.vehicle_id.make} ${booking.vehicle_id.model}`
                        : "No vehicle"}
                    </td>
                    <td>{booking.scheduled_date} {booking.scheduled_time}</td>
                    <td>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td>{booking.actual_cost || booking.estimated_cost || "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "1.2rem" }}>Feedback & Reviews ({reviews.length})</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Garage</th>
                  <th>Rating</th>
                  <th>Sentiment</th>
                  <th>Comment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td>{review.customer_id?.full_name || "Customer"}</td>
                    <td>{review.garage_id?.name || "Garage"}</td>
                    <td>
                      <span className="pill">
                        <Star size={11} fill="var(--accent-strong)" /> {review.rating}/5
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${review.sentiment === "negative" ? "cancelled" : review.sentiment === "positive" ? "completed" : "pending"}`}>
                        {review.sentiment || "neutral"}
                      </span>
                    </td>
                    <td>{review.comment || "No comment"}</td>
                    <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
