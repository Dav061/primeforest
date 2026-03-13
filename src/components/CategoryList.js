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
import "../styles.scss";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("https://prime-forest.ru/api/categories/")
      .then((response) => {
        if (response.data && Array.isArray(response.data.results)) {
          setCategories(response.data.results);
        } else {
          setError(
            "Ожидался массив категорий, но получен другой формат данных."
          );
        }
      })
      .catch((error) => {
        setError("Ошибка при загрузке категорий: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading)
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

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="category-list">
      <div className="categories-grid">
        {categories.map((category) => (
          <Link
            to={`/catalog?category=${category.id}`}
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
  );
};

export default CategoryList;