import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus } from "lucide-react";
import { CartContext } from "../CartContext"; // ← добавить импорт
import "../styles.scss";
import { notifySuccess, notifyError } from "../utils/notifications";

const Cart = () => {
  const { refreshCart } = useContext(CartContext); // ← используем для обновления
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Для просмотра корзины необходимо авторизоваться");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "https://prime-forest.ru/api/carts/my_cart/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(response.data);
      calculateTotal(response.data);
    } catch (error) {
      console.error("Cart error:", error);
      setError("Ошибка при загрузке корзины");
      notifyError("❌ Не удалось загрузить корзину");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const calculateTotal = (cartData) => {
    if (cartData?.items?.length > 0) {
      const total = cartData.items.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      );
      setTotalPrice(total);
    } else {
      setTotalPrice(0);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const itemToRemove = cart.items.find((item) => item.id === itemId);
      const productName = itemToRemove?.product?.name || "Товар";

      await axios.delete(`https://prime-forest.ru/api/cartitems/${itemId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const updatedCart = {
        ...cart,
        items: cart.items.filter((item) => item.id !== itemId),
      };
      setCart(updatedCart);
      calculateTotal(updatedCart);

      // Обновляем контекст
      if (refreshCart) {
        await refreshCart();
      }

      notifySuccess(`🗑️ "${productName}" удален из корзины`);
    } catch (error) {
      console.error("Remove error:", error);
      notifyError("❌ Ошибка при удалении товара");
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.patch(
        `https://prime-forest.ru/api/cartitems/${itemId}/`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedCart = {
        ...cart,
        items: cart.items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      };
      setCart(updatedCart);
      calculateTotal(updatedCart);

      // Обновляем контекст
      if (refreshCart) {
        await refreshCart();
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      notifyError("❌ Ошибка при обновлении количества");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `https://prime-forest.ru${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={60} />
        <p>Загрузка корзины...</p>
      </Box>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="container cart">
      <h1 className="page-title">Корзина</h1>

      {!cart?.items?.length ? (
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
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={getImageUrl(item.product?.main_image)}
                    alt={item.product?.name}
                    onError={(e) => {
                      e.target.src = "/default-product.jpg";
                    }}
                  />
                </div>

                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.product?.name}</h3>
                  <div className="cart-item-price">
                    {item.product?.price} руб.
                  </div>

                  <div className="cart-item-details">
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <span className="item-total">
                      {(item.product?.price * item.quantity).toFixed(2)} руб.
                    </span>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
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
              <span>Товары ({cart.items.length})</span>
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
            <Link to="/checkout" className="checkout-btn">
              Оформить заказ
            </Link>
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
                Точная стоимость просьба уточнять перед оформлением заказа
              </small>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
