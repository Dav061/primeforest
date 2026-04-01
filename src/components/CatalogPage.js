// src/components/CatalogPage.js
import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CategoryList from "./CategoryList";
import ProductList from "./ProductList";
import { HelmetProvider } from "react-helmet-async";
import "../styles.scss";

const CatalogPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get("search");

  // Показываем товары если есть slug в URL или поиск
  const showProductList = slug || searchParam;
  const showCategories = !showProductList;

  const pageMeta = React.useMemo(() => {
    if (searchParam) {
      return {
        title: `Поиск: ${searchParam} - пиломатериалы | Prime-Forest`,
        description: `Результаты поиска "${searchParam}" в каталоге пиломатериалов.`,
      };
    }
    if (slug) {
      return {
        title: `Категория - пиломатериалы | Prime-Forest`,
        description: `Пиломатериалы выбранной категории от производителя.`,
      };
    }
    return {
      title: "Каталог пиломатериалов - Prime-Forest",
      description: "Широкий ассортимент пиломатериалов от производителя.",
    };
  }, [searchParam, slug]);

  return (
    <>
      <HelmetProvider>
        <title>{pageMeta.title}</title>
        <meta name="description" content={pageMeta.description} />
      </HelmetProvider>
      <div className="catalog-page">
        {showCategories ? (
          <CategoryList />
        ) : (
          <ProductList categorySlug={slug} searchParam={searchParam} />
        )}
      </div>
    </>
  );
};

export default CatalogPage;