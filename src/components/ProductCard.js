// src/components/ProductCard.js - исправленная версия

import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { CardContent, Button, IconButton } from "@mui/material";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";
import "../styles.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, updateCartItem, removeFromCart, cartItems } =
    useContext(CartContext);

  const [selectedPrice, setSelectedPrice] = useState(null);

  // Мемоизация цены по умолчанию
  const defaultPrice = useMemo(() => {
    if (!product.prices?.length) return null;
    return product.prices.find((p) => p.is_default) || product.prices[0];
  }, [product.prices]);

  // Форматирование цены
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  }, []);

  useEffect(() => {
    if (!selectedPrice && defaultPrice) {
      setSelectedPrice(defaultPrice);
    }
  }, [defaultPrice, selectedPrice]);

  const getCurrentQuantity = useCallback(() => {
    if (!selectedPrice) return 0;
    const key = `${product.id}_${selectedPrice.id}`;
    return cartItems[key] || 0;
  }, [cartItems, product.id, selectedPrice]);

  const quantity = getCurrentQuantity();

  const handleAddToCart = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!selectedPrice) {
        alert("Выберите вариант цены");
        return;
      }
      await addToCart(product.id, 1, selectedPrice);
    },
    [addToCart, product.id, selectedPrice]
  );

  const handleIncrease = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!selectedPrice) return;
      await updateCartItem(product.id, selectedPrice.id, quantity + 1);
    },
    [updateCartItem, product.id, selectedPrice, quantity]
  );

  const handleDecrease = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!selectedPrice) return;
      if (quantity <= 1) {
        await removeFromCart(product.id, selectedPrice.id);
      } else {
        await updateCartItem(product.id, selectedPrice.id, quantity - 1);
      }
    },
    [removeFromCart, updateCartItem, product.id, selectedPrice, quantity]
  );

  const handleViewDetails = useCallback(
    (e) => {
      e?.stopPropagation();
      navigate(`/products/${product.id}`);
    },
    [navigate, product.id]
  );

  const handleGoToCart = useCallback(
    (e) => {
      e.stopPropagation();
      navigate("/cart");
    },
    [navigate]
  );

  const handlePriceSelect = useCallback((price) => {
    setSelectedPrice(price);
  }, []);

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  }, []);

  const renderPrices = useCallback(() => {
    if (!product.prices?.length) {
      return <div className="price-none">Цена не указана</div>;
    }

    if (product.prices.length === 1) {
      const price = product.prices[0];
      return (
        <div className="price-single">
          <span className="price-value">{formatPrice(price.price)} ₽</span>
          <span className="price-unit">/ {price.unit_type_short}</span>
          {price.quantity_per_unit && (
            <span className="price-pack"> ({price.quantity_per_unit} шт)</span>
          )}
        </div>
      );
    }

    // В ProductCard.js, обновите функцию renderPrices:

    return (
      <div className="price-multiple">
        <div className="price-buttons">
          {product.prices.map((price, index) => (
            <button
              key={`${product.id}_price_${price.id}_${price.price}_${index}`} // Более уникальный ключ
              className={`price-button ${
                selectedPrice?.id === price.id ? "active" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handlePriceSelect(price);
              }}
              type="button"
            >
              <span className="price-value">{formatPrice(price.price)}</span>
              <span className="price-unit">/{price.unit_type_short}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }, [
    product.prices,
    product.id,
    selectedPrice,
    formatPrice,
    handlePriceSelect,
  ]);

  // Мемоизация JSX для улучшения производительности
  const actionButtons = useMemo(() => {
    if (quantity === 0) {
      return (
        <Button
          variant="contained"
          size="medium"
          startIcon={<ShoppingCart size={18} />}
          onClick={handleAddToCart}
          className="cart-action-btn"
          disabled={!selectedPrice && product.prices?.length > 0}
          fullWidth
        >
          В корзину
        </Button>
      );
    }

    return (
      <div className="cart-controls">
        <div className="cart-counter">
          <IconButton
            size="small"
            onClick={handleDecrease}
            className="counter-btn"
          >
            <Minus size={16} />
          </IconButton>

          <input
            type="number"
            min="1"
            value={quantity}
            onClick={(e) => e.stopPropagation()}
            onChange={async (e) => {
              const newValue = parseInt(e.target.value);
              if (!isNaN(newValue) && selectedPrice) {
                if (newValue <= 0) {
                  await removeFromCart(product.id, selectedPrice.id);
                } else {
                  await updateCartItem(product.id, selectedPrice.id, newValue);
                }
              }
            }}
            className="counter-input"
          />

          <IconButton
            size="small"
            onClick={handleIncrease}
            className="counter-btn"
          >
            <Plus size={16} />
          </IconButton>
        </div>
        <Button
          variant="contained"
          size="medium"
          startIcon={<ShoppingCart size={18} />}
          onClick={handleGoToCart}
          className="cart-go-btn"
        >
          Перейти в корзину
        </Button>
      </div>
    );
  }, [
    quantity,
    handleAddToCart,
    handleDecrease,
    handleIncrease,
    handleGoToCart,
    selectedPrice,
    product.prices?.length,
    product.id,
    removeFromCart,
    updateCartItem,
  ]);

  return (
    <div className="product-card" onClick={handleViewDetails}>
      <div className="product-image-container">
        <img
          src={getImageUrl(product.main_image)}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = "/default-product.jpg";
          }}
        />
        {quantity > 0 && (
          <div className="product-quantity-badge">{quantity}</div>
        )}
      </div>

      <CardContent className="product-content">
        <h3 className="product-name">{product.name}</h3>

        {(product.wood_type || product.grade) && (
          <div className="product-wood-info">
            {product.wood_type && (
              <span className="wood-badge">{product.wood_type}</span>
            )}
            {product.grade && (
              <span className="wood-badge">Сорт {product.grade}</span>
            )}
          </div>
        )}

        <div className="product-prices-container">{renderPrices()}</div>

        <div className="product-actions">{actionButtons}</div>
      </CardContent>
    </div>
  );
};

export default ProductCard;
