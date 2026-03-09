import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import { ShoppingCart, User, LogIn, Phone, MapPin } from "lucide-react";
import { AuthContext } from "../AuthContext";
import { CartContext } from "../CartContext";
import "../styles.scss";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navLinks = [
    { path: "/", label: "Главная", icon: null },
    { path: "/products", label: "Каталог", icon: null },
    { path: "/promotions", label: "Акции", icon: null },
    { path: "/about", label: "О нас", icon: null },
    { path: "/contacts", label: "Контакты", icon: null },
  ];

  return (
    <AppBar position="sticky" className="navbar">
      <div className="navbar-container">
        <Toolbar className="top-toolbar">
          <div className="left-section">
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
                Рублёвское шоссе, 151к2
              </a>
            </div>
          </div>

          <div className="right-section">
            <a href="tel:+79990000629" className="call-button">
              <Phone size={16} />
              <span>+7 (999) 000-06-29</span>
            </a>

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

              <button
                className={`burgerButton ${menuOpen ? "burgerOpen" : ""}`}
                onClick={toggleMenu}
                aria-label="Меню"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </Toolbar>

        {/* Десктопная навигация */}
        <nav className="navDesktop">
          <ul>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="section-link">
                  {link.icon && <span className="link-icon">{link.icon}</span>}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Мобильное меню */}
        <div className={`mobileMenu ${menuOpen ? "mobileMenuOpen" : ""}`}>
          <nav>
            <ul>
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="section-link"
                    onClick={closeMenu}
                  >
                    {link.icon && (
                      <span className="link-icon">{link.icon}</span>
                    )}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </AppBar>
  );
};

export default Navbar;
