// src/components/ProductList.js - оптимизированная версия
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  ChevronRight,
} from "lucide-react";
import "../styles.scss";
import ProductCard from "./ProductCard";
import { Helmet } from "react-helmet-async";

const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";

const ProductList = ({ categorySlug, searchParam: propSearchParam }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const searchParam = propSearchParam || queryParams.get("search") || "";

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
  const [currentCategory, setCurrentCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryId, setCategoryId] = useState(null);
  const itemsPerPage = 12;

  const abortControllerRef = useRef(null);
  const initialLoadDone = useRef(false);

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  }, []);

  // Единый useEffect для загрузки всех данных
  useEffect(() => {
    if (!categorySlug && !searchParam) {
      setLoading(false);
      return;
    }

    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        let targetCategoryId = null;
        let targetCategory = null;

        // Если есть categorySlug, получаем категорию по slug
        if (categorySlug) {
          const categoriesResponse = await axios.get(
            `${API_URL}/api/categories/`,
            { signal }
          );
          const categories =
            categoriesResponse.data.results || categoriesResponse.data;
          targetCategory = categories.find((c) => c.slug === categorySlug);

          if (!targetCategory) {
            setError("Категория не найдена");
            setLoading(false);
            return;
          }

          targetCategoryId = targetCategory.id;
          setCurrentCategory(targetCategory);
        }

        if (targetCategoryId) {
          // Загружаем полную информацию о категории
          const categoryResponse = await axios.get(
            `${API_URL}/api/categories/${targetCategoryId}/`,
            { signal }
          );
          const fullCategory = categoryResponse.data;

          // Определяем parent для хлебных крошек
          if (fullCategory.parent) {
            const parentResponse = await axios.get(
              `${API_URL}/api/categories/${fullCategory.parent}/`,
              { signal }
            );
            setParentCategory(parentResponse.data);
          } else {
            setParentCategory(null);

            // Загружаем подкатегории для родительской категории
            const subcatsResponse = await axios.get(
              `${API_URL}/api/categories/`,
              {
                params: { parent: targetCategoryId },
                signal,
              }
            );
            const allSubcats =
              subcatsResponse.data.results || subcatsResponse.data;
            const filteredSubcats = allSubcats.filter(
              (subcat) => subcat.parent === targetCategoryId
            );
            setSubcategories(filteredSubcats);
          }

          // Формируем список ID категорий (включая подкатегории)
          let allCategoryIds = [targetCategoryId];

          if (fullCategory.parent === null) {
            const subcatsResponse = await axios.get(
              `${API_URL}/api/categories/`,
              {
                params: { parent: targetCategoryId },
                signal,
              }
            );
            const subcats =
              subcatsResponse.data.results || subcatsResponse.data;
            const subcategoryIds = subcats
              .filter((subcat) => subcat.parent === targetCategoryId)
              .map((subcat) => subcat.id);

            allCategoryIds = [targetCategoryId, ...subcategoryIds];
          }

          // Загружаем товары
          const productsParams = {
            is_active: true,
            category__in: allCategoryIds.join(","),
          };

          if (searchParam) productsParams.search = searchParam;
          if (woodTypeParam) productsParams.wood_type = woodTypeParam;
          if (gradeParam) productsParams.grade = gradeParam;
          if (orderingParam) productsParams.ordering = orderingParam;
          if (widthParam) productsParams.width = widthParam;
          if (thicknessParam) productsParams.thickness = thicknessParam;
          if (lengthParam) productsParams.length = lengthParam;
          if (minPriceParam) productsParams.min_price = minPriceParam;
          if (maxPriceParam) productsParams.max_price = maxPriceParam;

          const productsResponse = await axios.get(`${API_URL}/api/products/`, {
            params: productsParams,
            signal,
          });

          const productsData = productsResponse.data.results || [];
          const normalizedProducts = productsData.map((product) => ({
            ...product,
            main_image: getImageUrl(product.main_image),
            images: product.images?.map((img) => ({
              ...img,
              image: getImageUrl(img.image_url),
            })),
          }));

          setProducts(normalizedProducts);
        } else if (searchParam) {
          // Только поиск, без категории
          const productsParams = {
            is_active: true,
            search: searchParam,
          };

          if (woodTypeParam) productsParams.wood_type = woodTypeParam;
          if (gradeParam) productsParams.grade = gradeParam;
          if (orderingParam) productsParams.ordering = orderingParam;
          if (widthParam) productsParams.width = widthParam;
          if (thicknessParam) productsParams.thickness = thicknessParam;
          if (lengthParam) productsParams.length = lengthParam;
          if (minPriceParam) productsParams.min_price = minPriceParam;
          if (maxPriceParam) productsParams.max_price = maxPriceParam;

          const productsResponse = await axios.get(`${API_URL}/api/products/`, {
            params: productsParams,
            signal,
          });

          const productsData = productsResponse.data.results || [];
          const normalizedProducts = productsData.map((product) => ({
            ...product,
            main_image: getImageUrl(product.main_image),
            images: product.images?.map((img) => ({
              ...img,
              image: getImageUrl(img.image_url),
            })),
          }));

          setProducts(normalizedProducts);
          setCurrentCategory(null);
          setParentCategory(null);
          setSubcategories([]);
        }

        setPage(1);
        initialLoadDone.current = true;
      } catch (error) {
        if (error.name !== "AbortError" && error.code !== "ERR_CANCELED") {
          console.error("Ошибка:", error);
          setError(
            error.response?.data?.detail || "Ошибка при загрузке данных"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    categorySlug,
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

  // Пагинация
  const displayedProducts = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  }, [products, page]);

  useEffect(() => {
    setTotalPages(Math.ceil(products.length / itemsPerPage));
  }, [products, itemsPerPage]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToCategory = (catSlug) => {
    setPage(1);
    navigate(`/catalog/${catSlug}`);
  };

  const handleBackToCategories = () => {
    navigate("/catalog");
  };

  const handleSubcategoryClick = (subcatSlug) => {
    navigateToCategory(subcatSlug);
  };

  const handleBackToParent = () => {
    if (parentCategory) {
      navigateToCategory(parentCategory.slug);
    }
  };

  const handleClearSearch = () => {
    console.log("=== handleClearSearch ===");
    console.log("location.pathname:", location.pathname);
    console.log("location.search:", location.search);

    const pathParts = location.pathname.split("/");
    console.log("pathParts:", pathParts);

    const currentSlug = pathParts[2];
    console.log("currentSlug:", currentSlug);

    if (currentSlug && currentSlug !== "catalog") {
      console.log("Navigating to:", `/catalog/${currentSlug}`);
      navigate(`/catalog/${currentSlug}`);
    } else {
      console.log("Navigating to: /catalog");
      navigate("/catalog");
    }
  };

  const handleRemoveFilter = (filterName) => {
    const params = new URLSearchParams(location.search);
    params.delete(filterName);

    const pathParts = location.pathname.split("/");
    const currentSlug = pathParts[2];

    if (currentSlug && currentSlug !== "catalog") {
      navigate(`/catalog/${currentSlug}?${params.toString()}`);
    } else {
      navigate(`/catalog?${params.toString()}`);
    }
  };

  const handleClearAllFilters = () => {
    const pathParts = location.pathname.split("/");
    const currentSlug = pathParts[2];

    if (currentSlug && currentSlug !== "catalog") {
      navigate(`/catalog/${currentSlug}`);
    } else {
      navigate("/catalog");
    }
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

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={80} />
      </Box>
    );
  }

  if (error) return <div className="error-message">{error}</div>;

  const title = searchParam
    ? `Поиск: ${searchParam} - пиломатериалы | Prime-Forest`
    : currentCategory?.name
    ? `${currentCategory.name} - купить в Москве | Prime-Forest`
    : "Пиломатериалы - каталог | Prime-Forest";

  const description = searchParam
    ? `Результаты поиска "${searchParam}" в каталоге пиломатериалов.`
    : currentCategory?.name
    ? `${currentCategory.name} от производителя. Доставка по Москве и МО.`
    : "Каталог пиломатериалов: доска, брус, фанера, OSB.";

  const showSubcategories =
    subcategories.length > 0 && currentCategory?.parent === null;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>

      <div className="product-list">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <button onClick={handleBackToCategories} className="breadcrumb-link">
            Каталог
          </button>

          {parentCategory && (
            <>
              <span className="breadcrumb-separator">/</span>
              <button
                onClick={() => navigateToCategory(parentCategory.slug)}
                className="breadcrumb-link"
              >
                {parentCategory.name}
              </button>
            </>
          )}

          {currentCategory && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{currentCategory.name}</span>
            </>
          )}
        </div>

        {/* Подкатегории */}
        {showSubcategories && (
          <div className="subcategories-section">
            <div className="subcategories-grid">
              {subcategories.map((subcat) => (
                <button
                  key={subcat.id}
                  className="subcategory-card"
                  onClick={() => handleSubcategoryClick(subcat.slug)}
                >
                  <div className="subcategory-info">
                    <span className="subcategory-name">{subcat.name}</span>
                    <ChevronRight size={20} className="subcategory-arrow" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Кнопка возврата к родительской категории */}
        {parentCategory && currentCategory?.parent !== null && (
          <div className="parent-category-info">
            <button
              className="back-to-parent-button"
              onClick={handleBackToParent}
            >
              ← Показать все товары в категории "{parentCategory.name}"
            </button>
          </div>
        )}

        {/* Количество товаров */}
        {products.length > 0 && (
          <div className="products-count">
            Найдено товаров: {products.length}
          </div>
        )}

        {/* Результаты поиска */}
        {searchParam && (
          <div className="search-info">
            <div className="search-info-header">
              <div className="search-info-text">
                <h2>Результаты поиска: "{searchParam}"</h2>
                <p>Найдено товаров: {products.length}</p>
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
        {hasActiveFilters && products.length > 0 && (
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

        {/* Список товаров */}
        <div className="products-grid">
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <p>В этой категории пока нет товаров</p>
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

        {/* Пагинация */}
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
