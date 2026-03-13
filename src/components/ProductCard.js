import React, { useContext } from "react";
import { Card, CardContent, Button, IconButton } from "@mui/material";
import { ShoppingCart, Eye, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";
import "../styles.scss";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, updateCartItem, getItemQuantity, removeFromCart } =
    useContext(CartContext);
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const success = await addToCart(product.id, 1);
    if (success) {
      // Уведомление уже показывается в addToCart
    }
  };

  const handleIncrease = async (e) => {
    e.stopPropagation();
    await updateCartItem(product.id, quantity + 1);
  };

  const handleDecrease = async (e) => {
    e.stopPropagation();
    if (quantity <= 1) {
      // Если количество 1 - удаляем товар
      await removeFromCart(product.id);
      // Уведомление показывается в removeFromCart
    } else {
      // Иначе уменьшаем количество
      await updateCartItem(product.id, quantity - 1);
    }
  };

  const handleViewDetails = (e) => {
    if (e) e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  const handleGoToCart = (e) => {
    e.stopPropagation();
    navigate("/cart");
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `https://prime-forest.ru${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
  };

  return (
    <Card className="product-card" onClick={(e) => handleViewDetails(e)}>
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
        {/* <div className="product-category">{product.category}</div> */}

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
            <div className="cart-controls">
              <div className="cart-counter">
                <IconButton
                  size="small"
                  onClick={handleDecrease}
                  className="counter-btn"
                  // Убираем disabled - кнопка всегда активна
                >
                  <Minus size={16} />
                </IconButton>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onChange={async (e) => {
                    const newValue = parseInt(e.target.value);
                    if (!isNaN(newValue)) {
                      if (newValue <= 0) {
                        // Если ввели 0 или меньше - удаляем
                        await removeFromCart(product.id);
                      } else {
                        await updateCartItem(product.id, newValue);
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
                Перейти
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
