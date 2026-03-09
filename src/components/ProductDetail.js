import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { CartContext } from "../CartContext";
import "../styles.scss";
import { IconButton } from "@mui/material";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const navigate = useNavigate();

  const { addToCart, updateCartItem, getItemQuantity } =
    useContext(CartContext);
  const quantity = getItemQuantity(parseInt(id));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `https://prime-forest.ru/api/products/${id}/`
        );
        const productData = response.data;

        const getImageUrl = (imagePath) => {
          if (!imagePath) return "/default-product.jpg";
          if (imagePath.startsWith("http")) return imagePath;
          return `https://prime-forest.ru${
            imagePath.startsWith("/") ? "" : "/"
          }${imagePath}`;
        };

        const normalizedProduct = {
          ...productData,
          category: productData.category || "Не указана",
          wood_type: productData.wood_type || "Не указана",
          grade: productData.grade || "Не указан",
          main_image: getImageUrl(
            productData.main_image || productData.images?.[0]?.image
          ),
          images:
            productData.images?.map((img) => ({
              ...img,
              image: getImageUrl(img.image),
            })) || [],
        };

        setProduct(normalizedProduct);
        setMainImage(normalizedProduct.main_image);
      } catch (error) {
        console.error("Error loading product:", error);
        setError("Ошибка при загрузке товара: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product.id, 1);
  };

  const handleIncrease = async () => {
    await updateCartItem(product.id, quantity + 1);
  };

  const handleDecrease = async () => {
    await updateCartItem(product.id, quantity - 1);
  };

  const handleGoToCart = () => {
    navigate("/cart");
  };

  if (loading)
    return (
      <Box className="loading-container">
        <CircularProgress size={80} />
      </Box>
    );

  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Товар не найден.</div>;

  return (
    <div className="product-detail">
      <Button
        variant="contained"
        onClick={() => navigate(-1)}
        className="back-button"
      >
        Назад
      </Button>

      <div className="product-card">
        <div className="product-content">
          <div className="product-images">
            <img
              src={mainImage}
              alt={product.name}
              className="main-image"
              onError={(e) => {
                e.target.src = "/default-product.jpg";
              }}
            />

            {product.images.length > 0 && (
              <div className="thumbnail-container">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.image}
                    alt={`${product.name} ${index + 1}`}
                    className={`thumbnail ${
                      mainImage === img.image ? "active" : ""
                    }`}
                    onClick={() => setMainImage(img.image)}
                    onError={(e) => {
                      e.target.src = "/default-product.jpg";
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-description">
              {product.description || "Описание отсутствует"}
            </p>

            <div className="product-price">
              {product.price
                ? `${parseFloat(product.price).toFixed(2)} руб.`
                : "Цена не указана"}
            </div>

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Категория:</span>
                <span className="meta-value">{product.category}</span>
              </div>

              {product.wood_type && product.wood_type !== "Не указана" && (
                <div className="meta-item">
                  <span className="meta-label">Порода дерева:</span>
                  <span className="meta-value">{product.wood_type}</span>
                </div>
              )}

              {product.grade && product.grade !== "Не указан" && (
                <div className="meta-item">
                  <span className="meta-label">Сорт:</span>
                  <span className="meta-value">{product.grade}</span>
                </div>
              )}
            </div>

            {quantity === 0 ? (
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                <ShoppingCart size={20} />
                Добавить в корзину
              </button>
            ) : (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
