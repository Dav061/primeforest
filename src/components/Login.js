import React, { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import "../styles.scss";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate(user?.is_staff ? "/admin" : "/profile");
    } catch (error) {
      alert("Ошибка при входе. Проверьте логин и пароль.");
    }
  };

  return (
    <div className="login-form">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Войти
        </Button>
        <Link to="/register" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            style={{ marginTop: "10px" }}
          >
            Зарегистрироваться
          </Button>
        </Link>
      </form>
    </div>
  );
};

export default Login;
