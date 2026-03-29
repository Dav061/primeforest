const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BASE_URL = "http://127.0.0.1:8000";

// Статические страницы
const staticPages = [
  { url: "/", priority: 1.0, changefreq: "daily" },
  { url: "/catalog", priority: 0.9, changefreq: "daily" },
  { url: "/about", priority: 0.7, changefreq: "monthly" },
  { url: "/contacts", priority: 0.6, changefreq: "monthly" },
  { url: "/promotions", priority: 0.8, changefreq: "weekly" },
];

// Страницы, которые не нужно индексировать
const noIndexPages = [
  "/cart",
  "/login",
  "/register",
  "/checkout",
  "/profile",
  "/order-success",
  "/admin",
];

const generateSitemap = async () => {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Добавляем статические страницы
  staticPages.forEach((page) => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${BASE_URL}${page.url}</loc>\n`;
    sitemap += `    <lastmod>${
      new Date().toISOString().split("T")[0]
    }</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += `  </url>\n`;
  });

  // Добавляем страницы с noindex (низкий приоритет)
  noIndexPages.forEach((url) => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${BASE_URL}${url}</loc>\n`;
    sitemap += `    <lastmod>${
      new Date().toISOString().split("T")[0]
    }</lastmod>\n`;
    sitemap += `    <changefreq>never</changefreq>\n`;
    sitemap += `    <priority>0.1</priority>\n`;
    sitemap += `  </url>\n`;
  });

  // Загружаем категории с API
  try {
    console.log("Загрузка категорий...");
    const categoriesResponse = await axios.get(`${BASE_URL}/api/categories/`);
    const categories = categoriesResponse.data.results || [];

    categories.forEach((category) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${BASE_URL}/catalog?category=${category.id}</loc>\n`;
      sitemap += `    <lastmod>${
        new Date().toISOString().split("T")[0]
      }</lastmod>\n`;
      sitemap += `    <changefreq>daily</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Загружаем товары
    console.log("Загрузка товаров...");
    const productsResponse = await axios.get(`${BASE_URL}/api/products/`, {
      params: { limit: 1000 },
    });
    const products = productsResponse.data.results || [];

    products.forEach((product) => {
      // Основной URL
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${BASE_URL}/products/${product.id}</loc>\n`;
      sitemap += `    <lastmod>${
        new Date().toISOString().split("T")[0]
      }</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.7</priority>\n`;
      sitemap += `  </url>\n`;

      // Альтернативный URL /catalog/:id
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${BASE_URL}/catalog/${product.id}</loc>\n`;
      sitemap += `    <lastmod>${
        new Date().toISOString().split("T")[0]
      }</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.7</priority>\n`;
      sitemap += `  </url>\n`;
    });
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }

  sitemap += "</urlset>";

  // Сохраняем файл
  const sitemapPath = path.join(__dirname, "../../public/sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`Sitemap создан: ${sitemapPath}`);
};

// Запускаем генерацию
generateSitemap();
