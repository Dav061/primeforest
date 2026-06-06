// src/services/emailService.js
import emailjs from "@emailjs/browser";

// ⚠️ ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ!
const PUBLIC_KEY = "6qGHR3uWayac0K4mh"; // Вставьте сюда Public Key
const SERVICE_ID = "service_wjcq2g7"; // Вставьте Service ID (service_xxxxx)

const TEMPLATES = {
  ORDER: "template_b7kf1vg", // Order Confirmation
  CALLBACK: "template_66dj5bo", // Contact Us (для обратного звонка)
};

// Инициализация EmailJS
emailjs.init(PUBLIC_KEY);

// 📧 Отправка заказа
export const sendOrderEmail = async (orderData) => {
  try {
    const templateParams = {
      to_email: "priimeforest@gmail.com", // Куда отправлять
      from_name: orderData.name,
      from_email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      comment: orderData.comment || "Нет комментария",
      order_id: orderData.orderId,
      items: orderData.itemsList,
      total_price: orderData.totalPrice,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATES.ORDER,
      templateParams
    );
    console.log("✅ Заказ отправлен:", response);
    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка:", error);
    return { success: false, error: error.text };
  }
};

// 📞 Отправка заявки на обратный звонок
export const sendCallbackEmail = async (callbackData) => {
  try {
    const templateParams = {
      to_email: "priimeforest@gmail.com",
      from_name: callbackData.name,
      phone: callbackData.phone,
      message: `Заявка на обратный звонок от ${callbackData.name}\nТелефон: ${callbackData.phone}`,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATES.CALLBACK,
      templateParams
    );
    console.log("✅ Заявка отправлена:", response);
    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка:", error);
    return { success: false, error: error.text };
  }
};
