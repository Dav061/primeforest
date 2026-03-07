// Navbar.js
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { ShoppingCart, User, LogIn, Phone, MapPin } from "lucide-react";
import { AuthContext } from "../AuthContext";
import axios from "axios";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  // Загрузка количества товаров в корзине
  const fetchCartCount = () => {
    axios
      .get("http://127.0.0.1:8000/api/carts/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        if (response.data && response.data.length > 0) {
          setCartCount(response.data[0].items.length);
        }
      })
      .catch((error) => {
        console.error("Ошибка при загрузке корзины:", error);
      });
  };

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  return (
    <AppBar position="sticky" className="navbar">
      <div className="navbar-container">
        {/* Верхний тулбар */}
        <Toolbar className="top-toolbar">
          <div className="logo-section">
            <Link to="/" className="logo-link">
              Prime-Forest
            </Link>
            <a
              href="https://yandex.ru/maps/-/CHuLuW9G"
              className="logo-address"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={14} />
              Рублёвское ш., 151к2
            </a>
          </div>

          <div className="right-section">
            {/* Кнопка вызова с номером телефона СВЕРХУ иконок */}
            <a href="tel:+79999849269" className="call-button">
              <Phone size={18} />
              +7 (999) 000-06-29
            </a>

            {/* Иконки корзины и профиля СНИЗУ */}
            <div className="nav-icons">
              <IconButton
                component={Link}
                to="/cart"
                className="nav-icon-btn"
                aria-label="Корзина"
              >
                <ShoppingCart />
                {cartCount > 0 && (
                  <span className="cart-count">{cartCount}</span>
                )}
              </IconButton>

              {user ? (
                <IconButton
                  component={Link}
                  to="/profile"
                  className="nav-icon-btn"
                  aria-label="Профиль"
                >
                  <User />
                </IconButton>
              ) : (
                <IconButton
                  component={Link}
                  to="/login"
                  className="nav-icon-btn"
                  aria-label="Войти"
                >
                  <LogIn />
                </IconButton>
              )}
            </div>
          </div>
        </Toolbar>

        {/* Нижний тулбар с навигацией */}
        <Toolbar className="bottom-toolbar">
          <Link to="/" className="section-link">
            Главная
          </Link>
          <Link to="/about" className="section-link">
            О нас
          </Link>
          <Link to="/products" className="section-link">
            Каталог
          </Link>
          <Link to="/contacts" className="section-link">
            Контакты
          </Link>
        </Toolbar>
      </div>
    </AppBar>
  );
};

export default Navbar;
