import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { garageService } from "../api/services";
import { Search, MapPin, Phone, Star, Sparkles, Navigation, ChevronRight, Compass } from "lucide-react";

const hasCoords = (lat, lon) =>
  Number.isFinite(Number(lat)) && Number.isFinite(Number(lon));

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

const getDistanceKm = (garage, userLocation) => {
  if (
    !userLocation ||
    !hasCoords(userLocation.lat, userLocation.lon) ||
    !hasCoords(garage.latitude, garage.longitude)
  ) {
    return null;
  }

  return calculateDistance(
    Number(userLocation.lat),
    Number(userLocation.lon),
    Number(garage.latitude),
    Number(garage.longitude),
  );
};

const calculateAIScore = (garage, userLocation) => {
  const distanceKm = getDistanceKm(garage, userLocation);
  // Distance score: max 60 points, subtracting 4 points per kilometer
  const distanceScore = distanceKm === null ? 0 : Math.max(0, 60 - distanceKm * 4);
  
  // Rating score: max 30 points
  const ratingScore = (garage.rating || 5.0) * 6;
  
  // Popularity/bookings score: max 10 points
  const popularityScore = Math.min((garage.total_bookings || 0) * 0.5, 10);

  return Math.min(
    100,
    Math.round(distanceScore + ratingScore + popularityScore),
  );
};

