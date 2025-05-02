
// const TOKEN = '7222342632:AAHn1gKlEN52g4OWTpA98Kj_jbdBFOnEVXA';//process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
// const url = 'https://<PUBLIC-URL>';
// const port = process.env.PORT;

const express = require('express');
const bodyParser = require('body-parser');
// const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = 3000; // Или любой другой порт

const botToken = '7222342632:AAHn1gKlEN52g4OWTpA98Kj_jbdBFOnEVXA';
const apiUrl = `https://api.telegram.org/bot${botToken}`;
const chatId = '531229561';

app.use(bodyParser.json());

app.post('/telegram-webhook', (req, res) => {
  const update = req.body;
  if (update.message && update.message.text) {
    processMessage(update.message);
  }
  res.sendStatus(200); // Отправьте 200 OK, чтобы Telegram знал, что запрос получен
});

function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  const userId = message.from.id;
  const username = message.from.username || message.from.first_name || message.from.last_name || 'N/A';

  console.log(`Получено сообщение от ${username} (${userId}) в чате ${chatId}: ${text}`);
  // Здесь ваша логика обработки сообщения
  sendTelegramMessage(`Вы сказали: ${text}`, chatId);
}

async function sendTelegramMessage(text, chatId) {
  const bot = new TelegramBot(botToken, {polling: true});
  await bot.sendMessage(chatId, text, {parse_mode: "MarkdownV2" });
  // const body = {
  //   chat_id: chatId,
  //   text: text,
  //   parse_mode: 'MarkdownV2'
  // };
  // const response = await fetch(`${apiUrl}/sendMessage`, {
  //   method: "POST",
  //   headers: {"Content-Type": "application/json"},
  //   body: JSON.stringify(body)
  // });
  // const data = await response.json();
  // if (!data.ok) {
  //   console.error("Ошибка отправки:", data);
  // }
}

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

// const TelegramBot = require('../..');
// const express = require('express');

// No need to pass any parameters as we will handle the updates with Express
// const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
// bot.setWebHook(`${url}/bot${TOKEN}`);

// const app = express();

// parse the updates to JSON
// app.use(express.json());

// We are receiving updates at the route below!
// app.post(`/bot${TOKEN}`, (req, res) => {
//   bot.processUpdate(req.body);
//   res.sendStatus(200);
// });

// Start Express Server
// app.listen(port, () => {
//   console.log(`Express server is listening on ${port}`);
// });

// Just to ping!
// bot.on('message', msg => {
//   bot.sendMessage(msg.chat.id, 'I am alive!');
// });