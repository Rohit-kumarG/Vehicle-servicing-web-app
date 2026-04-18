import { useEffect, useState } from "react";
import { feedbackService, bookingService } from "../api/services";

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
      // Only show completed bookings that dont have feedback yet
      const completed = bookingsRes.data.filter(
        (b) => b.status === "completed",
      );
      console.log("Completed bookings:", completed); // check in browser console
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

  const getSentimentColor = (sentiment) => {
    if (sentiment === "positive") return "green";
    if (sentiment === "negative") return "red";
    return "orange";
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  if (loading) return <div className="page-content">Loading feedback...</div>;

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
          <h2>My Feedback</h2>
          <p>Rate your garage service experiences</p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Give Feedback"}
        </button>
      </div>

      {/* Feedback Form */}
      {showForm && (
        <div className="form-card" style={{ marginBottom: "24px" }}>
          <h3 style={{ marginBottom: "16px" }}>Submit Feedback</h3>
          {formError && (
            <p style={{ color: "red", marginBottom: "10px" }}>{formError}</p>
          )}
          <form onSubmit={handleSubmit}>
            <label>
              Select Completed Booking
              <select
                name="booking_id"
                value={form.booking_id}
                onChange={handleChange}
                required
              >
                <option value="">Choose a booking...</option>
                {completedBookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.service_type} - {b.garage_id?.name} ({b.scheduled_date})
                  </option>
                ))}
              </select>
            </label>

            <label style={{ marginTop: "12px" }}>
              Rating
              <select name="rating" value={form.rating} onChange={handleChange}>
                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                <option value="4">⭐⭐⭐⭐ Good</option>
                <option value="3">⭐⭐⭐ Average</option>
                <option value="2">⭐⭐ Poor</option>
                <option value="1">⭐ Very Poor</option>
              </select>
            </label>

            <label style={{ marginTop: "12px" }}>
              Comment
              <textarea
                name="comment"
                placeholder="Share your experience..."
                value={form.comment}
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
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      )}

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          No feedback submitted yet!
        </div>
      ) : (
        <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {feedbacks.map((feedback) => (
            <article key={feedback._id} className="garage-card">
              <div className="card-header-row">
                <h3>{feedback.garage_id?.name}</h3>
                <span
                  style={{
                    color: getSentimentColor(feedback.sentiment),
                    fontWeight: "bold",
                  }}
                >
                  {feedback.sentiment}
                </span>
              </div>
              <p>{renderStars(feedback.rating)}</p>
              {feedback.comment && <p>"{feedback.comment}"</p>}
              <p style={{ color: "#888", fontSize: "12px" }}>
                {new Date(feedback.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