const LeafletMap = ({ garages, userLocation, onSelectGarage }) => {
  useEffect(() => {
    const L = window.L;
    if (!L) return;

    let center = [30.3753, 69.3451]; // Default Pakistan center
    if (userLocation && userLocation.lat && userLocation.lon) {
      center = [Number(userLocation.lat), Number(userLocation.lon)];
    } else {
      const firstWithCoords = garages.find(g => hasCoords(g.latitude, g.longitude));
      if (firstWithCoords) {
        center = [Number(firstWithCoords.latitude), Number(firstWithCoords.longitude)];
      }
    }

    const map = L.map("leaflet-garage-map", {
      center: center,
      zoom: 12
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add user marker if location available
    if (userLocation && userLocation.lat && userLocation.lon) {
      const userIcon = L.divIcon({
        html: '<div style="background-color: #bd8e4e; width: 14px; height: 14px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
        className: 'user-gps-marker',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      L.marker([Number(userLocation.lat), Number(userLocation.lon)], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Your Current Position</b>")
        .openPopup();
    }

    // Add garages
    garages.forEach((garage) => {
      if (hasCoords(garage.latitude, garage.longitude)) {
        const marker = L.marker([Number(garage.latitude), Number(garage.longitude)]).addTo(map);
        const popupContent = document.createElement("div");
        popupContent.className = "map-popup-card";
        popupContent.innerHTML = `
          <h4>${garage.name}</h4>
          <p>${garage.area || ""}, ${garage.city || ""}</p>
          <button id="btn-${garage._id}">View Details</button>
        `;
        popupContent.querySelector("button").addEventListener("click", () => {
          onSelectGarage(garage._id);
        });
        marker.bindPopup(popupContent);
      }
    });

    return () => {
      map.remove();
    };
  }, [garages, userLocation]);

  return (
    <div 
      id="leaflet-garage-map" 
      style={{ 
        height: "450px", 
        width: "100%", 
        borderRadius: "var(--radius-md)", 
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow)"
      }} 
    />
  );
};

export default function GaragesPage() {
  const navigate = useNavigate();
  const [garages, setGarages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFallback, setCityFallback] = useState("");
  const [aiMode, setAiMode] = useState(true);
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState("cards");
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");

  useEffect(() => {
    fetchGarages();
    getUserLocation();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [search, cityFallback, garages, sortBy, aiMode, userLocation]);

  const fetchGarages = async () => {
    try {
      const res = await garageService.getAll();
      setGarages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("GPS not supported. Enter your city to filter garages.");
      return;
    }

    setLocationStatus("Getting your GPS location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setLocationStatus("GPS coordinates acquired. Custom AI routes matched.");
        setTimeout(() => setLocationStatus(""), 3000);
      },
      () => {
        setUserLocation(null);
        setLocationStatus("GPS not available. Enter your city to filter garages.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const applyFilter = () => {
    let result = [...garages];

    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      result = result.filter(
        (g) =>
          g.name?.toLowerCase().includes(searchTerm) ||
          g.city?.toLowerCase().includes(searchTerm) ||
          g.area?.toLowerCase().includes(searchTerm) ||
          g.services_offered?.some((s) =>
            s.toLowerCase().includes(searchTerm),
          ),
      );
    }

    if (!userLocation && cityFallback.trim()) {
      const cityTerm = cityFallback.trim().toLowerCase();
      result = result.filter((g) => g.city?.toLowerCase().includes(cityTerm));
    }

    if (aiMode) {
      result.sort((a, b) => {
        const scoreDiff =
          calculateAIScore(b, userLocation) - calculateAIScore(a, userLocation);

        if (scoreDiff !== 0) return scoreDiff;

        const distanceA = getDistanceKm(a, userLocation);
        const distanceB = getDistanceKm(b, userLocation);

        if (distanceA === null && distanceB === null) return 0;
        if (distanceA === null) return 1;
        if (distanceB === null) return -1;
        return distanceA - distanceB;
      });
    } else {
      if (sortBy === "rating") {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      if (sortBy === "distance" && userLocation) {
        result.sort((a, b) => {
          const distanceA = getDistanceKm(a, userLocation);
          const distanceB = getDistanceKm(b, userLocation);

          if (distanceA === null && distanceB === null) return 0;
          if (distanceA === null) return 1;
          if (distanceB === null) return -1;
          return distanceA - distanceB;
        });
      }

      if (sortBy === "bookings") {
        result.sort(
          (a, b) => (b.total_bookings || 0) - (a.total_bookings || 0),
        );
      }
    }

    setFiltered(result);
  };

  if (loading) return <div className="page-content"><p>Loading auto service centers...</p></div>;

  return (
    <div className="page-content">
      {/* Header section */}
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
          <h2>Service Directory</h2>
          <p>Browse elite vehicle repair, diagnostic, and tuning hubs</p>
        </div>
      </div>

      {/* GPS Status Banner */}
      {locationStatus && (
        <div
          style={{
            background: "rgba(197, 168, 128, 0.08)",
            border: "1px solid var(--accent)",
            borderRadius: "8px",
            padding: "10px 16px",
            marginBottom: "12px",
            fontSize: "13px",
            color: "var(--accent-strong)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "600",
            animation: "fadeIn 0.3s ease"
          }}
        >
          <Compass size={14} className="animate-spin" /> {locationStatus}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          marginBottom: "12px",
          flexWrap: "wrap",
          background: "var(--panel)",
          padding: "16px",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div style={{ flex: 1, position: "relative", minWidth: "220px" }}>
          <Search size={16} color="var(--accent-strong)" style={{ position: "absolute", left: "14px", top: "14px" }} />
          <input
            placeholder="Search by center name, city, specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px 10px 40px",
              borderRadius: "8px",
              border: "1px solid var(--line-strong)",
              fontSize: "13.5px",
              background: "var(--bg)",
            }}
          />
        </div>

        {!userLocation && (
          <input
            placeholder="Enter fallback city name..."
            value={cityFallback}
            onChange={(e) => setCityFallback(e.target.value)}
            style={{
              width: "200px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid var(--line-strong)",
              fontSize: "13.5px",
              background: "var(--bg)",
            }}
          />
        )}

        <button
          onClick={() => setAiMode(!aiMode)}
          className={aiMode ? "primary-button" : "ghost-button"}
          style={{
            padding: "8px 20px",
            minHeight: "40px",
            fontSize: "13px",
            fontWeight: "700",
            boxShadow: aiMode ? "0 4px 10px rgba(197, 168, 128, 0.2)" : "none"
          }}
        >
          <Sparkles size={14} /> {aiMode ? "AI Mode ON" : "AI Recommend"}
        </button>

        <button
          onClick={() => setViewMode(viewMode === "cards" ? "map" : "cards")}
          className="ghost-button"
          style={{
            padding: "8px 18px",
            minHeight: "40px",
            fontSize: "13px",
          }}
        >
          <MapPin size={14} /> {viewMode === "cards" ? "Map View" : "Card View"}
        </button>

        {!aiMode && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid var(--line-strong)",
              fontSize: "13px",
              cursor: "pointer",
              background: "var(--bg)",
              color: "var(--text)",
              fontWeight: "600"
            }}
          >
            <option value="rating">Sort by Rating Score</option>
            {userLocation && <option value="distance">Sort by Distance</option>}
            <option value="bookings">Sort by Popularity</option>
          </select>
        )}
      </div>

      {/* AI Recommendation Banner */}
      {aiMode && (
        <div
          style={{
            background: "linear-gradient(135deg, #1e2229 0%, #bd8e4e 150%)",
            color: "#ffffff",
            padding: "18px 24px",
            borderRadius: "var(--radius-md)",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "var(--shadow)",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          <div 
            style={{ 
              width: "40px", 
              height: "40px", 
              background: "rgba(255,255,255,0.1)", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontWeight: "800",
              color: "var(--accent)"
            }}
          >
            AI
          </div>
          <div>
            <h4 style={{ margin: 0, fontWeight: "700", fontSize: "14.5px", color: "#ffffff" }}>
              Concierge Match Routing Active
            </h4>
            <p style={{ margin: "4px 0 0", fontSize: "11.5px", color: "#d1d5db" }}>
              {userLocation
                ? "Matching centers dynamically based on distance, active slots, client rating, and booking queue load."
                : "Fallback city mode: Filtering location, then matching center ratings and average wait queues."}
            </p>
          </div>

          {userLocation ? (
            <span
              style={{
                marginLeft: "auto",
                background: "rgba(255,255,255,0.15)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#ffffff"
              }}
            >
              📍 GPS MATCH
            </span>
          ) : cityFallback ? (
            <span
              style={{
                marginLeft: "auto",
                background: "rgba(255,255,255,0.15)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#ffffff"
              }}
            >
              City: {cityFallback}
            </span>
          ) : null}
        </div>
      )}

      {/* Found status summary label */}
      <p style={{ color: "var(--muted)", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
        Showing {filtered.length} elite center{filtered.length !== 1 ? "s" : ""}
        {userLocation && !aiMode && sortBy === "distance" ? " sorted by nearest distance" : ""}
      </p>

      {viewMode === "map" && filtered.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <LeafletMap 
            garages={filtered} 
            userLocation={userLocation} 
            onSelectGarage={(id) => navigate(`/garages/${id}`)} 
          />
        </div>
      )}

      {/* Grids / List of centers */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            color: "var(--muted)",
            background: "var(--panel)",
            border: "1px dashed var(--line-strong)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <p style={{ fontWeight: "600", fontSize: "16px" }}>No servicing centers found</p>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>Modify your query filters or fallback city name.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {filtered.map((garage, index) => {
            const isTopPick = aiMode && index === 0;
            const aiScore = calculateAIScore(garage, userLocation);
            const distance = getDistanceKm(garage, userLocation);

            return (
              <article
                key={garage._id}
                className="garage-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  border: isTopPick ? "2px solid var(--accent)" : "1px solid var(--line)",
                  boxShadow: isTopPick ? "0 12px 36px rgba(197, 168, 128, 0.18)" : "var(--shadow)",
                  transform: isTopPick ? "scale(1.01)" : "none",
                }}
              >
                {isTopPick && (
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                      color: "white",
                      padding: "4px 14px",
                      borderRadius: "0 0 0 14px",
                      fontSize: "10px",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    AI Choice
                  </div>
                )}

                {/* Rating header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ paddingRight: "60px" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>{garage.name}</h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <MapPin size={12} color="var(--accent-strong)" /> {garage.area}, {garage.city}
                    </p>
                  </div>
                  <span className="pill" style={{ flexShrink: 0 }}>
                    <Star size={11} fill="var(--accent-strong)" stroke="none" /> {garage.rating || "5.0"}
                  </span>
                </div>

                {/* Info row */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: "var(--muted)" }}>
                  <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Phone size={12} color="var(--accent-strong)" /> Phone: <strong>{garage.phone}</strong>
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    🚀 Total Bookings: <strong>{garage.total_bookings || 0} completed</strong>
                  </p>
                </div>

                {/* GPS distance badge if present */}
                {distance !== null && (
                  <div style={{ width: "fit-content" }}>
                    <span className="status-badge confirmed" style={{ background: "rgba(30,58,138,0.06)", color: "var(--info)", fontSize: "10.5px" }}>
                      🗺️ {distance} km away from your location
                    </span>
                  </div>
                )}

                {/* Services list badges */}
                {garage.services_offered?.length > 0 && (
                  <div className="badge-group">
                    {garage.services_offered.slice(0, 3).map((s, i) => (
                      <span key={i} className="tag-badge">
                        {s}
                      </span>
                    ))}
                    {garage.services_offered.length > 3 && (
                      <span style={{ fontSize: "11px", color: "var(--muted)", alignSelf: "center", marginLeft: "4px" }}>
                        +{garage.services_offered.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* AI progress slider */}
                {aiMode && (
                  <div
                    style={{
                      background: "var(--bg-darker)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}
                    >
                      <span style={{ color: "var(--muted)" }}>Match Compatibility</span>
                      <span style={{ color: "var(--accent-strong)" }}>{aiScore}% Match</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "5px",
                        background: "var(--line-strong)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(aiScore, 100)}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-strong) 100%)",
                          borderRadius: "3px",
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions row */}
                <div 
                  style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    gap: "10px",
                    borderTop: "1px solid var(--line)", 
                    paddingTop: "14px", 
                    marginTop: "auto" 
                  }}
                >
                  <button
                    onClick={() => navigate(`/garages/${garage._id}`)}
                    className="ghost-button"
                    style={{
                      width: "100%",
                      minHeight: "38px",
                      fontSize: "12.5px"
                    }}
                  >
                    View Garage Details
                  </button>

                  <button
                    onClick={() => navigate("/bookings")}
                    className="primary-button"
                    style={{
                      width: "100%",
                      minHeight: "38px",
                      fontSize: "12.5px"
                    }}
                  >
                    Request Detailing Appointment
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
