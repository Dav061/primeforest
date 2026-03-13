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
import { ChevronDown, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles.scss";

const FilterPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

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

  // Загружаем доступные значения для фильтров с учетом текущих параметров
  useEffect(() => {
    fetchFilterValues();
  }, [location.search]); // Перезагружаем при изменении URL

  const fetchFilterValues = async () => {
    try {
      // Копируем все текущие параметры из URL
      const params = {};

      // Добавляем все параметры, которые есть в URL
      for (let [key, value] of queryParams.entries()) {
        // Не включаем фильтры, для которых мы собираем значения
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

      console.log("📊 Fetching filter values with params:", params);

      const response = await axios.get("http://127.0.0.1:8000/api/products/", {
        params,
      });
      const products = response.data.results || [];

      // Извлекаем уникальные значения из отфильтрованных товаров
      const wood_types = [
        ...new Set(products.map((p) => p.wood_type).filter(Boolean)),
      ];
      const grades = [...new Set(products.map((p) => p.grade).filter(Boolean))];

      // Извлекаем размеры и сортируем
      const widths = [
        ...new Set(products.map((p) => p.width).filter(Boolean)),
      ].sort((a, b) => a - b);

      const thicknesses = [
        ...new Set(products.map((p) => p.thickness).filter(Boolean)),
      ].sort((a, b) => a - b);

      const lengths = [
        ...new Set(products.map((p) => p.length).filter(Boolean)),
      ].sort((a, b) => a - b);

      console.log("📊 Available values:", {
        wood_types,
        grades,
        widths,
        thicknesses,
        lengths,
      });

      setAvailableValues({
        wood_types,
        grades,
        widths: widths.map((w) => w.toString()),
        thicknesses: thicknesses.map((t) => t.toString()),
        lengths: lengths.map((l) => l.toString()),
      });
    } catch (error) {
      console.error("Error fetching filter values:", error);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    // Добавляем ВСЕ текущие параметры из URL
    for (let [key, value] of queryParams.entries()) {
      params.append(key, value);
    }

    // Добавляем/обновляем фильтры
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value); // set заменяет существующее значение
      } else {
        params.delete(key); // удаляем пустые
      }
    });

    console.log("🎯 Applying filters:", params.toString());
    navigate(`/catalog?${params.toString()}`); // ИЗМЕНЕНО: было /products, стало /catalog
    if (onClose) onClose();
  };

  const handleResetFilters = () => {
    // Сбрасываем фильтры
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

    // Создаем новые параметры без фильтров
    const params = new URLSearchParams();

    // Сохраняем только search и category
    const searchParam = queryParams.get("search");
    if (searchParam) {
      params.append("search", searchParam);
    }

    const categoryParam = queryParams.get("category");
    if (categoryParam) {
      params.append("category", categoryParam);
    }

    console.log("🔄 Resetting filters, keeping only:", params.toString());
    navigate(`/catalog?${params.toString()}`); // ИЗМЕНЕНО: было /products, стало /catalog
    if (onClose) onClose();
  };

  // Функция для сброса поиска
  const handleClearSearch = () => {
    const params = new URLSearchParams();

    // Сохраняем только category
    const categoryParam = queryParams.get("category");
    if (categoryParam) {
      params.append("category", categoryParam);
    }

    navigate(`/products?${params.toString()}`);
    if (onClose) onClose();
  };

  const sortingOptions = [
    { value: "", label: "По умолчанию" },
    { value: "name", label: "По названию (А-Я)" },
    { value: "-name", label: "По названию (Я-А)" },
    { value: "price", label: "По цене (возрастание)" },
    { value: "-price", label: "По цене (убывание)" },
  ];

  const hasActiveFilters = () => {
    return Object.values(filters).some((v) => v && v !== "");
  };

  const hasSearch = queryParams.get("search");

  return (
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
  );
};

export default FilterPanel;
