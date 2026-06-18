import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../api/services";

function ForgotPasswordForm() {
  const [step, setStep] = useState(1);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await authService.sendOTP({ email });
      setStep(2);
      setMessage("OTP sent! Check your email inbox.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.resetPassword({ email, otp, newPassword });
      setMessage("Password reset successfully! You can now login.");
      setShow(false);
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!show)
    return (
      <div style={{ marginTop: "12px" }}>
        {message && (
          <p style={{ color: "var(--success)", textAlign: "center", fontSize: "13px", marginBottom: "8px", fontWeight: "600" }}>
            ✅ {message}
          </p>
        )}
        <button
          type="button"
          onClick={() => setShow(true)}
          className="ghost-button"
          style={{ width: "100%", fontSize: "13px", minHeight: "40px", padding: "8px" }}
        >
          Forgot Password?
        </button>
      </div>
    );

  return (
    <div style={{ marginTop: "14px", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "16px", background: "var(--bg-darker)" }}>
      {error && (
        <p style={{ color: "var(--danger)", fontSize: "13px", marginBottom: "10px", fontWeight: "600" }}>
          ❌ {error}
        </p>
      )}
      {message && (
        <p style={{ color: "var(--success)", fontSize: "13px", marginBottom: "10px", fontWeight: "600" }}>
          ✅ {message}
        </p>
      )}

      {/* Step 1 - Enter Email */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ color: "var(--muted)", fontSize: "12.5px" }}>
            Enter your email to receive OTP
          </p>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
            Email Address
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--line-strong)" }}
            />
          </label>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button
              type="button"
              className="primary-button"
              style={{ flex: 1, minHeight: "38px", padding: "6px 12px", fontSize: "12.5px" }}
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP 📧"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShow(false);
                setError("");
                setMessage("");
              }}
              className="ghost-button"
              style={{ flex: 1, minHeight: "38px", padding: "6px 12px", fontSize: "12.5px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 2 - Enter OTP + New Password */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ color: "var(--muted)", fontSize: "12.5px" }}>
            OTP sent to <strong>{email}</strong>
          </p>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
            Enter 6-digit OTP
            <input
              type="text"
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--line-strong)" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
            New Password
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--line-strong)" }}
            />
          </label>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button
              type="button"
              className="primary-button"
              style={{ flex: 1, minHeight: "38px", padding: "6px 12px", fontSize: "12.5px" }}
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password ✅"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setMessage("");
              }}
              className="ghost-button"
              style={{ flex: 1, minHeight: "38px", padding: "6px 12px", fontSize: "12.5px" }}
            >
              Back
            </button>
          </div>
          <p
            onClick={handleSendOTP}
            style={{
              color: "var(--accent-strong)",
              fontSize: "12px",
              cursor: "pointer",
              marginTop: "4px",
              textAlign: "center",
              textDecoration: "underline",
              fontWeight: "500",
            }}
          >
            Resend OTP
          </p>
        </div>
      )}
    </div>
  );
}

export default function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    city: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    let result;
    if (isRegister) {
      result = await register(form);
    } else {
      result = await login(form);
    }

    setLoading(false);

    if (result.success) {
      const user = result.user;
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "garage") {
        navigate("/garage/bookings");
      } else {
        navigate("/");
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <section className="auth-layout">
      {/* Visual luxury badge side panel */}
      <div className="auth-panel">
        <span className="hero-badge">
          ⚜️ GARAGE WALA Portal
        </span>
        <h1>
          {isRegister ? "Join the GARAGE WALA Hub" : "Welcome back to GARAGE WALA"}
        </h1>
        <p style={{ marginTop: "12px" }}>
          {isRegister 
            ? "Create an account to manage your high-end vehicles, coordinate maintenance, and request expert detailing with active step tracking."
            : "Sign in to access your registered garage bookings, inspect order history, and submit review feedback."}
        </p>
      </div>

      {/* Luxury Form wrapper */}
      <form className="form-card" onSubmit={handleSubmit} style={{ padding: "36px" }}>
        <h2 style={{ marginBottom: "8px", fontSize: "1.6rem" }}>
          {isRegister ? "Create Account" : "Sign In"}
        </h2>
        
        {error && (
          <div style={{ 
            color: "var(--danger)", 
            background: "var(--danger-light)", 
            padding: "10px 14px", 
            borderRadius: "8px", 
            fontSize: "13.5px",
            border: "1px solid var(--danger)",
            fontWeight: "600",
            marginBottom: "4px"
          }}>
            ❌ {error}
          </div>
        )}

        {isRegister && (
          <label>
            Full Name
            <input
              name="full_name"
              placeholder="Enter your full name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </label>
        )}

        {isRegister && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <label>
              Contact Number
              <input
                name="phone"
                placeholder="03001234567"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              City
              <input
                name="city"
                placeholder="Karachi"
                value={form.city}
                onChange={handleChange}
              />
            </label>
          </div>
        )}

        {isRegister && (
          <label>
            Address / Area
            <input
              name="address"
              placeholder="House, street, area"
              value={form.address}
              onChange={handleChange}
            />
          </label>
        )}

        <label>
          Email Address
          <input
            name="email"
            type="email"
            placeholder="yourname@domain.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            placeholder="••••••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        {isRegister && (
          <label>
            User Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer / Vehicle Owner</option>
              <option value="garage">Garage Partner Owner</option>
            </select>
          </label>
        )}

        <button
          type="submit"
          className="primary-button wide-button"
          disabled={loading}
          style={{ marginTop: "8px" }}
        >
          {loading ? "Verifying..." : isRegister ? "Create Account" : "Sign In"}
        </button>

        <p style={{ textAlign: "center", marginTop: "12px", fontSize: "14px", color: "var(--muted)", fontWeight: "500" }}>
          {isRegister ? (
            <>
              Already have an account? <a href="/login" style={{ color: "var(--accent-strong)", fontWeight: "700" }}>Sign In</a>
            </>
          ) : (
            <>
              New to the platform? <a href="/register" style={{ color: "var(--accent-strong)", fontWeight: "700" }}>Register</a>
            </>
          )}
        </p>

        {!isRegister && (
          <div
            style={{
              marginTop: "20px",
              borderTop: "1px solid var(--line)",
              paddingTop: "20px",
            }}
          >
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "13px",
                fontWeight: "500",
                marginBottom: "4px",
              }}
            >
              Need to retrieve access?
            </p>
            <ForgotPasswordForm />
          </div>
        )}
      </form>
    </section>
  );
}
