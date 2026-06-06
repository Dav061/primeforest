// src/components/Profile.js
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
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
import { HelmetProvider } from "react-helmet-async";
import "../styles.scss";

const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeader = useCallback(
    () => ({
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),
    []
  );

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/orders/`,
          getAuthHeader()
        );
        setOrders(response.data.results || response.data);
      } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
        setError("Не удалось загрузить историю заказов");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, getAuthHeader]);

  const handleOpenModal = async (order) => {
    try {
      setOrderLoading(true);
      const response = await axios.get(
        `${API_URL}/api/orders/${order.id}/`,
        getAuthHeader()
      );
      setSelectedOrder(response.data);
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

  const getStatusText = useCallback((status) => {
    const statusMap = {
      in_process: { text: "В обработке", class: "status-in_process" },
      in_working: { text: "В работе", class: "status-in_working" },
      completed: { text: "Выполнен", class: "status-completed" },
      canceled: { text: "Отменён", class: "status-canceled" },
    };
    return statusMap[status] || { text: status, class: "" };
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const formatPriceWithUnit = useCallback((item) => {
    if (item.display_price) return item.display_price;

    const price = item.price_per_unit || 0;
    const formattedPrice = price.toLocaleString("ru-RU");

    const unit =
      item.selected_price_info?.unit_type_short ||
      (item.unit_type === "cubic" ? "м³" : "шт");

    return `${formattedPrice} ₽/${unit}`;
  }, []);

  const formatQuantity = useCallback((item) => {
    if (item.display_quantity) return item.display_quantity;

    const quantity = item.quantity || 0;

    if (
      item.selected_price_info?.unit_type_code === "pack" &&
      item.selected_price_info?.quantity_per_unit
    ) {
      const totalItems = quantity * item.selected_price_info.quantity_per_unit;
      return `${quantity} уп (${totalItems} шт)`;
    }

    const unit =
      item.selected_price_info?.unit_type_short ||
      (item.unit_type === "cubic" ? "м³" : "шт");

    return `${quantity} ${unit}`;
  }, []);

  const orderCards = useMemo(() => {
    return orders.map((order) => {
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
              {order.total_price?.toLocaleString("ru-RU")} руб.
            </span>
            <Button variant="outlined" size="small" className="details-button">
              Подробнее
            </Button>
          </div>
        </div>
      );
    });
  }, [orders, getStatusText, formatDate, handleOpenModal]);

  if (!user) {
    return (
      <div className="profile-message">Пожалуйста, войдите в систему.</div>
    );
  }

  return (
    <>
      <HelmetProvider>
        <title>Личный кабинет - Prime-Forest | История заказов</title>
        <meta
          name="description"
          content="Личный кабинет Prime-Forest. Просмотр истории заказов пиломатериалов, отслеживание статуса доставки по Москве и МО."
        />
      </HelmetProvider>

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
          <Button
            variant="contained"
            onClick={logout}
            className="logout-button"
          >
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
            <div className="orders-grid">{orderCards}</div>
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
                    <span className="detail-value">
                      {selectedOrder.address}
                    </span>
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
                          <TableCell align="right">
                            {formatPriceWithUnit(item)}
                          </TableCell>
                          <TableCell align="right">
                            {formatQuantity(item)}
                          </TableCell>
                          <TableCell align="right">
                            {(
                              item.price_per_unit * item.quantity
                            ).toLocaleString("ru-RU")}{" "}
                            руб.
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <strong>Итого:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>
                            {selectedOrder.total_price?.toLocaleString("ru-RU")}{" "}
                            руб.
                          </strong>
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
