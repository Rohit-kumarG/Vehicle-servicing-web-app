import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem("autocare_user");
      const savedToken = sessionStorage.getItem("autocare_token");
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      sessionStorage.removeItem("autocare_user");
      sessionStorage.removeItem("autocare_token");
    }
    setLoading(false);
  }, []);

  const login = async (payload) => {
    try {
      // Clear old data first
      sessionStorage.removeItem("autocare_token");
      sessionStorage.removeItem("autocare_user");

      const res = await authService.login(payload);
      const { token, user } = res.data;

      sessionStorage.setItem("autocare_token", token);
      sessionStorage.setItem("autocare_user", JSON.stringify(user));
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (payload) => {
    try {
      // Clear old data first
      sessionStorage.removeItem("autocare_token");
      sessionStorage.removeItem("autocare_user");

      const res = await authService.register(payload);
      const { token, user } = res.data;

      sessionStorage.setItem("autocare_token", token);
      sessionStorage.setItem("autocare_user", JSON.stringify(user));
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Register failed",
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem("autocare_token");
    sessionStorage.removeItem("autocare_user");
    setUser(null);
    window.location.href = "/login";
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
