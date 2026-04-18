import { useEffect, useState } from "react";
import { bookingService } from "../api/services";

export default function GarageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getGarageBookings();
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, cost) => {
    setUpdating(id);
    try {
      await bookingService.updateStatus(id, {
        status,
        actual_cost: cost || undefined,
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      in_progress: "#8b5cf6",
      completed: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status] || "#888";
  };

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) return <div className="page-content">Loading bookings...</div>;

  return (
    <div className="page-content">
      <div style={{ marginBottom: "24px" }}>
        <h2>Garage Bookings</h2>
        <p>Manage all incoming customer bookings</p>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {[
          "all",
          "pending",
          "confirmed",
          "in_progress",
          "completed",
          "cancelled",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              background: filter === status ? "#0066cc" : "#f0f0f0",
              color: filter === status ? "white" : "black",
              fontSize: "13px",
            }}
          >
            {status === "all" ? "All" : status.replace("_", " ")}
            {status === "all"
              ? ` (${bookings.length})`
              : ` (${bookings.filter((b) => b.status === status).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          No bookings found
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((booking) => (
            <div
              key={booking._id}
              className="garage-card"
              style={{ padding: "20px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3>{booking.service_type}</h3>
                  <p>👤 Customer: {booking.customer_id?.full_name}</p>
                  <p>📞 Phone: {booking.customer_id?.phone || "N/A"}</p>
                  {booking.vehicle_id && (
                    <p>
                      🚗 Vehicle: {booking.vehicle_id.make}{" "}
                      {booking.vehicle_id.model} (
                      {booking.vehicle_id.registration_number})
                    </p>
                  )}
                  <p>
                    📅 Date: {booking.scheduled_date} at{" "}
                    {booking.scheduled_time}
                  </p>
                  {booking.service_description && (
                    <p>📝 Description: {booking.service_description}</p>
                  )}
                  {booking.notes && <p>💬 Notes: {booking.notes}</p>}
                  {booking.actual_cost && (
                    <p>💰 Cost: Rs. {booking.actual_cost}</p>
                  )}
                </div>

                <span
                  style={{
                    background: getStatusColor(booking.status),
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {booking.status.replace("_", " ")}
                </span>
              </div>

              {/* Action Buttons */}
              {booking.status !== "completed" &&
                booking.status !== "cancelled" && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    {booking.status === "pending" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(booking._id, "confirmed")
                        }
                        disabled={updating === booking._id}
                        style={{
                          background: "#3b82f6",
                          color: "white",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        ✅ Confirm
                      </button>
                    )}

                    {booking.status === "confirmed" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(booking._id, "in_progress")
                        }
                        disabled={updating === booking._id}
                        style={{
                          background: "#8b5cf6",
                          color: "white",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        🔧 Start Work
                      </button>
                    )}

                    {booking.status === "in_progress" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="number"
                          placeholder="Final cost (Rs.)"
                          id={`cost-${booking._id}`}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            width: "160px",
                          }}
                        />
                        <button
                          onClick={() => {
                            const cost = document.getElementById(
                              `cost-${booking._id}`,
                            ).value;
                            handleStatusUpdate(booking._id, "completed", cost);
                          }}
                          disabled={updating === booking._id}
                          style={{
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          ✔️ Complete
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        handleStatusUpdate(booking._id, "cancelled")
                      }
                      disabled={updating === booking._id}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
