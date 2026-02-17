// src/components/CategoryList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "../styles.scss";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/categories/")
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
    return <div>{error}</div>;
  }

  return (
    <div className="category-list">
      <h1>Категории</h1>
      <div className="categories-grid">
        {categories.map((category) => (
          <Link to={`/products?category=${category.id}`} key={category.id}>
            <Card className="category-card">
              {category.image_url && (
                <img src={category.image_url} alt={category.name} />
              )}
              <CardContent>
                <Typography variant="h5" component="div">
                  {category.name}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
