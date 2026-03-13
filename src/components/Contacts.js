import React from "react";
import { Helmet } from "react-helmet";
import "../styles.scss"; // Подключаем стили

const Contacts = () => {
  return (
    <>
      <Helmet>
        <title>Контакты - Prime-Forest | Адрес, телефон, график работы</title>
        <meta name="description" content="Контакты компании Prime-Forest в Москве. Адрес: Рублёвское шоссе, 151к2. Телефоны: +7 (999) 000-06-29, +7 (905) 598-35-00. График работы, WhatsApp, схема проезда." />
      </Helmet>
      <div className="contacts-container">
        {/* <h1 className="contacts-title">Контакты</h1> */}

        {/* Основная информация */}
        <div className="contacts-grid">
          {/* Адрес */}
          <div className="contact-card">
            <div className="contact-icon">📍</div>
            <h2 className="contact-heading">Адрес</h2>
            <p className="contact-text">г. Москва, Рублёвское шоссе, 151к2</p>
          </div>

          {/* Телефон */}
          <div className="contact-card">
            <div className="contact-icon">📞</div>
            <h2 className="contact-heading">Телефон</h2>
            <p className="contact-text">
              <a href="tel:+79990000629">+7 (999) 000-06-29</a>
            </p>
            <p className="contact-text">
              <a href="tel:+79055983500">+7 (905) 598-35-00</a>
            </p>
          </div>

          {/* Email */}
          <div className="contact-card">
            <div className="contact-icon">✉️</div>
            <h2 className="contact-heading">Email</h2>
            <p className="contact-text">
              <a href="mailto:info@prime-forest@yandex.ru">prime-forest@yandex.ru</a>
            </p>
          </div>

          {/* График работы */}
          <div className="contact-card">
            <div className="contact-icon">🕒</div>
            <h2 className="contact-heading">График работы</h2>
            <p className="contact-text">Пн-Пт: 9:00 - 18:00</p>
          </div>

          {/* вотсап */}
          <div className="contact-card">
            <div className="contact-icon">📲</div>
            <h2 className="contact-heading">WhatsApp</h2>
            <p className="contact-text">
              <a
                href="https://wa.me/79990000629?text=Здравствуйте!%20Меня%20интересуют%20пиломатериалы"
                target="_blank"
                rel="noopener noreferrer"
              >
                Написать с вопросом о товарах
              </a>
            </p>
          </div>
        </div>

        {/* Карта */}
        <div className="map-container">
          <iframe
            src="https://yandex.ru/map-widget/v1/?um=constructor%3A3792a5734fa6d5c57aa9332ad2188d98524cef7048e58c69584f3d51d96f5a2c&amp;source=constructor"
            width="944"
            height="342"
            frameborder="0"
          ></iframe>
        </div>

        <div className="foot-contacts">
          {/* Реквизиты компании */}
          <div className="requisites-container">
            <h2 className="section-title">Реквизиты компании</h2>
            <div className="requisites-content">
              <p>
                <h>Уточняйте, пожалуйста, по телефону</h> 
              </p>
            </div>
          </div>

          {/* Способы оплаты */}
          <div className="payment-methods-container">
            <h2 className="section-title">Способы оплаты</h2>
            <div className="payment-methods-content">
              <p>Мы принимаем следующие способы оплаты:</p>
              <ul>
                <li>💳 Банковские карты (Visa, MasterCard, Мир)</li>
                <li>🏦 Безналичный расчет для юридических лиц</li>
                <li>💰 Наличные в офисе</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contacts;
