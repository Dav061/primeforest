import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import "../styles.scss";

const Checkout = () => {
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const timeIntervals = [
    { value: "9-12", label: "9:00 - 12:00" },
    { value: "12-15", label: "12:00 - 15:00" },
    { value: "15-18", label: "15:00 - 18:00" },
    { value: "18-21", label: "18:00 - 21:00" },
  ];

  const paymentMethods = [
    { value: "cash", label: "Наличными при получении" },
    { value: "transfer", label: "Переводом при получении" },
  ];

  const fetchAddressSuggestions = (query) => {
    if (query.length > 2) {
      axios
        .post(
          "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
          { query: query },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: "Token YOUR_DADATA_API_KEY", // Замените на ваш API ключ
            },
          }
        )
        .then((response) => {
          const suggestions = response.data.suggestions.map(
            (suggestion) => suggestion.value
          );
          setAddressSuggestions(suggestions);
        })
        .catch((error) => {
          console.error("Ошибка при загрузке подсказок:", error);
        });
    }
  };

  const handleCheckout = async () => {
    if (!address || !phoneNumber || !deliveryDate || !deliveryTime) {
      setError("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    // Простая валидация телефона
    const phoneRegex =
      /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Пожалуйста, введите корректный номер телефона");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedDate = new Date(deliveryDate).toISOString().split("T")[0];

      // 1. Создаем заказ
      const orderResponse = await axios.post(
        "http://127.0.0.1:8000/api/orders/",
        {
          address: address,
          phone_number: phoneNumber,
          delivery_date: formattedDate,
          delivery_time_interval: deliveryTime,
          payment_method: paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 2. Отправляем уведомление в Telegram
      // try {
      //   await axios.post(
      //     "http://127.0.0.1:8000/api/telegram-notification/",
      //     {
      //       order_id: orderResponse.data.id,
      //     },
      //     {
      //       headers: {
      //         Authorization: `Bearer ${localStorage.getItem("token")}`,
      //       },
      //     }
      //   );
      //   console.log("✅ Уведомление в Telegram отправлено");
      // } catch (telegramError) {
      //   // Не блокируем оформление заказа, если Telegram не отправился
      //   console.error("❌ Ошибка отправки в Telegram:", telegramError);
      // }

      // 3. Очищаем корзину
      await axios.delete("http://127.0.0.1:8000/api/carts/clear/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // 4. Показываем сообщение об успехе
      setSuccessMessage(`Заказ #${orderResponse.data.id} успешно оформлен!`);
      setSnackbarOpen(true);

      // 5. Перенаправляем в профиль через 2 секунды
      setTimeout(() => {
        navigate("/profile", {
          state: { orderSuccess: true, orderId: orderResponse.data.id },
        });
      }, 2000);
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);

      let errorMessage = "Произошла ошибка при оформлении заказа";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const isFormValid = address && phoneNumber && deliveryDate && deliveryTime;

  return (
    <div className="checkout">
      <h1>Оформление заказа</h1>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <div className="form-container">
        <Autocomplete
          freeSolo
          options={addressSuggestions}
          onInputChange={(event, newValue) => {
            setAddress(newValue);
            fetchAddressSuggestions(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Адрес доставки"
              fullWidth
              margin="normal"
              required
              error={error && !address}
              helperText={error && !address ? "Адрес обязателен" : ""}
            />
          )}
        />

        <TextField
          label="Номер телефона"
          fullWidth
          margin="normal"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          placeholder="+7 (999) 123-45-67"
          error={error && !phoneNumber}
          helperText={error && !phoneNumber ? "Телефон обязателен" : ""}
        />

        <TextField
          label="Дата доставки"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          required
          inputProps={{
            min: new Date().toISOString().split("T")[0],
          }}
          error={error && !deliveryDate}
          helperText={error && !deliveryDate ? "Дата доставки обязательна" : ""}
        />

        <TextField
          select
          label="Временной интервал"
          fullWidth
          margin="normal"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
          required
          error={error && !deliveryTime}
          helperText={
            error && !deliveryTime ? "Временной интервал обязателен" : ""
          }
        >
          {timeIntervals.map((interval) => (
            <MenuItem key={interval.value} value={interval.value}>
              {interval.label}
            </MenuItem>
          ))}
        </TextField>

        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Способ оплаты</FormLabel>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {paymentMethods.map((method) => (
              <FormControlLabel
                key={method.value}
                value={method.value}
                control={<Radio />}
                label={method.label}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Button
          onClick={handleCheckout}
          disabled={loading || !isFormValid}
          variant="contained"
          color="primary"
          className="submit-button"
          fullWidth
          size="large"
          sx={{ mt: 2 }}
        >
          {loading ? "Оформление..." : "Оформить заказ"}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Checkout;
