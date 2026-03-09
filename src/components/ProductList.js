import React, { useEffect, useState, useCallback, useRef } from "react"; // добавили useRef
import axios from "axios";
import { useLocation } from "react-router-dom";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "../styles.scss";
import ProductCard from "./ProductCard";
import { notifySuccess } from "../utils/notifications";

const ProductList = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("category");

  // Добавляем ref для отслеживания первого клика
  const isFirstLoad = useRef(true);
  const topRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [woodTypes, setWoodTypes] = useState([]);
  const [grades, setGrades] = useState([]);

  const [filters, setFilters] = useState({
    category: categoryId || "",
    wood_type: "",
    grade: "",
    ordering: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    category: categoryId || "",
  });

  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://127.0.0.1:8000${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
  };

  const getUniqueValues = (products, key) => {
    const values = products.map((product) => product[key]);
    return [...new Set(values)].filter(Boolean);
  };

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = {
      ...appliedFilters,
      is_active: true,
    };

    if (categoryId) {
      params.category = categoryId;
    }

    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] == null) {
        delete params[key];
      }
    });

    axios
      .get("http://127.0.0.1:8000/api/products/", { params })
      .then((response) => {
        if (response.data) {
          const productsData = response.data.results || [];
          const normalizedProducts = productsData.map((product) => ({
            ...product,
            main_image: getImageUrl(product.main_image),
            images: product.images?.map((img) => ({
              ...img,
              image: getImageUrl(img.image),
            })),
          }));
          setAllProducts(normalizedProducts);
          setWoodTypes(getUniqueValues(normalizedProducts, "wood_type"));
          setGrades(getUniqueValues(normalizedProducts, "grade"));
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

  // Функция для прокрутки вверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // плавная прокрутка
    });
  };

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
    scrollToTop(); // Добавляем прокрутку вверх
  };

  const handleResetFilters = () => {
    setFilters({
      category: categoryId || "",
      wood_type: "",
      grade: "",
      ordering: "",
    });

    setAppliedFilters({
      category: categoryId || "",
    });

    setSearchQuery("");
    setPage(1);

    scrollToTop(); // Добавляем прокрутку вверх
    notifySuccess("Фильтры сброшены");
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
    scrollToTop(); // Добавляем прокрутку вверх
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    // Прокручиваем вверх при смене страницы
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100); // Небольшая задержка для плавности
  };

  if (loading && allProducts.length === 0)
    return (
      <Box className="loading-container">
        <CircularProgress size={80} />
      </Box>
    );

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="product-list" ref={topRef}>
      <h1 className="page-title">Товары</h1>

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

      <div className="filters-section">
        <div className="filters-container">
          <FormControl className="sort-control" fullWidth>
            <InputLabel>Сортировать по</InputLabel>
            <Select
              name="ordering"
              value={filters.ordering}
              onChange={handleFilterChange}
              displayEmpty
            >
              <MenuItem value=""></MenuItem>
              <MenuItem value="name">По названию (А-Я)</MenuItem>
              <MenuItem value="-name">По названию (Я-А)</MenuItem>
              <MenuItem value="price">По цене (возрастанию)</MenuItem>
              <MenuItem value="-price">По цене (убыванию)</MenuItem>
            </Select>
          </FormControl>

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

      <div className="products-grid">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          className="pagination"
        />
      )}
    </div>
  );
};

export default ProductList;
