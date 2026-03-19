// src/components/ProductList.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import {
  X,
  Filter,
  Ruler,
  Tag,
  Layers,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import "../styles.scss";
import ProductCard from "./ProductCard";
import { Helmet } from "react-helmet";

const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const categoryId = queryParams.get("category");
  const searchParam = queryParams.get("search") || "";
  const woodTypeParam = queryParams.get("wood_type") || "";
  const gradeParam = queryParams.get("grade") || "";
  const orderingParam = queryParams.get("ordering") || "";
  const widthParam = queryParams.get("width") || "";
  const thicknessParam = queryParams.get("thickness") || "";
  const lengthParam = queryParams.get("length") || "";
  const minPriceParam = queryParams.get("min_price") || "";
  const maxPriceParam = queryParams.get("max_price") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  }, []);

  // Загружаем название категории
  useEffect(() => {
    const fetchCategoryName = async () => {
      if (!categoryId) {
        setCategoryName("");
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/categories/${categoryId}/`
        );
        setCategoryName(response.data.name);
      } catch (error) {
        console.error("Ошибка загрузки названия категории:", error);
        setCategoryName("");
      }
    };

    fetchCategoryName();
  }, [categoryId]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    const params = { is_active: true };
    if (categoryId) params.category = categoryId;
    if (searchParam) params.search = searchParam;
    if (woodTypeParam) params.wood_type = woodTypeParam;
    if (gradeParam) params.grade = gradeParam;
    if (orderingParam) params.ordering = orderingParam;
    if (widthParam) params.width = widthParam;
    if (thicknessParam) params.thickness = thicknessParam;
    if (lengthParam) params.length = lengthParam;
    if (minPriceParam) params.min_price = minPriceParam;
    if (maxPriceParam) params.max_price = maxPriceParam;

    try {
      const response = await axios.get(`${API_URL}/api/products/`, { params });

      if (response.data) {
        const productsData = response.data.results || [];
        const normalizedProducts = productsData.map((product) => ({
          ...product,
          main_image: getImageUrl(product.main_image),
          images: product.images?.map((img) => ({
            ...img,
            image: getImageUrl(img.image_url),
          })),
        }));

        setAllProducts(normalizedProducts);
        setPage(1);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setError("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  }, [
    categoryId,
    searchParam,
    woodTypeParam,
    gradeParam,
    orderingParam,
    widthParam,
    thicknessParam,
    lengthParam,
    minPriceParam,
    maxPriceParam,
    getImageUrl,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedProducts(allProducts.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
  }, [allProducts, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const handleBackToCategories = () => navigate("/catalog");

  const handleClearSearch = () => {
    const params = new URLSearchParams(location.search);
    params.delete("search");
    navigate(`/catalog?${params.toString()}`);
  };

  const handleRemoveFilter = (filterName) => {
    const params = new URLSearchParams(location.search);
    params.delete(filterName);
    navigate(`/products?${params.toString()}`);
  };

  const handleClearAllFilters = () => {
    const params = new URLSearchParams();
    if (categoryId) params.append("category", categoryId);
    if (searchParam) params.append("search", searchParam);
    navigate(`/products?${params.toString()}`);
  };

  const hasActiveFilters = useMemo(
    () =>
      !!(
        woodTypeParam ||
        gradeParam ||
        widthParam ||
        thicknessParam ||
        lengthParam ||
        minPriceParam ||
        maxPriceParam ||
        orderingParam
      ),
    [
      woodTypeParam,
      gradeParam,
      widthParam,
      thicknessParam,
      lengthParam,
      minPriceParam,
      maxPriceParam,
      orderingParam,
    ]
  );

  const getFilterLabel = (key, value) => {
    const labels = {
      wood_type: "Порода",
      grade: "Сорт",
      width: "Ширина",
      thickness: "Толщина",
      length: "Длина",
      min_price: "Цена от",
      max_price: "Цена до",
      ordering: "Сортировка",
    };

    const orderingLabels = {
      name: "По названию (А-Я)",
      "-name": "По названию (Я-А)",
      price: "По цене (возр.)",
      "-price": "По цене (убыв.)",
    };

    if (key === "ordering" && orderingLabels[value])
      return orderingLabels[value];
    if (key === "min_price" || key === "max_price")
      return `${labels[key]}: ${value} ₽`;
    if (key === "width" || key === "thickness" || key === "length")
      return `${labels[key]}: ${value} мм`;
    return `${labels[key]}: ${value}`;
  };

  const getFilterIcon = (key) => {
    const icons = {
      wood_type: Tag,
      grade: Layers,
      width: Ruler,
      thickness: Ruler,
      length: Ruler,
      min_price: DollarSign,
      max_price: DollarSign,
      ordering: Filter,
    };
    const Icon = icons[key];
    return Icon ? <Icon size={14} /> : null;
  };

  const filters = useMemo(
    () =>
      [
        { key: "wood_type", value: woodTypeParam },
        { key: "grade", value: gradeParam },
        { key: "width", value: widthParam },
        { key: "thickness", value: thicknessParam },
        { key: "length", value: lengthParam },
        { key: "min_price", value: minPriceParam },
        { key: "max_price", value: maxPriceParam },
        { key: "ordering", value: orderingParam },
      ].filter((f) => f.value),
    [
      woodTypeParam,
      gradeParam,
      widthParam,
      thicknessParam,
      lengthParam,
      minPriceParam,
      maxPriceParam,
      orderingParam,
    ]
  );

  if (loading && allProducts.length === 0) {
    return (
      <Box className="loading-container">
        <CircularProgress size={80} />
      </Box>
    );
  }

  if (error) return <div className="error-message">{error}</div>;

  const title = searchParam
    ? `Поиск: ${searchParam} - пиломатериалы | Prime-Forest`
    : categoryName
    ? `${categoryName} - купить в Москве | Prime-Forest`
    : "Пиломатериалы - каталог | Prime-Forest";

  const description = searchParam
    ? `Результаты поиска "${searchParam}" в каталоге пиломатериалов. Доставка по Москве и Московской области.`
    : categoryName
    ? `${categoryName} от производителя. Доставка по Москве и МО. Высокое качество, экологически чистые материалы.`
    : "Каталог пиломатериалов: доска строганная и обрезная, брус, OSB, фанера, вагонка, имитация бруса, блок хаус, мебельный щит, половая доска, погонаж. Доставка по Москве и области.";

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>

      <div className="product-list">
        {categoryName && (
          <div className="category-header-with-back">
            <button
              onClick={handleBackToCategories}
              className="back-to-categories-btn"
              aria-label="Назад к категориям"
            >
              <ArrowLeft size={20} />
              <span>Все категории</span>
            </button>
            <h1 className="category-title-large">{categoryName}</h1>
            <div className="header-placeholder" />
          </div>
        )}

        {searchParam && (
          <div className="search-info">
            <div className="search-info-header">
              <div className="search-info-text">
                <h2>Результаты поиска: "{searchParam}"</h2>
                <p>Найдено товаров: {allProducts.length}</p>
              </div>
              <Button
                variant="outlined"
                size="small"
                startIcon={<X size={16} />}
                onClick={handleClearSearch}
                className="clear-search-button"
              >
                Сбросить поиск
              </Button>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="active-filters">
            <div className="active-filters-header">
              <div className="active-filters-title">
                <Filter size={16} />
                <span>Активные фильтры:</span>
              </div>
              <Button
                variant="text"
                size="small"
                onClick={handleClearAllFilters}
                className="clear-all-filters"
              >
                Очистить все
              </Button>
            </div>
            <div className="active-filters-list">
              {filters.map(({ key, value }) => (
                <div key={key} className="filter-chip">
                  <span className="filter-chip-icon">{getFilterIcon(key)}</span>
                  <span className="filter-chip-label">
                    {getFilterLabel(key, value)}
                  </span>
                  <button
                    className="filter-chip-remove"
                    onClick={() => handleRemoveFilter(key)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="products-grid">
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <p>Товары не найдены</p>
              {hasActiveFilters && (
                <Button
                  variant="contained"
                  onClick={handleClearAllFilters}
                  className="reset-filters-button"
                >
                  Сбросить все фильтры
                </Button>
              )}
            </div>
          )}
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
    </>
  );
};

export default ProductList;
