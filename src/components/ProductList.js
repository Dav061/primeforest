import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "../styles.scss";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("category");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [woodTypes, setWoodTypes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [filters, setFilters] = useState({
    category: categoryId || "",
    wood_type: "",
    grade: "",
    ordering: "name",
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  const [allProducts, setAllProducts] = useState([]); // Все продукты
  const [displayedProducts, setDisplayedProducts] = useState([]); // Продукты для текущей страницы
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10); // Количество элементов на странице
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const getUniqueValues = (products, key) => {
    const values = products.map((product) => product[key]);
    return [...new Set(values)].filter(Boolean);
  };

  const fetchProducts = useCallback(() => {
    const params = {
      ...appliedFilters,
      is_active: true,
    };

    if (categoryId) {
      params.category = categoryId;
    }

    // Удаляем параметры пагинации
    delete params.page;
    delete params.page_size;

    // Удаляем пустые параметры
    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] == null) {
        delete params[key];
      }
    });

    axios
      .get("http://127.0.0.1:8000/api/products/", { params })
      .then((response) => {
        if (response.data) {
          const products = response.data.results || [];
          setAllProducts(products);
          setWoodTypes(getUniqueValues(products, "wood_type"));
          setGrades(getUniqueValues(products, "grade"));
        }
      })
      .catch((error) => {
        console.error("Ошибка при загрузке данных:", error);
        setError("Ошибка при загрузке данных: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [appliedFilters, categoryId]);

  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedProducts(allProducts.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
  }, [allProducts, page, itemsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: categoryId || "",
      wood_type: "",
      grade: "",
      ordering: "name",
    });
    setAppliedFilters({
      category: categoryId || "",
      ordering: "name",
    });
    setSearchQuery("");
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    setAppliedFilters({
      ...appliedFilters,
      search: searchQuery,
    });
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
  };

  const addToCart = (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      axios
        .post(
          "http://127.0.0.1:8000/api/carts/add_to_cart/",
          { product_id: productId, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          setIsSuccessDialogOpen(true);
        })
        .catch(console.error);
    }
  };

  const handleCloseSuccessDialog = () => {
    setIsSuccessDialogOpen(false);
  };

  const handleGoToCart = () => {
    setIsSuccessDialogOpen(false);
    navigate("/cart");
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
  if (error) return <div>{error}</div>;

  return (
    <div className="product-list">
      <h1>Товары</h1>

      {/* Блок поиска */}
      <div className="search-section">
        <div className="search-container">
          <TextField
            name="search"
            label="Поиск"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            className="search-button"
            size="large"
          >
            Поиск
          </Button>
        </div>
      </div>

      {/* Блок сортировки и фильтров */}
      <div className="filters-section">
        <div className="filters-container">
          {/* Сортировка */}
          <FormControl className="sort-control" fullWidth>
            <InputLabel>Сортировать по</InputLabel>
            <Select
              name="ordering"
              value={filters.ordering}
              onChange={handleFilterChange}
            >
              <MenuItem value="name">По названию (А-Я)</MenuItem>
              <MenuItem value="-name">По названию (Я-А)</MenuItem>
              <MenuItem value="price">По цене (возрастанию)</MenuItem>
              <MenuItem value="-price">По цене (убыванию)</MenuItem>
            </Select>
          </FormControl>

          {/* Фильтры */}
          {categoryId && (
            <>
              <FormControl fullWidth>
                <InputLabel>Порода дерева</InputLabel>
                <Select
                  name="wood_type"
                  value={filters.wood_type}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Все породы</MenuItem>
                  {woodTypes.map((woodType, index) => (
                    <MenuItem key={index} value={woodType}>
                      {woodType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Сорт</InputLabel>
                <Select
                  name="grade"
                  value={filters.grade}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Все сорта</MenuItem>
                  {grades.map((grade, index) => (
                    <MenuItem key={index} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </div>

        {/* Кнопки */}
        <div className="filter-buttons">
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            className="apply-filters-button"
            size="large"
          >
            Применить фильтры
          </Button>
          <Button
            variant="outlined"
            onClick={handleResetFilters}
            className="reset-filters-button"
            size="large"
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>

      {/* Список товаров */}
      <div className="products-grid">
        {displayedProducts.map((product) => (
          <Card
            key={product.id}
            className="product-card"
            sx={{ cursor: "pointer" }}
          >
            <CardContent>
              <Typography variant="h5" component="div">
                {product.name}
              </Typography>
              <Typography variant="h6">Цена: {product.price} руб.</Typography>
              <Typography variant="body2">
                Категория: {product.category}
              </Typography>
              {product.wood_type && (
                <Typography variant="body2">
                  Порода дерева: {product.wood_type}
                </Typography>
              )}
              {product.grade && (
                <Typography variant="body2">Сорт: {product.grade}</Typography>
              )}
              <div className="product-images">
                {product.main_image ? (
                  <img
                    src={product.main_image}
                    alt={product.name}
                    style={{ maxWidth: "100%", maxHeight: "150px" }}
                  />
                ) : (
                  <Typography variant="body2">
                    Изображения отсутствуют
                  </Typography>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <Button
                  variant="contained"
                  style={{ backgroundColor: "#4caf50", color: "white" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product.id);
                  }}
                >
                  Добавить в корзину
                </Button>
                <Button
                  variant="outlined"
                  style={{ borderColor: "#4caf50", color: "#4caf50" }}
                  onClick={() => openProductModal(product)}
                >
                  Подробнее
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Пагинация */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        className="pagination"
      />

      {/* Модальное окно товара */}
      {isModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={closeProductModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeProductModal}>
              &times;
            </button>
            <div className="modal-product-content">
              <div className="modal-product-images">
                {selectedProduct.main_image ? (
                  <img
                    src={selectedProduct.main_image}
                    alt={selectedProduct.name}
                    className="main-image"
                  />
                ) : (
                  <Typography variant="body2">
                    Изображения отсутствуют
                  </Typography>
                )}
              </div>

              <div className="modal-product-info">
                <h2>{selectedProduct.name}</h2>
                <div className="product-details">
                  <p>
                    <strong>Описание:</strong> {selectedProduct.description}
                  </p>
                  <p>
                    <strong>Категория:</strong> {selectedProduct.category}
                  </p>
                  {selectedProduct.wood_type && (
                    <p>
                      <strong>Порода дерева:</strong>{" "}
                      {selectedProduct.wood_type}
                    </p>
                  )}
                  {selectedProduct.grade && (
                    <p>
                      <strong>Сорт:</strong> {selectedProduct.grade}
                    </p>
                  )}
                  <p className="price">{selectedProduct.price} руб.</p>
                </div>

                <button
                  className="modal-add-to-cart-btn"
                  onClick={() => addToCart(selectedProduct.id)}
                >
                  Добавить в корзину
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Диалоговое окно успешного добавления в корзину */}
      <Dialog
        open={isSuccessDialogOpen}
        onClose={handleCloseSuccessDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Товар добавлен в корзину
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Товар успешно добавлен в вашу корзину. Хотите перейти к просмотру
            корзины?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog}>Закрыть</Button>
          <Button onClick={handleGoToCart} autoFocus>
            Перейти в корзину
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductList;
