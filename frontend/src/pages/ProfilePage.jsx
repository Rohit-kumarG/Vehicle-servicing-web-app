import { useEffect, useState } from "react";
import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { authService } from "../api/services";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authService.getProfile();
      setProfile(res.data);
      setForm({
        full_name: res.data.full_name || "",
        phone: res.data.phone || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Please login to view profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await authService.updateProfile(form);
      setProfile(res.data.user);
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-content">Loading profile...</div>;

  if (!profile) {
    return (
      <div className="page-content">
        <div className="empty-state-card">
          <UserRound size={44} />
          <h2>Profile unavailable</h2>
          <p>{error || "Login first to manage your profile."}</p>
          <a className="primary-button" href="/login">
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">Account Center</span>
          <h1>My Profile</h1>
          <p>Manage your account identity and contact information.</p>
        </div>
        <span className="status-badge confirmed">{profile.role}</span>
      </section>

      {(message || error) && (
        <div className={error ? "soft-alert" : "success-alert"}>
          {error || message}
        </div>
      )}

      <section className="profile-layout">
        <article className="profile-summary-card">
          <div className="profile-avatar-large">
            {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h2>{profile.full_name}</h2>
          <p>
            <Mail size={15} /> {profile.email}
          </p>
          <p>
            <Phone size={15} /> {profile.phone || "Phone not added"}
          </p>
          <p>
            <ShieldCheck size={15} /> {profile.role}
          </p>
        </article>

        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Edit Profile</h2>
          <label>
            Full Name
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="03001234567"
            />
          </label>
          <button className="primary-button" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>
    </div>
  );
}
