// src/components/CatalogPage.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CategoryList from "./CategoryList";
import ProductList from "./ProductList";
import "../styles.scss";

const CatalogPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("category");
  const searchParam = queryParams.get("search");

  // Показываем категории только если нет выбранной категории и нет поиска
  const showCategories = !categoryId && !searchParam;

  return (
    <div className="catalog-page">
      {showCategories ? (
        <>
          {/* <h1 className="page-title">Категории товаров</h1> */}
          <CategoryList />
        </>
      ) : (
        <ProductList />
      )}
    </div>
  );
};

export default CatalogPage;