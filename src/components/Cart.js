// src/components/Cart.js - исправленная версия
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, Eye } from "lucide-react";
import { CartContext } from "../CartContext";
import { AuthContext } from "../AuthContext";
import "../styles.scss";
import { notifyError, notifySuccess } from "../utils/notifications";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { cart, cartItems, loading, updateCartItem, removeFromCart } =
    useContext(CartContext);

  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Ref для хранения таймаутов
  const timeouts = useRef({});
  // Ref для хранения ссылок на инпуты
  const inputRefs = useRef({});

  // Загружаем данные о товарах
  useEffect(() => {
    const loadCartData = async () => {
      if (user) {
        // Для авторизованных - данные уже в cart из контекста
        if (cart?.items && cart.items.length > 0) {
          setCartProducts(cart.items);
          calculateTotal(cart.items);

          const initialValues = {};
          cart.items.forEach((item) => {
            initialValues[item.product.id] = item.quantity.toString();
          });
          setInputValues(initialValues);
          setLocalLoading(false);
          setInitialLoadDone(true);
        } else if (cart?.items && cart.items.length === 0) {
          // Корзина пуста
          setCartProducts([]);
          setTotalPrice(0);
          setInputValues({});
          setLocalLoading(false);
          setInitialLoadDone(true);
        } else {
          // Данные еще загружаются в контексте
        }
      } else {
        // Для гостей - загружаем данные о товарах из localStorage
        const productIds = Object.keys(cartItems);
        if (productIds.length === 0) {
          setCartProducts([]);
          setTotalPrice(0);
          setLocalLoading(false);
          setInitialLoadDone(true);
          return;
        }

        try {
          const productsData = [];
          let total = 0;
          const initialValues = {};

          for (const productId of productIds) {
            const response = await axios.get(
              `https://prime-forest.ru/api/products/${productId}/`
            );
            const product = response.data;
            const quantity = cartItems[productId];

            productsData.push({
              id: `guest-${productId}`,
              product: {
                id: product.id,
                name: product.name,
                price: product.price,
                main_image: product.main_image,
              },
              quantity: quantity,
            });

            initialValues[productId] = quantity.toString();
            total += product.price * quantity;
          }

          setCartProducts(productsData);
          setInputValues(initialValues);
          setTotalPrice(total);
        } catch (error) {
          console.error("Error fetching guest cart products:", error);
          notifyError("Ошибка при загрузке корзины");
        } finally {
          setLocalLoading(false);
          setInitialLoadDone(true);
        }
      }
    };

    loadCartData();
  }, [user, cart, cartItems]);

  // Отдельный эффект для обновления данных при изменении cart (для авторизованных)
  useEffect(() => {
    if (user && cart?.items && initialLoadDone) {
      setCartProducts(cart.items);
      calculateTotal(cart.items);

      const newInputValues = {};
      cart.items.forEach((item) => {
        newInputValues[item.product.id] = item.quantity.toString();
      });
      setInputValues(newInputValues);
    }
  }, [user, cart, initialLoadDone]);

  const calculateTotal = useCallback((items) => {
    const total = items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
    setTotalPrice(total);
  }, []);

  const performUpdate = async (productId, newQuantity, isGuest) => {
    setUpdatingItems((prev) => ({ ...prev, [productId]: true }));

    const oldProduct = cartProducts.find(
      (item) => item.product.id === productId
    );
    const oldQuantity = oldProduct?.quantity;

    try {
      setCartProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        calculateTotal(updatedProducts);
        return updatedProducts;
      });

      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      notifyError("Ошибка при обновлении количества");

      setCartProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: oldQuantity };
          }
          return item;
        });
        calculateTotal(updatedProducts);
        return updatedProducts;
      });

      setInputValues((prev) => ({
        ...prev,
        [productId]: oldQuantity?.toString() || "1",
      }));
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Функция для перехода на детальную страницу товара
  const handleProductClick = (productId, e) => {
    // Предотвращаем переход, если клик был по интерактивным элементам
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "BUTTON" ||
      e.target.closest(".counter-btn") ||
      e.target.closest(".remove-btn") ||
      e.target.closest(".counter-input")
    ) {
      return;
    }
    navigate(`/products/${productId}`);
  };

  const handleInputChange = (productId, value) => {
    setInputValues((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleInputBlur = (productId, value, isGuest) => {
    const newQuantity = parseInt(value);

    if (!isNaN(newQuantity) && newQuantity >= 1) {
      const currentProduct = cartProducts.find(
        (item) => item.product.id === productId
      );

      if (currentProduct && newQuantity !== currentProduct.quantity) {
        if (timeouts.current[productId]) {
          clearTimeout(timeouts.current[productId]);
        }

        performUpdate(productId, newQuantity, isGuest);
      }
    } else {
      const currentProduct = cartProducts.find(
        (item) => item.product.id === productId
      );
      if (currentProduct) {
        setInputValues((prev) => ({
          ...prev,
          [productId]: currentProduct.quantity.toString(),
        }));
      }
    }
  };

  const handleInputKeyDown = (e, productId, isGuest) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const handleButtonClick = async (productId, newQuantity, isGuest) => {
    if (timeouts.current[productId]) {
      clearTimeout(timeouts.current[productId]);
    }

    setInputValues((prev) => ({
      ...prev,
      [productId]: newQuantity.toString(),
    }));

    await performUpdate(productId, newQuantity, isGuest);
  };

  const handleRemove = async (productId, isGuest = false, e) => {
    e.stopPropagation(); // Предотвращаем переход на детальную страницу

    setUpdatingItems((prev) => ({ ...prev, [productId]: true }));

    const removedItem = cartProducts.find(
      (item) => item.product.id === productId
    );

    try {
      setCartProducts((prevProducts) => {
        const updatedProducts = prevProducts.filter(
          (item) => item.product.id !== productId
        );
        calculateTotal(updatedProducts);
        return updatedProducts;
      });

      setInputValues((prev) => {
        const newValues = { ...prev };
        delete newValues[productId];
        return newValues;
      });

      await removeFromCart(productId);
      // notifySuccess("Товар удален из корзины");
    } catch (error) {
      console.error("Error removing item:", error);
      notifyError("Ошибка при удалении товара");

      if (removedItem) {
        setCartProducts((prevProducts) => {
          const updatedProducts = [...prevProducts, removedItem];
          calculateTotal(updatedProducts);
          return updatedProducts;
        });

        setInputValues((prev) => ({
          ...prev,
          [productId]: removedItem.quantity.toString(),
        }));
      }
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ - теперь просто переходим на checkout для всех
  const handleCheckout = () => {
    navigate("/checkout");
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `https://prime-forest.ru${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
  };

  // Показываем загрузку, пока не завершится начальная загрузка
  if (loading || localLoading || !initialLoadDone) {
    return (
      <Box className="loading-container">
        <CircularProgress size={60} />
        <p>Загрузка корзины...</p>
      </Box>
    );
  }

  const itemsToShow = cartProducts;
  const isGuestCart = !user && Object.keys(cartItems).length > 0;

  return (
    <div className="container cart">
      <h1 className="page-title">Корзина</h1>

      {!user && (
        <div className="guest-cart-notice">
          <p>
            ⚡ Для сохранения истории заказа, пожалуйста,{" "}
            <Link to="/login" state={{ from: "/cart" }}>
              войдите
            </Link>{" "}
            или <Link to="/register">зарегистрируйтесь</Link>. Собранная корзина
            автоматически синхронизируется.
          </p>
        </div>
      )}

      {itemsToShow.length === 0 ? (
        <div className="empty-cart">
          <h2>Ваша корзина пуста</h2>
          <p>Добавьте товары из каталога, чтобы оформить заказ</p>
          <Link to="/products" className="btn primary">
            Перейти к товарам
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {itemsToShow.map((item) => (
              <div
                key={item.id}
                className={`cart-item ${
                  updatingItems[item.product.id] ? "updating" : ""
                }`}
                onClick={(e) => handleProductClick(item.product.id, e)}
                style={{ cursor: "pointer" }}
              >
                <div className="cart-item-image">
                  <img
                    src={getImageUrl(item.product?.main_image)}
                    alt={item.product?.name}
                    onError={(e) => {
                      e.target.src = "/default-product.jpg";
                    }}
                  />
                  {updatingItems[item.product.id] && (
                    <div className="item-update-loader">
                      <CircularProgress size={24} />
                    </div>
                  )}
                  {/* Добавляем иконку для указания возможности перехода */}
                  <div className="cart-item-view-overlay">
                    <Eye size={20} />
                  </div>
                </div>

                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.product?.name}</h3>
                  <div className="cart-item-price">
                    {item.product?.price} руб.
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-counter">
                      <button
                        className="counter-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleButtonClick(
                            item.product.id,
                            item.quantity - 1,
                            !user
                          );
                        }}
                        onMouseUp={(e) => e.target.blur()}
                        disabled={
                          item.quantity <= 1 || updatingItems[item.product.id]
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <input
                        ref={(el) => (inputRefs.current[item.product.id] = el)}
                        type="number"
                        min="1"
                        value={
                          inputValues[item.product.id] ||
                          item.quantity.toString()
                        }
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          handleInputChange(item.product.id, e.target.value)
                        }
                        onBlur={(e) =>
                          handleInputBlur(
                            item.product.id,
                            e.target.value,
                            !user
                          )
                        }
                        onKeyDown={(e) =>
                          handleInputKeyDown(e, item.product.id, !user)
                        }
                        className="counter-input"
                        disabled={updatingItems[item.product.id]}
                      />

                      <button
                        className="counter-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleButtonClick(
                            item.product.id,
                            item.quantity + 1,
                            !user
                          );
                        }}
                        onMouseUp={(e) => e.target.blur()}
                        disabled={updatingItems[item.product.id]}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <span className="item-total">
                      {(item.product?.price * item.quantity).toFixed(2)} руб.
                    </span>

                    <button
                      className="remove-btn"
                      onClick={(e) => handleRemove(item.product.id, !user, e)}
                      onMouseUp={(e) => e.target.blur()}
                      disabled={updatingItems[item.product.id]}
                      title="Удалить"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Ваш заказ</h2>
            <div className="summary-row">
              <span>Позиций ({itemsToShow.length})</span>
              <span>{totalPrice.toFixed(2)} руб.</span>
            </div>
            <div className="summary-row">
              <span>Доставка</span>
              <span>Рассчитывается менеджером</span>
            </div>
            <div className="summary-row total">
              <span>Итого</span>
              <span>{totalPrice.toFixed(2)} руб.</span>
            </div>

            {/* ИСПРАВЛЕННАЯ КНОПКА - теперь всегда "Оформить заказ" */}
            <button onClick={handleCheckout} className="checkout-btn">
              Оформить заказ
            </button>
          </div>

          <div className="delivery-info">
            <h3>🚚 Информация о доставке</h3>
            <p>
              Стоимость доставки рассчитывается индивидуально для каждого адреса
            </p>
            <div className="delivery-calculator">
              <p>
                <strong>Ориентировочная стоимость:</strong>
              </p>
              <p>• В пределах МКАД: от 1500 ₽</p>
              <p>• За МКАД (до 30 км): от 1000 ₽ + 80 ₽/км</p>
              <p>• Дальше 30 км: рассчитывается менеджером</p>
            </div>
            <p>
              <small>
                Точную стоимость просьба уточнять перед оформлением заказа
              </small>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
