// src/components/ProductList.js
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

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Получение параметров из URL
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
  const [currentCategory, setCurrentCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const abortControllerRef = useRef(null);

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  }, []);

  // Загрузка информации о категории и товаров
  useEffect(() => {
    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const fetchData = async () => {
      if (!categoryId) {
        setCurrentCategory(null);
        setParentCategory(null);
        setSubcategories([]);
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Загружаем информацию о категории
        const categoryResponse = await axios.get(
          `${API_URL}/api/categories/${categoryId}/`,
          { signal }
        );
        const category = categoryResponse.data;
        setCurrentCategory(category);

        let allCategoryIds = [parseInt(categoryId)];
        let hasSubcategories = false;

        // 2. Если это родительская категория - загружаем подкатегории
        if (category.parent === null) {
          setParentCategory(null);

          const subcatsResponse = await axios.get(
            `${API_URL}/api/categories/`,
            {
              params: { parent: categoryId },
              signal,
            }
          );
          const allSubcats =
            subcatsResponse.data.results || subcatsResponse.data;
          const filteredSubcats = allSubcats.filter(
            (subcat) =>
              subcat.id !== category.id && subcat.parent === category.id
          );
          setSubcategories(filteredSubcats);

          // Добавляем ID подкатегорий для поиска товаров
          if (filteredSubcats.length > 0) {
            hasSubcategories = true;
            const subcategoryIds = filteredSubcats.map((subcat) => subcat.id);
            allCategoryIds = [...allCategoryIds, ...subcategoryIds];
          }
        } else {
          // Это подкатегория - загружаем родителя
          setSubcategories([]);

          const parentResponse = await axios.get(
            `${API_URL}/api/categories/${category.parent}/`,
            { signal }
          );
          setParentCategory(parentResponse.data);
        }

        // 3. Загружаем товары (всегда загружаем, даже для родительской категории)
        const params = {
          is_active: true,
          category__in: [...new Set(allCategoryIds)]
            .sort((a, b) => a - b)
            .join(","),
        };

        if (searchParam) params.search = searchParam;
        if (woodTypeParam) params.wood_type = woodTypeParam;
        if (gradeParam) params.grade = gradeParam;
        if (orderingParam) params.ordering = orderingParam;
        if (widthParam) params.width = widthParam;
        if (thicknessParam) params.thickness = thicknessParam;
        if (lengthParam) params.length = lengthParam;
        if (minPriceParam) params.min_price = minPriceParam;
        if (maxPriceParam) params.max_price = maxPriceParam;

        console.log("Запрос товаров:", params);

        const productsResponse = await axios.get(`${API_URL}/api/products/`, {
          params,
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
        setPage(1);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Ошибка:", error);
          setError(
            error.response?.data?.detail || "Ошибка при загрузке данных"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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

  const navigateToCategory = (catId) => {
    setPage(1);
    setProducts([]);
    navigate(`/products?category=${catId}`);
  };

  const handleBackToCategories = () => {
    navigate("/catalog");
  };

  const handleSubcategoryClick = (subcatId) => {
    navigateToCategory(subcatId);
  };

  const handleBackToParent = () => {
    if (parentCategory) {
      navigateToCategory(parentCategory.id);
    }
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
    navigate(`/products?${params.toString()}`);
  };

  const handleRemoveFilter = (filterName) => {
    const params = new URLSearchParams(location.search);
    params.delete(filterName);
    navigate(`/products?${params.toString()}`);
  };

  const handleClearAllFilters = () => {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
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

  // Показываем подкатегории если:
  // 1. Есть подкатегории
  // 2. Текущая категория - родительская (parent === null)
  // 3. Показываем их над товарами для удобной навигации
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
                onClick={() => navigateToCategory(parentCategory.id)}
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

        {/* Подкатегории - показываем для удобной навигации */}
        {showSubcategories && (
          <div className="subcategories-section">
            <div className="subcategories-grid">
              {subcategories.map((subcat) => (
                <button
                  key={subcat.id}
                  className="subcategory-card"
                  onClick={() => handleSubcategoryClick(subcat.id)}
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

        {/* Кнопка возврата к родительской категории - только для подкатегорий */}
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
