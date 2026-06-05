import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, ShieldCheck, CheckCircle2, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { bookingService } from "../api/services";

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [error, setError] = useState("");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await bookingService.getById(bookingId);
      setBooking(res.data);
      if (res.data.payment_status === "paid") {
        setPaidSuccess(true);
      }
    } catch (err) {
      setError("Unable to retrieve invoice details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === "number") {
      formatted = value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
    } else if (name === "expiry") {
      formatted = value.replace(/\//g, "").replace(/(\d{2})/g, "$1/").trim().slice(0, 5);
      if (formatted.endsWith("/")) formatted = formatted.slice(0, -1);
    } else if (name === "cvv") {
      formatted = value.replace(/\D/g, "").slice(0, 3);
    }
    setCard((prev) => ({ ...prev, [name]: formatted }));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    setError("");

    try {
      await bookingService.pay(bookingId);
      setPaidSuccess(true);
    } catch (err) {
      setError("Payment failed. Please verify your card details.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px", color: "var(--accent-strong)" }}>
        <Loader2 className="spinner-icon" size={32} />
        <strong>Retrieving invoice summary...</strong>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="page-content" style={{ maxWidth: "600px", margin: "40px auto" }}>
        <div className="empty-state-card">
          <CreditCard size={44} />
          <h2>Invoice Not Found</h2>
          <p>{error || "No booking record fits this reference."}</p>
          <button className="primary-button" onClick={() => navigate("/bookings")}>
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const costToPay = booking.actual_cost || booking.estimated_cost || 0;

  if (paidSuccess) {
    return (
      <div className="page-content" style={{ maxWidth: "560px", margin: "40px auto", textAlign: "center" }}>
        <div className="form-card" style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <div className="success-icon-glow" style={{ background: "var(--success-light)", color: "var(--success)", padding: "16px", borderRadius: "50%" }}>
            <CheckCircle2 size={48} />
          </div>
          <div>
            <h2>Payment Successful!</h2>
            <p style={{ color: "var(--muted)", marginTop: "6px" }}>Invoice settled for Order Ref: #{bookingId.slice(-6).toUpperCase()}</p>
          </div>

          <div style={{ width: "100%", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "16px 0", margin: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "var(--muted)", fontSize: "14px" }}>Station:</span>
              <strong style={{ fontSize: "14px" }}>{booking.garage_id?.name}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "var(--muted)", fontSize: "14px" }}>Service:</span>
              <strong style={{ fontSize: "14px" }}>{booking.service_type}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)", fontSize: "14px" }}>Amount Paid:</span>
              <strong style={{ fontSize: "15px", color: "var(--success)" }}>Rs. {costToPay.toLocaleString()}</strong>
            </div>
          </div>

          <button className="primary-button" onClick={() => navigate("/bookings")} style={{ width: "100%" }}>
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <button className="ghost-button" onClick={() => navigate("/bookings")} style={{ marginBottom: "20px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
        <ArrowLeft size={14} /> Back to Appointments
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "30px", alignItems: "start" }}>
        {/* Left Side: Payment Form */}
        <article className="form-card" style={{ padding: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "20px" }}>
            <CreditCard color="var(--accent-strong)" size={20} />
            <h3 style={{ margin: 0 }}>Secure Card Checkout</h3>
          </div>

          {error && (
            <div style={{ color: "var(--danger)", background: "var(--danger-light)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--danger)", fontSize: "13.5px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handlePay} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label>
              Cardholder Name
              <input
                type="text"
                name="name"
                placeholder="Olivia Pratt"
                value={card.name}
                onChange={handleCardChange}
                required
              />
            </label>

            <label>
              Card Number
              <input
                type="text"
                name="number"
                placeholder="4000 1234 5678 9010"
                value={card.number}
                onChange={handleCardChange}
                required
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <label>
                Expiration Date
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={handleCardChange}
                  required
                />
              </label>
              <label>
                CVV / CVC Code
                <input
                  type="password"
                  name="cvv"
                  placeholder="•••"
                  value={card.cvv}
                  onChange={handleCardChange}
                  required
                />
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0", padding: "12px", background: "var(--bg-darker)", borderRadius: "8px", fontSize: "12px", color: "var(--muted)", border: "1px solid var(--line)" }}>
              <ShieldCheck size={16} color="var(--success)" style={{ flexShrink: 0 }} />
              <span>Payment is secured with SHA-256 mock encryption. No real charge will occur.</span>
            </div>

            <button type="submit" className="primary-button wide-button" disabled={paying} style={{ marginTop: "10px", minHeight: "48px", fontSize: "15px" }}>
              {paying ? "Authorizing Payment..." : `Settle Invoice — Rs. ${costToPay.toLocaleString()}`}
            </button>
          </form>
        </article>

        {/* Right Side: Invoice Summary */}
        <aside className="analytics-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", background: "var(--bg-darker)" }}>
          <h3 style={{ fontSize: "1.1rem" }}>Invoice Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: "1px solid var(--line)", paddingBottom: "16px" }}>
            <div>
              <small style={{ color: "var(--muted)", display: "block", fontSize: "11px" }}>SERVICE STATION</small>
              <strong style={{ color: "var(--text)" }}>{booking.garage_id?.name}</strong>
            </div>
            <div>
              <small style={{ color: "var(--muted)", display: "block", fontSize: "11px" }}>VEHICLE REGISTERED</small>
              <strong style={{ color: "var(--text)" }}>{booking.vehicle_id ? `${booking.vehicle_id.make} ${booking.vehicle_id.model} (${booking.vehicle_id.registration_number})` : "Valet Dropoff"}</strong>
            </div>
            <div>
              <small style={{ color: "var(--muted)", display: "block", fontSize: "11px" }}>COMPLETED SERVICES</small>
              <strong style={{ color: "var(--text)" }}>{booking.service_type}</strong>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Service Subtotal:</span>
              <strong>Rs. {(costToPay * 0.85).toFixed(0)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Digital Platform Fee:</span>
              <strong>Rs. 200</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Government GST Tax (15%):</span>
              <strong>Rs. {(costToPay * 0.15).toFixed(0)}</strong>
            </div>
            <hr style={{ border: 0, borderTop: "1px dashed var(--line-strong)", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
              <span style={{ fontWeight: "700" }}>Total Amount:</span>
              <strong style={{ color: "var(--accent-strong)", fontWeight: "800" }}>Rs. {costToPay.toLocaleString()}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
