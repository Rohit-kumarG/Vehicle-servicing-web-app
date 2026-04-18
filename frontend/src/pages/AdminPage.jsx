import { useEffect, useState } from "react";
import { adminService } from "../api/services";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [garages, setGarages] = useState([]);
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
      const [statsRes, usersRes, garagesRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getGarages(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setGarages(garagesRes.data);
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
        className="page-content"
        style={{ textAlign: "center", padding: "40px" }}
      >
        <h2>Access Denied</h2>
        <p>Only admins can access this page.</p>
      </div>
    );
  }

  if (loading) return <div className="page-content">Loading admin data...</div>;

  return (
    <div className="page-content">
      <div style={{ marginBottom: "24px" }}>
        <h2>Admin Dashboard</h2>
        <p>Manage users, garages and view platform stats</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {["stats", "users", "garages"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: activeTab === tab ? "#0066cc" : "#f0f0f0",
              color: activeTab === tab ? "white" : "black",
              fontWeight: activeTab === tab ? "bold" : "normal",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div>
          <div
            className="card-grid"
            style={{
              gridTemplateColumns: "repeat(4, 1fr)",
              marginBottom: "24px",
            }}
          >
            <div className="garage-card" style={{ textAlign: "center" }}>
              <h1 style={{ color: "#0066cc" }}>{stats.users.total}</h1>
              <p>Total Customers</p>
            </div>
            <div className="garage-card" style={{ textAlign: "center" }}>
              <h1 style={{ color: "#10b981" }}>{stats.garages.active}</h1>
              <p>Active Garages</p>
            </div>
            <div className="garage-card" style={{ textAlign: "center" }}>
              <h1 style={{ color: "#f59e0b" }}>{stats.bookings.total}</h1>
              <p>Total Bookings</p>
            </div>
            <div className="garage-card" style={{ textAlign: "center" }}>
              <h1 style={{ color: "#8b5cf6" }}>{stats.feedbacks.total}</h1>
              <p>Total Reviews</p>
            </div>
          </div>

          <div
            className="card-grid"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <div className="garage-card" style={{ textAlign: "center" }}>
              <h2 style={{ color: "#10b981" }}>{stats.bookings.completed}</h2>
              <p>Completed Bookings</p>
            </div>
            <div className="garage-card" style={{ textAlign: "center" }}>
              <h2 style={{ color: "#f59e0b" }}>{stats.bookings.pending}</h2>
              <p>Pending Bookings</p>
            </div>
            <div className="garage-card" style={{ textAlign: "center" }}>
              <h2 style={{ color: "#ef4444" }}>{stats.bookings.cancelled}</h2>
              <p>Cancelled Bookings</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <h3 style={{ marginBottom: "16px" }}>All Users ({users.length})</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Role</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Joined</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{u.full_name}</td>
                  <td style={{ padding: "12px" }}>{u.email}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        background:
                          u.role === "admin"
                            ? "#8b5cf6"
                            : u.role === "garage"
                              ? "#f59e0b"
                              : "#10b981",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {u.role !== "admin" && (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        style={{
                          background: "red",
                          color: "white",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Garages Tab */}
      {activeTab === "garages" && (
        <div>
          <h3 style={{ marginBottom: "16px" }}>
            All Garages ({garages.length})
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left" }}>City</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Owner</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {garages.map((g) => (
                <tr key={g._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{g.name}</td>
                  <td style={{ padding: "12px" }}>{g.city}</td>
                  <td style={{ padding: "12px" }}>{g.owner_id?.full_name}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        background: g.is_active ? "#10b981" : "#ef4444",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    >
                      {g.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => handleToggleGarage(g._id)}
                      style={{
                        background: g.is_active ? "red" : "green",
                        color: "white",
                        border: "none",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {g.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
