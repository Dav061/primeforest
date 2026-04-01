const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BASE_URL = "https://prime-forest.ru";

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
  console.log("🚀 Начинаем генерацию sitemap...");

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  let categoriesCount = 0;
  let productsCount = 0;

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

  // Добавляем страницы с noindex
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

  // Загружаем категории
  try {
    console.log("📁 Загрузка категорий...");
    const categoriesResponse = await axios.get(`${BASE_URL}/api/categories/`);
    const categories = categoriesResponse.data.results || [];

    categoriesCount = categories.length;
    console.log(`Найдено категорий: ${categoriesCount}`);

    categories.forEach((category) => {
      // Используем slug из базы, если есть, иначе пропускаем категорию
      if (!category.slug) {
        console.warn(
          `⚠️ Категория "${category.name}" не имеет slug, пропускаем`
        );
        return;
      }

      sitemap += `  <url>\n`;
      sitemap += `    <loc>${BASE_URL}/catalog/${category.slug}</loc>\n`;
      sitemap += `    <lastmod>${
        new Date().toISOString().split("T")[0]
      }</lastmod>\n`;
      sitemap += `    <changefreq>daily</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    console.log(`✅ Добавлено ${categoriesCount} категорий`);
  } catch (error) {
    console.error("❌ Ошибка загрузки категорий:", error.message);
  }

  // Загружаем товары
  try {
    console.log("📦 Загрузка товаров...");
    const productsResponse = await axios.get(`${BASE_URL}/api/products/`, {
      params: { limit: 1000 },
    });
    const products = productsResponse.data.results || [];

    productsCount = products.length;
    console.log(`Найдено товаров: ${productsCount}`);

    let addedCount = 0;
    products.forEach((product) => {
      // Используем slug из базы, если есть
      if (!product.slug) {
        console.warn(`⚠️ Товар ID: ${product.id} не имеет slug, пропускаем`);
        return;
      }

      sitemap += `  <url>\n`;
      sitemap += `    <loc>${BASE_URL}/products/${product.slug}</loc>\n`;
      sitemap += `    <lastmod>${
        new Date().toISOString().split("T")[0]
      }</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.7</priority>\n`;
      sitemap += `  </url>\n`;
      addedCount++;
    });

    console.log(`✅ Добавлено ${addedCount} товаров из ${productsCount}`);
  } catch (error) {
    console.error("❌ Ошибка загрузки товаров:", error.message);
  }

  sitemap += "</urlset>";

  // Сохраняем файл
  const sitemapPath = path.join(__dirname, "../../public/sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`✅ Sitemap сохранен: ${sitemapPath}`);
  console.log(
    `📊 Всего URL в sitemap: ${
      staticPages.length + noIndexPages.length + categoriesCount + productsCount
    }`
  );
};

// Запускаем генерацию
generateSitemap();
