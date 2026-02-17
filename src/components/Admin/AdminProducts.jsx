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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allWoodTypes, setAllWoodTypes] = useState([]);
  const [allGrades, setAllGrades] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    category: "",
    wood_type: "",
    grade: "",
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

  const [itemsPerPage] = useState(10); // Количество элементов на странице
  const [currentPage, setCurrentPage] = useState(0);

  // Вычисляем продукты для текущей страницы
  const currentProducts = filteredProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Общее количество страниц
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

      const [productsRes, categoriesRes, woodTypesRes, gradesRes] =
        await Promise.all([
          axios.get("http://localhost:8000/api/products/"),
          axios.get("http://localhost:8000/api/categories/"),
          axios.get("http://localhost:8000/api/woodtypes/"),
          axios.get("http://localhost:8000/api/grades/"),
        ]);

      const productsData = productsRes.data.results || productsRes.data;
      setProducts(productsData);
      setFilteredProducts(productsData);

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
      setCurrentProduct({
        id: product.id,
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        wood_type: product.wood_type || "",
        grade: product.grade || "",
        image_url: product.main_image || "",
      });
    } else {
      setCurrentProduct({
        id: null,
        name: "",
        description: "",
        price: "",
        category: "",
        wood_type: "",
        grade: "",
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

  const handleSaveProduct = async () => {
    try {
      const productData = {
        name: currentProduct.name,
        description: currentProduct.description,
        price: parseFloat(currentProduct.price),
        category_name: currentProduct.category || null,
        wood_type_name: currentProduct.wood_type || null,
        grade_name: currentProduct.grade || null,
        image_url: currentProduct.image_url || null,
      };

      if (currentProduct.id) {
        await axios.patch(
          `http://localhost:8000/api/products/${currentProduct.id}/`,
          productData
        );
        setSuccessMessage(`Товар "${currentProduct.name}" успешно обновлен!`);
      } else {
        await axios.post("http://localhost:8000/api/products/", productData);
        setSuccessMessage(`Товар "${currentProduct.name}" успешно добавлен!`);
      }

      fetchData();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving product:", error);
      if (error.response?.data) {
        setError(JSON.stringify(error.response.data));
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
          const response = await axios.delete(
            `http://localhost:8000/api/products/${id}/`
          );

          if (response.status === 204) {
            setSuccessMessage(`Товар "${product.name}" успешно удалён!`);
            fetchData();
          }
          setConfirmDialog((prev) => ({ ...prev, open: false })); // Закрываем диалог после успешного удаления
        } catch (error) {
          console.error("Error deleting product:", error);
          if (error.response?.data?.error) {
            setError(error.response.data.error);
          } else {
            setError(`Ошибка удаления: ${error.message}`);
          }
          setConfirmDialog((prev) => ({ ...prev, open: false })); // Закрываем диалог при ошибке
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
            `http://localhost:8000/api/products/${id}/activate/`
          );
          setSuccessMessage(`Товар "${product.name}" успешно активирован!`);
          fetchData();
        } catch (error) {
          setError(
            `Ошибка активации: ${error.response?.data?.detail || error.message}`
          );
        } finally {
          setLoading(false);
          setConfirmDialog((prev) => ({ ...prev, open: false })); // Закрываем диалог после выполнения
        }
      },
    });
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
          sx={{ width: "70%" }}
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Цена</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Порода дерева</TableCell>
                <TableCell>Сорт</TableCell>
                <TableCell>Изображение</TableCell>
                <TableCell>Доступность</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price} руб.</TableCell>
                    <TableCell>{product.category || "-"}</TableCell>
                    <TableCell>{product.wood_type || "-"}</TableCell>
                    <TableCell>{product.grade || "-"}</TableCell>
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
                        "Нет изображения"
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
                      <Button onClick={() => handleOpenDialog(product)}>
                        Изменить
                      </Button>
                      {product.is_active ? (
                        <Button
                          color="error"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Удалить
                        </Button>
                      ) : (
                        <Button
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
                  <TableCell colSpan={8} align="center">
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
        maxWidth="sm"
        fullWidth
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
          <Button
            onClick={() => {
              confirmDialog.onConfirm();
              setConfirmDialog((prev) => ({ ...prev, open: false }));
            }}
            color="primary"
            variant="contained"
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования/добавления товара */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {currentProduct.id ? "Редактировать товар" : "Добавить товар"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            margin="dense"
            name="name"
            label="Название"
            fullWidth
            value={currentProduct.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Описание"
            fullWidth
            multiline
            rows={4}
            value={currentProduct.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="price"
            label="Цена"
            type="number"
            fullWidth
            value={currentProduct.price}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Категория</InputLabel>
            <Select
              name="category"
              value={currentProduct.category}
              onChange={handleSelectChange}
              label="Категория"
            >
              <MenuItem value="">
                <em>Не выбрано</em>
              </MenuItem>
              {allCategories.map((category, index) => (
                <MenuItem key={`category-${index}`} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Порода дерева</InputLabel>
            <Select
              name="wood_type"
              value={currentProduct.wood_type}
              onChange={handleSelectChange}
              label="Порода дерева"
            >
              <MenuItem value="">
                <em>Не выбрано</em>
              </MenuItem>
              {allWoodTypes.map((woodType, index) => (
                <MenuItem key={`wood-${index}`} value={woodType.name}>
                  {woodType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Сорт</InputLabel>
            <Select
              name="grade"
              value={currentProduct.grade}
              onChange={handleSelectChange}
              label="Сорт"
            >
              <MenuItem value="">
                <em>Не выбрано</em>
              </MenuItem>
              {allGrades.map((grade, index) => (
                <MenuItem key={`grade-${index}`} value={grade.name}>
                  {grade.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            name="image_url"
            label="URL изображения"
            fullWidth
            value={currentProduct.image_url}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            placeholder="https://example.com/image.jpg"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            color="primary"
            disabled={!currentProduct.name || !currentProduct.price}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
