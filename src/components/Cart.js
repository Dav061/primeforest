import React, { useEffect, useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Для просмотра корзины необходимо авторизоваться");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/carts/my_cart/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCart(response.data);

        if (response.data.items && response.data.items.length > 0) {
          const total = response.data.items.reduce(
            (sum, item) => sum + (item.product?.price || 0) * item.quantity,
            0
          );
          setTotalPrice(total);
        }
      } catch (error) {
        console.error("Cart error:", error.response?.data || error.message);
        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            "Ошибка при загрузке корзины"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/cartitems/${itemId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter((item) => item.id !== itemId),
      }));

      setTotalPrice((prevTotal) => {
        const itemToRemove = cart.items.find((item) => item.id === itemId);
        return (
          prevTotal -
          (itemToRemove?.product?.price || 0) * itemToRemove?.quantity
        );
      });
    } catch (error) {
      console.error("Remove error:", error);
      setError("Ошибка при удалении товара: " + error.message);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/cartitems/${itemId}/`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      }));

      setTotalPrice((prevTotal) => {
        const itemToUpdate = cart.items.find((item) => item.id === itemId);
        const oldQuantity = itemToUpdate?.quantity || 0;
        const price = itemToUpdate?.product?.price || 0;
        return prevTotal - oldQuantity * price + newQuantity * price;
      });
    } catch (error) {
      console.error("Update quantity error:", error);
      setError("Ошибка при обновлении количества товара: " + error.message);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={80} />
      </Box>
    );
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="container cart">
      <h1 className="page-title">Ваша корзина</h1>

      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="empty-cart">
          <h2>Ваша корзина пуста</h2>
          <Link to="/products" className="btn primary">
            Перейти к товарам
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <h3>{item.product.name}</h3>
                <p>Цена: {item.product.price} руб.</p>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value) || 1)
                    }
                    min="1"
                    className="quantity-input"
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="item-total">
                  Сумма: {item.product.price * item.quantity} руб.
                </p>
                <button
                  className="btn remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Итого</h2>
            <p className="total-price">{totalPrice} руб.</p>
            <Link to="/checkout" className="btn checkout-btn">
              Оформить заказ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
