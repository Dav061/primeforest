import React from "react";
import { Helmet } from "react-helmet";
import "../styles.scss";

const Contacts = () => {
  const phoneNumbers = [
    { href: "tel:+79990000629", display: "+7 (999) 000-06-29" },
    { href: "tel:+79055983500", display: "+7 (905) 598-35-00" }
  ];

  const deliveryInfo = [
    "В пределах МКАД: от 1500 ₽",
    "За МКАД (до 30 км): от 1000 ₽ + 80 ₽/км",
    "Дальше 30 км: рассчитывается менеджером"
  ];

  const paymentMethods = [
    "Банковские карты (Visa, MasterCard, Мир)",
    "Безналичный расчёт для юридических лиц",
    "Наличные в офисе"
  ];

  return (
    <>
      <Helmet>
        <title>Контакты - Prime-Forest | Адрес, телефон, график работы</title>
        <meta 
          name="description" 
          content="Контакты компании Prime-Forest в Москве. Адрес: Рублёвское шоссе, 151к2. Телефоны: +7 (999) 000-06-29, +7 (905) 598-35-00. График работы, WhatsApp, схема проезда." 
        />
      </Helmet>
      
      <div className="contacts-container">
        <div className="contacts-grid">
          <div className="contact-card">
            <div className="contact-icon">📍</div>
            <h2 className="contact-heading">Адрес</h2>
            <p className="contact-text">г. Москва, Рублёвское шоссе, 151к2</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">📞</div>
            <h2 className="contact-heading">Телефон</h2>
            {phoneNumbers.map((phone, index) => (
              <p key={index} className="contact-text">
                <a href={phone.href}>{phone.display}</a>
              </p>
            ))}
          </div>

          <div className="contact-card">
            <div className="contact-icon">✉️</div>
            <h2 className="contact-heading">Email</h2>
            <p className="contact-text">
              <a href="mailto:prime-forest@yandex.ru">prime-forest@yandex.ru</a>
            </p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">🕒</div>
            <h2 className="contact-heading">График работы</h2>
            <p className="contact-text">Пн-Пт: 9:00 - 18:00</p>
          </div>

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

        <div className="map-container">
          <iframe
            src="https://yandex.ru/map-widget/v1/?um=constructor%3A3792a5734fa6d5c57aa9332ad2188d98524cef7048e58c69584f3d51d96f5a2c&amp;source=constructor"
            width="100%"
            height="342"
            frameBorder="0"
            title="Карта проезда"
            loading="lazy"
          />
        </div>

        <div className="foot-contacts">
          <div className="requisites-container">
            <h2 className="section-title">🚚 Информация о доставке</h2>
            <div className="delivery-info">
              <p>Стоимость доставки рассчитывается индивидуально для каждого адреса</p>
              <div className="delivery-calculator">
                <p><strong>Ориентировочная стоимость:</strong></p>
                {deliveryInfo.map((item, index) => (
                  <p key={index}>• {item}</p>
                ))}
              </div>
              <p>
                <small>Точную стоимость просьба уточнять перед оформлением заказа</small>
              </p>
            </div>
          </div>

          <div className="payment-methods-container">
            <h2 className="section-title">💸 Способы оплаты</h2>
            <div className="delivery-info">
              <p>Мы принимаем следующие способы оплаты</p>
              <div className="delivery-calculator">
                {paymentMethods.map((method, index) => (
                  <p key={index}>• {method}</p>
                ))}
              </div>
              <p>
                <small>Точную информацию просьба уточнять перед оформлением заказа</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contacts;