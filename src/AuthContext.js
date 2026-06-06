// src/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthToken = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []);

  const handleLogout = useCallback(() => {
    const username = localStorage.getItem("lastLoggedInUser");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    if (username) {
      localStorage.removeItem(`guestCartSynced_${username}`);
    }
    setAuthToken(null);
    setUser(null);
  }, [setAuthToken]);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      setAuthToken(token);

      const response = await axios.get(`${API_URL}/api/user/`);
      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refresh = localStorage.getItem("refresh");
          if (refresh) {
            const refreshResponse = await axios.post(
              `${API_URL}/api/token/refresh/`,
              { refresh }
            );
            const { access } = refreshResponse.data;
            localStorage.setItem("token", access);
            setAuthToken(access);

            const userResponse = await axios.get(`${API_URL}/api/user/`);
            setUser(userResponse.data);
          } else {
            handleLogout();
          }
        } catch {
          handleLogout();
        }
      } else {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout, setAuthToken]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/token/`, {
        username,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);
      setAuthToken(access);

      const userResponse = await axios.get(`${API_URL}/api/user/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      setUser(userResponse.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Ошибка входа",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout: handleLogout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
