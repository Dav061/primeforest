// src/components/CategoryList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { ChevronRight } from "lucide-react";
import { HelmetProvider } from "react-helmet-async";
import "../styles.scss";

const API_URL = process.env.REACT_APP_API_URL || "https://prime-forest.ru";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Загружаем ВСЕ категории
        const response = await axios.get(`${API_URL}/api/categories/`);
        const allCategories = response.data.results || [];

        // Фильтруем только родительские категории (parent = null)
        const parentCategories = allCategories.filter(
          (cat) => cat.parent === null
        );

        setCategories(parentCategories);
      } catch (error) {
        setError("Ошибка при загрузке категорий: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={80} />
      </Box>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <HelmetProvider>
        <title>
          Категории пиломатериалов - Prime-Forest | Доска, брус, OSB, фанера
        </title>
        <meta
          name="description"
          content="Все категории пиломатериалов: доска строганная и обрезная, брус, OSB, фанера, вагонка, имитация бруса, блок хаус, мебельный щит, половая доска, погонаж. Доставка по Москве и МО."
        />
      </HelmetProvider>

      <div className="category-list">
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              to={`/catalog/${category.slug}`} // ← ИСПРАВЛЕНО
              key={category.id}
              className="category-link"
            >
              <Card className="category-card">
                <div className="category-image-wrapper">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="category-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="category-image-placeholder">
                      <span>{category.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                <CardContent className="category-card-content">
                  <Typography
                    variant="h5"
                    component="div"
                    className="category-title"
                  >
                    {category.name}
                  </Typography>
                  <ChevronRight size={20} className="category-arrow" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryList;
