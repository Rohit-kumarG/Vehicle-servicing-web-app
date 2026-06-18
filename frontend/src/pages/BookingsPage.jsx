import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { bookingService, garageService, vehicleService } from "../api/services";
import { Calendar, Clock, DollarSign, Shield, Car, AlignLeft, XCircle, AlertCircle, MessageSquare } from "lucide-react";
import ChatPanel from "../components/ChatPanel";
import { useAuth } from "../context/AuthContext";

const servicePrices = {
  "Oil Change": 3500,
  "Full Synthetic Oil Change": 4500,
  "Engine Diagnostic": 3000,
  "Engine Diagnostic & Tuning": 5000,
  "Brake Pad Replacement": 4500,
  "Brake Service": 4000,
  "Wheel Alignment": 2000,
  "Wheel Alignment & Balancing": 2800,
  "Tire Rotation": 1200,
  "Ceramic Coating Detail": 15000,
  "Complete Detailing Package": 12000,
  "Car Wash": 1500,
  "Body Polishing": 6000,
  "General Mechanical Checkup": 1800,
  "AC Gas Refill": 3500,
  "Suspension Repair": 9000,
  "Battery Replacement": 8500,
};

const getPrice = (name) => servicePrices[name] || 2500;

export default function BookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [garages, setGarages] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingOtherChecked, setBookingOtherChecked] = useState(false);
  const [bookingOtherText, setBookingOtherText] = useState("");
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
    estimated_cost: 0,
  });

  const selectedGarage = garages.find((garage) => garage._id === form.garage_id);
  const selectedGarageServices = selectedGarage?.services_offered || [];

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const garageId = params.get("garage");

    if (garageId && garages.some((garage) => garage._id === garageId)) {
      setForm((current) => ({
        ...current,
        garage_id: garageId,
        service_type: "",
        estimated_cost: 0,
      }));
      setSelectedServices([]);
      setBookingOtherChecked(false);
      setBookingOtherText("");
      setShowForm(true);
    }
  }, [location.search, garages]);

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
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "garage_id" ? { service_type: "", estimated_cost: 0 } : {}),
    }));
    if (name === "garage_id") {
      setSelectedServices([]);
    }
  };

  const handleServiceToggle = (serviceName) => {
    let updated;
    if (selectedServices.includes(serviceName)) {
      updated = selectedServices.filter((s) => s !== serviceName);
    } else {
      updated = [...selectedServices, serviceName];
    }
    setSelectedServices(updated);

    const baseCost = updated.reduce((sum, name) => sum + getPrice(name), 0);
    const total = baseCost + (bookingOtherChecked ? 2000 : 0);
    setForm((current) => ({
      ...current,
      service_type: updated.join(", ") || "Custom Service Request",
      estimated_cost: total,
    }));
  };

  const handleOtherToggle = (checked) => {
    setBookingOtherChecked(checked);
    const baseCost = selectedServices.reduce((sum, name) => sum + getPrice(name), 0);
    const total = baseCost + (checked ? 2000 : 0);
    setForm((current) => ({
      ...current,
      estimated_cost: total,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serviceList = [...selectedServices];
    if (bookingOtherChecked && bookingOtherText.trim()) {
      serviceList.push(bookingOtherText.trim());
    } else if (bookingOtherChecked) {
      serviceList.push("Other Services");
    }

    if (serviceList.length === 0) {
      setFormError("Please select at least one service.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const finalForm = {
        ...form,
        service_type: serviceList.join(", ")
      };
      await bookingService.create(finalForm);
      setForm({
        garage_id: "",
        vehicle_id: "",
        service_type: "",
        service_description: "",
        scheduled_date: "",
        scheduled_time: "",
        notes: "",
        estimated_cost: 0,
      });
      setSelectedServices([]);
      setBookingOtherChecked(false);
      setBookingOtherText("");
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

  const downloadInvoice = (booking) => {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) return;

    const cost = booking.actual_cost || booking.estimated_cost || 0;
    const subtotal = (cost * 0.85).toFixed(0);
    const gst = (cost * 0.15).toFixed(0);

    const html = `
      <html>
        <head>
          <title>Invoice - GARAGE WALA</title>
          <style>
            body { font-family: 'Outfit', 'Inter', sans-serif; color: #1a1e26; padding: 40px; margin: 0; }
            .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #c5a880; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { color: #a4865d; font-size: 24px; font-weight: 800; text-transform: uppercase; }
            .invoice-status { border: 2px solid #3d5c4b; color: #3d5c4b; padding: 6px 12px; font-size: 14px; font-weight: 700; text-transform: uppercase; border-radius: 4px; display: inline-block; margin-top: 10px; }
            .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            h3 { color: #a4865d; margin-bottom: 10px; border-bottom: 1px solid #f6f3eb; padding-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background: #f6f3eb; text-align: left; padding: 12px; font-weight: 700; color: #a4865d; border-bottom: 2px solid #c5a880; }
            td { padding: 12px; border-bottom: 1px solid #f6f3eb; }
            .totals-table { width: 300px; margin-left: auto; }
            .totals-table td { border: none; padding: 6px 12px; }
            .totals-table tr.grand-total td { font-weight: 800; font-size: 16px; color: #a4865d; border-top: 1px dashed #c5a880; padding-top: 10px; }
            .footer { text-align: center; color: #5e6675; font-size: 12px; margin-top: 60px; border-top: 1px solid #f6f3eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div>
              <div class="logo">GARAGE WALA</div>
              <span class="invoice-status">Paid Receipt</span>
            </div>
            <div style="text-align: right;">
              <h2>INVOICE</h2>
              <p style="margin: 4px 0;">Ref: #INV-${booking._id.slice(-6).toUpperCase()}</p>
              <p style="margin: 4px 0; color: #5e6675;">Issued: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div class="invoice-details">
            <div>
              <h3>Issued By</h3>
              <strong>${booking.garage_id?.name || "Service Station"}</strong>
              <p style="margin: 4px 0; color: #5e6675;">${booking.garage_id?.address || "Vetted Workshop Location"}</p>
              <p style="margin: 4px 0; color: #5e6675;">${booking.garage_id?.city || ""}</p>
              <p style="margin: 4px 0; color: #5e6675;">Phone: ${booking.garage_id?.phone || ""}</p>
            </div>
            <div>
              <h3>Billed To</h3>
              <strong>${user?.full_name || "Olivia Pratt"}</strong>
              <p style="margin: 4px 0; color: #5e6675;">Vehicle: ${booking.vehicle_id ? `${booking.vehicle_id.make} ${booking.vehicle_id.model} (${booking.vehicle_id.registration_number})` : "Valet Customer"}</p>
              <p style="margin: 4px 0; color: #5e6675;">Service Date: ${booking.scheduled_date}</p>
            </div>
          </div>

          <h3>Service Description</h3>
          <table>
            <thead>
              <tr>
                <th>Service Item</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${booking.service_type.split(", ").map(s => `
                <tr>
                  <td>${s}</td>
                  <td style="text-align: right;">Rs. ${getPrice(s).toLocaleString()}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">Rs. ${Number(subtotal).toLocaleString()}</td>
            </tr>
            <tr>
              <td>GST Tax (15%):</td>
              <td style="text-align: right;">Rs. ${Number(gst).toLocaleString()}</td>
            </tr>
            <tr class="grand-total">
              <td>Grand Total:</td>
              <td style="text-align: right;">Rs. ${Number(cost).toLocaleString()}</td>
            </tr>
          </table>

          <div class="footer">
            <p>Thank you for choosing GARAGE WALA for your premium vehicle needs.</p>
            <p>&copy; ${new Date().getFullYear()} GARAGE WALA. All rights reserved.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
  };

  const renderTimeline = (status) => {
    if (status === "cancelled") {
      return (
        <div 
          className="status-badge cancelled" 
          style={{ 
            width: "100%", 
            textAlign: "center", 
            padding: "8px", 
            margin: "16px 0", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            gap: "6px",
            fontSize: "12px",
            background: "var(--danger-light)",
            border: "1px solid var(--danger)",
            borderRadius: "8px"
          }}
        >
          <XCircle size={14} /> This request has been cancelled.
        </div>
      );
    }

    const steps = [
      { key: "pending", label: "Requested" },
      { key: "confirmed", label: "Confirmed" },
      { key: "in_progress", label: "Servicing" },
      { key: "completed", label: "Completed" },
    ];

    const getStepClass = (stepKey) => {
      const statusOrder = ["pending", "confirmed", "in_progress", "completed"];
      const currentIndex = statusOrder.indexOf(status);
      const stepIndex = statusOrder.indexOf(stepKey);

      if (currentIndex > stepIndex) return "status-step completed";
      if (currentIndex === stepIndex) return "status-step active";
      return "status-step";
    };

    return (
      <div className="status-timeline">
        {steps.map((step, idx) => (
          <div key={step.key} className={getStepClass(step.key)}>
            <div className="status-node">{idx + 1}</div>
            <div className="status-label">{step.label}</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className="page-content"><p>Loading your appointments...</p></div>;

  return (
    <div className="page-content">
      {/* Page Header */}
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
          <h2>Service Bookings</h2>
          <p>Schedule concierge detailing or track live maintenance statuses</p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "View Bookings" : "+ Request Booking"}
        </button>
      </div>

      {/* Booking Form Card */}
      {showForm && (
        <div className="form-card" style={{ animation: "fadeIn 0.3s ease" }}>
          <h3 style={{ borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>Create Concierge Appointment</h3>
          
          {formError && (
            <div style={{ 
              color: "var(--danger)", 
              background: "var(--danger-light)", 
              padding: "10px 14px", 
              borderRadius: "8px", 
              fontSize: "13.5px",
              border: "1px solid var(--danger)",
              fontWeight: "600",
              marginBottom: "12px"
            }}>
              <AlertCircle size={14} style={{ display: "inline", marginRight: "6px" }} /> {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <label>
                Select Detailing Station / Garage
                <select
                  name="garage_id"
                  value={form.garage_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select garage location...</option>
                  {garages.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} — {g.area}, {g.city}
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
                  required
                >
                  <option value="">Select registered vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.make} {v.model} ({v.registration_number})
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>Select Services Required</span>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  background: "var(--bg-darker)",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--line-strong)",
                  maxHeight: "180px",
                  overflowY: "auto"
                }}>
                  {(selectedGarageServices.length ? selectedGarageServices : [
                    "Oil Change",
                    "Engine Diagnostic & Tuning",
                    "Brake Service",
                    "Wheel Alignment & Balancing",
                    "Car Wash",
                    "Body Polishing",
                    "General Mechanical Checkup"
                  ]).map((service) => {
                    const price = getPrice(service);
                    const isChecked = selectedServices.includes(service);
                    return (
                      <label key={service} style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontWeight: "500", cursor: "pointer", fontSize: "13px" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleServiceToggle(service)}
                          style={{ width: "auto", margin: 0 }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                          <span>{service}</span>
                          <span style={{ color: "var(--accent-strong)", fontWeight: "700" }}>Rs. {price.toLocaleString()}</span>
                        </div>
                      </label>
                    );
                  })}
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontWeight: "500", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="checkbox"
                      checked={bookingOtherChecked}
                      onChange={(e) => handleOtherToggle(e.target.checked)}
                      style={{ width: "auto", margin: 0 }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <span>Other (Custom Service)</span>
                      <span style={{ color: "var(--accent-strong)", fontWeight: "700" }}>Rs. 2,000</span>
                    </div>
                  </label>
                </div>
                {bookingOtherChecked && (
                  <label style={{ marginTop: "8px" }}>
                    Specify Custom Service Name
                    <input
                      placeholder="e.g. Engine Valve Adjustment"
                      value={bookingOtherText}
                      onChange={(e) => setBookingOtherText(e.target.value)}
                      required
                    />
                  </label>
                )}
                {form.estimated_cost > 0 && (
                  <div style={{ textAlign: "right", fontSize: "14px", fontWeight: "800", color: "var(--success)", marginTop: "4px" }}>
                    Total Estimated Cost: Rs. {form.estimated_cost.toLocaleString()}
                  </div>
                )}
              </div>

              <label>
                Request Date
                <input
                  name="scheduled_date"
                  type="date"
                  value={form.scheduled_date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Preferred Time Slot
                <input
                  name="scheduled_time"
                  type="time"
                  value={form.scheduled_time}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Special Delivery Notes (optional)
                <input
                  name="notes"
                  placeholder="e.g. Leave keys in valet dropoff"
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label style={{ marginTop: "16px", display: "flex", flexDirection: "column" }}>
              Service Diagnostics / Description
              <textarea
                name="service_description"
                placeholder="Please detail engine indicators, polish guidelines, or custom requests..."
                value={form.service_description}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--line-strong)",
                  background: "#fafaf9",
                  marginTop: "8px",
                }}
                rows={3}
              />
            </label>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting ? "Submitting Request..." : "Submit Booking Request"}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings Collection Grid */}
      {bookings.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "48px", 
          color: "var(--muted)",
          border: "1px dashed var(--line-strong)",
          borderRadius: "var(--radius-md)",
          background: "var(--panel)"
        }}>
          <p style={{ fontWeight: "600" }}>No appointments registered.</p>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>Click "+ Request Booking" to submit your first service scheduling.</p>
        </div>
      ) : (
        <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {bookings.map((booking) => (
            <article key={booking._id} className="garage-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              {/* Card Title Header */}
              <div className="card-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className="luxury-badge" style={{ background: "var(--accent-light)", color: "var(--accent-strong)", fontSize: "9px" }}>
                    Maintenance Order
                  </span>
                  <h3 style={{ fontSize: "1.15rem", marginTop: "4px" }}>{booking.service_type}</h3>
                </div>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status.replace("_", " ")}
                </span>
              </div>

              {/* Status Progress Timeline */}
              {renderTimeline(booking.status)}

              {/* Details List */}
              <div 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "10px 16px",
                  background: "var(--bg-darker)",
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  border: "1px solid var(--line)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text)" }}>
                  <Shield size={14} color="var(--accent-strong)" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {booking.garage_id?.name || "Service Station"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--muted)" }}>
                  <Calendar size={14} color="var(--accent-strong)" />
                  <span>{booking.scheduled_date}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--muted)" }}>
                  <Clock size={14} color="var(--accent-strong)" />
                  <span>{booking.scheduled_time}</span>
                </div>
                {booking.vehicle_id && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text)", fontWeight: "500" }}>
                    <Car size={14} color="var(--accent-strong)" />
                    <span>{booking.vehicle_id.make} {booking.vehicle_id.model}</span>
                  </div>
                )}
              </div>

              {/* Description/Notes if present */}
              {(booking.service_description || booking.notes) && (
                <div style={{ fontSize: "12.5px", color: "var(--muted)", borderLeft: "2px solid var(--accent)", paddingLeft: "10px" }}>
                  {booking.service_description && <p style={{ fontStyle: "italic", marginBottom: "4px" }}>"{booking.service_description}"</p>}
                  {booking.notes && <p style={{ fontSize: "11px", fontWeight: "600" }}>🔑 Notes: {booking.notes}</p>}
                </div>
              )}

              {/* Footer row with pricing and actions */}
              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  borderTop: "1px solid var(--line)", 
                  paddingTop: "14px", 
                  marginTop: "auto" 
                }}
              >
                <div style={{ display: "flex", gap: "16px" }}>
                  {booking.estimated_cost && (
                    <span style={{ fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "3px" }}>
                      Est: <strong>Rs.{booking.estimated_cost}</strong>
                    </span>
                  )}
                  {booking.actual_cost && (
                    <span style={{ fontSize: "13px", color: "var(--success)", display: "flex", alignItems: "center", gap: "3px", fontWeight: "700" }}>
                      Final: <strong>Rs.{booking.actual_cost}</strong>
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {booking.status !== "cancelled" && (
                    <button
                      onClick={() => setActiveChatBooking({ _id: booking._id, name: booking.garage_id?.name || "Service Station" })}
                      style={{
                        background: "var(--accent-glow)",
                        color: "var(--accent-strong)",
                        border: "1px solid var(--line-strong)",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <MessageSquare size={12} /> Chat
                    </button>
                  )}

                  {booking.status === "completed" && (
                    booking.payment_status === "paid" ? (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{
                          color: "var(--success)",
                          background: "var(--success-light)",
                          border: "1px solid var(--success)",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center"
                        }}>
                          ✓ Paid
                        </span>
                        <button
                          onClick={() => downloadInvoice(booking)}
                          style={{
                            background: "var(--accent-glow)",
                            color: "var(--accent-strong)",
                            border: "1px solid var(--line-strong)",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          🖨️ Receipt
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/checkout/${booking._id}`)}
                        style={{
                          background: "var(--accent-strong)",
                          color: "#ffffff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "700",
                          transition: "all 0.2s"
                        }}
                      >
                        💳 Pay Invoice
                      </button>
                    )
                  )}

                  {["pending", "confirmed"].includes(booking.status) && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      style={{
                        background: "rgba(153, 27, 27, 0.08)",
                        color: "var(--danger)",
                        border: "1px solid rgba(153, 27, 27, 0.15)",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--danger-light)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(153, 27, 27, 0.08)";
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

            </article>
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
