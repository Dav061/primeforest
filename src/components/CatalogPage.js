// src/components/CatalogPage.js
import React from "react";
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

  // Мемоизируем заголовок и описание для предотвращения лишних вычислений
  const pageMeta = React.useMemo(() => {
    if (searchParam) {
      return {
        title: `Поиск: ${searchParam} - пиломатериалы | Prime-Forest`,
        description: `Результаты поиска "${searchParam}" в каталоге пиломатериалов. Доска строганная, брус, OSB, фанера, вагонка с доставкой по Москве и МО.`
      };
    }
    if (categoryId) {
      return {
        title: `Категория - пиломатериалы | Prime-Forest`,
        description: "Пиломатериалы выбранной категории от производителя. Доставка по Москве и области."
      };
    }
    return {
      title: "Каталог пиломатериалов - Prime-Forest",
      description: "Широкий ассортимент пиломатериалов от производителя: доска строганная и обрезная, брус, OSB, фанера, вагонка, имитация бруса, блок хаус, мебельный щит, половая доска, погонаж. Доставка по Москве и области."
    };
  }, [searchParam, categoryId]);

  return (
    <>
      <Helmet>
        <title>{pageMeta.title}</title>
        <meta name="description" content={pageMeta.description} />
      </Helmet>
      <div className="catalog-page">
        {showCategories ? <CategoryList /> : <ProductList />}
      </div>
    </>
  );
};

export default CatalogPage;