// Navbar.js
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { ShoppingCart, LogIn, User } from "lucide-react";
import { AuthContext } from "../AuthContext";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import {
  questions,
  getRecommendations,
  RecommendationModal,
} from "./Recommendation";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

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

  // Проверяем, есть ли сохраненные рекомендации при монтировании
  useEffect(() => {
    const lastRecommendations = sessionStorage.getItem("lastRecommendations");
    if (lastRecommendations) {
      setRecommendedProducts(JSON.parse(lastRecommendations));
    }
  }, []);

  const handleAnswerSelect = async (answer) => {
    if (answer === "back") {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setAnswers(answers.slice(0, -1));
        // Сбрасываем рекомендации при возврате назад
        setRecommendedProducts([]);
      }
      return;
    }

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsLoadingProducts(true);
      try {
        const recommendations = await getRecommendations(newAnswers);
        setRecommendedProducts(recommendations);
        sessionStorage.setItem(
          "lastRecommendations",
          JSON.stringify(recommendations)
        );
      } finally {
        setIsLoadingProducts(false);
      }
    }
  };

  // Сброс опроса
  const resetQuestionnaire = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setRecommendedProducts([]);
    sessionStorage.removeItem("lastRecommendations");
  };

  // Закрытие модального окна
  const closeModal = () => {
    setShowRecommendationModal(false);
    // Не сбрасываем рекомендации, чтобы можно было вернуться
  };

  // При открытии модального окна проверяем, есть ли сохраненные рекомендации
  const handleOpenModal = () => {
    const lastRecommendations = sessionStorage.getItem("lastRecommendations");
    if (lastRecommendations) {
      setRecommendedProducts(JSON.parse(lastRecommendations));
    } else {
      resetQuestionnaire();
    }
    setShowRecommendationModal(true);
  };

  return (
    <AppBar position="static" className="navbar">
      <Toolbar className="toolbar">
        <div className="HeaderLogo">
          <Link to="/" className="logo-link">
            WOODGOOD
          </Link>
          <a
            href="https://yandex.ru/maps/-/CHuLuW9G"
            variant="body2"
            className="contact-item"
          >
            Рублёвское ш., 151к2
          </a>
        </div>

        <div className="contact-info">
          <a href="tel:+79999849269" variant="body2" className="contact-item">
            +7 (999) 984-92-69
          </a>
          <a
            href="mailto:info@woodgood.ru"
            variant="body2"
            className="contact-item"
          >
            info@woodgood.ru
          </a>
        </div>

        <div className="nav-icons">
          <IconButton component={Link} to="/cart" color="inherit">
            <ShoppingCart size={32} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </IconButton>
          {user ? (
            <IconButton component={Link} to="/profile" color="inherit">
              <User size={32} />
            </IconButton>
          ) : (
            <IconButton component={Link} to="/login" color="inherit">
              <LogIn size={32} />
            </IconButton>
          )}
        </div>
      </Toolbar>

      <Toolbar className="bottom-toolbar">
        <Link to="/" className="section-link">
          Главная
        </Link>
        <Link to="/about" className="section-link">
          О нас
        </Link>
        <button
          className="section-link recommendation-btn"
          onClick={handleOpenModal}
          disabled={isLoadingProducts}
        >
          {isLoadingProducts ? "Загрузка..." : "Получить рекомендацию"}
        </button>
        <Link to="/products" className="section-link">
          Каталог
        </Link>
        <Link to="/contacts" className="section-link">
          Контакты
        </Link>
      </Toolbar>

      {/* Модальное окно рекомендаций */}
      <RecommendationModal
        showModal={showRecommendationModal}
        onClose={closeModal}
        currentQuestionIndex={currentQuestionIndex}
        questions={questions}
        answers={answers}
        onAnswerSelect={handleAnswerSelect}
        recommendedProducts={recommendedProducts}
        onReset={resetQuestionnaire}
        allProducts={allProducts}
        isLoadingProducts={isLoadingProducts}
      />
    </AppBar>
  );
};

export default Navbar;
