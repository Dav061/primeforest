import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Начальное состояние - загрузка

  // Функция для установки/удаления токена в axios
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Функция для выхода (обернута в useCallback)
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  }, []);

  // Функция для получения данных пользователя (обернута в useCallback)
  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/");
      setUser({ ...response.data, token: localStorage.getItem("token") });
    } catch (error) {
      console.error("Ошибка при загрузке данных пользователя:", error);
      handleLogout(); // Если токен невалидный, делаем логаут
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);

    if (token) {
      fetchUserData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUserData]);

  // Функция для входа
  // В методе login AuthContext
  const login = async (username, password) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });
      const { access } = response.data;
      localStorage.setItem("token", access);
      setAuthToken(access); // Убедитесь, что это вызывается
      await fetchUserData(); // Загружаем данные пользователя
      return true;
    } catch (error) {
      console.error("Ошибка при входе:", error);
      throw error;
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
