// src/components/Navbar.js (исправленная версия)
import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
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

  // Получаем параметры из URL
  const queryParams = new URLSearchParams(location.search);

  // Проверяем, нужно ли показывать фильтры (есть категория ИЛИ поиск)
  const shouldShowFilters =
    queryParams.has("category") || queryParams.has("search");

  // Синхронизируем searchQuery с URL при изменении
  useEffect(() => {
    const searchParam = queryParams.get("search");
    setSearchQuery(searchParam || "");
  }, [location.search]);

  // Устанавливаем начальное значение поиска из URL при загрузке
  useEffect(() => {
    const searchParam = queryParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Закрываем мобильное меню при переходе на десктоп
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Блокируем прокрутку страницы при открытом меню
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Получаем ВСЕ текущие параметры из URL
      const params = new URLSearchParams(location.search);

      // Обновляем или добавляем поисковый запрос
      params.set("search", searchQuery.trim());

      // Удаляем параметр page, так как при новом поиске начинаем с первой страницы
      params.delete("page");

      // Навигируем с сохраненными параметрами
      navigate(`/catalog?${params.toString()}`);
    }
  };

  const handleClearSearch = () => {
    console.log("🔍 handleClearSearch вызван");

    setSearchQuery("");

    // Получаем параметры ИЗ ТЕКУЩЕГО location.search
    const params = new URLSearchParams(location.search);
    console.log("📦 Текущие параметры из URL:", Object.fromEntries(params));

    // Удаляем ТОЛЬКО search
    params.delete("search");
    console.log("📦 После удаления search:", Object.fromEntries(params));

    // Навигируем
    navigate(`/catalog?${params.toString()}`);
  };

  const navLinks = [
    { path: "/", label: "Главная", icon: null },
    { path: "/catalog", label: "Каталог", icon: null },
    { path: "/promotions", label: "Акции", icon: null },
    { path: "/about", label: "О нас", icon: null },
    { path: "/contacts", label: "Контакты", icon: null },
  ];

  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
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
              <Phone size={12} />
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
            </div>
          </div>
        </Toolbar>

        {/* Десктопная навигация с поиском */}
        <div className="nav-desktop-wrapper">
          <nav className="navDesktop">
            <ul>
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`section-link ${
                      isActivePath(link.path) ? "active" : ""
                    }`}
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

          {/* Поиск и фильтры для десктопа */}
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
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        className="clear-search-icon"
                      >
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

            {/* Показываем кнопку фильтров только когда есть категория или поиск */}
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

        {/* Мобильная поисковая строка с бургер-меню слева */}
        <div className="mobile-search-container">
          {/* Простой бургер - всегда на заднем плане */}
          <button
            className="burgerButton"
            onClick={toggleMenu}
            aria-label="Меню"
          >
            <span></span>
            <span></span>
            <span></span>
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
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        className="clear-search-icon"
                      >
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

          {/* Показываем кнопку фильтров только когда есть категория или поиск */}
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

        {/* Мобильное меню - накладывается поверх */}
        <div className={`mobileMenu ${menuOpen ? "mobileMenuOpen" : ""}`}>
          <div className="mobile-menu-header">
            <button className="mobile-menu-close" onClick={closeMenu}>
              <X size={24} />
            </button>
          </div>
          <nav>
            <ul>
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`section-link ${
                      isActivePath(link.path) ? "active" : ""
                    }`}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Затемнение фона при открытом меню */}
        {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

        {/* Drawer с фильтрами */}
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
