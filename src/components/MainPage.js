// src/components/MainPage.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Percent,
  Shield,
  Ruler,
  TreePine,
  Award,
  Phone,
  Clock,
  MapPin,
  Star,
  Home,
  Warehouse,
  Fence,
  Hammer,
  X,
} from "lucide-react";
import "../styles.scss";
import { HelmetProvider } from "react-helmet-async";

const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";
const POPULAR_PRODUCT_IDS = [1, 2, 12, 5];

const MainPage = () => {
  const navigate = useNavigate();
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    products: 1500,
    customers: 5000,
    years: 12,
    deliveries: 12000,
  });

  // Состояния для формы обратного звонка
  const [callbackForm, setCallbackForm] = useState({
    name: "",
    phone: "",
  });
  const [callbackStatus, setCallbackStatus] = useState({
    loading: false,
    success: false,
    error: false,
    message: "",
  });

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/`, {
          params: { limit: 100 },
        });

        if (response.data?.results) {
          const popular = response.data.results.filter((product) =>
            POPULAR_PRODUCT_IDS.includes(product.id)
          );

          if (popular.length < 4) {
            const remainingCount = 4 - popular.length;
            const otherProducts = response.data.results
              .filter((product) => !POPULAR_PRODUCT_IDS.includes(product.id))
              .slice(0, remainingCount);

            setPopularProducts([...popular, ...otherProducts].slice(0, 4));
          } else {
            setPopularProducts(popular.slice(0, 4));
          }
        } else {
          setPopularProducts([]);
        }
      } catch (error) {
        console.error("Error loading popular products:", error);
        setPopularProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  // Обработчик отправки формы обратного звонка
  const handleCallbackSubmit = async (e) => {
    e.preventDefault();

    if (!callbackForm.name.trim()) {
      setCallbackStatus({
        loading: false,
        success: false,
        error: true,
        message: "Пожалуйста, введите ваше имя",
      });
      return;
    }

    if (!callbackForm.phone.trim()) {
      setCallbackStatus({
        loading: false,
        success: false,
        error: true,
        message: "Пожалуйста, введите номер телефона",
      });
      return;
    }

    const phoneRegex = /^[\d+\s()-]{10,}$/;
    if (!phoneRegex.test(callbackForm.phone.trim())) {
      setCallbackStatus({
        loading: false,
        success: false,
        error: true,
        message: "Пожалуйста, введите корректный номер телефона",
      });
      return;
    }

    setCallbackStatus({
      loading: true,
      success: false,
      error: false,
      message: "",
    });

    try {
      const response = await axios.post(`${API_URL}/api/callback/`, {
        name: callbackForm.name.trim(),
        phone: callbackForm.phone.trim(),
      });

      setCallbackStatus({
        loading: false,
        success: true,
        error: false,
        message: "Спасибо! Мы перезвоним вам в ближайшее время.",
      });

      setCallbackForm({ name: "", phone: "" });

      setTimeout(() => {
        setCallbackStatus((prev) => ({ ...prev, success: false, message: "" }));
      }, 5000);
    } catch (error) {
      console.error("Error sending callback request:", error);

      let errorMessage = "Произошла ошибка. Пожалуйста, попробуйте позже.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setCallbackStatus({
        loading: false,
        success: false,
        error: true,
        message: errorMessage,
      });

      setTimeout(() => {
        setCallbackStatus((prev) => ({ ...prev, error: false, message: "" }));
      }, 5000);
    }
  };

  const handleCallbackInputChange = (field, value) => {
    setCallbackForm((prev) => ({ ...prev, [field]: value }));
    if (callbackStatus.error || callbackStatus.success) {
      setCallbackStatus({
        loading: false,
        success: false,
        error: false,
        message: "",
      });
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://images.unsplash.com/photo-1581517066154-d9ca0f8c456a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const formatPrice = (price) => new Intl.NumberFormat("ru-RU").format(price);

  const renderProductPrices = (product) => {
    if (!product.prices?.length) {
      return <div className="product-price">Цена по запросу</div>;
    }

    if (product.prices.length === 1) {
      const price = product.prices[0];
      return (
        <div className="product-price">
          <span className="price-value">{formatPrice(price.price)} ₽</span>
          <span className="price-unit">/{price.unit_type_short}</span>
          {price.quantity_per_unit && (
            <span className="price-pack"> ({price.quantity_per_unit} шт)</span>
          )}
        </div>
      );
    }

    const minPrice = Math.min(...product.prices.map((p) => p.price));
    const mainUnit =
      product.prices.find((p) => p.price === minPrice)?.unit_type_short || "шт";

    return (
      <div className="product-price">
        <span className="price-from">от </span>
        <span className="price-value">{formatPrice(minPrice)} ₽</span>
        <span className="price-unit">/{mainUnit}</span>
      </div>
    );
  };

  const advantages = [
    {
      icon: TreePine,
      title: "Собственное производство",
      desc: "Контроль качества на всех этапах",
    },
    {
      icon: Ruler,
      title: "Любые размеры",
      desc: "Изготовление нестандартных размеров",
    },
    { icon: Warehouse, title: "Склад в наличии", desc: "Более 1000 позиций" },
    {
      icon: Award,
      title: "Сертификаты качества",
      desc: "Вся продукция сертифицирована",
    },
  ];

  const applications = [
    { path: "construction", icon: Home, text: "Строительство домов" },
    { path: "bath", icon: Warehouse, text: "Бани и сауны" },
    { path: "fence", icon: Fence, text: "Заборы и ограждения" },
    { path: "furniture", icon: Hammer, text: "Мебельное производство" },
  ];

  const reviews = [
    {
      initials: "АП",
      name: "Александр Петров",
      date: "12.03.2026",
      text: "Отличное качество досок. Быстрая доставка. Буду заказывать ещё.",
    },
    {
      initials: "ИС",
      name: "Иван Сидоров",
      date: "10.03.2026",
      text: "Большой выбор пиломатериалов. Цены ниже чем у конкурентов. Рекомендую!",
    },
    {
      initials: "МИ",
      name: "Михаил Иванов",
      date: "05.03.2026",
      text: "Заказывал брус для строительства бани. Качество отличное, доставили вовремя.",
    },
  ];

  return (
    <>
      <HelmetProvider>
        <title>
          Prime-Forest - пиломатериалы от производителя в Москве и МО
        </title>
        <meta
          name="description"
          content="Prime-Forest - производство и продажа пиломатериалов в Москве и Московской области. Доставка по Москве и области."
        />
      </HelmetProvider>

      <div className="main-page">
        {/* ГЕРОЙ СЕКЦИЯ */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Пиломатериалы высшего качества для вашего дома
            </h1>

            {/* ФОРМА ОБРАТНОГО ЗВОНКА вместо поиска */}
            <div className="hero-callback">
              <form
                onSubmit={handleCallbackSubmit}
                className="callback-wrapper"
              >
                <h3 className="callback-title">Заказать обратный звонок</h3>
                <p className="callback-subtitle">
                  Оставьте заявку и мы перезвоним вам в течение 15 минут
                </p>

                <div className="callback-form-group">
                  <input
                    type="text"
                    placeholder="Ваше имя *"
                    className="callback-input"
                    value={callbackForm.name}
                    onChange={(e) =>
                      handleCallbackInputChange("name", e.target.value)
                    }
                    disabled={callbackStatus.loading}
                  />
                </div>

                <div className="callback-form-group">
                  <input
                    type="tel"
                    placeholder="Номер телефона *"
                    className="callback-input"
                    value={callbackForm.phone}
                    onChange={(e) =>
                      handleCallbackInputChange("phone", e.target.value)
                    }
                    disabled={callbackStatus.loading}
                  />
                </div>

                <button
                  type="submit"
                  className="callback-button"
                  disabled={callbackStatus.loading}
                >
                  {callbackStatus.loading ? (
                    <>
                      <span className="callback-spinner"></span>
                      Отправка...
                    </>
                  ) : (
                    "Перезвоните мне"
                  )}
                </button>

                {(callbackStatus.success || callbackStatus.error) && (
                  <div
                    className={`callback-message ${
                      callbackStatus.success ? "success" : "error"
                    }`}
                  >
                    <span>{callbackStatus.message}</span>
                    <button
                      type="button"
                      className="callback-message-close"
                      onClick={() =>
                        setCallbackStatus({
                          loading: false,
                          success: false,
                          error: false,
                          message: "",
                        })
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <p className="callback-notice">
                  Нажимая на кнопку, вы даете согласие на обработку персональных
                  данных
                </p>
              </form>
            </div>

            <div className="hero-features">
              <div className="hero-feature">
                <Percent size={20} />
                <span>Скидка от количества</span>
              </div>
              <div className="hero-feature">
                <Shield size={20} />
                <span>Гарантия качества</span>
              </div>
              <div className="hero-feature">
                <Clock size={20} />
                <span>Отгрузка за 12 часов</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images2.imgbox.com/03/06/nzoPgdfx_o.jpeg"
              alt="Пиломатериалы"
              className="hero-img"
              loading="lazy"
            />
          </div>
        </section>

        {/* Остальные секции без изменений */}
        <section className="advantages-section">
          <h2 className="section-title">
            Почему выбирают нас
            <span className="section-title-decoration" />
          </h2>
          <div className="advantages-grid">
            {advantages.map(({ icon: Icon, title, desc }, index) => (
              <div key={index} className="advantage-card">
                <div className="advantage-icon">
                  <Icon size={40} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="popular-products-section">
          <h2 className="section-title">
            Популярные товары
            <span className="section-title-decoration" />
          </h2>
          {loading ? (
            <div className="loading-container">
              <div className="loader" />
              <p>Загрузка популярных товаров...</p>
            </div>
          ) : popularProducts.length > 0 ? (
            <div className="products-grid">
              {popularProducts.map((product) => (
                <Link
                  to={`/products/${product.slug}`}
                  key={product.id}
                  className="product-link"
                >
                  <div className="product-card">
                    <div className="product-image-container">
                      <img
                        src={getImageUrl(product.main_image)}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300x200?text=Пиломатериал";
                        }}
                      />
                      <span className="product-badge popular">Хит продаж</span>
                    </div>
                    <div className="product-content">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-category">
                        {product.category_name ||
                          product.category ||
                          "Пиломатериалы"}
                      </p>
                      {renderProductPrices(product)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-popular-products">
              <p>В данный момент популярные товары отсутствуют</p>
              <Link to="/catalog" className="browse-catalog-link">
                Перейти в каталог
              </Link>
            </div>
          )}
        </section>

        <section className="applications-section">
          <h2 className="section-title">
            Применение пиломатериалов
            <span className="section-title-decoration" />
          </h2>
          <div className="applications-grid">
            {applications.map(({ path, icon: Icon, text }, index) => (
              <Link
                to={`/catalog?application=${path}`}
                key={index}
                className="application-card"
              >
                <Icon size={32} />
                <span>{text}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">{stats.products}+</div>
              <div className="stat-label">Товаров в наличии</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.customers}+</div>
              <div className="stat-label">Довольных клиентов</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.years}</div>
              <div className="stat-label">Лет на рынке</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.deliveries}+</div>
              <div className="stat-label">Доставок</div>
            </div>
          </div>
        </section>

        <section className="reviews-section">
          <h2 className="section-title">
            Отзывы наших клиентов
            <span className="section-title-decoration" />
          </h2>
          <div className="reviews-grid">
            {reviews.map(({ initials, name, date, text }, index) => (
              <div key={index} className="review-card">
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="review-text">"{text}"</p>
                <div className="review-author">
                  <div className="review-avatar-placeholder">{initials}</div>
                  <div>
                    <div className="review-name">{name}</div>
                    <div className="review-date">{date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="contact-section">
          <div className="contact-info">
            <h2>Свяжитесь с нами</h2>
            <p>
              Наши менеджеры помогут подобрать нужный материал и рассчитать
              стоимость
            </p>
            <div className="contact-details">
              <div className="contact-detail">
                <Phone size={20} />
                <a href="tel:+79990000629">8 (999) 000-06-29</a>
              </div>
              <div className="contact-detail">
                <Phone size={20} />
                <a href="tel:+79055983500">8 (905) 598-35-00</a>
              </div>
              <div className="contact-detail">
                <MapPin size={20} />
                <span>г. Москва, ш. Рублёвское, д. 151, к. 2</span>
              </div>
              <div className="contact-detail">
                <Clock size={20} />
                <span>Ежедневно: 9:00 - 18:00</span>
              </div>
            </div>
            <div className="contact-buttons">
              <Link to="/contacts" className="contact-btn primary">
                Контакты
              </Link>
            </div>
          </div>
          <div className="contact-map">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3Ab5bd6e0f4259e1283bf85db928e68523230beaf6ddf73fcb9c4dbb8a70b3e21a&source=constructor"
              width="100%"
              height="320"
              frameBorder="0"
              title="Карта проезда"
              loading="lazy"
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default MainPage;
