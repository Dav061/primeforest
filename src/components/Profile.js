import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import "../styles.scss";
import {
  Modal,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);

  // Загружаем историю заказов пользователя
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          setLoading(true);
          setError(null);

          const response = await axios.get(
            "http://127.0.0.1:8000/api/orders/",
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );

          // Обрабатываем разные форматы ответа (с пагинацией и без)
          const ordersData = response.data.results || response.data;

          // Убеждаемся, что это массив
          if (Array.isArray(ordersData)) {
            setOrders(ordersData);
          } else {
            console.error("Получены некорректные данные заказов:", ordersData);
            setError("Ошибка формата данных заказов");
          }
        } catch (error) {
          console.error("Ошибка при загрузке заказов:", error);
          setError(
            error.response?.data?.detail ||
              "Не удалось загрузить историю заказов"
          );
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [user]);

  // Загружаем детали заказа при открытии модального окна
  const handleOpenModal = async (order) => {
    try {
      setOrderLoading(true);
      setError(null);

      // Проверяем, есть ли уже данные о товарах
      if (!order.items || order.items.length === 0) {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/orders/${order.id}/`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setSelectedOrder(response.data);
      } else {
        setSelectedOrder(order);
      }

      setOpenModal(true);
    } catch (error) {
      console.error("Ошибка при загрузке деталей заказа:", error);
      setError(
        error.response?.data?.detail || "Не удалось загрузить детали заказа"
      );
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
    setError(null);
  };

  // Стили для модального окна
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: "800px",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
    maxHeight: "80vh",
    overflowY: "auto",
  };

  if (!user) {
    return (
      <div className="profile-message">Пожалуйста, войдите в систему.</div>
    );
  }

  return (
    <div className="profile">
      <h1>Личный кабинет</h1>

      <div className="user-info">
        <h2>Информация о пользователе</h2>
        <p>Логин: {user.username}</p>
        <p>Email: {user.email}</p>
        <button onClick={logout} className="logout-button">
          Выйти
        </button>
      </div>

      <div className="order-history">
        <h2>История заказов</h2>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <CircularProgress />
            <p>Загрузка заказов...</p>
          </div>
        ) : orders.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">№ Заказа</TableCell>
                  <TableCell align="center">Статус</TableCell>
                  <TableCell align="center">Адрес</TableCell>
                  <TableCell align="center">Дата создания</TableCell>
                  <TableCell align="center">Сумма</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell align="center">{order.id}</TableCell>
                    <TableCell align="center">
                      {order.status === "in_process"
                        ? "В процессе"
                        : order.status === "completed"
                        ? "Завершен"
                        : "Отменен"}
                    </TableCell>
                    <TableCell align="center">{order.address}</TableCell>
                    <TableCell align="center">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      {order.total_price} руб.
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenModal(order)}
                        disabled={orderLoading}
                      >
                        {orderLoading ? "Загрузка..." : "Подробнее"}
                      </Button>
                    </TableCell>
                    {/* <TableCell>{order.status}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p>У вас пока нет заказов.</p>
        )}
      </div>

      {/* Модальное окно с деталями заказа */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="order-details-modal"
      >
        <Box sx={modalStyle}>
          {selectedOrder ? (
            <>
              <Typography variant="h6" component="h2" gutterBottom>
                Детали заказа №{selectedOrder.id}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Адрес доставки:</strong> {selectedOrder.address}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Дата доставки:</strong>{" "}
                {selectedOrder.delivery_date &&
                  new Date(
                    selectedOrder.delivery_date
                  ).toLocaleDateString()}{" "}
                ({selectedOrder.delivery_time_interval})
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Способ оплаты:</strong>{" "}
                {selectedOrder.payment_method === "cash"
                  ? "Наличными"
                  : "Переводом"}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Статус:</strong>{" "}
                {selectedOrder.status === "in_process"
                  ? "В процессе"
                  : selectedOrder.status === "completed"
                  ? "Завершен"
                  : "Отменен"}
              </Typography>

              <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                Товары в заказе:
              </Typography>

              {orderLoading ? (
                <div className="loading-container">
                  <CircularProgress />
                  <p>Загрузка товаров...</p>
                </div>
              ) : selectedOrder.items && selectedOrder.items.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Товар</TableCell>
                        <TableCell align="right">Цена</TableCell>
                        <TableCell align="right">Количество</TableCell>
                        <TableCell align="right">Сумма</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell component="th" scope="row">
                            {item.product?.name || "Товар не найден"}
                          </TableCell>
                          <TableCell align="right">{item.price} руб.</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {(item.price * item.quantity).toFixed(2)} руб.
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <strong>Итого:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{selectedOrder.total_price} руб.</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  В заказе нет товаров
                </Typography>
              )}

              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  onClick={handleCloseModal}
                  variant="contained"
                  color="error"
                >
                  Закрыть
                </Button>
              </Box>
            </>
          ) : (
            <div className="loading-container">
              <CircularProgress />
              <p>Загрузка данных заказа...</p>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default Profile;
