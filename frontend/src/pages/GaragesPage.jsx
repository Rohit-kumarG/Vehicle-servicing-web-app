import { useEffect, useState } from "react";
import { garageService } from "../api/services";

export default function GaragesPage() {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchGarages();
  }, []);

  const fetchGarages = async () => {
    try {
      const res = await garageService.getAll();
      setGarages(res.data);
    } catch (err) {
      setError("Failed to load garages");
    } finally {
      setLoading(false);
    }
  };

  const filtered = garages.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.city.toLowerCase().includes(search.toLowerCase()) ||
      g.area.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <div className="page-content">Loading garages...</div>;
  if (error)
    return (
      <div className="page-content" style={{ color: "red" }}>
        {error}
      </div>
    );

  return (
    <div className="page-content">
      <div style={{ marginBottom: "24px" }}>
        <h2>All Garages</h2>
        <p>Find trusted garages near you</p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "24px" }}>
        <input
          placeholder="Search by name, city or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          No garages found
        </div>
      ) : (
        <div className="card-grid three-column">
          {filtered.map((garage) => (
            <article key={garage._id} className="garage-card">
              <div className="card-header-row">
                <h3>{garage.name}</h3>
                <span className="pill">⭐ {garage.rating || 0}</span>
              </div>
              <p>
                📍 {garage.area}, {garage.city}
              </p>
              <p>📞 {garage.phone}</p>
              {garage.description && <p>{garage.description}</p>}

              {/* Services */}
              {garage.services_offered?.length > 0 && (
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                  }}
                >
                  {garage.services_offered.map((service, i) => (
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
                      {service}
                    </span>
                  ))}
                </div>
              )}

              <div className="card-footer-row" style={{ marginTop: "12px" }}>
                <span style={{ color: garage.is_active ? "green" : "red" }}>
                  {garage.is_active ? "✅ Open" : "❌ Closed"}
                </span>
                <a href="/bookings" className="text-link">
                  Book Now →
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
