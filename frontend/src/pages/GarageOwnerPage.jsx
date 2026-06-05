import { useEffect, useState } from "react";
import { garageService } from "../api/services";
import { AlertCircle, CheckCircle, Search, MapPin, Phone, Mail, Award, Clock, Star, Edit, AlignLeft, Info } from "lucide-react";

const standardServicesList = [
  "Oil Change",
  "Engine Diagnostic & Tuning",
  "Brake Service",
  "Wheel Alignment & Balancing",
  "Car Wash",
  "Body Polishing",
  "General Mechanical Checkup",
  "Suspension Repair",
  "AC Gas Refill",
  "Battery Replacement"
];

export default function GarageOwnerPage() {
  const [garage, setGarage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    area: "",
    phone: "",
    email: "",
    services_offered: "",
    cnic: "",
    google_maps_link: "",
    latitude: null,
    longitude: null,
  });

  const [regServices, setRegServices] = useState([]);
  const [regOtherChecked, setRegOtherChecked] = useState(false);
  const [regOtherText, setRegOtherText] = useState("");

  const [editServices, setEditServices] = useState([]);
  const [editOtherChecked, setEditOtherChecked] = useState(false);
  const [editOtherText, setEditOtherText] = useState("");

  useEffect(() => {
    fetchMyGarage();
  }, []);

  useEffect(() => {
    if (garage && editing) {
      const standardSelected = [];
      const customSelected = [];
      (garage.services_offered || []).forEach((s) => {
        if (standardServicesList.includes(s)) {
          standardSelected.push(s);
        } else {
          customSelected.push(s);
        }
      });
      setEditServices(standardSelected);
      if (customSelected.length > 0) {
        setEditOtherChecked(true);
        setEditOtherText(customSelected.join(", "));
      } else {
        setEditOtherChecked(false);
        setEditOtherText("");
      }
      setLocationQuery(garage.address || "");
    }
  }, [editing, garage]);

  const fetchMyGarage = async () => {
    try {
      const res = await garageService.getMyGarage();
      setGarage(res.data);
      setForm(res.data);
    } catch (err) {
      setGarage(null);
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async (query) => {
    setLocationQuery(query);
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    setLocationLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&countrycodes=pk&limit=5`,
      );
      const data = await res.json();
      setLocationSuggestions(data);
    } catch (err) {
      console.error("Location search error:", err);
      setLocationSuggestions([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const selectLocation = (place) => {
    const parts = place.display_name.split(",");
    const locationData = {
      area: parts[0]?.trim() || "",
      city: parts[1]?.trim() || "",
      address: place.display_name.substring(0, 100),
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    };
    if (editing) {
      setForm((prev) => ({
        ...prev,
        ...locationData
      }));
    } else {
      setCreateForm((prev) => ({
        ...prev,
        ...locationData
      }));
    }
    setLocationQuery(place.display_name.substring(0, 60));
    setLocationSuggestions([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    const customList = editOtherChecked
      ? editOtherText.split(",").map((s) => s.trim()).filter((s) => s)
      : [];
    const combinedServices = [...editServices, ...customList];

    try {
      await garageService.update(garage._id, {
        ...form,
        services_offered: combinedServices,
      });
      setSuccess("Garage profile details updated successfully!");
      setEditing(false);
      fetchMyGarage();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const customList = regOtherChecked
      ? regOtherText.split(",").map((s) => s.trim()).filter((s) => s)
      : [];
    const combinedServices = [...regServices, ...customList];

    try {
      await garageService.create({
        ...createForm,
        services_offered: combinedServices,
      });
      setShowCreateForm(false);
      fetchMyGarage();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create garage");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="page-content"><p>Loading servicing profiles...</p></div>;

  // No garage yet
  if (!garage) {
    return (
      <div className="page-content">
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
            <h2>My Detailing Station</h2>
            <p>Register your service center to activate appointment queue matching</p>
          </div>
          <button
            className="primary-button"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "View Overview" : "+ Register Station"}
          </button>
        </div>

        {showCreateForm && (
          <div className="form-card" style={{ animation: "fadeIn 0.3s ease" }}>
            <h3 style={{ borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>Register Detailing Center</h3>
            
            {error && (
              <div style={{ color: "var(--danger)", background: "var(--danger-light)", padding: "10px", borderRadius: "8px", border: "1px solid var(--danger)", fontSize: "13px", fontWeight: "600", marginBottom: "10px" }}>
                ❌ {error}
              </div>
            )}
            
            <form onSubmit={handleCreate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <label>
                  Station Name
                  <input
                    placeholder="e.g. Apex Detailing Studio"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Direct Telephone Number
                  <input
                    placeholder="e.g. 03001234567"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    required
                  />
                </label>

                {/* Location Search Input */}
                <label style={{ gridColumn: "1 / -1", position: "relative" }}>
                  Search Maps Location Coordinates
                  <div style={{ position: "relative" }}>
                    <Search size={14} color="var(--accent-strong)" style={{ position: "absolute", left: "12px", top: "14px" }} />
                    <input
                      placeholder="Type district, sector, city to auto-match..."
                      value={locationQuery}
                      onChange={(e) => searchLocation(e.target.value)}
                      style={{ paddingLeft: "36px" }}
                    />
                  </div>
                  {locationLoading && (
                    <div style={{ padding: "8px 10px", color: "var(--muted)", fontSize: "12px" }}>
                      🔍 Match searching...
                    </div>
                  )}
                  {locationSuggestions.length > 0 && (
                    <div
                      style={{
                        border: "1px solid var(--line-strong)",
                        borderRadius: "8px",
                        marginTop: "6px",
                        maxHeight: "180px",
                        overflowY: "auto",
                        background: "var(--panel)",
                        boxShadow: "var(--shadow)",
                        zIndex: 15,
                        position: "relative"
                      }}
                    >
                      {locationSuggestions.map((place, i) => (
                        <div
                          key={i}
                          onClick={() => selectLocation(place)}
                          style={{
                            padding: "10px 14px",
                            cursor: "pointer",
                            borderBottom: "1px solid var(--line)",
                            fontSize: "12.5px",
                            color: "var(--text)",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-light)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          📍 {place.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </label>

                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "12px",
                    background: "rgba(197, 168, 128, 0.08)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--accent-strong)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Info size={14} /> City and District parameters auto-fill upon map selection.
                </div>

                <label>
                  City
                  <input
                    placeholder="Karachi"
                    value={createForm.city}
                    onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Area District
                  <input
                    placeholder="Gulshan"
                    value={createForm.area}
                    onChange={(e) => setCreateForm({ ...createForm, area: e.target.value })}
                    required
                  />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Full Street Address
                  <input
                    placeholder="e.g. Shop 5, Block 10, KDA Complex"
                    value={createForm.address}
                    onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                    required
                  />
                </label>

                {createForm.latitude && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "10px 12px",
                      background: "rgba(61,92,75,0.08)",
                      border: "1px solid var(--success)",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      color: "var(--success)",
                    }}
                  >
                    ✅ Coordinates Linked: {createForm.latitude.toFixed(5)}, {createForm.longitude.toFixed(5)}
                  </div>
                )}

                <label>
                  Business Email
                  <input
                    type="email"
                    placeholder="contact@studio.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </label>
                
                <label>
                  CNIC Registration
                  <input
                    placeholder="e.g. 42101-1234567-1"
                    value={createForm.cnic}
                    onChange={(e) => setCreateForm({ ...createForm, cnic: e.target.value })}
                    required
                  />
                </label>
              </div>

              <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "600" }}>Select Services Offered</span>
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
                  {standardServicesList.map((service) => {
                    const isChecked = regServices.includes(service);
                    return (
                      <label key={service} style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontWeight: "500", cursor: "pointer", fontSize: "13px" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRegServices([...regServices, service]);
                            } else {
                              setRegServices(regServices.filter((s) => s !== service));
                            }
                          }}
                          style={{ width: "auto", margin: 0 }}
                        />
                        <span>{service}</span>
                      </label>
                    );
                  })}
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontWeight: "500", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="checkbox"
                      checked={regOtherChecked}
                      onChange={(e) => setRegOtherChecked(e.target.checked)}
                      style={{ width: "auto", margin: 0 }}
                    />
                    <span>Other Services</span>
                  </label>
                </div>
                {regOtherChecked && (
                  <label style={{ marginTop: "8px" }}>
                    Specify Custom Services (comma separated)
                    <input
                      placeholder="e.g. Master Detailing, Nano Ceramic Polish"
                      value={regOtherText}
                      onChange={(e) => setRegOtherText(e.target.value)}
                    />
                  </label>
                )}
              </div>

              <label style={{ marginTop: "16px", display: "flex", flexDirection: "column" }}>
                Google Maps Navigation Link
                <input
                  placeholder="https://maps.google.com/?q=..."
                  value={createForm.google_maps_link}
                  onChange={(e) => setCreateForm({ ...createForm, google_maps_link: e.target.value })}
                />
              </label>

              <label style={{ marginTop: "16px", display: "flex", flexDirection: "column" }}>
                Center Description
                <textarea
                  placeholder="Tell clients about your specialty detailing equipment, tuning licenses..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line-strong)",
                    background: "#fafaf9",
                    marginTop: "8px"
                  }}
                  rows={3}
                />
              </label>

              <button
                type="submit"
                className="primary-button"
                style={{ marginTop: "24px" }}
                disabled={submitting}
              >
                {submitting ? "Registering..." : "Submit Registration Request"}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header bar */}
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
          <h2>{garage.name}</h2>
          <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13.5px", color: "var(--muted)", marginTop: "4px" }}>
            <MapPin size={13} color="var(--accent-strong)" /> {garage.area}, {garage.city}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className={`status-badge ${garage.is_active ? "completed" : "cancelled"}`}>
            {garage.is_active ? "● Active Station" : "● Inactive Approval"}
          </span>
          <button
            className="primary-button"
            onClick={() => setEditing(!editing)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Edit size={14} />
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {success && (
        <div style={{ color: "var(--success)", background: "var(--success-light)", border: "1px solid var(--success)", padding: "10px 14px", borderRadius: "8px", fontSize: "13.5px", fontWeight: "600", marginBottom: "12px" }}>
          ✅ {success}
        </div>
      )}
      {error && (
        <div style={{ color: "var(--danger)", background: "var(--danger-light)", border: "1px solid var(--danger)", padding: "10px 14px", borderRadius: "8px", fontSize: "13.5px", fontWeight: "600", marginBottom: "12px" }}>
          ❌ {error}
        </div>
      )}

      {!editing ? (
        // View Profile Mode
        <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="garage-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ borderBottom: "1px solid var(--line)", paddingBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Phone size={15} color="var(--accent-strong)" /> Contact details
            </h3>
            <p style={{ fontSize: "13.5px", marginTop: "8px" }}>📞 Phone: <strong>{garage.phone}</strong></p>
            <p style={{ fontSize: "13.5px" }}>📧 Email: <strong>{garage.email || "Not registered"}</strong></p>
            <p style={{ fontSize: "13.5px" }}>📍 Address: <strong>{garage.address}</strong></p>
          </div>

          <div className="garage-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ borderBottom: "1px solid var(--line)", paddingBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Award size={15} color="var(--accent-strong)" /> Performance Stats
            </h3>
            <p style={{ fontSize: "13.5px", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
              ⭐ Rating Score: <strong>{garage.rating || "5.0"} Stars</strong>
            </p>
            <p style={{ fontSize: "13.5px" }}>📋 Completed bookings: <strong>{garage.total_bookings || 0} orders</strong></p>
            <p style={{ fontSize: "13.5px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={13} color="var(--accent-strong)" /> Average Wait queue: <strong>{garage.average_wait_time || 0} minutes</strong>
            </p>
          </div>

          <div className="garage-card" style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>Detailing Specialties</h3>
            <div className="badge-group" style={{ marginTop: "8px" }}>
              {garage.services_offered?.map((s, i) => (
                <span key={i} className="tag-badge" style={{ padding: "6px 12px", fontSize: "12px" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="garage-card" style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ borderBottom: "1px solid var(--line)", paddingBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlignLeft size={15} color="var(--accent-strong)" /> Public Description
            </h3>
            <p style={{ fontSize: "13.5px", fontStyle: "italic", marginTop: "8px" }}>
              "{garage.description || "No public studio description details registered."}"
            </p>
          </div>
        </div>
      ) : (
        // Edit Profile Mode
        <div className="form-card" style={{ animation: "fadeIn 0.3s ease" }}>
          <h3 style={{ borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>Modify Profile Details</h3>
          <form onSubmit={handleUpdate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <label>
                Station Name
                <input
                  placeholder="e.g. Apex Detailing Studio"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Direct Telephone Number
                <input
                  placeholder="e.g. 03001234567"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </label>

              {/* Location Search Input */}
              <label style={{ gridColumn: "1 / -1", position: "relative" }}>
                Search Maps Location Coordinates
                <div style={{ position: "relative" }}>
                  <Search size={14} color="var(--accent-strong)" style={{ position: "absolute", left: "12px", top: "14px" }} />
                  <input
                    placeholder="Type district, sector, city to auto-match..."
                    value={locationQuery}
                    onChange={(e) => searchLocation(e.target.value)}
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
                {locationLoading && (
                  <div style={{ padding: "8px 10px", color: "var(--muted)", fontSize: "12px" }}>
                    🔍 Match searching...
                  </div>
                )}
                {locationSuggestions.length > 0 && (
                  <div
                    style={{
                      border: "1px solid var(--line-strong)",
                      borderRadius: "8px",
                      marginTop: "6px",
                      maxHeight: "180px",
                      overflowY: "auto",
                      background: "var(--panel)",
                      boxShadow: "var(--shadow)",
                      zIndex: 15,
                      position: "relative"
                    }}
                  >
                    {locationSuggestions.map((place, i) => (
                      <div
                        key={i}
                        onClick={() => selectLocation(place)}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          borderBottom: "1px solid var(--line)",
                          fontSize: "12.5px",
                          color: "var(--text)",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-light)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        📍 {place.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </label>

              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "12px",
                  background: "rgba(197, 168, 128, 0.08)",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--accent-strong)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Info size={14} /> City and District parameters auto-fill upon map selection.
              </div>

              <label>
                City
                <input
                  placeholder="Karachi"
                  value={form.city || ""}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </label>

              <label>
                Area District
                <input
                  placeholder="Gulshan"
                  value={form.area || ""}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  required
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                Full Street Address
                <input
                  placeholder="e.g. Shop 5, Block 10, KDA Complex"
                  value={form.address || ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </label>

              {form.latitude && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "10px 12px",
                    background: "rgba(61,92,75,0.08)",
                    border: "1px solid var(--success)",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    color: "var(--success)",
                  }}
                >
                  ✅ Coordinates Linked: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                </div>
              )}

              <label>
                Business Email
                <input
                  type="email"
                  placeholder="contact@studio.com"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              
              <label>
                CNIC Registration
                <input
                  placeholder="e.g. 42101-1234567-1"
                  value={form.cnic || ""}
                  onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                  required
                />
              </label>
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "600" }}>Select Services Offered</span>
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
                {standardServicesList.map((service) => {
                  const isChecked = editServices.includes(service);
                  return (
                    <label key={service} style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontWeight: "500", cursor: "pointer", fontSize: "13px" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditServices([...editServices, service]);
                          } else {
                            setEditServices(editServices.filter((s) => s !== service));
                          }
                        }}
                        style={{ width: "auto", margin: 0 }}
                      />
                      <span>{service}</span>
                    </label>
                  );
                })}
                <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontWeight: "500", cursor: "pointer", fontSize: "13px" }}>
                  <input
                    type="checkbox"
                    checked={editOtherChecked}
                    onChange={(e) => setEditOtherChecked(e.target.checked)}
                    style={{ width: "auto", margin: 0 }}
                  />
                  <span>Other Services</span>
                </label>
              </div>
              {editOtherChecked && (
                <label style={{ marginTop: "8px" }}>
                  Specify Custom Services (comma separated)
                  <input
                    placeholder="e.g. Master Detailing, Nano Ceramic Polish"
                    value={editOtherText}
                    onChange={(e) => setEditOtherText(e.target.value)}
                  />
                </label>
              )}
            </div>

            <label style={{ marginTop: "16px", display: "flex", flexDirection: "column" }}>
              Google Maps Navigation Link
              <input
                placeholder="https://maps.google.com/?q=..."
                value={form.google_maps_link || ""}
                onChange={(e) => setForm({ ...form, google_maps_link: e.target.value })}
              />
            </label>

            <label style={{ marginTop: "16px", display: "flex", flexDirection: "column" }}>
              Center Description
              <textarea
                placeholder="Tell clients about your specialty detailing equipment, tuning licenses..."
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--line-strong)",
                  background: "#fafaf9",
                  marginTop: "8px"
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
                {submitting ? "Saving changes..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
