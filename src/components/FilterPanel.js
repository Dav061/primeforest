// src/components/FilterPanel.js
import React, { useState, useEffect } from "react";
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
import { Helmet } from "react-helmet";
import "../styles.scss";

const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";

const FilterPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Начальные значения фильтров из URL
  const [filters, setFilters] = useState({
    wood_type: queryParams.get("wood_type") || "",
    grade: queryParams.get("grade") || "",
    width: queryParams.get("width") || "",
    thickness: queryParams.get("thickness") || "",
    length: queryParams.get("length") || "",
    min_price: queryParams.get("min_price") || "",
    max_price: queryParams.get("max_price") || "",
    ordering: queryParams.get("ordering") || "",
  });

  const [availableValues, setAvailableValues] = useState({
    wood_types: [],
    grades: [],
    widths: [],
    thicknesses: [],
    lengths: [],
  });

  // Загружаем доступные значения для фильтров
  useEffect(() => {
    fetchFilterValues();
  }, [location.search]);

  // Вспомогательная функция для извлечения уникальных значений
  const extractUnique = (products, field, isNumber = false) => {
    const values = [...new Set(products.map((p) => p[field]).filter(Boolean))];
    if (isNumber) {
      return values.sort((a, b) => a - b).map((v) => v.toString());
    }
    return values;
  };

  const fetchFilterValues = async () => {
    try {
      // Сохраняем только основные параметры (не фильтры)
      const params = {};
      for (let [key, value] of queryParams.entries()) {
        if (
          ![
            "wood_type",
            "grade",
            "width",
            "thickness",
            "length",
            "min_price",
            "max_price",
            "ordering",
          ].includes(key)
        ) {
          params[key] = value;
        }
      }

      const response = await axios.get(`${API_URL}/api/products/`, { params });
      const products = response.data.results || [];

      setAvailableValues({
        wood_types: extractUnique(products, "wood_type"),
        grades: extractUnique(products, "grade"),
        widths: extractUnique(products, "width", true),
        thicknesses: extractUnique(products, "thickness", true),
        lengths: extractUnique(products, "length", true),
      });
    } catch (error) {
      console.error("Error fetching filter values:", error);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    // Сохраняем все существующие параметры
    for (let [key, value] of queryParams.entries()) {
      params.append(key, value);
    }

    // Обновляем фильтры
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    navigate(`/catalog?${params.toString()}`);
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

    // Сохраняем только search и category
    const params = new URLSearchParams();
    const searchParam = queryParams.get("search");
    const categoryParam = queryParams.get("category");

    if (searchParam) params.append("search", searchParam);
    if (categoryParam) params.append("category", categoryParam);

    navigate(`/catalog?${params.toString()}`);
    if (onClose) onClose();
  };

  const sortingOptions = [
    { value: "", label: "По умолчанию" },
    { value: "name", label: "По названию (А-Я)" },
    { value: "-name", label: "По названию (Я-А)" },
    { value: "price", label: "По цене (возрастание)" },
    { value: "-price", label: "По цене (убывание)" },
  ];

  const hasActiveFilters = () =>
    Object.values(filters).some((v) => v && v !== "");

  const hasSearch = queryParams.get("search");

  return (
    <>
      <Helmet>
        <title>
          Фильтр пиломатериалов - Prime-Forest | Подбор по параметрам
        </title>
        <meta
          name="description"
          content="Удобный фильтр для подбора пиломатериалов по параметрам: порода дерева, сорт, размеры, цена. Доска, брус, OSB, фанера, вагонка."
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
                  {availableValues.wood_types.map((type, index) => (
                    <MenuItem key={index} value={type}>
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
                  {availableValues.grades.map((grade, index) => (
                    <MenuItem key={index} value={grade}>
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
                  {availableValues.widths.map((width, index) => (
                    <MenuItem key={index} value={width}>
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
                  {availableValues.thicknesses.map((thickness, index) => (
                    <MenuItem key={index} value={thickness}>
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
                  {availableValues.lengths.map((length, index) => (
                    <MenuItem key={index} value={length}>
                      {length} мм
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        )}

        <Box className="filter-actions">
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            fullWidth
            disabled={!hasActiveFilters() && !hasSearch}
          >
            Применить
          </Button>
          <Button
            variant="outlined"
            onClick={handleResetFilters}
            fullWidth
            disabled={!hasActiveFilters() && !hasSearch}
          >
            Сбросить фильтры
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default FilterPanel;
