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
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    parent: "",
    image_url: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
    categoryName: "",
  });

  const [itemsPerPage] = useState(10); // Количество элементов на странице
  const [currentPage, setCurrentPage] = useState(0);

  const currentCategories = categories.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Общее количество страниц
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:8000/api/categories/");
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(`Ошибка загрузки категорий: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    setCurrentCategory(
      category
        ? {
            id: category.id,
            name: category.name || "",
            parent: category.parent?.id || "",
            image_url: category.image_url || "",
          }
        : {
            name: "",
            parent: "",
            image_url: "",
          }
    );
    setOpenDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      setError(null);

      if (currentCategory.id) {
        await axios.put(
          `http://localhost:8000/api/categories/${currentCategory.id}/`,
          currentCategory
        );
        setSuccessMessage(
          `Категория "${currentCategory.name}" успешно обновлена!`
        );
      } else {
        await axios.post(
          "http://localhost:8000/api/categories/",
          currentCategory
        );
        setSuccessMessage(
          `Категория "${currentCategory.name}" успешно добавлена!`
        );
      }

      fetchCategories();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving category:", error);
      if (error.response?.data) {
        setError(JSON.stringify(error.response.data));
      } else {
        setError(`Ошибка сохранения: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkCategoryHasProducts = async (categoryId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/products/?category=${categoryId}`
      );
      return (response.data.results || response.data).length > 0;
    } catch (error) {
      console.error("Error checking category products:", error);
      return false;
    }
  };

  const handleDeleteCategory = async (id) => {
    const category = categories.find((cat) => cat.id === id);

    try {
      setLoading(true);

      // Проверяем есть ли товары в этой категории
      const hasProducts = await checkCategoryHasProducts(id);

      if (hasProducts) {
        setError(
          `Нельзя удалить категорию "${category.name}", так как в ней есть товары. Сначала перенесите или удалите эти товары.`
        );
        return;
      }

      setConfirmDialog({
        open: true,
        title: "Подтверждение удаления",
        message: `Вы точно хотите удалить категорию "${category.name}"?`,
        categoryName: category.name,
        onConfirm: async () => {
          try {
            const response = await axios.delete(
              `http://localhost:8000/api/categories/${id}/`
            );

            if (response.status === 204) {
              setSuccessMessage(
                `Категория "${category.name}" успешно удалена!`
              );
              fetchCategories();
            }
          } catch (error) {
            console.error("Error deleting category:", error);
            if (error.response?.data?.error) {
              setError(error.response.data.error);
            } else {
              setError(`Ошибка удаления: ${error.message}`);
            }
          } finally {
            setLoading(false);
            setConfirmDialog((prev) => ({ ...prev, open: false }));
          }
        },
      });
    } catch (error) {
      console.error("Error preparing to delete category:", error);
      setError(`Ошибка при проверке категории: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

      <Button
        variant="contained"
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        Добавить категорию
      </Button>

      <Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Родительская категория</TableCell>
                <TableCell>Изображение</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentCategories.length > 0 ? (
                currentCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.parent?.name || "-"}</TableCell>
                    <TableCell>
                      {category.image_url ? (
                        <a
                          href={category.image_url}
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
                      <Button onClick={() => handleOpenDialog(category)}>
                        Изменить
                      </Button>
                      <Button
                        color="error"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Нет категорий
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

      {/* Диалог подтверждения удаления */}
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

      {/* Диалог редактирования/добавления категории */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {currentCategory.id
            ? "Редактировать категорию"
            : "Добавить категорию"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            margin="dense"
            name="name"
            label="Название"
            fullWidth
            value={currentCategory.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="image_url"
            label="URL изображения"
            fullWidth
            value={currentCategory.image_url}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            placeholder="https://example.com/image.jpg"
          />
          <FormControl fullWidth>
            <InputLabel>Родительская категория</InputLabel>
            <Select
              name="parent"
              value={currentCategory.parent}
              onChange={handleInputChange}
              label="Родительская категория"
            >
              <MenuItem value="">
                <em>Нет</em>
              </MenuItem>
              {categories
                .filter(
                  (cat) => !currentCategory.id || cat.id !== currentCategory.id
                )
                .map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            color="primary"
            disabled={!currentCategory.name}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
