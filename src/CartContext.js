// src/CartContext.js
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

export const GUEST_CART_KEY = "guestCart";
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const getAuthHeader = useCallback(
    () => ({
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),
    []
  );

  // Загрузка корзины из localStorage для гостя
  const loadGuestCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem(GUEST_CART_KEY);
      setCartItems(savedCart ? JSON.parse(savedCart) : {});
    } catch (error) {
      setCartItems({});
    }
  }, []);

  // Сохранение гостевой корзины
  const saveGuestCart = useCallback((items) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving guest cart:", error);
    }
  }, []);

  // Загрузка корзины с сервера
  const fetchUserCart = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/carts/my_cart/`,
        getAuthHeader()
      );

      setCart(response.data);

      const itemsMap = {};

      if (response.data?.items) {
        response.data.items.forEach((item) => {
          const priceId =
            item.selected_price?.id ||
            item.selected_price_info?.id ||
            (typeof item.selected_price === "number"
              ? item.selected_price
              : null);

          if (item.product && priceId) {
            itemsMap[`${item.product.id}_${priceId}`] = item.quantity;
          }
        });
      }

      setCartItems(itemsMap);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeader]);

  // Синхронизация гостевой корзины с сервером
  const syncGuestCartWithServer = useCallback(
    async (username) => {
      const token = localStorage.getItem("token");
      if (!token) return false;

      try {
        const savedCart = localStorage.getItem(GUEST_CART_KEY);
        if (!savedCart) return true;

        const guestItems = JSON.parse(savedCart);
        if (Object.keys(guestItems).length === 0) return true;

        setLoading(true);
        setIsSyncing(true);

        const currentCartResponse = await axios.get(
          `${API_URL}/api/carts/my_cart/`,
          getAuthHeader()
        );

        const currentItems = {};
        if (currentCartResponse.data?.items) {
          currentCartResponse.data.items.forEach((item) => {
            if (item.selected_price?.id) {
              currentItems[`${item.product.id}_${item.selected_price.id}`] =
                item.quantity;
            }
          });
        }

        // Объединяем корзины
        for (const [key, guestQuantity] of Object.entries(guestItems)) {
          const [productId, priceId] = key.split("_").map(Number);
          const currentQuantity = currentItems[key] || 0;

          await axios.post(
            `${API_URL}/api/carts/add_to_cart/`,
            {
              product_id: productId,
              quantity: currentQuantity + guestQuantity,
              selected_price_id: priceId,
            },
            getAuthHeader()
          );
        }

        localStorage.setItem(`guestCartSynced_${username}`, "true");
        localStorage.removeItem(GUEST_CART_KEY);

        const response = await axios.get(
          `${API_URL}/api/carts/my_cart/`,
          getAuthHeader()
        );

        const itemsMap = {};
        if (response.data?.items) {
          response.data.items.forEach((item) => {
            if (item.selected_price?.id) {
              itemsMap[`${item.product.id}_${item.selected_price.id}`] =
                item.quantity;
            }
          });
        }

        setCartItems(itemsMap);
        setCart(response.data);
        notifySuccess("Корзина синхронизирована");
        return true;
      } catch (error) {
        console.error("Error syncing cart:", error);
        notifyError("Ошибка при синхронизации корзины");
        return false;
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    },
    [getAuthHeader]
  );

  // Эффект для загрузки корзины
  useEffect(() => {
    if (isSyncing) return;

    if (user) {
      fetchUserCart();
    } else {
      loadGuestCart();
    }
  }, [user, isSyncing, fetchUserCart, loadGuestCart]);

  // Подсчет количества
  useEffect(() => {
    const totalCount = Object.values(cartItems).reduce(
      (sum, qty) => sum + (typeof qty === "number" ? qty : 0),
      0
    );
    setCartCount(totalCount);
  }, [cartItems]);

  // Добавление товара
  const addToCart = async (productId, quantity = 1, selectedPrice) => {
    if (!selectedPrice) {
      notifyError("Выберите вариант цены");
      return false;
    }

    const key = `${productId}_${selectedPrice.id}`;

    if (user) {
      try {
        await axios.post(
          `${API_URL}/api/carts/add_to_cart/`,
          {
            product_id: productId,
            quantity,
            selected_price_id: selectedPrice.id,
          },
          getAuthHeader()
        );

        setCartItems((prev) => ({
          ...prev,
          [key]: (prev[key] || 0) + quantity,
        }));

        notifySuccess("Товар добавлен в корзину");
        return true;
      } catch (error) {
        console.error("Error adding to cart:", error);
        notifyError("Не удалось добавить товар в корзину");
        return false;
      }
    } else {
      setCartItems((prev) => {
        const newItems = { ...prev, [key]: (prev[key] || 0) + quantity };
        saveGuestCart(newItems);
        return newItems;
      });
      notifySuccess("Товар добавлен в корзину");
      return true;
    }
  };

  // Обновление количества
  const updateCartItem = async (productId, priceId, newQuantity) => {
    const key = `${productId}_${priceId}`;

    if (newQuantity < 1) {
      await removeFromCart(productId, priceId);
      return;
    }

    if (user) {
      try {
        setCartItems((prev) => ({ ...prev, [key]: newQuantity }));

        const cartItem = cart?.items?.find(
          (item) =>
            item.product?.id === productId &&
            item.selected_price?.id === priceId
        );

        if (cartItem) {
          await axios.patch(
            `${API_URL}/api/cartitems/${cartItem.id}/`,
            { quantity: newQuantity },
            getAuthHeader()
          );
        } else {
          await axios.post(
            `${API_URL}/api/carts/add_to_cart/`,
            {
              product_id: productId,
              quantity: newQuantity,
              selected_price_id: priceId,
            },
            getAuthHeader()
          );
        }
      } catch (error) {
        console.error("Error updating cart:", error);
        notifyError("Не удалось обновить количество");
        await fetchUserCart();
        throw error;
      }
    } else {
      setCartItems((prev) => {
        const newItems = { ...prev, [key]: newQuantity };
        saveGuestCart(newItems);
        return newItems;
      });
    }
  };

  // Удаление товара
  const removeFromCart = async (productId, priceId) => {
    const key = `${productId}_${priceId}`;

    if (user) {
      try {
        setCartItems((prev) => {
          const newItems = { ...prev };
          delete newItems[key];
          return newItems;
        });

        const cartItem = cart?.items?.find(
          (item) =>
            item.product?.id === productId &&
            item.selected_price?.id === priceId
        );

        if (cartItem) {
          await axios.delete(
            `${API_URL}/api/cartitems/${cartItem.id}/`,
            getAuthHeader()
          );
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
        notifyError("Не удалось удалить товар");
        await fetchUserCart();
        throw error;
      }
    } else {
      setCartItems((prev) => {
        const newItems = { ...prev };
        delete newItems[key];
        saveGuestCart(newItems);
        return newItems;
      });
    }
  };

  // Получение количества
  const getItemQuantity = useCallback(
    (productId, priceId) => {
      if (!priceId) return 0;
      return cartItems[`${productId}_${priceId}`] || 0;
    },
    [cartItems]
  );

  // Очистка корзины
  const clearCart = async () => {
    if (user) {
      try {
        await axios.delete(`${API_URL}/api/carts/clear/`, getAuthHeader());
        setCartItems({});
        setCart(null);
        notifySuccess("Корзина очищена");
      } catch (error) {
        console.error("Error clearing cart:", error);
        notifyError("Ошибка при очистке корзины");
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
      setCartItems({});
      notifySuccess("Корзина очищена");
    }
  };

  const refreshCart = useCallback(() => {
    if (user) return fetchUserCart();
    return loadGuestCart();
  }, [user, fetchUserCart, loadGuestCart]);

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
        refreshCart,
        syncGuestCartWithServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
