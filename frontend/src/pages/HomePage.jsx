import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { garageService, adminService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Star,
  MapPin,
  Phone,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [garages, setGarages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const garagesRes = await garageService.getAll();
      setGarages(garagesRes.data.slice(0, 3));

      // Always fetch stats from admin endpoint if admin
      // Otherwise just use garage count
      try {
        const statsRes = await adminService.getStats();
        setStats(statsRes.data);
      } catch {
        // Not admin, just show garage count
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-badge">
            <Sparkles size={14} />
            MERN Stack Final Year Project
          </span>
          <h1>Book trusted garage services with a smarter experience.</h1>
          <p>
            AutoCare Hub connects customers, garages, and administrators through
            one professional platform for vehicle registration, service booking,
            tracking, and feedback.
          </p>

          <div className="hero-actions">
            {!user ? (
              <>
                <button
                  className="primary-button"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </button>
                <button
                  className="ghost-button"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </>
            ) : user.role === "customer" ? (
              <>
                <button
                  className="primary-button"
                  onClick={() => navigate("/bookings")}
                >
                  Book a Service
                </button>
                <button
                  className="ghost-button"
                  onClick={() => navigate("/garages")}
                >
                  Explore Garages
                </button>
              </>
            ) : user.role === "garage" ? (
              <>
                <button
                  className="primary-button"
                  onClick={() => navigate("/garage/bookings")}
                >
                  View Bookings
                </button>
                <button
                  className="ghost-button"
                  onClick={() => navigate("/garage/profile")}
                >
                  My Garage
                </button>
              </>
            ) : (
              <>
                <button
                  className="primary-button"
                  onClick={() => navigate("/admin")}
                >
                  Admin Panel
                </button>
              </>
            )}
          </div>

          <div className="feature-points">
            <span>
              <CheckCircle2 size={16} /> Real-time booking flow
            </span>
            <span>
              <CheckCircle2 size={16} /> Role-based dashboards
            </span>
            <span>
              <CheckCircle2 size={16} /> Feedback-driven quality
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="hero-card">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {[
              {
                label: "Bookings Completed",
                value: stats?.bookings?.completed ?? "...",
                sub: "Live from database",
                color: "#0066cc",
                icon: "✅",
              },
              {
                label: "Partner Garages",
                value: stats?.garages?.active ?? garages.length ?? "...",
                sub: "Verified stations",
                color: "#10b981",
                icon: "🏪",
              },
              {
                label: "Total Customers",
                value: stats?.users?.total ?? "...",
                sub: "Registered users",
                color: "#f59e0b",
                icon: "👤",
              },
              {
                label: "Total Reviews",
                value: stats?.feedbacks?.total ?? "...",
                sub: "Customer feedback",
                color: "#8b5cf6",
                icon: "⭐",
              },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  borderLeft: `4px solid ${card.color}`,
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>
                  {card.icon}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "36px",
                    color: card.color,
                    fontWeight: "800",
                  }}
                >
                  {card.value}
                </h2>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#333",
                  }}
                >
                  {card.label}
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "12px",
                    color: "#888",
                  }}
                >
                  {card.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="content-section">
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="eyebrow">How It Works</span>
          <h2>Simple 3 step process</h2>
        </div>
        <div className="card-grid three-column">
          {[
            {
              step: "01",
              title: "Register & Add Vehicle",
              desc: "Create your account and add your vehicle details to get started.",
            },
            {
              step: "02",
              title: "Find & Book Garage",
              desc: "Search garages by city or area and book your preferred service.",
            },
            {
              step: "03",
              title: "Track & Review",
              desc: "Track your booking status in real time and leave feedback after service.",
            },
          ].map((item) => (
            <article
              key={item.step}
              className="info-card"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "900",
                  color: "#0066cc20",
                  lineHeight: 1,
                }}
              >
                {item.step}
              </div>
              <h3 style={{ marginTop: "8px" }}>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Live Garages from DB */}
      <section className="content-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <span className="eyebrow">Live from Database</span>
            <h2>Top Rated Garages</h2>
          </div>
          <button className="ghost-button" onClick={() => navigate("/garages")}>
            View All →
          </button>
        </div>

        {loading ? (
          <p>Loading garages...</p>
        ) : garages.length === 0 ? (
          <p style={{ color: "#888" }}>No active garages yet.</p>
        ) : (
          <div className="card-grid three-column">
            {garages.map((garage) => (
              <article key={garage._id} className="garage-card">
                <div className="card-header-row">
                  <h3>{garage.name}</h3>
                  <span className="pill">
                    <Star size={12} /> {garage.rating || 0}
                  </span>
                </div>
                <p>
                  <MapPin size={14} /> {garage.area}, {garage.city}
                </p>
                <p>
                  <Phone size={14} /> {garage.phone}
                </p>

                {garage.services_offered?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px",
                      margin: "8px 0",
                    }}
                  >
                    {garage.services_offered.slice(0, 3).map((s, i) => (
                      <span
                        key={i}
                        style={{
                          background: "#e8f4ff",
                          color: "#0066cc",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="card-footer-row">
                  <span style={{ color: "green", fontSize: "13px" }}>
                    ✅ Active
                  </span>
                  <button
                    className="text-link"
                    onClick={() => navigate("/bookings")}
                  >
                    Book Now <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Role Based Welcome */}
      {user && (
        <section className="content-section">
          <div
            style={{
              background: "#0066cc",
              borderRadius: "16px",
              padding: "32px",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ color: "white", margin: 0 }}>
                Welcome back, {user.full_name}! 👋
              </h2>
              <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
                {user.role === "customer" && "Ready to book your next service?"}
                {user.role === "garage" &&
                  "Check your latest bookings and manage your garage."}
                {user.role === "admin" &&
                  "Monitor platform activity and manage users."}
              </p>
            </div>
            <button
              onClick={() => {
                if (user.role === "customer") navigate("/bookings");
                if (user.role === "garage") navigate("/garage/bookings");
                if (user.role === "admin") navigate("/admin");
              }}
              style={{
                background: "white",
                color: "#0066cc",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              Go to Dashboard →
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
