// src/components/FilterPanel.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import "../styles.scss";

const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";

const FilterPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState({
    wood_type: "",
    grade: "",
    width: "",
    thickness: "",
    length: "",
    min_price: "",
    max_price: "",
    ordering: "",
  });

  const [availableValues, setAvailableValues] = useState({
    wood_types: [],
    grades: [],
    widths: [],
    thicknesses: [],
    lengths: [],
  });

  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(null);
  const [categorySlug, setCategorySlug] = useState(null);

  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastFetchedParamsRef = useRef("");
  const isFetchingRef = useRef(false);
  const initialLoadDone = useRef(false);

  const extractUnique = (products, field, isNumber = false) => {
    const values = [...new Set(products.map((p) => p[field]).filter(Boolean))];
    if (isNumber) {
      return values.sort((a, b) => a - b).map((v) => v.toString());
    }
    return values.sort();
  };

  // Получаем categoryId из slug
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const slugFromPath = pathParts[2]; // /catalog/:slug

    if (slugFromPath && slugFromPath !== "catalog") {
      setCategorySlug(slugFromPath);

      const fetchCategoryId = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/categories/`);
          const categories = response.data.results || response.data;
          const category = categories.find((c) => c.slug === slugFromPath);
          if (category) {
            setCategoryId(category.id);
          } else {
            setCategoryId(null);
          }
        } catch (error) {
          console.error("Error fetching category by slug:", error);
          setCategoryId(null);
        }
      };
      fetchCategoryId();
    } else {
      setCategorySlug(null);
      setCategoryId(null);
    }
  }, [location.pathname]);

  const fetchFilterValues = useCallback(async () => {
    if (isFetchingRef.current) return;

    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get("search");

    // Если нет категории, не делаем запрос
    if (!categoryId) {
      if (isMounted.current) {
        setAvailableValues({
          wood_types: [],
          grades: [],
          widths: [],
          thicknesses: [],
          lengths: [],
        });
        setLoading(false);
        initialLoadDone.current = true;
      }
      return;
    }

    const paramsKey = JSON.stringify({ categoryId, searchParam });

    if (paramsKey === lastFetchedParamsRef.current && initialLoadDone.current) {
      return;
    }

    lastFetchedParamsRef.current = paramsKey;
    isFetchingRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const params = { is_active: true };

      try {
        const categoryResponse = await axios.get(
          `${API_URL}/api/categories/${categoryId}/`,
          { signal: abortControllerRef.current.signal }
        );
        const category = categoryResponse.data;

        let allCategoryIds = [parseInt(categoryId)];

        if (category.parent === null) {
          const subcatsResponse = await axios.get(
            `${API_URL}/api/categories/`,
            {
              params: { parent: categoryId },
              signal: abortControllerRef.current.signal,
            }
          );
          const allSubcats =
            subcatsResponse.data.results || subcatsResponse.data;
          const subcategoryIds = allSubcats
            .filter(
              (subcat) =>
                subcat.id !== parseInt(categoryId) &&
                subcat.parent === parseInt(categoryId)
            )
            .map((subcat) => subcat.id);

          if (subcategoryIds.length > 0) {
            allCategoryIds = [...allCategoryIds, ...subcategoryIds];
          }
        }

        params.category__in = [...new Set(allCategoryIds)]
          .sort((a, b) => a - b)
          .join(",");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching category:", error);
        }
        params.category = categoryId;
      }

      if (searchParam) {
        params.search = searchParam;
      }

      const response = await axios.get(`${API_URL}/api/products/`, {
        params,
        signal: abortControllerRef.current.signal,
      });

      const products = response.data.results || [];

      if (isMounted.current) {
        setAvailableValues({
          wood_types: extractUnique(products, "wood_type"),
          grades: extractUnique(products, "grade"),
          widths: extractUnique(products, "width", true),
          thicknesses: extractUnique(products, "thickness", true),
          lengths: extractUnique(products, "length", true),
        });
        setLoading(false);
        initialLoadDone.current = true;
      }
    } catch (error) {
      if (error.name !== "AbortError" && isMounted.current) {
        console.error("Error fetching filter values:", error);
        setLoading(false);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [location.search, categoryId]);

  // Инициализация filters из URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setFilters({
      wood_type: queryParams.get("wood_type") || "",
      grade: queryParams.get("grade") || "",
      width: queryParams.get("width") || "",
      thickness: queryParams.get("thickness") || "",
      length: queryParams.get("length") || "",
      min_price: queryParams.get("min_price") || "",
      max_price: queryParams.get("max_price") || "",
      ordering: queryParams.get("ordering") || "",
    });
  }, [location.search]);

  // Загрузка фильтров
  useEffect(() => {
    if (categoryId) {
      setLoading(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          fetchFilterValues();
        }
      }, 100);
    } else {
      setAvailableValues({
        wood_types: [],
        grades: [],
        widths: [],
        thicknesses: [],
        lengths: [],
      });
      setLoading(false);
      initialLoadDone.current = false;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.search, categoryId, fetchFilterValues]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const queryParams = new URLSearchParams(location.search);
    const params = new URLSearchParams();

    const searchParam = queryParams.get("search");

    if (searchParam) params.set("search", searchParam);

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      }
    });

    if (categorySlug) {
      navigate(`/catalog/${categorySlug}?${params.toString()}`);
    } else {
      navigate(`/catalog?${params.toString()}`);
    }
    if (onClose) onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      wood_type: "",
      grade: "",
      width: "",
      thickness: "",
      length: "",
      min_price: "",
      max_price: "",
      ordering: "",
    });

    const params = new URLSearchParams();
    const searchParam = new URLSearchParams(location.search).get("search");
    if (searchParam) params.set("search", searchParam);

    if (categorySlug) {
      navigate(`/catalog/${categorySlug}?${params.toString()}`);
    } else {
      navigate(`/catalog?${params.toString()}`);
    }
    if (onClose) onClose();
  };

  const sortingOptions = [
    { value: "", label: "По умолчанию" },
    { value: "name", label: "По названию (А-Я)" },
    { value: "-name", label: "По названию (Я-А)" },
    { value: "price", label: "По цене (возрастание)" },
    { value: "-price", label: "По цене (убывание)" },
  ];

  const hasAnyFilters =
    availableValues.wood_types.length > 0 ||
    availableValues.grades.length > 0 ||
    availableValues.widths.length > 0 ||
    availableValues.thicknesses.length > 0 ||
    availableValues.lengths.length > 0;

  if (
    loading &&
    !initialLoadDone.current &&
    availableValues.wood_types.length === 0
  ) {
    return (
      <Box className="filter-panel">
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography>Загрузка фильтров...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          Фильтр пиломатериалов - Prime-Forest | Подбор по параметрам
        </title>
        <meta
          name="description"
          content="Удобный фильтр для подбора пиломатериалов по параметрам: порода дерева, сорт, размеры, цена."
        />
      </Helmet>

      <Box className="filter-panel">
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ChevronDown size={20} />}>
            <Typography>Сортировка</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth size="small">
              <InputLabel>Сортировать по</InputLabel>
              <Select
                name="ordering"
                value={filters.ordering}
                onChange={handleFilterChange}
                label="Сортировать по"
              >
                {sortingOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ChevronDown size={20} />}>
            <Typography>Цена</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className="price-range">
              <TextField
                name="min_price"
                label="От"
                type="number"
                size="small"
                value={filters.min_price}
                onChange={handleFilterChange}
                fullWidth
              />
              <TextField
                name="max_price"
                label="До"
                type="number"
                size="small"
                value={filters.max_price}
                onChange={handleFilterChange}
                fullWidth
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {availableValues.wood_types.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown size={20} />}>
              <Typography>Порода дерева</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth size="small">
                <Select
                  name="wood_type"
                  value={filters.wood_type}
                  onChange={handleFilterChange}
                  displayEmpty
                >
                  <MenuItem value="">Все породы</MenuItem>
                  {availableValues.wood_types.map((type) => (
                    <MenuItem key={`wood-type-${type}`} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        )}

        {availableValues.grades.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown size={20} />}>
              <Typography>Сорт</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth size="small">
                <Select
                  name="grade"
                  value={filters.grade}
                  onChange={handleFilterChange}
                  displayEmpty
                >
                  <MenuItem value="">Все сорта</MenuItem>
                  {availableValues.grades.map((grade) => (
                    <MenuItem key={`grade-${grade}`} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        )}

        {availableValues.widths.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown size={20} />}>
              <Typography>Ширина (мм)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth size="small">
                <Select
                  name="width"
                  value={filters.width}
                  onChange={handleFilterChange}
                  displayEmpty
                >
                  <MenuItem value="">Любая ширина</MenuItem>
                  {availableValues.widths.map((width) => (
                    <MenuItem key={`width-${width}`} value={width}>
                      {width} мм
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        )}

        {availableValues.thicknesses.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown size={20} />}>
              <Typography>Толщина (мм)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth size="small">
                <Select
                  name="thickness"
                  value={filters.thickness}
                  onChange={handleFilterChange}
                  displayEmpty
                >
                  <MenuItem value="">Любая толщина</MenuItem>
                  {availableValues.thicknesses.map((thickness) => (
                    <MenuItem key={`thickness-${thickness}`} value={thickness}>
                      {thickness} мм
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        )}

        {availableValues.lengths.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown size={20} />}>
              <Typography>Длина (мм)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth size="small">
                <Select
                  name="length"
                  value={filters.length}
                  onChange={handleFilterChange}
                  displayEmpty
                >
                  <MenuItem value="">Любая длина</MenuItem>
                  {availableValues.lengths.map((length) => (
                    <MenuItem key={`length-${length}`} value={length}>
                      {length} мм
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        )}

        {!hasAnyFilters && !loading && initialLoadDone.current && (
          <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">
              В этой категории пока нет товаров
            </Typography>
          </Box>
        )}

        <Box className="filter-actions">
          <Button variant="contained" onClick={handleApplyFilters} fullWidth>
            Применить
          </Button>
          <Button variant="outlined" onClick={handleResetFilters} fullWidth>
            Сбросить фильтры
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default FilterPanel;
