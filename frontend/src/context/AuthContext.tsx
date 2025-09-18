// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "../types/auth-types";

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string>("");

  useEffect(() => { checkAuth(); }, []);

  // Always send Authorization: Bearer <token>
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/auth/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        setUser(await response.json());
        setAuthError("");
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
    setIsLoading(false);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token); // Store token!
        await checkAuth();
        return true;
      }
      setAuthError("Invalid username or password");
      return false;
    } catch {
      setAuthError("Login failed. Please try again.");
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setAuthError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token); // Store token!
        await checkAuth();
        return true;
      }
      setAuthError("Registration failed. Username or email may already exist.");
      return false;
    } catch {
      setAuthError("Registration failed. Please try again.");
      return false;
    }
  };

  const logout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    setUser(null);
    localStorage.removeItem("access_token");
    setAuthError("");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      isLoading,
      authError,
      clearAuthError: () => setAuthError("")
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
