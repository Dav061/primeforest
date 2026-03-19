// src/components/Login.js
import React, { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { CartContext } from "../CartContext";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles.scss";
import { notifySuccess, notifyError } from "../utils/notifications";
import { Helmet } from "react-helmet";

const GUEST_CART_KEY = "guestCart";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { syncGuestCartWithServer, refreshCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/profile";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        localStorage.setItem("lastLoggedInUser", username);

        // Проверяем наличие гостевой корзины
        const guestCart = localStorage.getItem(GUEST_CART_KEY);
        if (guestCart && Object.keys(JSON.parse(guestCart)).length > 0) {
          await syncGuestCartWithServer(username);
        }

        // Обновляем корзину
        await refreshCart();
        
        notifySuccess("Успешный вход в систему");
        navigate(from, { replace: true });
      } else {
        notifyError(result.error || "Ошибка при входе");
        setLoading(false);
      }
    } catch (error) {
      notifyError("Ошибка при входе. Проверьте логин и пароль.");
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Вход в личный кабинет - Prime-Forest</title>
      </Helmet>
      
      <div className="login-page">
        <div className="login-header">
          <IconButton
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="назад"
          >
            <ArrowBackIcon />
            <span className="back-button-text">Назад</span>
          </IconButton>
        </div>

        <div className="login-form">
          <h2>Вход</h2>
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
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              className="submit-btn"
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                className="register-btn"
                style={{ marginTop: "10px" }}
              >
                Зарегистрироваться
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;