// src/components/Cart.js - Оптимизированная версия для продакшена
import React, { useEffect, useState, useContext, useRef } from "react"; // убрали useCallback
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, Eye } from "lucide-react";
import { CartContext } from "../CartContext";
import { AuthContext } from "../AuthContext";
import "../styles.scss";
import { notifyError, notifySuccess } from "../utils/notifications";
import { Helmet } from "react-helmet";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, loading, updateCartItem, removeFromCart } =
    useContext(CartContext); // убрали getItemQuantity

  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const timeouts = useRef({});

  useEffect(() => {
    // Убрали console.log для продакшена
    if (cartItems && Object.keys(cartItems).length > 0) {
      loadCartData();
    } else {
      setCartProducts([]);
      setTotalPrice(0);
      setLocalLoading(false);
      setInitialLoadDone(true);
    }
  }, [cartItems]);

  const loadCartData = async () => {
    if (!cartItems || Object.keys(cartItems).length === 0) {
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

      // Получаем уникальные ID цен
      const priceIds = [
        ...new Set(Object.keys(cartItems).map((key) => key.split("_")[1])),
      ];

      // Кэшируем цены
      const pricesCache = {};
      await Promise.all(
        priceIds.map(async (priceId) => {
          try {
            const response = await axios.get(
              `https://prime-forest.ru/api/product-prices/${priceId}/`
            );
            pricesCache[priceId] = response.data;
          } catch (error) {
            console.error(`Ошибка загрузки цены ${priceId}:`, error);
          }
        })
      );

      // Загружаем товары параллельно
      await Promise.all(
        Object.entries(cartItems).map(async ([key, quantity]) => {
          const [productId, priceId] = key.split("_").map(Number);
          const priceInfo = pricesCache[priceId];

          if (!priceInfo) return;

          try {
            const productResponse = await axios.get(
              `https://prime-forest.ru/api/products/${productId}/`
            );
            const product = productResponse.data;

            productsData.push({
              id: key,
              productId,
              productName: product.name,
              productImage: product.main_image,
              priceId,
              price: priceInfo.price,
              unitType: priceInfo.unit_type_short,
              unitCode: priceInfo.unit_type_code,
              quantity,
              quantityPerUnit: priceInfo.quantity_per_unit,
            });

            initialValues[key] = quantity.toString();
            total += priceInfo.price * quantity;
          } catch (error) {
            console.error(`Ошибка загрузки товара ${productId}:`, error);
          }
        })
      );

      setCartProducts(productsData);
      setInputValues(initialValues);
      setTotalPrice(total);
    } catch (error) {
      console.error("Error loading cart:", error);
      notifyError("Ошибка при загрузке корзины");
    } finally {
      setLocalLoading(false);
      setInitialLoadDone(true);
    }
  };

  const handleProductClick = (productId, e) => {
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

  const performUpdate = async (itemKey, productId, priceId, newQuantity) => {
    setUpdatingItems((prev) => ({ ...prev, [itemKey]: true }));

    const oldItem = cartProducts.find((item) => item.id === itemKey);
    const oldQuantity = oldItem?.quantity;

    try {
      setCartProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((item) =>
          item.id === itemKey ? { ...item, quantity: newQuantity } : item
        );
        setTotalPrice(
          updatedProducts.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          )
        );
        return updatedProducts;
      });

      await updateCartItem(productId, priceId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      notifyError("Ошибка при обновлении количества");

      // Откат при ошибке
      setCartProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((item) =>
          item.id === itemKey ? { ...item, quantity: oldQuantity } : item
        );
        setTotalPrice(
          updatedProducts.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          )
        );
        return updatedProducts;
      });

      setInputValues((prev) => ({
        ...prev,
        [itemKey]: oldQuantity?.toString() || "1",
      }));
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  const handleInputChange = (itemKey, value) => {
    setInputValues((prev) => ({ ...prev, [itemKey]: value }));
  };

  const handleInputBlur = (itemKey, value) => {
    const item = cartProducts.find((i) => i.id === itemKey);
    if (!item) return;

    const newQuantity = parseInt(value);
    if (
      !isNaN(newQuantity) &&
      newQuantity >= 1 &&
      newQuantity !== item.quantity
    ) {
      if (timeouts.current[itemKey]) clearTimeout(timeouts.current[itemKey]);
      performUpdate(itemKey, item.productId, item.priceId, newQuantity);
    } else {
      setInputValues((prev) => ({
        ...prev,
        [itemKey]: item.quantity.toString(),
      }));
    }
  };

  const handleButtonClick = async (itemKey, newQuantity) => {
    const item = cartProducts.find((i) => i.id === itemKey);
    if (!item) return;

    setInputValues((prev) => ({ ...prev, [itemKey]: newQuantity.toString() }));
    await performUpdate(itemKey, item.productId, item.priceId, newQuantity);
  };

  const handleRemove = async (itemKey, e) => {
    e.stopPropagation();

    const item = cartProducts.find((i) => i.id === itemKey);
    if (!item) return;

    setUpdatingItems((prev) => ({ ...prev, [itemKey]: true }));

    try {
      setCartProducts((prevProducts) => {
        const updatedProducts = prevProducts.filter((i) => i.id !== itemKey);
        setTotalPrice(
          updatedProducts.reduce((sum, i) => sum + i.price * i.quantity, 0)
        );
        return updatedProducts;
      });

      setInputValues((prev) => {
        const newValues = { ...prev };
        delete newValues[itemKey];
        return newValues;
      });

      await removeFromCart(item.productId, item.priceId);
      notifySuccess("Товар удален из корзины");
    } catch (error) {
      console.error("Error removing item:", error);
      notifyError("Ошибка при удалении товара");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  const handleCheckout = () => navigate("/checkout");

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `https://prime-forest.ru${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
  };

  if (loading || localLoading || !initialLoadDone) {
    return (
      <Box className="loading-container">
        <CircularProgress size={60} />
        <p>Загрузка корзины...</p>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Корзина - Prime-Forest</title>
      </Helmet>
      <div className="container cart">
        <h1 className="page-title">Корзина</h1>

        {!user && (
          <div className="guest-cart-notice">
            <p>
              ⚡ У вас гостевая корзина.{" "}
              <Link to="/login" state={{ from: "/cart" }}>
                Войдите
              </Link>{" "}
              или <Link to="/register">зарегистрируйтесь</Link>, чтобы после
              оформления заказа следить за его статусом 😊.
            </p>
          </div>
        )}

        {cartProducts.length === 0 ? (
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
              {cartProducts.map((item) => (
                <div
                  key={item.id}
                  className={`cart-item ${
                    updatingItems[item.id] ? "updating" : ""
                  }`}
                  onClick={(e) => handleProductClick(item.productId, e)}
                >
                  <div className="cart-item-image">
                    <img
                      src={getImageUrl(item.productImage)}
                      alt={item.productName}
                      onError={(e) => {
                        e.target.src = "/default-product.jpg";
                      }}
                    />
                    {updatingItems[item.id] && (
                      <div className="item-update-loader">
                        <CircularProgress size={24} />
                      </div>
                    )}
                    <div className="cart-item-view-overlay">
                      <Eye size={20} />
                    </div>
                  </div>

                  <div className="cart-item-info">
                    <h3 className="cart-item-title">{item.productName}</h3>

                    <div className="cart-item-price-info">
                      <span className="price-per-unit">
                        {item.price.toLocaleString()} ₽/{item.unitType}
                        {item.quantityPerUnit &&
                          ` (${item.quantityPerUnit} шт в упаковке)`}
                      </span>
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-counter">
                        <button
                          className="counter-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleButtonClick(item.id, item.quantity - 1);
                          }}
                          disabled={
                            item.quantity <= 1 || updatingItems[item.id]
                          }
                        >
                          <Minus size={16} />
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={
                            inputValues[item.id] || item.quantity.toString()
                          }
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleInputChange(item.id, e.target.value)
                          }
                          onBlur={(e) =>
                            handleInputBlur(item.id, e.target.value)
                          }
                          className="counter-input"
                          disabled={updatingItems[item.id]}
                        />

                        <button
                          className="counter-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleButtonClick(item.id, item.quantity + 1);
                          }}
                          disabled={updatingItems[item.id]}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <span className="item-total">
                        {(item.price * item.quantity).toLocaleString()} руб.
                      </span>

                      <button
                        className="remove-btn"
                        onClick={(e) => handleRemove(item.id, e)}
                        disabled={updatingItems[item.id]}
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
                <span>Позиций ({cartProducts.length})</span>
                <span>{totalPrice.toLocaleString()} руб.</span>
              </div>
              <div className="summary-row total">
                <span>Итого</span>
                <span>{totalPrice.toLocaleString()} руб.</span>
              </div>

              <button onClick={handleCheckout} className="checkout-btn">
                Оформить заказ
              </button>
            </div>

            <div className="delivery-info">
              <h3>🚚 Информация о доставке</h3>
              <p>
                Стоимость доставки рассчитывается индивидуально для каждого
                адреса
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
    </>
  );
};

export default Cart;
