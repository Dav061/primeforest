// src/components/CatalogPage.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CategoryList from "./CategoryList";
import ProductList from "./ProductList";
import { Helmet } from "react-helmet";
import "../styles.scss";

const CatalogPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("category");
  const searchParam = queryParams.get("search");

  // Показываем категории только если нет выбранной категории и нет поиска
  const showCategories = !categoryId && !searchParam;

  // Определяем заголовок в зависимости от параметров
  const getTitle = () => {
    if (searchParam) return `Поиск: ${searchParam} - пиломатериалы | Prime-Forest`;
    if (categoryId) return `Категория - пиломатериалы | Prime-Forest`;
    return "Каталог пиломатериалов - Prime-Forest";
  };

  const getDescription = () => {
    if (searchParam) {
      return `Результаты поиска "${searchParam}" в каталоге пиломатериалов. Доска строганная, брус, OSB, фанера, вагонка с доставкой по Москве и МО.`;
    }
    return "Широкий ассортимент пиломатериалов от производителя: доска строганная и обрезная, брус, OSB, фанера, вагонка, имитация бруса, блок хаус, мебельный щит, половая доска, погонаж. Доставка по Москве и области.";
  };

  return (
    <>
      <Helmet>
        <title>{getTitle()}</title>
        <meta name="description" content={getDescription()} />
      </Helmet>
      <div className="catalog-page">
        {showCategories ? (
          <CategoryList />
        ) : (
          <ProductList />
        )}
      </div>
    </>
  );
};

export default CatalogPage;