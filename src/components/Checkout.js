// src/components/Checkout.js - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ

import React, { useState, useContext } from "react";
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

// Константы
const PHONE_REGEX =
  /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Состояния формы
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!address || !phoneNumber) {
      notifyError("Пожалуйста, заполните обязательные поля: адрес и телефон");
      return false;
    }

    if (!PHONE_REGEX.test(phoneNumber)) {
      notifyError("Пожалуйста, введите корректный номер телефона");
      return false;
    }

    if (Object.keys(cartItems).length === 0) {
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

  const isFormValid = address && phoneNumber;

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
