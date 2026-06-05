import { useEffect, useState } from "react";
import { bookingService } from "../api/services";
import { User, Phone, Car, Calendar, AlignLeft, Shield, DollarSign, Clock, CheckCircle, Play, AlertTriangle, MessageSquare } from "lucide-react";
import ChatPanel from "../components/ChatPanel";

export default function GarageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);
  const [activeChatBooking, setActiveChatBooking] = useState(null);

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

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const earnings = bookings.reduce(
    (acc, booking) => {
      const actual = Number(booking.actual_cost || 0);
      const estimated = Number(booking.estimated_cost || 0);
      if (booking.status === "completed") acc.completedRevenue += actual || estimated;
      acc.pipelineRevenue += actual || estimated;
      if (booking.status === "completed") acc.completed += 1;
      if (["pending", "confirmed", "in_progress"].includes(booking.status)) acc.active += 1;
      return acc;
    },
    { completedRevenue: 0, pipelineRevenue: 0, completed: 0, active: 0 },
  );

  if (loading) return <div className="page-content"><p>Loading client appointments...</p></div>;

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
          <h2>Order Queue</h2>
          <p>Supervise detailing schedules, adjust wait times, and update pricing actuals</p>
        </div>
      </div>

      <section className="owner-earnings-grid">
        {[
          {
            label: "Completed Revenue",
            value: `Rs. ${earnings.completedRevenue.toLocaleString()}`,
            icon: DollarSign,
            note: "From completed bookings",
          },
          {
            label: "Pipeline Value",
            value: `Rs. ${earnings.pipelineRevenue.toLocaleString()}`,
            icon: Shield,
            note: "Estimated + actual queue value",
          },
          {
            label: "Active Orders",
            value: earnings.active,
            icon: Play,
            note: "Pending, confirmed, in progress",
          },
          {
            label: "Completed Orders",
            value: earnings.completed,
            icon: CheckCircle,
            note: "Finished service tickets",
          },
        ].map(({ label, value, icon: Icon, note }) => (
          <article className="owner-earning-card" key={label}>
            <Icon size={18} />
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{note}</p>
          </article>
        ))}
      </section>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          flexWrap: "wrap",
          background: "var(--bg-darker)",
          padding: "6px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--line)",
          width: "fit-content"
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
            className={filter === status ? "primary-button" : "ghost-button"}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "700",
              minHeight: "34px",
              boxShadow: filter === status ? "0 4px 10px rgba(197, 168, 128, 0.15)" : "none"
            }}
          >
            {status === "all" ? "All Queue" : status.replace("_", " ")}
            <span style={{ fontSize: "10.5px", opacity: 0.8, marginLeft: "4px" }}>
              ({status === "all" ? bookings.length : bookings.filter((b) => b.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Bookings Queue List */}
      {filtered.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "48px", 
          color: "var(--muted)",
          border: "1px dashed var(--line-strong)",
          borderRadius: "var(--radius-md)",
          background: "var(--panel)"
        }}>
          <p style={{ fontWeight: "600" }}>No matching orders in queue slot.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filtered.map((booking) => (
            <div
              key={booking._id}
              className="garage-card"
              style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className="luxury-badge" style={{ background: "var(--accent-light)", color: "var(--accent-strong)", fontSize: "9px" }}>
                    Service Ticket
                  </span>
                  <h3 style={{ fontSize: "1.15rem", marginTop: "4px" }}>{booking.service_type}</h3>
                </div>
                <span className={`status-badge ${booking.status}`} style={{ fontSize: "11px" }}>
                  {booking.status.replace("_", " ")}
                </span>
              </div>

              {/* Client Info Grid */}
              <div 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
                  gap: "12px 18px",
                  background: "var(--bg-darker)",
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  border: "1px solid var(--line)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <User size={13} color="var(--accent-strong)" />
                  <span>Customer: <strong>{booking.customer_id?.full_name}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone size={13} color="var(--accent-strong)" />
                  <span>Telephone: <strong>{booking.customer_id?.phone || "Not provided"}</strong></span>
                </div>
                {booking.vehicle_id && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Car size={13} color="var(--accent-strong)" />
                    <span>Vehicle: <strong>{booking.vehicle_id.make} {booking.vehicle_id.model} ({booking.vehicle_id.registration_number})</strong></span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={13} color="var(--accent-strong)" />
                  <span>Scheduled: <strong>{booking.scheduled_date} at {booking.scheduled_time}</strong></span>
                </div>
              </div>

              {/* Description boxes */}
              {(booking.service_description || booking.notes) && (
                <div style={{ fontSize: "12.5px", color: "var(--muted)", borderLeft: "2px solid var(--accent)", paddingLeft: "10px" }}>
                  {booking.service_description && <p style={{ fontStyle: "italic", marginBottom: "4px" }}>"Description: {booking.service_description}"</p>}
                  {booking.notes && <p style={{ fontSize: "11.5px", fontWeight: "600" }}>💬 Special instructions: {booking.notes}</p>}
                </div>
              )}

              {/* Footer action flow bar */}
              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  borderTop: "1px solid var(--line)", 
                  paddingTop: "14px", 
                  marginTop: "auto",
                  flexWrap: "wrap",
                  gap: "14px"
                }}
              >
                <div>
                  {booking.actual_cost ? (
                    <span style={{ fontSize: "13.5px", color: "var(--success)", fontWeight: "700" }}>
                      💰 Final Revenue: Rs. {booking.actual_cost}
                    </span>
                  ) : booking.estimated_cost ? (
                    <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>
                      Estimated Quote: Rs. {booking.estimated_cost}
                    </span>
                  ) : (
                    <span style={{ fontSize: "12.5px", color: "var(--muted)", fontStyle: "italic" }}>
                      Pending quote entry
                    </span>
                  )}
                </div>

                {/* Status action buttons */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  {booking.status !== "cancelled" && (
                    <button
                      onClick={() => setActiveChatBooking({ _id: booking._id, name: booking.customer_id?.full_name || "Customer" })}
                      style={{
                        background: "var(--accent-glow)",
                        color: "var(--accent-strong)",
                        border: "1px solid var(--line-strong)",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "11.5px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        minHeight: "32px"
                      }}
                    >
                      <MessageSquare size={12} /> Chat
                    </button>
                  )}

                  {booking.status !== "completed" && booking.status !== "cancelled" && (
                    <>
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                          disabled={updating === booking._id}
                          className="primary-button"
                          style={{ padding: "6px 14px", minHeight: "32px", fontSize: "11.5px", background: "var(--success)", boxShadow: "none" }}
                        >
                          <CheckCircle size={12} /> Confirm Appointment
                        </button>
                      )}

                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, "in_progress")}
                          disabled={updating === booking._id}
                          className="primary-button"
                          style={{ padding: "6px 14px", minHeight: "32px", fontSize: "11.5px", background: "var(--accent)" }}
                        >
                          <Clock size={12} /> Start Detailing Work
                        </button>
                      )}

                      {booking.status === "in_progress" && (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "8px", top: "8px", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Rs.</span>
                            <input
                              type="number"
                              placeholder="Final actual cost"
                              id={`cost-${booking._id}`}
                              style={{
                                padding: "6px 10px 6px 28px",
                                borderRadius: "6px",
                                border: "1px solid var(--line-strong)",
                                width: "150px",
                                fontSize: "12px",
                                height: "32px",
                                background: "var(--bg)"
                              }}
                            />
                          </div>
                          <button
                            onClick={() => {
                              const cost = document.getElementById(`cost-${booking._id}`).value;
                              handleStatusUpdate(booking._id, "completed", cost);
                            }}
                            disabled={updating === booking._id}
                            className="primary-button"
                            style={{ padding: "6px 14px", minHeight: "32px", fontSize: "11.5px", background: "var(--success)", boxShadow: "none" }}
                          >
                            ✔ Mark Completed
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                        disabled={updating === booking._id}
                        style={{
                          background: "rgba(153, 27, 27, 0.08)",
                          color: "var(--danger)",
                          border: "1px solid rgba(153, 27, 27, 0.15)",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "11.5px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          minHeight: "32px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--danger-light)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(153, 27, 27, 0.08)"; }}
                      >
                        <AlertTriangle size={12} /> Cancel Order
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeChatBooking && (
        <ChatPanel
          bookingId={activeChatBooking._id}
          garageName={activeChatBooking.name}
          onClose={() => setActiveChatBooking(null)}
        />
      )}
    </div>
  );
}
