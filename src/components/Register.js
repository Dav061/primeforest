// src/components/Register.js
import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { CartContext } from "../CartContext";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Helmet } from "react-helmet";
import "../styles.scss";
import { notifySuccess, notifyError } from "../utils/notifications";

const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);
  const { syncGuestCartWithServer } = useContext(CartContext); // убрали getSessionKey

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/register/`,
        { username, password, email },
        { withCredentials: true }
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
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Ошибка при регистрации";
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => navigate(-1);

  return (
    <>
      <Helmet>
        <title>Регистрация - Prime-Forest | Создание личного кабинета</title>
        <meta
          name="description"
          content="Регистрация в интернет-магазине пиломатериалов Prime-Forest. Сохраняйте историю заказов, отслеживайте доставку по Москве и МО."
        />
      </Helmet>

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
              autoComplete="username"
            />
            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoComplete="new-password"
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              autoComplete="email"
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
    </>
  );
};

export default Register;
