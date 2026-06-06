// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "./styles.scss";
import reportWebVitals from "./reportWebVitals";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import { YandexMetrika } from "yandex-metrika-react";

// Настройка axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://prime-forest.ru";

// ID счётчика Яндекс.Метрики
const METRIKA_ID = 109693335;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <YandexMetrika
      counterId={METRIKA_ID}
      options={{
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        triggerEvent: true,
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </YandexMetrika>
  </React.StrictMode>
);

reportWebVitals();
