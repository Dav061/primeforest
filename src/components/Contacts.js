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
            <a href="tel:+74951234567">+7 (495) 123-45-67</a>
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
          <h2 className="contact-heading">WhatsApp</h2>
          <p className="contact-text">
            <a href="whatsapp://send?phone=+79999849269">Написать сообщение</a>
          </p>
        </div>
      </div>

      {/* Карта */}
      <div className="map-container">
        <iframe
          src="https://yandex.ru/map-widget/v1/?um=constructor%3A3792a5734fa6d5c57aa9332ad2188d98524cef7048e58c69584f3d51d96f5a2c&amp;source=constructor"
          width="1540"
          height="400"
          frameborder="0"
        ></iframe>
      </div>

      <div className="foot-contacts">
        {/* Реквизиты компании */}
        <div className="requisites-container">
          <h2 className="section-title">Реквизиты компании</h2>
          <div className="requisites-content">
            <p>
              <strong>ИНН:</strong> 1234567890
            </p>
            <p>
              <strong>КПП:</strong> 987654321
            </p>
            <p>
              <strong>ОГРН:</strong> 1234567890123
            </p>
            <p>
              <strong>Банк:</strong> ПАО Сбербанк
            </p>
            <p>
              <strong>Р/с:</strong> 40702810123456789012
            </p>
            <p>
              <strong>БИК:</strong> 044525225
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
