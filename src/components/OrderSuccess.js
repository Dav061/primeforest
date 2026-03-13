// src/components/OrderSuccess.js
import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button, Paper, Typography, Box, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "../styles.scss";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, isGuest, phoneNumber, email } = location.state || {};

  return (
    <div className="order-success">
      <Paper className="success-card" elevation={3}>
        <CheckCircleIcon className="success-icon" />
        
        <Typography variant="h4" gutterBottom>
          Заказ #{orderId} оформлен!
        </Typography>
        
        <Typography variant="body1" color="textSecondary" paragraph>
          Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для подтверждения.
        </Typography>

        {isGuest ? (
          <Box className="guest-info">
            <Typography variant="h6" gutterBottom>
              📝 Важная информация
            </Typography>
            
            <Typography paragraph>
              <strong>Номер вашего заказа:</strong> #{orderId}
            </Typography>
            
            <Typography paragraph>
              <strong>Контактный телефон:</strong> {phoneNumber}
            </Typography>
            
            {email && (
              <Typography paragraph>
                <strong>Email:</strong> {email}
              </Typography>
            )}

            <Box className="guest-actions">
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/register')}
                sx={{ mr: 2 }}
              >
                Зарегистрироваться
              </Button>
              <Button 
                variant="outlined"
                onClick={() => navigate('/')}
              >
                На главную
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography paragraph>
              Статус заказа можно отслеживать в 
              <Link to="/profile"> личном кабинете</Link>
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/profile')}
            >
              Перейти в личный кабинет
            </Button>
          </Box>
        )}
      </Paper>
    </div>
  );
};

export default OrderSuccess;