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
import "../styles.scss";

const Checkout = () => {
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
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
              Authorization: "Token YOUR_DADATA_API_KEY",
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

    setLoading(true);
    setError(null);

    try {
      const formattedDate = new Date(deliveryDate).toISOString().split("T")[0];

      const response = await axios.post(
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

      // Успешное создание заказа
      await axios.delete("http://127.0.0.1:8000/api/carts/clear/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      navigate("/profile", { state: { orderSuccess: true } });
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);

      let errorMessage = "Произошла ошибка при оформлении заказа";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = address && phoneNumber && deliveryDate && deliveryTime;

  return (
    <div className="checkout">
      <h1>Оформление заказа</h1>
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
        />

        <TextField
          select
          label="Временной интервал"
          fullWidth
          margin="normal"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
          required
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
        >
          {loading ? "Оформление..." : "Оформить заказ"}
        </Button>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Checkout;
