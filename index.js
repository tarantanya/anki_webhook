const express = require('express');
const bodyParser = require('body-parser');

const urlRailway = "ankiwebhook-production.up.railway.app";
const app = express();
const port = 8443;
const botToken = '7222342632:AAHn1gKlEN52g4OWTpA98Kj_jbdBFOnEVXA';
const apiUrl = `https://api.telegram.org/bot${botToken}`;

app.use(bodyParser.json());

app.post('/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    if (update.message && update.message.text) {
      await processMessage(update.message);
    }
    res.sendStatus(200); // Отправьте 200 OK, чтобы Telegram знал, что запрос получен
  } catch (error) {
    console.error("Ошибка обработки сообщения:", error);
  }
});

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  const userId = message.from.id;
  const username = message.from.username || message.from.first_name || message.from.last_name || 'N/A';

  console.log(`Получено сообщение от ${username} (${userId}) в чате ${chatId}: ${text}`);
  const result = await checkSentence(text);
  await sendTelegramMessage(result, chatId);
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

async function checkSentence(sentence) {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: "AIzaSyCdi3gJ3BK_KKaS2di1NW35CJflUySdTB4" });
    const res =  await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Ты учитель английского, я студент с уровнем A2. У меня есть 3 слова и мне нужно сделать с ними простое предложение. Я пишу предложения на английском, а ты исправляй если я сделала ошибку: ${sentence}`,
    });
    if (res.text) {
      return res.text;
    }
    else {
      console.log("Ошибка в ответе Gemini:", res);
      return `Ошибка в ответе Gemini: ${res}`;
    }
  } catch (error) {
    console.error("Ошибка gemini:", error);
    return `Ошибка Gemini: ${error}`;
  }
}

async function init(){
  await deleteWebhook();
  await setWebhook();
  await webhookInfo();
}

app.listen(port, async () => {
  console.log(`Сервер запущен на порту ${port}`);
  try {
    await init();
  }
  catch (e) {
    console.error("Ошибка инициализации:", e);
  }
});