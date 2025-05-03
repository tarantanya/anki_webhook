const express = require('express');
const bodyParser = require('body-parser');
import Gemini from "./Gemini";

const urlRailway = "ankiwebhook-production.up.railway.app";
const app = express();
const port = 8443;
const botToken = '7222342632:AAHn1gKlEN52g4OWTpA98Kj_jbdBFOnEVXA';
const apiUrl = `https://api.telegram.org/bot${botToken}`;

app.use(bodyParser.json());

app.post('/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log("Получено обновление:", update);
    if (update.message && update.message.text) {
      await processMessage(update.message);
    }
    res.sendStatus(200); // Отправьте 200 OK, чтобы Telegram знал, что запрос получен
  } catch (error) {
    console.error("Ошибка обработки сообщения:", error);
    // res.sendStatus(500); // Отправьте 500 Internal Server Error в случае ошибки
  }
});

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  const userId = message.from.id;
  const username = message.from.username || message.from.first_name || message.from.last_name || 'N/A';

  console.log(`Получено сообщение от ${username} (${userId}) в чате ${chatId}: ${text}`);
  const gemini = new Gemini();
  const result = await gemini.checkSentence(text);
  await sendTelegramMessage(result, chatId);
  // await sendTelegramMessage(`Вы сказали: ${text}`, chatId);
}

async function sendTelegramMessage(text, chatId) {
  try {
    const url = `${apiUrl}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
  } catch (error) {
    console.error("Ошибка отправки сообщения:", error);
  }
}

async function setWebhook() {
  const url = `${apiUrl}/setWebhook?url=https://${urlRailway}/telegram-webhook`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    if (!data.ok) {
      console.error("Ошибка отправки:", data);
    } else {
      console.log("Webhook установлен успешно");
      console.log(data);
    }
  } catch (error) {
    console.error("Произошла ошибка при запросе к Telegram API:", error);
  }
}

async function webhookInfo() {
  const url = `${apiUrl}/getWebhookInfo`;
  try {

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    console.log("Webhook info");
    console.log(data);
  } catch (error) {
    console.error("Произошла ошибка при запросе к Telegram API:", error);
  }
}

async function deleteWebhook() {
  const url = `${apiUrl}/deleteWebhook`;
  try {
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();

    if (data.ok) {
      console.log('Webhook успешно удален:', data);
      return true;
    } else {
      console.error('Ошибка при удалении webhook:', data);
      return false;
    }
  } catch (error) {
    console.error('Произошла ошибка при запросе к Telegram API:', error);
    return false;
  }
}

app.listen(port, async () => {
  console.log(`Сервер запущен на порту ${port}`);
  await deleteWebhook();
  await setWebhook();
  await webhookInfo();
});