// AdminProducts.js - обновленная версия с поддержкой множественных цен

import { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Box,
  InputAdornment,
  IconButton,
  Typography,
  FormControlLabel,
  Radio,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allWoodTypes, setAllWoodTypes] = useState([]);
  const [allGrades, setAllGrades] = useState([]);
  const [allUnitTypes, setAllUnitTypes] = useState([]); // Новый state для единиц измерения
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Обновленный currentProduct с поддержкой множественных цен
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: "",
    description: "",
    prices: [], // [{ unit_type_code: "piece", price: "", is_default: false, quantity_per_unit: "" }]
    category: "",
    wood_type: "",
    grade: "",
    thickness: "",
    width: "",
    length: "",
    image_url: "",
  });

  const [activeFilter, setActiveFilter] = useState("all");
  const [successMessage, setSuccessMessage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
    productName: "",
  });

  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const currentProducts = filteredProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilter === "active") {
      filtered = filtered.filter((product) => product.is_active);
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter((product) => !product.is_active);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, products, activeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const [
        productsRes,
        categoriesRes,
        woodTypesRes,
        gradesRes,
        unitTypesRes,
      ] = await Promise.all([
        axios.get("https://prime-forest.ru/api/products/"),
        axios.get("https://prime-forest.ru/api/categories/"),
        axios.get("https://prime-forest.ru/api/woodtypes/"),
        axios.get("https://prime-forest.ru/api/grades/"),
        axios.get("https://prime-forest.ru/api/unit-types/"),
      ]);

      const productsData = productsRes.data.results || productsRes.data;
      console.log("Полученные товары:", productsData);

      // Преобразуем данные товаров для отображения
      const formattedProducts = productsData.map((product) => ({
        ...product,
        display_prices:
          product.prices
            ?.map((p) =>
              p.quantity_per_unit
                ? `${p.price}₽/${p.unit_type_short} (${p.quantity_per_unit} шт)`
                : `${p.price}₽/${p.unit_type_short}`
            )
            .join(" | ") || "Нет цен",
      }));

      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);

      const categoriesData = categoriesRes.data.results || categoriesRes.data;
      setAllCategories(
        Array.isArray(categoriesData)
          ? categoriesData.map((cat) => ({ name: cat.name }))
          : []
      );

      const woodTypesData = woodTypesRes.data.results || woodTypesRes.data;
      setAllWoodTypes(
        Array.isArray(woodTypesData)
          ? woodTypesData.map((wood) => ({ name: wood.name }))
          : []
      );

      const gradesData = gradesRes.data.results || gradesRes.data;
      setAllGrades(
        Array.isArray(gradesData)
          ? gradesData.map((grade) => ({ name: grade.name }))
          : []
      );

      const unitTypesData = unitTypesRes.data.results || unitTypesRes.data;
      setAllUnitTypes(Array.isArray(unitTypesData) ? unitTypesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(`Ошибка загрузки данных: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredProducts(products);
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      console.log("Редактируемый товар (полные данные):", product);

      // Преобразуем цены в формат для формы
      const prices =
        product.prices?.map((p) => ({
          unit_type_code:
            p.unit_type_code || (p.unit_type ? p.unit_type.code : ""),
          price: p.price?.toString() || "",
          is_default: p.is_default || false,
          quantity_per_unit: p.quantity_per_unit?.toString() || "",
        })) || [];

      setCurrentProduct({
        id: product.id,
        name: product.name || "",
        description: product.description || "",
        prices: prices,
        category: product.category || "", // было: product.category || ""
        wood_type: product.wood_type || "", // было: product.wood_type || ""
        grade: product.grade || "", // было: product.grade || ""
        thickness: product.thickness || "",
        width: product.width || "",
        length: product.length || "",
        image_url: product.main_image || "",
      });
    } else {
      // Новый товар - добавляем одну цену по умолчанию
      setCurrentProduct({
        id: null,
        name: "",
        description: "",
        prices: [
          {
            unit_type_code: "piece",
            price: "",
            is_default: true,
            quantity_per_unit: "",
          },
        ],
        category: "",
        wood_type: "",
        grade: "",
        thickness: "",
        width: "",
        length: "",
        image_url: "",
      });
    }
    setOpenDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик изменения цены
  const handlePriceChange = (index, field, value) => {
    const updatedPrices = [...currentProduct.prices];
    updatedPrices[index] = { ...updatedPrices[index], [field]: value };

    // Если это поле unit_type_code и меняем на pack, очищаем quantity_per_unit
    if (field === "unit_type_code" && value !== "pack") {
      updatedPrices[index].quantity_per_unit = "";
    }

    setCurrentProduct((prev) => ({ ...prev, prices: updatedPrices }));
  };

  // Добавление новой цены
  const handleAddPrice = () => {
    // Проверяем, что не все единицы измерения уже использованы
    const usedUnitTypes = currentProduct.prices.map((p) => p.unit_type_code);
    const availableUnitTypes = allUnitTypes.filter(
      (ut) => !usedUnitTypes.includes(ut.code)
    );

    if (availableUnitTypes.length === 0) {
      setError("Все доступные единицы измерения уже используются");
      return;
    }

    setCurrentProduct((prev) => ({
      ...prev,
      prices: [
        ...prev.prices,
        {
          unit_type_code: availableUnitTypes[0].code,
          price: "",
          is_default: false,
          quantity_per_unit: "",
        },
      ],
    }));
  };

  // Удаление цены
  const handleRemovePrice = (index) => {
    if (currentProduct.prices.length <= 1) {
      setError("Должна быть хотя бы одна цена");
      return;
    }

    const updatedPrices = currentProduct.prices.filter((_, i) => i !== index);

    // Если удалили цену по умолчанию, делаем первую цену по умолчанию
    if (currentProduct.prices[index].is_default && updatedPrices.length > 0) {
      updatedPrices[0].is_default = true;
    }

    setCurrentProduct((prev) => ({ ...prev, prices: updatedPrices }));
  };

  // Установка цены по умолчанию
  const handleSetDefaultPrice = (index) => {
    const updatedPrices = currentProduct.prices.map((price, i) => ({
      ...price,
      is_default: i === index,
    }));
    setCurrentProduct((prev) => ({ ...prev, prices: updatedPrices }));
  };

  const handleSaveProduct = async () => {
    try {
      // Валидация
      if (!currentProduct.name) {
        setError("Название товара обязательно");
        return;
      }

      // Валидация цен
      for (const price of currentProduct.prices) {
        if (!price.price || parseFloat(price.price) <= 0) {
          setError("Цена должна быть положительным числом");
          return;
        }
        if (price.unit_type_code === "pack" && !price.quantity_per_unit) {
          setError("Для упаковок необходимо указать количество в упаковке");
          return;
        }
      }

      // Проверяем, что есть цена по умолчанию
      if (!currentProduct.prices.some((p) => p.is_default)) {
        setError("Должна быть выбрана цена по умолчанию");
        return;
      }

      // Подготавливаем данные - ИСПРАВЛЕНИЕ ЗДЕСЬ
      const productData = {
        name: currentProduct.name,
        description: currentProduct.description || "",
        // Важно: отправляем пустую строку вместо null
        category_name: currentProduct.category || "",
        wood_type_name: currentProduct.wood_type || "",
        grade_name: currentProduct.grade || "",
        image_url: currentProduct.image_url || null,
        prices_data: currentProduct.prices.map((price) => ({
          unit_type_code: price.unit_type_code,
          price: parseInt(price.price),
          is_default: price.is_default,
          quantity_per_unit: price.quantity_per_unit
            ? parseInt(price.quantity_per_unit)
            : null,
        })),
      };

      // Добавляем размерные поля только если они не пустые
      if (currentProduct.thickness && currentProduct.thickness !== "") {
        productData.thickness = parseInt(currentProduct.thickness, 10);
      }
      if (currentProduct.width && currentProduct.width !== "") {
        productData.width = parseInt(currentProduct.width, 10);
      }
      if (currentProduct.length && currentProduct.length !== "") {
        productData.length = parseInt(currentProduct.length, 10);
      }

      console.log("Отправляемые данные:", productData);

      let response;
      if (currentProduct.id) {
        response = await axios.patch(
          `https://prime-forest.ru/api/products/${currentProduct.id}/`,
          productData
        );
        setSuccessMessage(`Товар "${currentProduct.name}" успешно обновлен!`);
      } else {
        response = await axios.post(
          "https://prime-forest.ru/api/products/",
          productData
        );
        setSuccessMessage(`Товар "${currentProduct.name}" успешно добавлен!`);
      }

      // Обновляем список товаров
      await fetchData();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving product:", error);

      if (error.response) {
        console.error("Данные ошибки:", error.response.data);

        if (error.response.data) {
          const errorMessages = Object.entries(error.response.data)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join("\n");
          setError(`Ошибка сохранения:\n${errorMessages}`);
        } else {
          setError(`Ошибка сохранения: ${error.response.statusText}`);
        }
      } else if (error.request) {
        setError("Ошибка сохранения: сервер не отвечает");
      } else {
        setError(`Ошибка сохранения: ${error.message}`);
      }
    }
  };

  const handleDeleteProduct = (id) => {
    const product = products.find((p) => p.id === id);
    setConfirmDialog({
      open: true,
      title: "Подтверждение удаления",
      message: `Вы точно хотите удалить товар "${product.name}"?`,
      productName: product.name,
      onConfirm: async () => {
        try {
          await axios.delete(`https://prime-forest.ru/api/products/${id}/`);
          setSuccessMessage(`Товар "${product.name}" успешно удалён!`);
          fetchData();
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        } catch (error) {
          console.error("Error deleting product:", error);
          setError(`Ошибка удаления: ${error.message}`);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleActivateProduct = (id) => {
    const product = products.find((p) => p.id === id);
    setConfirmDialog({
      open: true,
      title: "Подтверждение активации",
      message: `Вы точно хотите активировать товар "${product.name}"?`,
      productName: product.name,
      onConfirm: async () => {
        try {
          setLoading(true);
          await axios.post(
            `https://prime-forest.ru/api/products/${id}/activate/`
          );
          setSuccessMessage(`Товар "${product.name}" успешно активирован!`);
          fetchData();
        } catch (error) {
          setError(
            `Ошибка активации: ${error.response?.data?.detail || error.message}`
          );
        } finally {
          setLoading(false);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // Функция для отображения цен в таблице
  const renderPrices = (product) => {
    if (!product.prices || product.prices.length === 0) {
      return <span style={{ color: "#999" }}>Нет цен</span>;
    }

    return (
      <Box>
        {product.prices.map((price, index) => (
          <Chip
            key={index}
            label={
              price.quantity_per_unit
                ? `${price.price}₽/${price.unit_type_short} (${price.quantity_per_unit} шт)`
                : `${price.price}₽/${price.unit_type_short}`
            }
            size="small"
            color={price.is_default ? "primary" : "default"}
            variant={price.is_default ? "filled" : "outlined"}
            sx={{ m: 0.5 }}
          />
        ))}
      </Box>
    );
  };

  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />;
  }

  return (
    <div>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            label="Статус"
          >
            <MenuItem value="all">Все товары</MenuItem>
            <MenuItem value="active">Только активные</MenuItem>
            <MenuItem value="inactive">Только неактивные</MenuItem>
          </Select>
        </FormControl>
        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск по названию товара"
          sx={{ width: "50%" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchTerm && (
                  <IconButton onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                )}
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Добавить товар
        </Button>
      </Box>

      <Box>
        <TableContainer
          component={Paper}
          sx={{ maxHeight: "calc(100vh - 300px)", overflow: "auto" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Цены</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Порода</TableCell>
                <TableCell>Сорт</TableCell>
                <TableCell>Размеры (мм)</TableCell>
                <TableCell>Изображение</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{renderPrices(product)}</TableCell>
                    <TableCell>{product.category || "-"}</TableCell>
                    <TableCell>{product.wood_type || "-"}</TableCell>
                    <TableCell>{product.grade || "-"}</TableCell>
                    <TableCell>
                      {[product.thickness, product.width, product.length]
                        .filter(Boolean)
                        .join("×") || "-"}
                    </TableCell>
                    <TableCell>
                      {product.main_image ? (
                        <a
                          href={product.main_image}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Просмотр
                        </a>
                      ) : (
                        "Нет"
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          color: product.is_active ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {product.is_active ? "Активен" : "Неактивен"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleOpenDialog(product)}
                        sx={{ mr: 1 }}
                      >
                        Изменить
                      </Button>
                      {product.is_active ? (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Удалить
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleActivateProduct(product.id)}
                        >
                          Активировать
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    {searchTerm ? "Ничего не найдено" : "Нет товаров"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
          <Button
            variant="outlined"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Назад
          </Button>
          <Typography sx={{ mx: 2, alignSelf: "center" }}>
            Страница {currentPage + 1} из {totalPages}
          </Typography>
          <Button
            variant="outlined"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Вперед
          </Button>
        </Box>
      </Box>

      {/* Диалог подтверждения действий */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <p>{confirmDialog.message}</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog((prev) => ({ ...prev, open: false }))
            }
          >
            Отмена
          </Button>
          <Button onClick={confirmDialog.onConfirm} color="primary">
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования/добавления */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentProduct.id ? "Редактировать товар" : "Добавить товар"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Основная информация */}
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="name"
                label="Название *"
                fullWidth
                value={currentProduct.name}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label="Описание"
                fullWidth
                multiline
                rows={3}
                value={currentProduct.description}
                onChange={handleInputChange}
              />
            </Grid>

            {/* Цены */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Цены *
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {currentProduct.prices.map((price, index) => (
                <Box
                  key={index}
                  sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Единица</InputLabel>
                        <Select
                          value={price.unit_type_code}
                          onChange={(e) =>
                            handlePriceChange(
                              index,
                              "unit_type_code",
                              e.target.value
                            )
                          }
                          label="Единица"
                        >
                          {allUnitTypes.map((unit) => (
                            <MenuItem
                              key={unit.code}
                              value={unit.code}
                              disabled={currentProduct.prices.some(
                                (p) =>
                                  p.unit_type_code === unit.code &&
                                  p.unit_type_code !== price.unit_type_code
                              )}
                            >
                              {unit.name} ({unit.short_name})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Цена (руб) *"
                        type="number"
                        value={price.price}
                        onChange={(e) =>
                          handlePriceChange(index, "price", e.target.value)
                        }
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>

                    {price.unit_type_code === "pack" && (
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Кол-во в упаковке *"
                          type="number"
                          value={price.quantity_per_unit}
                          onChange={(e) =>
                            handlePriceChange(
                              index,
                              "quantity_per_unit",
                              e.target.value
                            )
                          }
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                      </Grid>
                    )}

                    <Grid item xs={6} sm={2}>
                      <FormControlLabel
                        control={
                          <Radio
                            checked={price.is_default}
                            onChange={() => handleSetDefaultPrice(index)}
                            name={`default-price-${index}`}
                          />
                        }
                        label="По умолч."
                      />
                    </Grid>

                    <Grid item xs={6} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemovePrice(index)}
                        disabled={currentProduct.prices.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={handleAddPrice}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Добавить вариант цены
              </Button>
            </Grid>

            {/* Категория и характеристики */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Категория и характеристики
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Категория</InputLabel>
                <Select
                  name="category"
                  value={currentProduct.category}
                  onChange={handleSelectChange}
                  label="Категория"
                >
                  <MenuItem value="">Не выбрано</MenuItem>
                  {allCategories.map((cat) => (
                    <MenuItem key={cat.name} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Порода дерева</InputLabel>
                <Select
                  name="wood_type"
                  value={currentProduct.wood_type}
                  onChange={handleSelectChange}
                  label="Порода дерева"
                >
                  <MenuItem value="">Не выбрано</MenuItem>
                  {allWoodTypes.map((wood) => (
                    <MenuItem key={wood.name} value={wood.name}>
                      {wood.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Сорт</InputLabel>
                <Select
                  name="grade"
                  value={currentProduct.grade}
                  onChange={handleSelectChange}
                  label="Сорт"
                >
                  <MenuItem value="">Не выбрано</MenuItem>
                  {allGrades.map((grade) => (
                    <MenuItem key={grade.name} value={grade.name}>
                      {grade.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Размеры */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Размеры (необязательно)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={4}>
              <TextField
                margin="dense"
                name="thickness"
                label="Толщина (мм)"
                type="number"
                fullWidth
                value={currentProduct.thickness}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                margin="dense"
                name="width"
                label="Ширина (мм)"
                type="number"
                fullWidth
                value={currentProduct.width}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                margin="dense"
                name="length"
                label="Длина (мм)"
                type="number"
                fullWidth
                value={currentProduct.length}
                onChange={handleInputChange}
              />
            </Grid>

            {/* Изображение */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Изображение
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="image_url"
                label="URL изображения"
                fullWidth
                value={currentProduct.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            color="primary"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
