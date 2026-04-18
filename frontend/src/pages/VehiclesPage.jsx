import { useEffect, useState } from "react";
import { vehicleService } from "../api/services";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    registration_number: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await vehicleService.getAll();
      setVehicles(res.data);
    } catch (err) {
      setError("Failed to load vehicles");
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
      await vehicleService.create({
        ...form,
        year: parseInt(form.year),
      });
      setForm({ make: "", model: "", year: "", registration_number: "" });
      setShowForm(false);
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?"))
      return;
    try {
      await vehicleService.delete(id);
      fetchVehicles();
    } catch (err) {
      alert("Failed to delete vehicle");
    }
  };

  if (loading) return <div className="page-content">Loading vehicles...</div>;

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
          <h2>My Vehicles</h2>
          <p>Manage your registered vehicles</p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Vehicle"}
        </button>
      </div>

      {/* Add Vehicle Form */}
      {showForm && (
        <div className="form-card" style={{ marginBottom: "24px" }}>
          <h3 style={{ marginBottom: "16px" }}>Add New Vehicle</h3>
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
                Make (Brand)
                <input
                  name="make"
                  placeholder="Toyota"
                  value={form.make}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Model
                <input
                  name="model"
                  placeholder="Corolla"
                  value={form.model}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Year
                <input
                  name="year"
                  type="number"
                  placeholder="2020"
                  value={form.year}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Registration Number
                <input
                  name="registration_number"
                  placeholder="ABC-123"
                  value={form.registration_number}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
            <button
              type="submit"
              className="primary-button"
              style={{ marginTop: "16px" }}
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Vehicle"}
            </button>
          </form>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {vehicles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          No vehicles added yet. Click Add Vehicle to get started!
        </div>
      ) : (
        <div className="card-grid three-column">
          {vehicles.map((vehicle) => (
            <article key={vehicle._id} className="garage-card">
              <div className="card-header-row">
                <h3>
                  {vehicle.make} {vehicle.model}
                </h3>
                <span className="pill">{vehicle.year}</span>
              </div>
              <p>🚗 Reg: {vehicle.registration_number}</p>
              <p style={{ color: "#888", fontSize: "12px" }}>
                Added: {new Date(vehicle.createdAt).toLocaleDateString()}
              </p>
              <div style={{ marginTop: "12px" }}>
                <button
                  onClick={() => handleDelete(vehicle._id)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
