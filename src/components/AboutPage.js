import React from "react";
import { Typography, Container, Box } from "@mui/material";
import aboutImage from "../images/about-image.jpg"; // Замените на путь к вашему изображению
import "../styles.scss"; // Подключите общий файл стилей

const AboutPage = () => {
  return (
    <Container maxWidth="lg" className="about-page">
      {/* Заголовок страницы */}
      <Typography
        variant="h2"
        align="center"
        gutterBottom
        className="page-title"
        component="h2"
      >
        О нас
      </Typography>

      {/* Основной контент */}
      <Box className="about-content">
        {/* Текстовый блок */}
        <Box className="about-text-block">
          <Typography variant="body1" className="about-text" component="p">
            Добро пожаловать в <strong>WOODGOOD</strong> — ваш надежный партнер
            в мире качественной мебели и деревянных изделий. Мы работаем на
            рынке уже более 10 лет, предлагая нашим клиентам только лучшие
            продукты, созданные с любовью и вниманием к деталям.
          </Typography>
          <Typography variant="body1" className="about-text" component="p">
            Наша миссия — сделать ваш дом уютным и стильным. Мы используем
            только экологически чистые материалы и современные технологии, чтобы
            каждая деталь нашей мебели радовала вас долгие годы.
          </Typography>
          <Typography variant="body1" className="about-text" component="p">
            В нашем ассортименте вы найдете:
          </Typography>
          <ul className="about-list">
            <li>Мебель для гостиной, спальни и кухни</li>
            <li>Деревянные аксессуары и декор</li>
            <li>Индивидуальные проекты по вашим эскизам</li>
          </ul>
          <Typography variant="body1" className="about-text" component="p">
            Спасибо, что выбираете нас! Мы ценим каждого клиента и стремимся
            сделать ваш опыт покупок максимально комфортным.
          </Typography>
        </Box>

        {/* Изображение */}
        <Box className="about-image-container">
          <img src={aboutImage} alt="О нас" className="about-image" />
        </Box>
      </Box>

      {/* Дополнительный раздел */}
      <Box className="about-mission">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          className="mission-title"
          component="h3"
        >
          Наша миссия
        </Typography>
        <Typography
          variant="body1"
          align="center"
          className="mission-text"
          component="p"
        >
          Мы стремимся создавать мебель, которая вдохновляет и делает ваш дом
          уютным. Каждое изделие — это результат кропотливой работы и любви к
          своему делу.
        </Typography>
      </Box>
    </Container>
  );
};

export default AboutPage;
