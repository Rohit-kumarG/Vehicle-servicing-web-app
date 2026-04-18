import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
      </form>
    </section>
  );
}
