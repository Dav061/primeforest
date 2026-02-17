import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // Показываем заглушку во время проверки аутентификации
    return <div>Проверка авторизации...</div>;
  }

  if (!user) {
    // Пользователь не аутентифицирован
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.is_staff) {
    // Пользователь не администратор, но требуется админский доступ
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
