import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { MapPin, Calendar, Package } from "lucide-react";
import { Helmet } from "react-helmet";
import "../styles.scss";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          setLoading(true);
          console.log("Загружаем заказы для пользователя:", user.id);

          const response = await axios.get(
            "https://prime-forest.ru/api/orders/",
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );

          console.log("Получены заказы:", response.data);

          const ordersData = response.data.results || response.data;
          const ordersArray = Array.isArray(ordersData) ? ordersData : [];

          setOrders(ordersArray);

          if (ordersArray.length === 0) {
            console.log("Заказы не найдены");
          }
        } catch (error) {
          console.error("Ошибка при загрузке заказов:", error);
          console.error("Детали ошибки:", error.response?.data);
          setError("Не удалось загрузить историю заказов");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [user]);

  const handleOpenModal = async (order) => {
    try {
      setOrderLoading(true);
      if (!order.items || order.items.length === 0) {
        const response = await axios.get(
          `https://prime-forest.ru/api/orders/${order.id}/`,
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
      setError("Не удалось загрузить детали заказа");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "in_process":
        return { text: "В обработке", class: "status-in_process" };
      case "in_working":
        return { text: "В работе", class: "status-in_working" };
      case "completed":
        return { text: "Выполнен", class: "status-completed" };
      default:
        return { text: "Отменён", class: "status-canceled" };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="profile-message">Пожалуйста, войдите в систему.</div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Личный кабинет - Prime-Forest | История заказов</title>
        <meta name="description" content="Личный кабинет Prime-Forest. Просмотр истории заказов пиломатериалов, отслеживание статуса доставки по Москве и МО." />
      </Helmet>
      <div className="profile">
        <h1 className="page-title">Личный кабинет</h1>

        <div className="user-info">
          <div className="user-details">
            <h2>Информация о пользователе</h2>
            <p>
              <strong>Логин:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email || "не указан"}
            </p>
          </div>
          <Button variant="contained" onClick={logout} className="logout-button">
            Выйти
          </Button>
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
            <div className="orders-grid">
              {orders.map((order) => {
                const status = getStatusText(order.status);
                return (
                  <div
                    key={order.id}
                    className="order-card"
                    onClick={() => handleOpenModal(order)}
                  >
                    <div className="order-header">
                      <span className="order-number">Заказ №{order.id}</span>
                      <span className={`order-status ${status.class}`}>
                        {status.text}
                      </span>
                    </div>

                    <div className="order-info">
                      <p>
                        <Calendar size={16} />
                        {formatDate(order.created_at)}
                      </p>
                      <p>
                        <MapPin size={16} />
                        {order.address}
                      </p>
                      {!order.user && order.guest_name && (
                        <p>
                          <strong>Гость:</strong> {order.guest_name}
                        </p>
                      )}
                      <p>
                        <Package size={16} />
                        {order.items?.length || 0} товаров
                      </p>
                    </div>

                    <div className="order-footer">
                      <span className="order-total">
                        {order.total_price} руб.
                      </span>
                      <Button
                        variant="outlined"
                        size="small"
                        className="details-button"
                      >
                        Подробнее
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-orders">У вас пока нет заказов</p>
          )}
        </div>

        {/* Модальное окно с деталями заказа */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box className="order-modal">
            {selectedOrder && !orderLoading ? (
              <>
                <Typography variant="h5" component="h2" gutterBottom>
                  Заказ №{selectedOrder.id}
                </Typography>

                <div className="order-details-section">
                  <h3>Информация о доставке</h3>
                  <div className="detail-row">
                    <span className="detail-label">Адрес:</span>
                    <span className="detail-value">{selectedOrder.address}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Телефон:</span>
                    <span className="detail-value">
                      {selectedOrder.phone_number}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Статус:</span>
                    <span className="detail-value">
                      {getStatusText(selectedOrder.status).text}
                    </span>
                  </div>
                </div>

                {/* БЛОК КОММЕНТАРИЯ */}
                {selectedOrder.comment && (
                  <div className="order-comment">
                    <h3>Комментарий к заказу</h3>
                    <div className="comment-text">{selectedOrder.comment}</div>
                  </div>
                )}

                <h3>Товары в заказе</h3>
                <TableContainer component={Paper} className="order-items">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Товар</TableCell>
                        <TableCell align="right">Цена</TableCell>
                        <TableCell align="right">Кол-во</TableCell>
                        <TableCell align="right">Сумма</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product?.name || "Товар"}</TableCell>
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

                <div className="modal-actions">
                  <Button
                    variant="contained"
                    onClick={handleCloseModal}
                    className="close-modal-btn"
                  >
                    Закрыть
                  </Button>
                </div>
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
    </>
  );
};

export default Profile;
