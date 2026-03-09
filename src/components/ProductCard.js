import React, { useContext, useState } from "react";
import { Card, CardContent, Button, IconButton } from "@mui/material";
import { ShoppingCart, Eye, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";
import "../styles.scss";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, updateCartItem, getItemQuantity } =
    useContext(CartContext);
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await addToCart(product.id, 1);
  };

  const handleIncrease = async (e) => {
    e.stopPropagation();
    await updateCartItem(product.id, quantity + 1);
  };

  const handleDecrease = async (e) => {
    e.stopPropagation();
    await updateCartItem(product.id, quantity - 1);
  };

  const handleViewDetails = () => {
    navigate(`/products/${product.id}`);
  };

  const handleGoToCart = (e) => {
    e.stopPropagation();
    navigate("/cart");
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://127.0.0.1:8000${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
  };

  return (
    <Card className="product-card" onClick={handleViewDetails}>
      <div className="product-image-container">
        <img
          src={getImageUrl(product.main_image)}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = "/default-product.jpg";
          }}
        />
        {quantity > 0 && (
          <div className="product-quantity-badge">{quantity} шт</div>
        )}
      </div>

      <CardContent className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-category">{product.category}</div>

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

        <div className="product-price">
          {product.price ? `${product.price} руб.` : "Цена по запросу"}
        </div>

        <div className="product-actions">
          {quantity === 0 ? (
            // Кнопка для добавления (когда товара нет в корзине)
            <Button
              variant="contained"
              size="medium"
              startIcon={<ShoppingCart size={18} />}
              onClick={handleAddToCart}
              className="cart-action-btn"
              fullWidth
            >
              В корзину
            </Button>
          ) : (
            // Блок с счетчиком и отдельной кнопкой перехода (всегда видимой)
            <div className="cart-controls">
              <div className="cart-counter">
                <IconButton
                  size="small"
                  onClick={handleDecrease}
                  className="counter-btn"
                >
                  <Minus size={16} />
                </IconButton>
                <span className="counter-value">{quantity}</span>
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
                Перейти
              </Button>
            </div>
          )}

          <Button
            variant="outlined"
            size="medium"
            startIcon={<Eye size={18} />}
            onClick={handleViewDetails}
            className="details-btn"
          >
            Детали
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
