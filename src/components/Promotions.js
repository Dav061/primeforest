// src/components/Promotions.js
import React from "react";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import { Helmet } from "react-helmet";
import "../styles.scss";

const Promotions = () => {
  const promoSteps = [
    {
      number: 1,
      title: "Выберите товары",
      description: "Добавьте в корзину пиломатериалы на сумму от 50 000 ₽"
    },
    {
      number: 2,
      title: "Оформите заказ",
      description: "Укажите адрес доставки и удобное время"
    },
    {
      number: 3,
      title: "Получите скидку",
      description: "Менеджер рассчитает стоимость доставки со скидкой 5%"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Акции на пиломатериалы - скидка на доставку 5% | Prime-Forest</title>
        <meta 
          name="description" 
          content="Акции на пиломатериалы в Москве. Скидка на доставку 5% при заказе от 50 000 ₽. Доска, брус, OSB, фанера, вагонка по выгодным ценам." 
        />
      </Helmet>
      
      <div className="promotions-page">
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

        <div className="delivery-info-section">
          <h2>Как получить скидку?</h2>
          <div className="info-cards">
            {promoSteps.map((step) => (
              <div key={step.number} className="info-card">
                <div className="info-card-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="promo-cta">
          <Link to="/products" className="cta-button">
            Перейти в каталог
          </Link>
        </div>
      </div>
    </>
  );
};

export default Promotions;