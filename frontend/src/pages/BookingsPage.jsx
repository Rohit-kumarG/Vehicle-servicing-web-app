import { useEffect, useState } from "react";
import { bookingService, garageService, vehicleService } from "../api/services";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [garages, setGarages] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    garage_id: "",
    vehicle_id: "",
    service_type: "",
    service_description: "",
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [bookingsRes, garagesRes, vehiclesRes] = await Promise.all([
        bookingService.getMyBookings(),
        garageService.getAll(),
        vehicleService.getAll(),
      ]);
      setBookings(bookingsRes.data);
      setGarages(garagesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await bookingService.create(form);
      setForm({
        garage_id: "",
        vehicle_id: "",
        service_type: "",
        service_description: "",
        scheduled_date: "",
        scheduled_time: "",
        notes: "",
      });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      await bookingService.cancel(id);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
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

  if (loading) return <div className="page-content">Loading bookings...</div>;

  return (
    <div className="page-content">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2>My Bookings</h2>
          <p>Manage your service bookings</p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ New Booking"}
        </button>
      </div>

      {/* New Booking Form */}
      {showForm && (
        <div className="form-card" style={{ marginBottom: "24px" }}>
          <h3 style={{ marginBottom: "16px" }}>Create New Booking</h3>
          {formError && (
            <p style={{ color: "red", marginBottom: "10px" }}>{formError}</p>
          )}
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <label>
                Select Garage
                <select
                  name="garage_id"
                  value={form.garage_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a garage...</option>
                  {garages.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} - {g.city}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Select Vehicle
                <select
                  name="vehicle_id"
                  value={form.vehicle_id}
                  onChange={handleChange}
                >
                  <option value="">Choose a vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.make} {v.model} ({v.registration_number})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Service Type
                <input
                  name="service_type"
                  placeholder="e.g. oil change, tire change"
                  value={form.service_type}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Scheduled Date
                <input
                  name="scheduled_date"
                  type="date"
                  value={form.scheduled_date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Scheduled Time
                <input
                  name="scheduled_time"
                  type="time"
                  value={form.scheduled_time}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Notes (optional)
                <input
                  name="notes"
                  placeholder="Any special instructions..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label style={{ marginTop: "12px" }}>
              Service Description (optional)
              <textarea
                name="service_description"
                placeholder="Describe the issue in detail..."
                value={form.service_description}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "4px",
                }}
                rows={3}
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              style={{ marginTop: "16px" }}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Booking"}
            </button>
          </form>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          No bookings yet. Click New Booking to get started!
        </div>
      ) : (
        <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {bookings.map((booking) => (
            <article key={booking._id} className="garage-card">
              <div className="card-header-row">
                <h3>{booking.service_type}</h3>
                <span
                  style={{
                    background: getStatusColor(booking.status),
                    color: "white",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                >
                  {booking.status}
                </span>
              </div>

              <p>🏪 {booking.garage_id?.name || "Garage"}</p>
              <p>📍 {booking.garage_id?.city}</p>
              {booking.vehicle_id && (
                <p>
                  🚗 {booking.vehicle_id.make} {booking.vehicle_id.model}
                </p>
              )}
              <p>
                📅 {booking.scheduled_date} at {booking.scheduled_time}
              </p>

              {booking.estimated_cost && (
                <p>💰 Estimated: Rs. {booking.estimated_cost}</p>
              )}
              {booking.actual_cost && (
                <p>💵 Final Cost: Rs. {booking.actual_cost}</p>
              )}

              {["pending", "confirmed"].includes(booking.status) && (
                <button
                  onClick={() => handleCancel(booking._id)}
                  style={{
                    marginTop: "12px",
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel Booking
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
