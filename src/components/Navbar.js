// src/components/Navbar.js
import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import {
  ShoppingCart,
  User,
  LogIn,
  Phone,
  MapPin,
  Search,
  Filter,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { AuthContext } from "../AuthContext";
import { CartContext } from "../CartContext";
import FilterPanel from "./FilterPanel";
import "../styles.scss";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const shouldShowFilters =
    location.pathname.includes("/catalog/") || queryParams.has("search");

  // Синхронизируем searchQuery с URL
  useEffect(() => {
    setSearchQuery(queryParams.get("search") || "");
  }, [location.search]);

  // Закрываем мобильное меню при переходе на десктоп
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Блокируем прокрутку при открытом меню
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);
  const toggleFilterDrawer = () => setFilterDrawerOpen((prev) => !prev);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams(location.search);
      params.set("search", searchQuery.trim());
      params.delete("page");

      // Получаем slug из текущего URL, если есть
      const pathParts = location.pathname.split("/");
      const currentSlug = pathParts[2];

      if (currentSlug && currentSlug !== "catalog") {
        // Если мы в категории, остаемся в ней
        navigate(`/catalog/${currentSlug}?${params.toString()}`);
      } else {
        // Если мы не в категории, просто добавляем поиск
        navigate(`/catalog?${params.toString()}`);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(location.search);
    params.delete("search");

    const pathParts = location.pathname.split("/");
    const currentSlug = pathParts[2];

    if (currentSlug && currentSlug !== "catalog") {
      navigate(`/catalog/${currentSlug}?${params.toString()}`);
    } else {
      navigate(`/catalog?${params.toString()}`);
    }
  };

  const navLinks = [
    { path: "/", label: "Главная" },
    { path: "/catalog", label: "Каталог" },
    { path: "/promotions", label: "Акции" },
    { path: "/about", label: "О нас" },
    { path: "/contacts", label: "Контакты" },
  ];

  const isActivePath = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

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
                href="https://yandex.ru/maps/-/CPB24ZOi"
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
              <Phone size={12} />
              <span>+7 (999) 000-06-29</span>
            </a>

            <div className="nav-icons">
              <IconButton component={Link} to="/cart" className="nav-icon-btn">
                <ShoppingCart />
                {cartCount > 0 && (
                  <span className="cart-count">{cartCount}</span>
                )}
              </IconButton>

              <IconButton
                component={Link}
                to={user ? "/profile" : "/login"}
                className="nav-icon-btn"
              >
                {user ? <User /> : <LogIn />}
              </IconButton>
            </div>
          </div>
        </Toolbar>

        {/* Десктопная навигация */}
        <div className="nav-desktop-wrapper">
          <nav className="navDesktop">
            <ul>
              {navLinks.map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`section-link ${
                      isActivePath(path) ? "active" : ""
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Десктопный поиск */}
          <div className="nav-search-section">
            <form onSubmit={handleSearch} className="nav-search-form">
              <TextField
                size="small"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nav-search-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <X size={16} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="small"
                className="nav-search-button"
              >
                Найти
              </Button>
            </form>

            {shouldShowFilters && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<SlidersHorizontal size={16} />}
                onClick={toggleFilterDrawer}
                className="nav-filter-button"
              >
                Фильтры
              </Button>
            )}
          </div>
        </div>

        {/* Мобильный поиск */}
        <div className="mobile-search-container">
          <button className="burgerButton" onClick={toggleMenu}>
            <span />
            <span />
            <span />
          </button>

          <div className="mobile-search-wrapper">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <TextField
                size="small"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <X size={16} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="small"
                className="mobile-search-button"
              >
                Найти
              </Button>
            </form>
          </div>

          {shouldShowFilters && (
            <Button
              variant="outlined"
              size="small"
              onClick={toggleFilterDrawer}
              className="mobile-filter-button"
            >
              <Filter size={18} />
            </Button>
          )}
        </div>

        {/* Мобильное меню */}
        <div className={`mobileMenu ${menuOpen ? "mobileMenuOpen" : ""}`}>
          <div className="mobile-menu-header">
            <button className="mobile-menu-close" onClick={closeMenu}>
              <X size={24} />
            </button>
          </div>
          <nav>
            <ul>
              {navLinks.map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`section-link ${
                      isActivePath(path) ? "active" : ""
                    }`}
                    onClick={closeMenu}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}

        {/* Фильтры */}
        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={toggleFilterDrawer}
          classes={{ paper: "filter-drawer" }}
        >
          <div className="filter-drawer-header">
            <h3>Фильтры</h3>
            <IconButton onClick={toggleFilterDrawer}>
              <X size={20} />
            </IconButton>
          </div>
          <div className="filter-drawer-content">
            <FilterPanel onClose={toggleFilterDrawer} />
          </div>
        </Drawer>
      </div>
    </AppBar>
  );
};

export default Navbar;
