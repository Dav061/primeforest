// src/components/Checkout.js
import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { CartContext } from "../CartContext";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { HelmetProvider } from "react-helmet-async";
import "../styles.scss";
import { notifySuccess, notifyError } from "../utils/notifications";
import { sendOrderEmail } from "../services/emailService";

const PHONE_REGEX =
  /^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, clearCart, cart, refreshCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartProductsData, setCartProductsData] = useState([]);

  // Загрузка данных о товарах из корзины
  useEffect(() => {
    if (cart?.items && cart.items.length > 0) {
      const products = cart.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.selected_price?.price || 0,
        unitShort: item.selected_price?.unit_type_short || "шт",
        total: (item.selected_price?.price || 0) * item.quantity,
      }));
      setCartProductsData(products);
    } else if (!user && Object.keys(cartItems).length > 0) {
      const fetchGuestProducts = async () => {
        const productsList = [];
        for (const [key, quantity] of Object.entries(cartItems)) {
          const [productId, priceId] = key.split("_").map(Number);
          try {
            const response = await axios.get(
              `${API_URL}/api/products/${productId}/`
            );
            const product = response.data;
            const selectedPrice = product.prices?.find((p) => p.id === priceId);
            productsList.push({
              id: productId,
              name: product.name,
              quantity: quantity,
              price: selectedPrice?.price || 0,
              unitShort: selectedPrice?.unit_type_short || "шт",
              total: (selectedPrice?.price || 0) * quantity,
            });
          } catch (err) {
            console.error(`Ошибка загрузки товара ${productId}:`, err);
          }
        }
        setCartProductsData(productsList);
      };
      fetchGuestProducts();
    }
  }, [cart, cartItems, user]);

  // Обновление корзины при монтировании страницы
  useEffect(() => {
    if (user) {
      refreshCart();
    }
  }, [user, refreshCart]);

  // Обновление корзины при возврате на страницу (из корзины или другой вкладки)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refreshCart();
        console.log(
          "🔄 Обновление корзины при возврате на страницу оформления"
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        refreshCart();
        console.log("🔄 Обновление корзины при возврате на вкладку");
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, refreshCart]);

  const calculateTotalPrice = () => {
    return cartProductsData.reduce((sum, item) => sum + item.total, 0);
  };

  const formatItemsList = () => {
    return cartProductsData
      .map(
        (item) =>
          `${item.name} - ${item.quantity} ${item.unitShort} × ${item.price} руб. = ${item.total} руб.`
      )
      .join("\n");
  };

  const validateForm = () => {
    if (!address || !phoneNumber) {
      notifyError("Пожалуйста, заполните обязательные поля: адрес и телефон");
      return false;
    }

    if (!PHONE_REGEX.test(phoneNumber)) {
      notifyError("Пожалуйста, введите корректный номер телефона");
      return false;
    }

    if (
      Object.keys(cartItems).length === 0 &&
      (!cart?.items || cart.items.length === 0)
    ) {
      notifyError("Корзина пуста");
      return false;
    }

    return true;
  };

  const prepareOrderData = () => {
    const baseData = {
      address: address.trim(),
      phone_number: phoneNumber.trim(),
      comment: comment.trim() || null,
    };

    if (!user) {
      return {
        ...baseData,
        guest_name: guestName.trim() || "Гость",
        ...(guestEmail.trim() && { guest_email: guestEmail.trim() }),
        cart_items: Object.entries(cartItems).map(([key, quantity]) => {
          const [productId, priceId] = key.split("_").map(Number);
          return {
            product_id: productId,
            quantity,
            selected_price_id: priceId,
          };
        }),
      };
    }

    return baseData;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const orderData = prepareOrderData();
      const headers = user
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
        : {};

      const { data } = await axios.post(`${API_URL}/api/orders/`, orderData, {
        headers,
      });

      // 🔥 ЦЕЛЬ: ЗАКАЗ ОФОРМЛЕН
      if (window.ym) {
        window.ym(109693335, "reachGoal", "order_completed");
        console.log("🎯 Цель: Заказ оформлен");
      }

      const totalPrice = calculateTotalPrice();
      const itemsList = formatItemsList();

      const emailResult = await sendOrderEmail({
        name: user ? user.username : guestName || "Гость",
        email: user ? user.email : guestEmail || "Не указан",
        phone: phoneNumber,
        address: address,
        comment: comment || "Нет комментария",
        orderId: data.id,
        itemsList: itemsList || "Нет товаров",
        totalPrice: totalPrice,
      });

      if (emailResult.success) {
        console.log("✅ Уведомление отправлено на почту");
      } else {
        console.warn("⚠️ Не удалось отправить уведомление:", emailResult.error);
      }

      await clearCart();
      notifySuccess(`✅ Заказ #${data.id} успешно оформлен!`);

      navigate("/order-success", {
        state: {
          orderId: data.id,
          isGuest: !user,
          phoneNumber,
          email: guestEmail || user?.email,
        },
      });
    } catch (error) {
      const errorMessage = error.response?.data
        ? typeof error.response.data === "object"
          ? Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")
          : error.response.data.error ||
            error.response.data.detail ||
            "Ошибка при оформлении заказа"
        : error.message || "Ошибка при оформлении заказа";

      notifyError(`❌ ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = address && phoneNumber && cartProductsData.length > 0;

  return (
    <>
      <HelmetProvider>
        <title>Оформление заказа - Prime-Forest</title>
      </HelmetProvider>

      <div className="checkout-page">
        <div className="checkout-header">
          <Button
            variant="contained"
            onClick={() => navigate("/cart")}
            className="back-to-cart-btn"
            startIcon={<ArrowBackIcon />}
          >
            Назад
          </Button>
          <h1 className="checkout-title">Оформление заказа</h1>
        </div>

        <div className="checkout-form">
          <div className="form-section">
            <h2>Контактные данные</h2>

            <TextField
              label="Номер телефона"
              fullWidth
              margin="normal"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              required
              error={error && !phoneNumber}
            />

            {user && (
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={user.email || ""}
                disabled
                helperText="Ваш email из профиля"
              />
            )}

            {!user && (
              <>
                <TextField
                  label="Ваше имя"
                  fullWidth
                  margin="normal"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Как к вам обращаться?"
                  helperText="Необязательно"
                />

                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Почта"
                  helperText="Необязательно"
                />
              </>
            )}
          </div>

          <div className="form-section">
            <h2>Адрес доставки</h2>

            <TextField
              label="Адрес доставки"
              fullWidth
              margin="normal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Город, улица, дом, квартира"
              required
              multiline
              rows={2}
              error={error && !address}
            />
          </div>

          <div className="form-section">
            <h2>Комментарий к заказу</h2>

            <TextField
              label="Комментарий"
              fullWidth
              margin="normal"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Укажите дополнительную информацию"
              multiline
              rows={3}
            />
          </div>

          {cartProductsData.length > 0 && (
            <div className="form-section">
              <h2>Ваш заказ</h2>
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "15px",
                  borderRadius: "8px",
                }}
              >
                {cartProductsData.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "10px",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "5px",
                    }}
                  >
                    <strong>{item.name}</strong>
                    <br />
                    {item.quantity} {item.unitShort} × {item.price} руб. ={" "}
                    {item.total} руб.
                  </div>
                ))}
                <div
                  style={{
                    marginTop: "10px",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  Итого: {calculateTotalPrice()} руб.
                </div>
              </div>
            </div>
          )}

          <div className="checkout-actions">
            <Button
              onClick={handleCheckout}
              disabled={loading || !isFormValid}
              variant="contained"
              color="primary"
              className="submit-order-btn"
              fullWidth
              size="large"
            >
              {loading ? "Оформление..." : "Подтвердить заказ"}
            </Button>
          </div>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;
