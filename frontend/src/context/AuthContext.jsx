import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const getRoleDashboard = (role) => {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "TRAINER":
      return "/trainer/dashboard";
    case "PLACEMENT":
      return "/placement/dashboard";
    case "ALUMNI":
      return "/alumni/dashboard";
    case "STUDENT":
    default:
      return "/student/dashboard";
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("ascendra_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("ascendra_access_token");
      if (token) {
        try {
          const { data } = await authApi.getMe();
          setUser(data);
          localStorage.setItem("ascendra_user", JSON.stringify(data));
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("ascendra_access_token");
          localStorage.removeItem("ascendra_refresh_token");
          localStorage.removeItem("ascendra_user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await authApi.login({ username, password });
      localStorage.setItem("ascendra_access_token", data.access);
      localStorage.setItem("ascendra_refresh_token", data.refresh);
      localStorage.setItem("ascendra_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user, redirect: getRoleDashboard(data.user.role) };
    } catch (error) {
      let message = "Invalid username or password. Please try again.";
      if (!error.response) {
        message = "Cannot reach the Ascendra backend server at http://127.0.0.1:8000. Please ensure the Django server is running.";
      } else {
        message =
          error.response?.data?.detail ||
          error.response?.data?.non_field_errors?.[0] ||
          message;
      }
      return { success: false, error: message };
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await authApi.register(formData);
      localStorage.setItem("ascendra_access_token", data.access);
      localStorage.setItem("ascendra_refresh_token", data.refresh);
      localStorage.setItem("ascendra_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user, redirect: getRoleDashboard(data.user.role) };
    } catch (error) {
      const errData = error.response?.data;
      const message =
        errData?.detail ||
        errData?.username?.[0] ||
        errData?.email?.[0] ||
        errData?.password?.[0] ||
        "Could not create account. Please check your details.";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("ascendra_access_token");
    localStorage.removeItem("ascendra_refresh_token");
    localStorage.removeItem("ascendra_user");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data);
      localStorage.setItem("ascendra_user", JSON.stringify(data));
      return data;
    } catch (err) {
      console.error("Refresh user error:", err);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        dashboardUrl: user ? getRoleDashboard(user.role) : "/login",
      }}
    >
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
