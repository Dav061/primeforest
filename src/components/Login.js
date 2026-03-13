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

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { syncGuestCartWithServer } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/profile";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      await syncGuestCartWithServer();
      notifySuccess("Успешный вход в систему");
      navigate(from, { replace: true });
    } catch (error) {
      notifyError("Ошибка при входе. Проверьте логин и пароль.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };

  return (
    <>
      <Helmet>
        <title>Вход в личный кабинет - Prime-Forest | Пиломатериалы</title>
        <meta name="description" content="Вход в личный кабинет Prime-Forest. Отслеживайте статус заказов, сохраняйте историю покупок пиломатериалов." />
      </Helmet>
      <div className="login-page">
        <div className="login-header">
          <IconButton 
            className="back-button" 
            onClick={handleGoBack}
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