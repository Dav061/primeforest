import React from "react";
import { Typography, Box } from "@mui/material"; // убрали Container
import aboutImage from "../images/about-image.jpg";
import "../styles.scss";
import { Helmet } from "react-helmet";

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>О компании Prime-Forest - производитель пиломатериалов в Москве</title>
        <meta name="description" content="Prime-Forest более 10 лет производит качественные пиломатериалы. Собственное производство, экологически чистые материалы, доставка по Москве и области. Доска, брус, вагонка, имитация бруса, блок хаус и другие материалы." />
      </Helmet>
      <Box className="about-page"> {/* вместо Container */}
        {/* <Typography
          variant="h2"
          align="center"
          gutterBottom
          className="page-title"
        >
          О нас
        </Typography> */}

        <Box className="about-content">
          <Box className="about-text-block">
            <Typography variant="body1" className="about-text" component="p">
              Добро пожаловать в <strong>Prime-Forest</strong> — ваш надежный
              партнер в мире качественных деревянных материалов и изделий из
              дерева.
            </Typography>

            <Typography variant="body1" className="about-text" component="p">
              Мы работаем на рынке уже более 10 лет, предлагая нашим клиентам
              только лучшие продукты, созданные с любовью и вниманием к деталям.
              Наша миссия — сделать ваш дом уютным и стильным.
            </Typography>

            <Typography variant="body1" className="about-text" component="p">
              Мы используем только экологически чистые материалы и современные
              технологии, чтобы каждая деталь нашей продукции радовала вас долгие
              годы.
            </Typography>

            <Typography variant="body1" className="about-text" component="p">
              В нашем ассортименте вы найдете:
            </Typography>

            <ul className="about-list">
              <li>Пиломатериалы высшего качества</li>
              <li>Экологически чистые материалы</li>
              <li>Индивидуальный подход к каждому клиенту</li>
              <li>Доставка по всей России</li>
            </ul>
          </Box>

          <Box className="about-image-container">
            <img
              src={aboutImage}
              alt="О компании Prime-Forest"
              className="about-image"
            />
          </Box>
        </Box>

        <Box className="about-mission">
          <Typography variant="h3" align="center" className="mission-title">
            Наша миссия
          </Typography>
          <Typography variant="body1" align="center" className="mission-text">
            Мы стремимся создавать качественные деревянные материалы, которые
            вдохновляют и делают ваш дом уютным. Каждое изделие — это результат
            кропотливой работы и любви к своему делу.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default AboutPage;