import React from "react";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import "../styles.scss";

const Promotions = () => {
  return (
    <div className="promotions-page">
      {/* <h1 className="page-title">Акции и специальные предложения</h1> */}

      {/* Главный баннер с акцией на доставку */}
      <div className="delivery-promo-banner">
        <div className="promo-content">
          <Truck size={64} className="promo-icon" />
          <div className="promo-text">
            <h2>Скидка на доставку 5%</h2>
            <p className="promo-description">
              При заказе от <span className="highlight">50 000 ₽</span>
            </p>
            <div className="promo-details">
              <p>Акция действует на все виды доставки</p>
              <p className="promo-note">
                *Скидка применяется при оформлении заказа менеджером
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Дополнительная информация о доставке */}
      <div className="delivery-info-section">
        <h2>Как получить скидку?</h2>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-card-number">1</div>
            <h3>Выберите товары</h3>
            <p>Добавьте в корзину пиломатериалы на сумму от 50 000 ₽</p>
          </div>
          <div className="info-card">
            <div className="info-card-number">2</div>
            <h3>Оформите заказ</h3>
            <p>Укажите адрес доставки и удобное время</p>
          </div>
          <div className="info-card">
            <div className="info-card-number">3</div>
            <h3>Получите скидку</h3>
            <p>Менеджер рассчитает стоимость доставки со скидкой 5%</p>
          </div>
        </div>
      </div>

      {/* Призыв к действию */}
      <div className="promo-cta">
        <Link to="/products" className="cta-button">
          Перейти в каталог
        </Link>
      </div>
    </div>
  );
};

export default Promotions;
