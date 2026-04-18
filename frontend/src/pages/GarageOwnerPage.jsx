import { useEffect, useState } from "react";
import { garageService } from "../api/services";

export default function GarageOwnerPage() {
  const [garage, setGarage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    area: "",
    phone: "",
    email: "",
    services_offered: "",
  });

  useEffect(() => {
    fetchMyGarage();
  }, []);

  const fetchMyGarage = async () => {
    try {
      const res = await garageService.getMyGarage();
      setGarage(res.data);
      setForm(res.data);
    } catch (err) {
      // No garage found
      setGarage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await garageService.update(garage._id, {
        ...form,
      });
      setSuccess("Garage updated successfully!");
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
    try {
      await garageService.create({
        ...createForm,
        services_offered: createForm.services_offered
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
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
    return <div className="page-content">Loading garage info...</div>;

  // No garage yet
  if (!garage) {
    return (
      <div className="page-content">
        <div style={{ marginBottom: "24px" }}>
          <h2>My Garage</h2>
          <p>You have not registered a garage yet</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "+ Register My Garage"}
        </button>

        {showCreateForm && (
          <div className="form-card" style={{ marginTop: "24px" }}>
            <h3 style={{ marginBottom: "16px" }}>Register Your Garage</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleCreate}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <label>
                  Garage Name
                  <input
                    placeholder="Ahmed Auto Workshop"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Phone
                  <input
                    placeholder="03001234567"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  City
                  <input
                    placeholder="Karachi"
                    value={createForm.city}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, city: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Area
                  <input
                    placeholder="Gulshan"
                    value={createForm.area}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, area: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Address
                  <input
                    placeholder="Shop 5, Block 10"
                    value={createForm.address}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, address: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    placeholder="garage@email.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                  />
                </label>
              </div>
              <label style={{ marginTop: "12px" }}>
                Services Offered (comma separated)
                <input
                  placeholder="oil change, tire change, engine repair"
                  value={createForm.services_offered}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      services_offered: e.target.value,
                    })
                  }
                />
              </label>
              <label style={{ marginTop: "12px" }}>
                Description
                <textarea
                  placeholder="Describe your garage..."
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
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
                {submitting ? "Creating..." : "Register Garage"}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

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
          <h2>{garage.name}</h2>
          <p>
            📍 {garage.area}, {garage.city}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              background: garage.is_active ? "#10b981" : "#ef4444",
              color: "white",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "13px",
            }}
          >
            {garage.is_active ? "✅ Active" : "⏳ Pending Approval"}
          </span>
          <button
            className="primary-button"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Cancel" : "Edit Garage"}
          </button>
        </div>
      </div>

      {success && (
        <p style={{ color: "green", marginBottom: "12px" }}>{success}</p>
      )}
      {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}

      {!editing ? (
        // View Mode
        <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="garage-card">
            <h3>Contact Info</h3>
            <p>📞 {garage.phone}</p>
            <p>📧 {garage.email || "Not provided"}</p>
            <p>📍 {garage.address}</p>
          </div>
          <div className="garage-card">
            <h3>Performance</h3>
            <p>⭐ Rating: {garage.rating || 0}</p>
            <p>📋 Total Bookings: {garage.total_bookings || 0}</p>
            <p>⏱️ Avg Wait Time: {garage.average_wait_time || 0} mins</p>
          </div>
          <div className="garage-card">
            <h3>Services Offered</h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "8px",
              }}
            >
              {garage.services_offered?.map((s, i) => (
                <span
                  key={i}
                  style={{
                    background: "#e8f4ff",
                    color: "#0066cc",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="garage-card">
            <h3>Description</h3>
            <p>{garage.description || "No description added"}</p>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="form-card">
          <h3 style={{ marginBottom: "16px" }}>Update Garage Info</h3>
          <form onSubmit={handleUpdate}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <label>
                Garage Name
                <input
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
              <label>
                City
                <input
                  value={form.city || ""}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </label>
              <label>
                Area
                <input
                  value={form.area || ""}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                />
              </label>
              <label>
                Address
                <input
                  value={form.address || ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </label>
              <label>
                Email
                <input
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
            </div>
            <label style={{ marginTop: "12px" }}>
              Description
              <textarea
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
