import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { ShoppingCart } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/products/${id}/`
        );
        const productData = response.data;

        console.log("Product data from API:", productData); // Логируем полученные данные

        // Функция для создания полного URL изображения
        const getImageUrl = (imagePath) => {
          if (!imagePath) return "/default-product.jpg";
          if (imagePath.startsWith("http")) return imagePath;
          return `http://127.0.0.1:8000${
            imagePath.startsWith("/") ? "" : "/"
          }${imagePath}`;
        };

        // Нормализация данных продукта
        const normalizedProduct = {
          ...productData,
          category: productData.category || "Не указана",
          wood_type: productData.wood_type || "Не указана",
          grade: productData.grade || "Не указан",
          // Обрабатываем изображения
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

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/carts/add_to_cart/",
        {
          product_id: product.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Товар добавлен в корзину!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Ошибка при добавлении товара в корзину: " + error.message);
      }
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
                console.error("Error loading image:", e.target.src);
                e.target.src = "/default-product.jpg";
              }}
            />

            <div className="thumbnail-container">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img.image}
                  alt={`${product.name} ${index + 1}`}
                  className="thumbnail"
                  onClick={() => setMainImage(img.image)}
                  onError={(e) => {
                    console.error("Error loading thumbnail:", e.target.src);
                    e.target.src = "/default-product.jpg";
                  }}
                />
              ))}
            </div>
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

              {product.wood_type && (
                <div className="meta-item">
                  <span className="meta-label">Порода дерева:</span>
                  <span className="meta-value">{product.wood_type}</span>
                </div>
              )}

              {product.grade && (
                <div className="meta-item">
                  <span className="meta-label">Сорт:</span>
                  <span className="meta-value">{product.grade}</span>
                </div>
              )}
            </div>

            <button className="add-to-cart-btn" onClick={addToCart}>
              <ShoppingCart size={20} style={{ marginRight: "10px" }} />
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
