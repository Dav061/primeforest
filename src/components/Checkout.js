// src/components/Checkout.js - исправленная версия
import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { CartContext } from "../CartContext";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Helmet } from "react-helmet";
import "../styles.scss";
import { notifySuccess, notifyError } from "../utils/notifications";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Обязательные поля (только адрес и телефон)
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Необязательные поля
  const [comment, setComment] = useState("");

  // Для гостей (необязательные)
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    // Проверяем только обязательные поля (адрес и телефон)
    if (!address || !phoneNumber) {
      notifyError("Пожалуйста, заполните обязательные поля: адрес и телефон");
      return;
    }

    // Валидация телефона
    const phoneRegex =
      /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    if (!phoneRegex.test(phoneNumber)) {
      notifyError("Пожалуйста, введите корректный номер телефона");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Проверяем корзину
      if (!user && Object.keys(cartItems).length === 0) {
        notifyError("Корзина пуста");
        return;
      }

      // Базовая структура заказа - только нужные поля
      const orderData = {
        address: address.trim(),
        phone_number: phoneNumber.trim(),
        comment: comment.trim() || null,
      };

      // Для гостей
      if (!user) {
        orderData.guest_name = guestName.trim() || "Гость";
        if (guestEmail.trim()) {
          orderData.guest_email = guestEmail.trim();
        }

        // Добавляем товары из корзины
        orderData.cart_items = Object.entries(cartItems).map(
          ([productId, quantity]) => ({
            product_id: parseInt(productId),
            quantity: quantity,
          })
        );
      }

      const headers = user
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
        : {};

      const orderResponse = await axios.post(
        "https://prime-forest.ru/api/orders/",
        orderData,
        { headers }
      );

      // Очищаем корзину
      clearCart();

      notifySuccess(`✅ Заказ #${orderResponse.data.id} успешно оформлен!`);

      navigate("/order-success", {
        state: {
          orderId: orderResponse.data.id,
          isGuest: !user,
          phoneNumber: phoneNumber,
          email: guestEmail || user?.email,
        },
      });
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);

      let errorMessage = "Произошла ошибка при оформлении заказа";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      notifyError(`❌ ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Проверяем только обязательные поля
  const isFormValid = address && phoneNumber;

  return (
    <>
      <Helmet>
        <title>Оформление заказа - Prime-Forest | Пиломатериалы с доставкой</title>
        <meta name="description" content="Оформление заказа на пиломатериалы. Доставка по Москве и Московской области. Доска, брус, OSB, фанера, вагонка, имитация бруса." />
      </Helmet>
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

            {/* Номер телефона - обязателен */}
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

          {/* Адрес доставки - обязателен */}
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

          {/* Комментарий - необязательный */}
          <div className="form-section">
            <h2>Комментарий к заказу</h2>

            <TextField
              label="Комментарий"
              fullWidth
              margin="normal"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Укажите дополнительную информацию: подъезд, домофон, пожелания по доставке и т.д."
              multiline
              rows={3}
            />
          </div>

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
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;
