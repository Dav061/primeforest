import React from "react";
import "../styles.scss"; // Подключаем стили

const Contacts = () => {
  return (
    <div className="contacts-container">
      <h1 className="contacts-title">Контакты</h1>

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
        </div>

        {/* Email */}
        <div className="contact-card">
          <div className="contact-icon">✉️</div>
          <h2 className="contact-heading">Email</h2>
          <p className="contact-text">
            <a href="mailto:info@severlesgroup.ru">info@woodgood.ru</a>
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
          <h2 className="contact-heading">Telegram</h2>
          <p className="contact-text">
            <a href="https://t.me/+79999849269">Написать сообщение</a>
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
              <strong>ИНН:</strong> \
            </p>
            <p>
              <strong>КПП:</strong> \
            </p>
            <p>
              <strong>ОГРН:</strong> \
            </p>
            <p>
              <strong>Банк:</strong> ПАО Сбербанк
            </p>
            <p>
              <strong>Р/с:</strong> \
            </p>
            <p>
              <strong>БИК:</strong> \
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
  );
};

export default Contacts;
