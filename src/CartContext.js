import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { notifySuccess, notifyError } from "./utils/notifications";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState({}); // { productId: quantity }
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Загрузка корзины с сервера
  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setCartItems({});
      setCartCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/carts/my_cart/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCart(response.data);

      const itemsMap = {};
      let totalCount = 0;

      if (response.data?.items) {
        response.data.items.forEach((item) => {
          itemsMap[item.product.id] = item.quantity;
          totalCount += item.quantity;
        });
      }

      setCartItems(itemsMap);
      setCartCount(totalCount); // ← обязательно обновляем счетчик
    } catch (error) {
      console.error("Ошибка загрузки корзины:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Добавление товара в корзину
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      notifyError("Необходимо авторизоваться");
      return false;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/carts/add_to_cart/",
        { product_id: productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Обновляем локальное состояние
      const newQuantity = (cartItems[productId] || 0) + quantity;

      setCartItems((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));

      setCartCount((prev) => prev + quantity);

      // Обновляем полную корзину
      await fetchCart();

      return true;
    } catch (error) {
      console.error("Ошибка добавления в корзину:", error);
      notifyError("Не удалось добавить товар в корзину");
      return false;
    }
  };

  // Обновление количества товара
  const updateCartItem = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
      return;
    }

    try {
      // Ищем item в корзине
      const cartItem = cart?.items?.find(
        (item) => item.product.id === productId
      );

      if (cartItem) {
        await axios.patch(
          `http://127.0.0.1:8000/api/cartitems/${cartItem.id}/`,
          { quantity: newQuantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // Если нет в корзине, добавляем
        await addToCart(productId, newQuantity);
        return;
      }

      // Обновляем локальное состояние
      const oldQuantity = cartItems[productId] || 0;

      setCartItems((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));

      setCartCount((prev) => prev - oldQuantity + newQuantity);

      await fetchCart();
    } catch (error) {
      console.error("Ошибка обновления корзины:", error);
      notifyError("Не удалось обновить количество");
    }
  };

  // Удаление товара из корзины
  const removeFromCart = async (productId) => {
    try {
      const cartItem = cart?.items?.find(
        (item) => item.product.id === productId
      );

      if (cartItem) {
        await axios.delete(
          `http://127.0.0.1:8000/api/cartitems/${cartItem.id}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      // Обновляем локальное состояние
      const removedQuantity = cartItems[productId] || 0;

      const newCartItems = { ...cartItems };
      delete newCartItems[productId];

      setCartItems(newCartItems);
      setCartCount((prev) => prev - removedQuantity);

      await fetchCart();
      notifySuccess("Товар удален из корзины");
    } catch (error) {
      console.error("Ошибка удаления из корзины:", error);
      notifyError("Не удалось удалить товар");
    }
  };

  // Получение количества конкретного товара
  const getItemQuantity = (productId) => {
    return cartItems[productId] || 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        cartCount,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        getItemQuantity,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
