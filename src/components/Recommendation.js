import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";

export const questions = [
  {
    id: 1,
    text: "Для какой области применения вам нужен материал?",
    options: [
      { id: 1, text: "Крыша", tags: ["крыша", "кровля"], icon: "🏠" },
      { id: 2, text: "Пол", tags: ["пол", "напольное"], icon: "🪵" },
      { id: 3, text: "Стены", tags: ["стены", "обшивка"], icon: "🧱" },
      { id: 4, text: "Мебель", tags: ["мебель", "мебельный"], icon: "🪑" },
      { id: 5, text: "Декорации", tags: ["декор", "отделка"], icon: "🎨" },
      { id: 6, text: "Сад/Ландшафт", tags: ["сад", "ландшафт"], icon: "🌳" },
    ],
  },
  {
    id: 2,
    text: "Какой тип древесины вы предпочитаете?",
    options: [
      {
        id: 1,
        text: "Хвойные породы",
        tags: ["сосна", "ель", "кедр", "лиственница"],
        icon: "🌲",
        description: "Прочные, устойчивые к влаге, с красивой текстурой",
      },
      {
        id: 2,
        text: "Лиственные породы",
        tags: ["дуб", "ясень", "берёза", "бук"],
        icon: "🍂",
        description: "Твёрдые, долговечные, с богатой текстурой",
      },
      {
        id: 3,
        text: "Экзотические породы",
        tags: ["красное", "тик", "венге", "махагон"],
        icon: "🌴",
        description: "Уникальные текстуры и цвета, высокая прочность",
      },
      {
        id: 4,
        text: "Не имеет значения",
        tags: [],
        icon: "❓",
      },
    ],
  },
  {
    id: 3,
    text: "Какой бюджет вы рассматриваете?",
    options: [
      {
        id: 1,
        text: "Эконом (до 1000 руб.)",
        maxPrice: 1000,
        icon: "💰",
      },
      {
        id: 2,
        text: "Средний (1000-5000 руб.)",
        minPrice: 1000,
        maxPrice: 5000,
        icon: "💵",
      },
      {
        id: 3,
        text: "Премиум (от 5000 руб.)",
        minPrice: 5000,
        icon: "💎",
      },
    ],
  },
  {
    id: 4,
    text: "Какой уровень обработки древесины вам нужен?",
    options: [
      {
        id: 1,
        text: "Черновая (для дальнейшей обработки)",
        tags: ["черновая", "необработанная"],
        icon: "⚒️",
      },
      {
        id: 2,
        text: "Стандартная (шлифованная)",
        tags: ["шлифованная", "стандарт"],
        icon: "🛠️",
      },
      {
        id: 3,
        text: "Премиум (полированная, тонированная)",
        tags: ["полированная", "тонированная"],
        icon: "✨",
      },
    ],
  },
  {
    id: 5,
    text: "Какой цвет древесины вы предпочитаете?",
    options: [
      {
        id: 1,
        text: "Светлые тона",
        tags: ["светлый", "белый", "белёный"],
        icon: "⚪",
      },
      {
        id: 2,
        text: "Натуральные древесные",
        tags: ["натуральный", "древесный"],
        icon: "🟤",
      },
      {
        id: 3,
        text: "Тёмные/богатые тона",
        tags: ["тёмный", "венге", "орех"],
        icon: "⚫",
      },
      {
        id: 4,
        text: "Яркие/нестандартные",
        tags: ["цветной", "тонированный"],
        icon: "🎨",
      },
    ],
  },
];

export const getRecommendations = async (userAnswers) => {
  try {
    const preparedAnswers = userAnswers.map((answer) => {
      const prepared = {};
      if (answer.tags) prepared.tags = answer.tags;
      if (answer.minPrice !== undefined) prepared.minPrice = answer.minPrice;
      if (answer.maxPrice !== undefined) prepared.maxPrice = answer.maxPrice;
      return prepared;
    });

    const response = await axios.post(
      "http://127.0.0.1:8000/api/recommendations/",
      {
        answers: preparedAnswers,
      }
    );

    return response.data || [];
  } catch (error) {
    console.error("Ошибка при получении рекомендаций:", error);
    return [];
  }
};

export const RecommendationModal = ({
  showModal,
  onClose,
  currentQuestionIndex,
  questions,
  answers,
  onAnswerSelect,
  recommendedProducts,
  onReset,
  allProducts,
  isLoadingProducts,
}) => {
  const modalRef = React.useRef();

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Функция для получения корректного URL изображения
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://127.0.0.1:8000${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-content recommendation-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        {recommendedProducts.length === 0 ? (
          <div className="recommendation-questions">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  }%`,
                }}
              ></div>
              <div className="progress-text">
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </div>
            </div>

            {questions[currentQuestionIndex] && (
              <>
                <h2 className="question-title">
                  {questions[currentQuestionIndex].text}
                </h2>
                <div className="options-container">
                  {questions[currentQuestionIndex].options.map((option) => (
                    <button
                      key={option.id}
                      className="option-btn"
                      onClick={() => onAnswerSelect(option)}
                    >
                      {option.icon && (
                        <span className="option-icon">{option.icon}</span>
                      )}
                      <span className="option-text">{option.text}</span>
                      {option.description && (
                        <span className="option-description">
                          {option.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {answers.length > 0 && (
                  <button
                    className="back-btn"
                    onClick={() => onAnswerSelect("back")}
                  >
                    ← Назад
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="recommendation-results">
            <div className="results-header">
              <h2>Мы подобрали для вас лучшие варианты</h2>
              {recommendedProducts.length > 0 ? (
                <>
                  <p className="results-subtitle">
                    На основе ваших предпочтений мы нашли наиболее подходящие
                    товары
                  </p>
                  <div className="recommended-products">
                    {recommendedProducts.map((product) => {
                      // Получаем первое доступное изображение
                      const productImage =
                        product.images?.[0]?.image || product.main_image;
                      const imageUrl = getImageUrl(productImage);

                      return (
                        <div
                          key={product.id}
                          className="recommended-product-card"
                        >
                          <div className="product-match-percent">
                            Соответствие: {product.match_percent || 0}%
                            <div className="match-bar">
                              <div
                                className="match-fill"
                                style={{
                                  width: `${product.match_percent || 0}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="product-image-container">
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="product-image"
                              onError={(e) => {
                                console.error(
                                  `Error loading image: ${imageUrl}`
                                );
                                e.target.src = "/default-product.jpg";
                              }}
                            />
                          </div>
                          <div className="product-info">
                            <h3 className="product-title">{product.name}</h3>
                            <p className="product-price">
                              {parseFloat(product.price).toFixed(2)} руб.
                            </p>
                            <p className="product-category">
                              Категория: {product.category || "Не указана"}
                            </p>
                            <Link
                              to={`/products/${product.id}`}
                              className="view-product-btn"
                              onClick={() => {
                                sessionStorage.setItem(
                                  "lastRecommendations",
                                  JSON.stringify(recommendedProducts)
                                );
                                onClose();
                              }}
                            >
                              Подробнее о товаре
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="results-actions">
                    <button className="restart-btn" onClick={onReset}>
                      Пройти опрос заново
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-results-placeholder">
                  <p className="no-results-message">
                    К сожалению, товаров по вашим предпочтениям не нашлось.
                    Пожалуйста, попробуйте изменить критерии поиска.
                  </p>
                  <button className="restart-btn" onClick={onReset}>
                    Начать заново
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
