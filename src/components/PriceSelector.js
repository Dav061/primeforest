// src/components/PriceSelector.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import "../styles.scss";

const PriceSelector = ({ prices, selectedPriceId, onSelect }) => {
  const [selected, setSelected] = useState(selectedPriceId);

  // Мемоизация функций форматирования
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  }, []);

  // Поиск цены по умолчанию
  const defaultPrice = useMemo(() => {
    if (!prices?.length) return null;
    return prices.find(p => p.is_default) || prices[0];
  }, [prices]);

  useEffect(() => {
    if (!selected && defaultPrice) {
      setSelected(defaultPrice.id);
      onSelect(defaultPrice);
    }
  }, [selected, defaultPrice, onSelect]);

  const handleSelect = useCallback((price) => {
    setSelected(price.id);
    onSelect(price);
  }, [onSelect]);

  const getPriceDisplay = useCallback((price) => {
    const unitShort = price.unit_type_short;
    const formattedPrice = formatPrice(price.price);
    
    if (price.unit_type_code === 'pack' && price.quantity_per_unit) {
      return (
        <div className="price-option-content">
          <span className="price-value">{formattedPrice} ₽</span>
          <span className="price-unit">/{unitShort}</span>
          <span className="price-pack-info"> ({price.quantity_per_unit} шт)</span>
        </div>
      );
    }
    
    return (
      <div className="price-option-content">
        <span className="price-value">{formattedPrice} ₽</span>
        <span className="price-unit">/{unitShort}</span>
      </div>
    );
  }, [formatPrice]);

  if (!prices?.length) {
    return <div className="no-prices">Цена не указана</div>;
  }

  // Одна цена
  if (prices.length === 1) {
    const price = prices[0];
    return (
      <div className="price-selector single-price">
        <div className="single-price-display">
          <span className="price-label">Цена:</span>
          {getPriceDisplay(price)}
        </div>
      </div>
    );
  }

  // Несколько цен
  return (
    <div className="price-selector multiple-prices">
      <div className="price-selector-label">Выберите вариант цены:</div>
      <div className="price-options">
        {prices.map((price) => (
          <button
            key={price.id}
            className={`price-option ${selected === price.id ? 'selected' : ''}`}
            onClick={() => handleSelect(price)}
            type="button"
          >
            {getPriceDisplay(price)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceSelector;