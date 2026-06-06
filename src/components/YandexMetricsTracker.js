// src/components/YandexMetricsTracker.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const YandexMetricsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.ym) {
      window.ym(109693335, 'hit', location.pathname + location.search);
      console.log('📊 Яндекс.Метрика:', location.pathname);
    }
  }, [location]);

  return null;
};

export default YandexMetricsTracker;