// src/components/ProductList.js
import React, { useEffect, useState, useCallback } from "react";
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
} from "lucide-react"; // Добавлен ArrowLeft
import "../styles.scss";
import ProductCard from "./ProductCard";
import { Helmet } from "react-helmet";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("category");

  // Состояние для названия категории
  const [categoryName, setCategoryName] = useState("");

  // Получаем все параметры из URL при каждом изменении
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
  const [woodTypes, setWoodTypes] = useState([]);
  const [grades, setGrades] = useState([]);

  // Состояние для фильтров (синхронизируется с URL)
  const [filters, setFilters] = useState({
    category: categoryId || "",
    wood_type: woodTypeParam,
    grade: gradeParam,
    ordering: orderingParam,
    width: widthParam,
    thickness: thicknessParam,
    length: lengthParam,
    min_price: minPriceParam,
    max_price: maxPriceParam,
    search: searchParam,
  });

  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // Загружаем название категории, если выбран categoryId
  useEffect(() => {
    const fetchCategoryName = async () => {
      if (!categoryId) {
        setCategoryName("");
        return;
      }

      try {
        const response = await axios.get(
          `https://prime-forest.ru/api/categories/${categoryId}/`
        );
        setCategoryName(response.data.name);
      } catch (error) {
        console.error("Ошибка загрузки названия категории:", error);
        setCategoryName("");
      }
    };

    fetchCategoryName();
  }, [categoryId]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `https://prime-forest.ru${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
  };

  const getUniqueValues = (products, key) => {
    const values = products.map((product) => product[key]);
    return [...new Set(values)].filter(Boolean);
  };

  // Загружаем товары при изменении URL
  useEffect(() => {
    console.log("📍 URL changed:", location.search);

    // Обновляем filters из URL
    setFilters({
      category: categoryId || "",
      wood_type: woodTypeParam,
      grade: gradeParam,
      ordering: orderingParam,
      width: widthParam,
      thickness: thicknessParam,
      length: lengthParam,
      min_price: minPriceParam,
      max_price: maxPriceParam,
      search: searchParam,
    });

    // Загружаем товары
    fetchProducts();
  }, [location.search]);

  const fetchProducts = async () => {
    setLoading(true);

    // Собираем параметры из URL
    const params = {
      is_active: true,
    };

    // Добавляем все непустые параметры из URL
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

    console.log("📤 Fetching with params:", params);

    try {
      const response = await axios.get(
        "https://prime-forest.ru/api/products/",
        {
          params,
        }
      );

      if (response.data) {
        const productsData = response.data.results || [];
        console.log(`📥 Received ${productsData.length} products`);

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
        setPage(1);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setError("Ошибка при загрузке данных: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Обновляем отображаемые товары при изменении allProducts или страницы
  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedProducts(allProducts.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
  }, [allProducts, page, itemsPerPage]);

  const handlePageChange = (event, value) => {
    setPage(value);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  // Функция для возврата к списку категорий
  const handleBackToCategories = () => {
    navigate("/catalog");
  };

  // Функция для сброса поиска
  // src/components/ProductList.js - замените функцию handleClearSearch

  const handleClearSearch = () => {
    console.log("🔍 Сброс поиска из ProductList");

    // Получаем ВСЕ текущие параметры из URL
    const params = new URLSearchParams(location.search);
    console.log("📦 Текущие параметры:", Object.fromEntries(params));

    // Удаляем ТОЛЬКО search
    params.delete("search");
    console.log("📦 После удаления search:", Object.fromEntries(params));

    // Навигируем с сохраненными параметрами
    navigate(`/catalog?${params.toString()}`);
  };

  // Функция для сброса конкретного фильтра
  const handleRemoveFilter = (filterName) => {
    const params = new URLSearchParams(location.search);
    params.delete(filterName);
    navigate(`/products?${params.toString()}`);
  };

  // Функция для сброса всех фильтров (кроме поиска и категории)
  const handleClearAllFilters = () => {
    const params = new URLSearchParams();
    if (categoryId) {
      params.append("category", categoryId);
    }
    if (searchParam) {
      params.append("search", searchParam);
    }
    navigate(`/products?${params.toString()}`);
  };

  // Проверяем, есть ли активные фильтры (кроме search и category)
  const hasActiveFilters = () => {
    return !!(
      woodTypeParam ||
      gradeParam ||
      widthParam ||
      thicknessParam ||
      lengthParam ||
      minPriceParam ||
      maxPriceParam ||
      orderingParam
    );
  };

  // Форматирование названия фильтра для отображения
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

    if (key === "ordering" && orderingLabels[value]) {
      return orderingLabels[value];
    }

    if (key === "min_price") return `${labels[key]}: ${value} ₽`;
    if (key === "max_price") return `${labels[key]}: ${value} ₽`;
    if (key === "width" || key === "thickness" || key === "length")
      return `${labels[key]}: ${value} мм`;

    return `${labels[key]}: ${value}`;
  };

  // Получаем иконку для фильтра
  const getFilterIcon = (key) => {
    switch (key) {
      case "wood_type":
        return <Tag size={14} />;
      case "grade":
        return <Layers size={14} />;
      case "width":
      case "thickness":
      case "length":
        return <Ruler size={14} />;
      case "min_price":
      case "max_price":
        return <DollarSign size={14} />;
      case "ordering":
        return <Filter size={14} />;
      default:
        return null;
    }
  };

  if (loading && allProducts.length === 0)
    return (
      <Box className="loading-container">
        <CircularProgress size={80} />
      </Box>
    );

  if (error) return <div className="error-message">{error}</div>;

  // Определяем заголовок в зависимости от параметров
  const getTitle = () => {
    if (searchParam) return `Поиск: ${searchParam} - пиломатериалы | Prime-Forest`;
    if (categoryName) return `${categoryName} - купить в Москве | Prime-Forest`;
    return "Пиломатериалы - каталог | Prime-Forest";
  };

  const getDescription = () => {
    if (searchParam) {
      return `Результаты поиска "${searchParam}" в каталоге пиломатериалов. Доставка по Москве и Московской области.`;
    }
    if (categoryName) {
      return `${categoryName} от производителя. Доставка по Москве и МО. Высокое качество, экологически чистые материалы.`;
    }
    return "Каталог пиломатериалов: доска строганная и обрезная, брус, OSB, фанера, вагонка, имитация бруса, блок хаус, мебельный щит, половая доска, погонаж. Доставка по Москве и области.";
  };

  return (
    <>
      <Helmet>
        <title>{getTitle()}</title>
        <meta name="description" content={getDescription()} />
      </Helmet>
      <div className="product-list">
        {/* Заголовок категории с кнопкой назад */}
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
            <div className="header-placeholder"></div>{" "}
            {/* Пустой div для баланса */}
          </div>
        )}

        {/* Информация о результатах поиска */}
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

        {/* Активные фильтры */}
        {hasActiveFilters() && (
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
              {/* Порода дерева */}
              {woodTypeParam && (
                <div className="filter-chip">
                  <span className="filter-chip-icon">
                    {getFilterIcon("wood_type")}
                  </span>
                  <span className="filter-chip-label">
                    {getFilterLabel("wood_type", woodTypeParam)}
                  </span>
                  <button
                    className="filter-chip-remove"
                    onClick={() => handleRemoveFilter("wood_type")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Сорт */}
              {gradeParam && (
                <div className="filter-chip">
                  <span className="filter-chip-icon">
                    {getFilterIcon("grade")}
                  </span>
                  <span className="filter-chip-label">
                    {getFilterLabel("grade", gradeParam)}
                  </span>
                  <button
                    className="filter-chip-remove"
                    onClick={() => handleRemoveFilter("grade")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Ширина */}
              {widthParam && (
                <div className="filter-chip">
                  <span className="filter-chip-icon">
                    {getFilterIcon("width")}
                  </span>
                  <span className="filter-chip-label">
                    {getFilterLabel("width", widthParam)}
                  </span>
                  <button
                    className="filter-chip-remove"
                    onClick={() => handleRemoveFilter("width")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Толщина */}
              {thicknessParam && (
                <div className="filter-chip">
                  <span className="filter-chip-icon">
                    {getFilterIcon("thickness")}
                  </span>
                  <span className="filter-chip-label">
                    {getFilterLabel("thickness", thicknessParam)}
                  </span>
                  <button
                    className="filter-chip-remove"
                    onClick={() => handleRemoveFilter("thickness")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Длина */}
              {lengthParam && (
                <div className="filter-chip">
                  <span className="filter-chip-icon">
                    {getFilterIcon("length")}
                  </span>
                  <span className="filter-chip-label">
                    {getFilterLabel("length", lengthParam)}
                  </span>
                  <button
                    className="filter-chip-remove"
                    onClick={() => handleRemoveFilter("length")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Цена от */}
              {minPriceParam && (
                <div className="filter-chip">
                  <span className="filter-chip-icon">
                    {getFilterIcon("min_price")}
                  </span>
                  <span className="filter-chip-label">
                    {getFilterLabel("min_price", minPriceParam)}
                  </span>
                  <button
                    className="filter-chip-remove"
                    onClick={() => handleRemoveFilter("min_price")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Цена до */}
              {maxPriceParam && (
                <div className="filter-chip">
                  <span className="filter-chip-icon">
                    {getFilterIcon("max_price")}
                  </span>
                  <span className="filter-chip-label">
                    {getFilterLabel("max_price", maxPriceParam)}
                  </span>
                  <button
                    className="filter-chip-remove"
                    onClick={() => handleRemoveFilter("max_price")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Сортировка */}
              {orderingParam && orderingParam !== "" && (
                <div className="filter-chip">
                  <span className="filter-chip-icon">
                    {getFilterIcon("ordering")}
                  </span>
                  <span className="filter-chip-label">
                    {getFilterLabel("ordering", orderingParam)}
                  </span>
                  <button
                    className="filter-chip-remove"
                    onClick={() => handleRemoveFilter("ordering")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
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
              {hasActiveFilters() && (
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
