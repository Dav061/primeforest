// src/components/ProductDetail.js
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { ShoppingCart, Minus, Plus, Ruler } from "lucide-react";
import { CartContext } from "../CartContext";
import { Helmet } from "react-helmet";
import PriceSelector from "./PriceSelector";
import "../styles.scss";
import { IconButton } from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(null);
  const navigate = useNavigate();

  const { addToCart, updateCartItem, removeFromCart, cartItems } =
    useContext(CartContext);

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  }, []);

  const getItemKey = useCallback(
    (productId, priceId) => `${productId}_${priceId}`,
    []
  );

  const getQuantityForPrice = useCallback(
    (productId, priceId) => {
      if (!priceId) return 0;
      const key = getItemKey(productId, priceId);
      return cartItems[key] || 0;
    },
    [cartItems, getItemKey]
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/${id}/`);
        const productData = response.data;

        const normalizedProduct = {
          ...productData,
          category: productData.category || "Не указана",
          wood_type: productData.wood_type || "Не указана",
          grade: productData.grade || "Не указан",
          width: productData.width,
          thickness: productData.thickness,
          length: productData.length,
          main_image: getImageUrl(
            productData.main_image || productData.images?.[0]?.image_url
          ),
          images:
            productData.images?.map((img) => ({
              ...img,
              image: getImageUrl(img.image_url),
            })) || [],
        };

        setProduct(normalizedProduct);
        setMainImage(normalizedProduct.main_image);
      } catch (error) {
        console.error("Error loading product:", error);
        setError("Ошибка при загрузке товара");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, getImageUrl]);

  const handleAddToCart = useCallback(async () => {
    if (!selectedPrice) {
      alert("Пожалуйста, выберите вариант цены");
      return;
    }
    await addToCart(product.id, 1, selectedPrice);
  }, [addToCart, product?.id, selectedPrice]);

  const handleIncrease = useCallback(async () => {
    if (!selectedPrice) return;
    const currentQuantity = getQuantityForPrice(product.id, selectedPrice.id);
    await updateCartItem(product.id, selectedPrice.id, currentQuantity + 1);
  }, [updateCartItem, product?.id, selectedPrice, getQuantityForPrice]);

  const handleDecrease = useCallback(async () => {
    if (!selectedPrice) return;
    const currentQuantity = getQuantityForPrice(product.id, selectedPrice.id);

    if (currentQuantity <= 1) {
      await removeFromCart(product.id, selectedPrice.id);
    } else {
      await updateCartItem(product.id, selectedPrice.id, currentQuantity - 1);
    }
  }, [
    removeFromCart,
    updateCartItem,
    product?.id,
    selectedPrice,
    getQuantityForPrice,
  ]);

  const handleGoToCart = useCallback(() => {
    navigate("/cart");
  }, [navigate]);

  const currentQuantity = useMemo(() => {
    if (!selectedPrice || !product) return 0;
    return getQuantityForPrice(product.id, selectedPrice.id);
  }, [product, selectedPrice, getQuantityForPrice]);

  const hasSizes = useMemo(
    () => product?.width || product?.thickness || product?.length,
    [product?.width, product?.thickness, product?.length]
  );

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={80} />
      </Box>
    );
  }

  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Товар не найден.</div>;

  return (
    <>
      <Helmet>
        <title>{product.name} - купить в Москве | Prime-Forest</title>
        <meta
          name="description"
          content={product.description?.substring(0, 160)}
        />
      </Helmet>

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
                loading="lazy"
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
                      loading="lazy"
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

              <PriceSelector
                prices={product.prices || []}
                selectedPriceId={selectedPrice?.id}
                onSelect={setSelectedPrice}
              />

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

                {hasSizes && (
                  <div className="meta-item sizes-section">
                    <span className="meta-label">
                      <Ruler size={16} style={{ marginRight: "4px" }} />
                      Размеры:
                    </span>
                    <div className="sizes-values">
                      {product.thickness && (
                        <span className="size-badge">
                          <span className="size-label">Толщина:</span>
                          <span className="size-value">
                            {product.thickness} мм
                          </span>
                        </span>
                      )}
                      {product.width && (
                        <span className="size-badge">
                          <span className="size-label">Ширина:</span>
                          <span className="size-value">{product.width} мм</span>
                        </span>
                      )}
                      {product.length && (
                        <span className="size-badge">
                          <span className="size-label">Длина:</span>
                          <span className="size-value">
                            {product.length} мм
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {currentQuantity === 0 ? (
                <button
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={!selectedPrice}
                >
                  <ShoppingCart size={20} />
                  Добавить в корзину
                </button>
              ) : (
                <div className="detail-cart-controls">
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
                      value={currentQuantity}
                      onChange={async (e) => {
                        const newValue = parseInt(e.target.value);
                        if (!isNaN(newValue) && selectedPrice) {
                          if (newValue <= 0) {
                            await removeFromCart(product.id, selectedPrice.id);
                          } else {
                            await updateCartItem(
                              product.id,
                              selectedPrice.id,
                              newValue
                            );
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
