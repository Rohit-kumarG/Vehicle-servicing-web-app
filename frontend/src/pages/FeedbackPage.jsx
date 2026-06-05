import { useEffect, useState } from "react";
import { feedbackService, bookingService } from "../api/services";
import { Star, MessageSquare, Award, AlertCircle, Quote } from "lucide-react";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    booking_id: "",
    rating: "5",
    comment: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [feedbackRes, bookingsRes] = await Promise.all([
        feedbackService.getMyFeedbacks(),
        bookingService.getMyBookings(),
      ]);
      setFeedbacks(feedbackRes.data);
      // Only show completed bookings that don't have feedback yet
      const completed = bookingsRes.data.filter(
        (b) => b.status === "completed",
      );
      setCompletedBookings(completed);
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
      await feedbackService.submit({
        ...form,
        rating: parseInt(form.rating),
      });
      setForm({ booking_id: "", rating: "5", comment: "" });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const getSentimentBadgeClass = (sentiment) => {
    if (sentiment === "positive") return "status-badge completed"; // Sage Green
    if (sentiment === "negative") return "status-badge cancelled"; // Red
    return "status-badge pending"; // Amber
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < rating ? "var(--accent-strong)" : "none"} 
        stroke={i < rating ? "none" : "var(--line-strong)"}
        style={{ marginRight: "2px" }}
      />
    ));
  };

  if (loading) return <div className="page-content"><p>Loading client reviews...</p></div>;

  return (
    <div className="page-content">
      {/* Header Panel */}
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
          <h2>Client Reviews</h2>
          <p>Rate your servicing experiences and submit satisfaction feedback</p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "View Reviews" : "+ Give Feedback"}
        </button>
      </div>

      {/* Feedback Form Card */}
      {showForm && (
        <div className="form-card" style={{ animation: "fadeIn 0.3s ease" }}>
          <h3 style={{ borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>Share Your Experience</h3>
          
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <label>
                Select Completed Booking
                <select
                  name="booking_id"
                  value={form.booking_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select booking location...</option>
                  {completedBookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.service_type} — {b.garage_id?.name} ({b.scheduled_date})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Rating Score
                <select name="rating" value={form.rating} onChange={handleChange}>
                  <option value="5">⭐⭐⭐⭐⭐ Excellent Experience</option>
                  <option value="4">⭐⭐⭐⭐ Good Service</option>
                  <option value="3">⭐⭐⭐ Satisfactory / Average</option>
                  <option value="2">⭐⭐ Poor Detailing</option>
                  <option value="1">⭐ Highly Unsatisfied</option>
                </select>
              </label>
            </div>

            <label style={{ marginTop: "16px", display: "flex", flexDirection: "column" }}>
              Review Comment
              <textarea
                name="comment"
                placeholder="Share detail about service speed, mechanical quality, or personnel care..."
                value={form.comment}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--line-strong)",
                  background: "#fafaf9",
                  marginTop: "8px",
                }}
                rows={4}
              />
            </label>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting ? "Submitting Review..." : "Submit Review"}
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

      {/* Feedbacks Grid */}
      {feedbacks.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "48px", 
          color: "var(--muted)",
          border: "1px dashed var(--line-strong)",
          borderRadius: "var(--radius-md)",
          background: "var(--panel)"
        }}>
          <p style={{ fontWeight: "600" }}>No reviews logged yet.</p>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>Submit your first rating on a completed maintenance appointment above.</p>
        </div>
      ) : (
        <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {feedbacks.map((feedback) => (
            <article key={feedback._id} className="review-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="card-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className="luxury-badge" style={{ background: "rgba(197, 168, 128, 0.08)", color: "var(--accent-strong)", fontSize: "9px" }}>
                    Verified client
                  </span>
                  <h3 style={{ fontSize: "1.1rem", marginTop: "4px" }}>{feedback.garage_id?.name || "Detaler"}</h3>
                </div>
                <span className={getSentimentBadgeClass(feedback.sentiment)}>
                  {feedback.sentiment || "Neutral"}
                </span>
              </div>

              {/* Star Rating Icons */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {renderStars(feedback.rating)}
              </div>

              {/* Review Comment Quote bubble */}
              {feedback.comment ? (
                <div 
                  style={{ 
                    background: "var(--bg-darker)", 
                    padding: "16px", 
                    borderRadius: "var(--radius-sm)", 
                    position: "relative",
                    border: "1px solid var(--line)",
                    marginTop: "4px",
                    fontStyle: "italic",
                    color: "var(--text)",
                    fontSize: "13px"
                  }}
                >
                  <Quote size={20} color="var(--line-strong)" style={{ position: "absolute", right: "12px", top: "8px", opacity: 0.6 }} />
                  "{feedback.comment}"
                </div>
              ) : (
                <p style={{ fontStyle: "italic", color: "var(--muted)", fontSize: "12px" }}>No comments provided.</p>
              )}

              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  borderTop: "1px solid var(--line)", 
                  paddingTop: "12px", 
                  marginTop: "auto" 
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Submitted: {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
                <span style={{ fontSize: "11px", color: "var(--accent-strong)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Award size={12} /> Score: {feedback.rating}/5
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
