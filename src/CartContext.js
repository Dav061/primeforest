// src/CartContext.js - исправленная версия

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { notifySuccess, notifyError } from "./utils/notifications";

export const CartContext = createContext();

// Ключ для localStorage (только для товаров в корзине)
const GUEST_CART_KEY = "guestCart";

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState({}); // { productId: quantity }
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // УДАЛЯЕМ getSessionKey - она больше не нужна

  // Загрузка корзины из localStorage для гостя
  const loadGuestCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem(GUEST_CART_KEY);
      if (savedCart) {
        const items = JSON.parse(savedCart);
        setCartItems(items);

        // Подсчитываем общее количество
        const totalCount = Object.values(items).reduce(
          (sum, qty) => sum + qty,
          0
        );
        setCartCount(totalCount);

        setCart({ id: "guest", items: [] }); // Просто для совместимости
      } else {
        setCartItems({});
        setCartCount(0);
        setCart({ id: "guest", items: [] });
      }
    } catch (error) {
      console.error("Error loading guest cart:", error);
    }
  }, []);

  // Сохранение гостевой корзины в localStorage
  const saveGuestCart = (items) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
      setCartItems(items);

      const totalCount = Object.values(items).reduce(
        (sum, qty) => sum + qty,
        0
      );
      setCartCount(totalCount);
    } catch (error) {
      console.error("Error saving guest cart:", error);
    }
  };

  // Загрузка корзины с сервера для авторизованного пользователя
  const fetchUserCart = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/carts/my_cart/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true, // Добавляем для отправки cookies
        }
      );

      setCart(response.data);

      // Преобразуем в объект для быстрого доступа
      const itemsMap = {};
      let totalCount = 0;

      if (response.data?.items) {
        response.data.items.forEach((item) => {
          itemsMap[item.product.id] = item.quantity;
          totalCount += item.quantity;
        });
      }

      setCartItems(itemsMap);
      setCartCount(totalCount);
    } catch (error) {
      console.error("Ошибка загрузки корзины:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Синхронизация гостевой корзины с сервером после авторизации
  const syncGuestCartWithServer = useCallback(async () => {
    if (!user) return;

    const guestItems = cartItems;
    if (Object.keys(guestItems).length === 0) return;

    try {
      // Добавляем каждый товар из гостевой корзины на сервер
      for (const [productId, quantity] of Object.entries(guestItems)) {
        await axios.post(
          "http://127.0.0.1:8000/api/carts/add_to_cart/",
          { product_id: parseInt(productId), quantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }
        );
      }

      // Очищаем гостевую корзину
      localStorage.removeItem(GUEST_CART_KEY);

      // Загружаем актуальную корзину с сервера
      await fetchUserCart();

      notifySuccess("Корзина синхронизирована");
    } catch (error) {
      console.error("Error syncing cart:", error);
      notifyError("Ошибка при синхронизации корзины");
    }
  }, [user, cartItems, fetchUserCart]);

  // Загрузка корзины в зависимости от статуса пользователя
  useEffect(() => {
    if (user) {
      fetchUserCart();
    } else {
      loadGuestCart();
    }
  }, [user, fetchUserCart, loadGuestCart]);

  // Синхронизация при авторизации
  useEffect(() => {
    if (user && Object.keys(cartItems).length > 0) {
      const guestItems = localStorage.getItem(GUEST_CART_KEY);
      if (guestItems) {
        syncGuestCartWithServer();
      }
    }
  }, [user, cartItems, syncGuestCartWithServer]);

  // Добавление товара в корзину
  const addToCart = async (productId, quantity = 1) => {
    // Для авторизованных пользователей
    if (user) {
      try {
        await axios.post(
          "http://127.0.0.1:8000/api/carts/add_to_cart/",
          { product_id: productId, quantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }
        );

        // Обновляем локальное состояние без полной перезагрузки
        const newQuantity = (cartItems[productId] || 0) + quantity;

        setCartItems((prev) => ({
          ...prev,
          [productId]: newQuantity,
        }));

        setCartCount((prev) => prev + quantity);

        // Обновляем cart.items если он есть
        if (cart?.items) {
          const existingItemIndex = cart.items.findIndex(
            (item) => item.product.id === productId
          );

          if (existingItemIndex >= 0) {
            // Обновляем существующий item
            const updatedItems = [...cart.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
            };
            setCart({ ...cart, items: updatedItems });
          } else {
            // Добавляем новый item (нужны данные о продукте)
            // В этом случае лучше сделать полную перезагрузку
            await fetchUserCart();
          }
        }

        return true;
      } catch (error) {
        console.error("Ошибка добавления в корзину:", error);
        notifyError("Не удалось добавить товар в корзину");
        return false;
      }
    }
    // Для гостей
    else {
      const newItems = { ...cartItems };
      newItems[productId] = (newItems[productId] || 0) + quantity;
      saveGuestCart(newItems);
      notifySuccess("Товар добавлен в корзину");
      return true;
    }
  };

  // Обновление количества товара
  const updateCartItem = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
      return;
    }

    // Для авторизованных пользователей
    if (user) {
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
              withCredentials: true,
            }
          );

          // Обновляем локальное состояние без полной перезагрузки
          setCartItems((prev) => ({
            ...prev,
            [productId]: newQuantity,
          }));

          // Обновляем счетчик
          const oldQuantity = cartItems[productId] || 0;
          setCartCount((prev) => prev - oldQuantity + newQuantity);

          // Обновляем cart.items
          if (cart?.items) {
            const updatedItems = cart.items.map((item) =>
              item.product.id === productId
                ? { ...item, quantity: newQuantity }
                : item
            );
            setCart({ ...cart, items: updatedItems });
          }
        } else {
          await addToCart(productId, newQuantity);
        }
      } catch (error) {
        console.error("Ошибка обновления корзины:", error);
        notifyError("Не удалось обновить количество");
        throw error; // Пробрасываем ошибку для отката в компоненте
      }
    }
    // Для гостей
    else {
      const newItems = { ...cartItems };
      newItems[productId] = newQuantity;
      saveGuestCart(newItems);
    }
  };

  // Удаление товара из корзины
  const removeFromCart = async (productId) => {
    // Для авторизованных пользователей
    if (user) {
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
              withCredentials: true,
            }
          );
        }

        // Обновляем локальное состояние без полной перезагрузки
        const oldQuantity = cartItems[productId] || 0;

        const newCartItems = { ...cartItems };
        delete newCartItems[productId];
        setCartItems(newCartItems);

        setCartCount((prev) => prev - oldQuantity);

        // Обновляем cart.items
        if (cart?.items) {
          const updatedItems = cart.items.filter(
            (item) => item.product.id !== productId
          );
          setCart({ ...cart, items: updatedItems });
        }

        notifySuccess("Товар удален из корзины");
      } catch (error) {
        console.error("Ошибка удаления из корзины:", error);
        notifyError("Не удалось удалить товар");
        throw error; // Пробрасываем ошибку для отката в компоненте
      }
    }
    // Для гостей
    else {
      const newItems = { ...cartItems };
      delete newItems[productId];
      saveGuestCart(newItems);
      notifySuccess("Товар удален из корзины");
    }
  };

  // Получение количества конкретного товара
  const getItemQuantity = (productId) => {
    return cartItems[productId] || 0;
  };

  // Очистка корзины
  const clearCart = async () => {
    if (user) {
      try {
        await axios.delete("http://127.0.0.1:8000/api/carts/clear/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });
        setCartItems({});
        setCartCount(0);
        setCart({ ...cart, items: [] });
      } catch (error) {
        console.error("Ошибка очистки корзины:", error);
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
      setCartItems({});
      setCartCount(0);
    }
  };

  // Сброс гостевой корзины после авторизации
  const resetGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
    setCartItems({});
    setCartCount(0);
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
        clearCart,
        refreshCart: user ? fetchUserCart : loadGuestCart,
        syncGuestCartWithServer,
        resetGuestCart,
        // УДАЛЯЕМ getSessionKey из value
      }}
    >
      {children}
    </CartContext.Provider>
  );
};