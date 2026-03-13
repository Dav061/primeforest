// src/components/Register.js - исправленная версия
import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { CartContext } from "../CartContext";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "../styles.scss";
import { notifySuccess, notifyError } from "../utils/notifications";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);
  const { getSessionKey, syncGuestCartWithServer } = useContext(CartContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        {
          username,
          password,
          email,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("token", response.data.tokens.access);

      if (response.data.linked_orders_count > 0) {
        notifySuccess(
          `К вашему аккаунту привязано ${response.data.linked_orders_count} заказов`
        );
      }

      await login(username, password);
      await syncGuestCartWithServer();

      notifySuccess("Регистрация прошла успешно!");
      navigate("/profile");
    } catch (error) {
      console.error("Registration error:", error);
      notifyError(error.response?.data?.error || "Ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <IconButton
          className="back-button"
          onClick={handleGoBack}
          aria-label="назад"
        >
          <ArrowBackIcon />
          <span className="back-button-text">Назад</span>
        </IconButton>
      </div>

      <div className="register-form">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
            className="submit-btn"
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
