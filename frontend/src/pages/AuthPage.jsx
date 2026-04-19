import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../api/services";
function ForgotPasswordForm() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await authService.forgotPassword(form);
      setMessage(res.data.message);
      setForm({ email: "", newPassword: "" });
      setShow(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {message && (
        <p style={{ color: "green", textAlign: "center" }}>✅ {message}</p>
      )}
      {!show ? (
        <button
          onClick={() => setShow(true)}
          style={{
            width: "100%",
            background: "none",
            border: "1px solid #ccc",
            padding: "8px",
            borderRadius: "6px",
            cursor: "pointer",
            color: "#0066cc",
            fontSize: "13px",
          }}
        >
          Reset Password
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
          <label>
            Your Email
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label style={{ marginTop: "8px" }}>
            New Password
            <input
              type="password"
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              required
            />
          </label>
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <button
              type="submit"
              className="primary-button"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button
              type="button"
              onClick={() => setShow(false)}
              style={{
                flex: 1,
                background: "#f0f0f0",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
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
      // Redirect based on role
      const user = result.user;
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "garage") {
        navigate("/garages");
      } else {
        navigate("/");
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-panel">
        <span className="eyebrow">{isRegister ? "Register" : "Login"}</span>
        <h1>
          {isRegister ? "Create your AutoCare Hub account" : "Welcome back"}
        </h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        )}

        {isRegister && (
          <label>
            Full Name
            <input
              name="full_name"
              placeholder="Enter your name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </label>
        )}

        <label>
          Email Address
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
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
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        {isRegister && (
          <label>
            User Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="garage">Garage Owner</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}

        <button
          type="submit"
          className="primary-button wide-button"
          disabled={loading}
        >
          {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          {isRegister ? (
            <>
              Already have account? <a href="/login">Login</a>
            </>
          ) : (
            <>
              No account? <a href="/register">Register</a>
            </>
          )}
        </p>

        {!isRegister && (
          <div
            style={{
              marginTop: "16px",
              borderTop: "1px solid #eee",
              paddingTop: "16px",
            }}
          >
            <p
              style={{
                textAlign: "center",
                color: "#888",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              Forgot your password?
            </p>
            <ForgotPasswordForm />
          </div>
        )}
      </form>
    </section>
  );
}
