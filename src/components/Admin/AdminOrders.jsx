import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const ordersPerPage = 10;

  const [statusFilter, setStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        let url = "http://localhost:8000/api/orders/";
        const params = new URLSearchParams();

        if (statusFilter) params.append("status", statusFilter);
        if (userFilter) params.append("user", userFilter);

        if (params.toString()) url += `?${params.toString()}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersData = response.data.results || response.data || [];
        setOrders(ordersData);

        const statusMap = {};
        ordersData.forEach((order) => {
          statusMap[order.id] = order.status;
        });
        setSelectedStatus(statusMap);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Доступ запрещен. Требуются права администратора.");
          navigate("/login");
        } else {
          setError("Ошибка при загрузке заказов");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, statusFilter, userFilter]);

  const handleStatusChange = async (orderId) => {
    const newStatus = selectedStatus[orderId];
    const currentStatus = orders.find((o) => o.id === orderId)?.status;

    if (!newStatus || newStatus === currentStatus) return;

    setLoadingId(orderId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.patch(
        `http://localhost:8000/api/orders/${orderId}/`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setError(null);
    } catch (err) {
      console.error("Failed to update order:", err);
      setError(
        `Ошибка обновления: ${err.response?.data?.detail || err.message}`
      );

      // Возвращаем предыдущий статус
      setSelectedStatus((prev) => ({
        ...prev,
        [orderId]: currentStatus,
      }));
    } finally {
      setLoadingId(null);
    }
  };

  const statusColors = {
    in_process: "orange",
    completed: "green",
    canceled: "red",
  };

  if (loading && orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  // Вычисляем заказы для текущей страницы
  const currentOrders = orders.slice(
    currentPage * ordersPerPage,
    (currentPage + 1) * ordersPerPage
  );

  // Общее количество страниц
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Все статусы</MenuItem>
          <MenuItem value="in_process">В процессе</MenuItem>
          <MenuItem value="completed">Завершен</MenuItem>
          <MenuItem value="canceled">Отменен</MenuItem>
        </Select>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Номер телефона</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Товары</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.user?.username || "Гость"}</TableCell>
                <TableCell>{order.phone_number}</TableCell>
                <TableCell>{order.total_price} руб.</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Select
                      value={selectedStatus[order.id] || order.status}
                      onChange={(e) =>
                        setSelectedStatus({
                          ...selectedStatus,
                          [order.id]: e.target.value,
                        })
                      }
                      size="small"
                      sx={{
                        color:
                          statusColors[
                            selectedStatus[order.id] || order.status
                          ],
                        fontWeight: "bold",
                        minWidth: 150,
                        mr: 1,
                      }}
                    >
                      <MenuItem value="in_process">В процессе</MenuItem>
                      <MenuItem value="completed">Завершен</MenuItem>
                      <MenuItem value="canceled">Отменен</MenuItem>
                    </Select>
                    <IconButton
                      onClick={() => handleStatusChange(order.id)}
                      disabled={
                        loadingId === order.id ||
                        selectedStatus[order.id] === order.status
                      }
                    >
                      {loadingId === order.id ? (
                        <CircularProgress size={24} />
                      ) : (
                        <CheckIcon />
                      )}
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ maxHeight: 150, overflow: "auto" }}>
                    {order.items?.map((item) => (
                      <Typography key={item.id} variant="body2">
                        {item.product?.name} - {item.quantity} шт. (по{" "}
                        {item.price} руб.)
                      </Typography>
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
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
  );
};

export default AdminOrders;
